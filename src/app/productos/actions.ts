// src/app/productos/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { obtenerSesion } from '@/lib/auth-server'
import type { Database } from '@/lib/database.types'

async function subirImagenProductoDesdeBase64(imagenBase64?: string, nombreArchivo?: string) {
  if (!imagenBase64) return null

  const coincidencia = imagenBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!coincidencia) {
    throw new Error('La imagen no tiene un formato válido.')
  }

  const mimeType = coincidencia[1]
  const base64 = coincidencia[2]
  const buffer = Buffer.from(base64, 'base64')

  const extension = (nombreArchivo?.split('.').pop() || mimeType.split('/')[1] || 'png').toLowerCase()
  const nombreArchivoStorage = `productos/${crypto.randomUUID()}.${extension}`

  try {
    await supabaseAdmin.storage.createBucket('productos', {
      public: true,
      fileSizeLimit: '5MB',
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    })
  } catch {
    // El bucket ya existe o no requiere creación.
  }

  const { error } = await supabaseAdmin.storage
    .from('productos')
    .upload(nombreArchivoStorage, buffer, {
      contentType: mimeType,
      upsert: true,
      cacheControl: '3600',
    })

  if (error) {
    throw new Error('No se pudo guardar la imagen del producto.')
  }

  const { data } = supabaseAdmin.storage.from('productos').getPublicUrl(nombreArchivoStorage)
  return data.publicUrl
}

export async function buscarProductoPorCodigo(codigoBarras: string) {
  const { data } = await supabaseAdmin
    .from('productos')
    .select('id, nombre, stock, codigo_barras, imagen_url')
    .eq('codigo_barras', codigoBarras)
    .maybeSingle()

  return data
}

export async function obtenerProductoPorId(productoId: string) {
  const { data, error } = await supabaseAdmin
    .from('productos')
    .select('*')
    .eq('id', productoId)
    .maybeSingle()

  if (error) return null
  return data
}

export async function crearProducto(datos: {
  nombre: string
  precioDetal: number
  precioMayor: number
  codigoBarras: string
  stockInicial: number
  imagenBase64?: string
  imagenNombre?: string
}) {
  const sesion = await obtenerSesion()
  if (!sesion || (sesion.rol !== 'bodegero' && sesion.rol !== 'dueno')) {
    return { error: 'No autorizado' }
  }

  let imagenUrl: string | null = null

  try {
    imagenUrl = await subirImagenProductoDesdeBase64(datos.imagenBase64, datos.imagenNombre)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No se pudo guardar la imagen del producto' }
  }

  const { error } = await supabaseAdmin.from('productos').insert({
    nombre: datos.nombre,
    precio_detal: datos.precioDetal,
    precio_mayor: datos.precioMayor,
    codigo_barras: datos.codigoBarras,
    stock: datos.stockInicial,
    imagen_url: imagenUrl,
  })

  if (error) return { error: 'No se pudo crear el producto' }

  revalidatePath('/productos')
  return { ok: true }
}

type ResultadoActualizacion =
  | { ok: true; pendienteAprobacion?: boolean }
  | { error: string }

export async function actualizarProducto(productoId: string, datos: {
  nombre: string
  precioDetal: number
  precioMayor: number
  codigoBarras: string
  stock: number
  imagenBase64?: string
  imagenNombre?: string
}): Promise<ResultadoActualizacion> {
  const sesion = await obtenerSesion()
  if (!sesion || (sesion.rol !== 'bodegero' && sesion.rol !== 'dueno')) {
    return { error: 'No autorizado' }
  }

  const { data: productoActual, error: errorProducto } = await supabaseAdmin
    .from('productos')
    .select('nombre, precio_detal, precio_mayor, codigo_barras, stock, imagen_url')
    .eq('id', productoId)
    .single()

  if (errorProducto || !productoActual) {
    return { error: 'Producto no encontrado' }
  }

  let imagenUrl: string | null = productoActual.imagen_url ?? null

  try {
    const nuevaImagenUrl = await subirImagenProductoDesdeBase64(datos.imagenBase64, datos.imagenNombre)
    if (nuevaImagenUrl) {
      imagenUrl = nuevaImagenUrl
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No se pudo guardar la imagen del producto' }
  }

  const cambiosPendientes: Array<{ campo: string; valor_anterior: string | number | null; valor_nuevo: string | number | null }> = []
  const camposAActualizar: Database['public']['Tables']['productos']['Update'] = {
    nombre: datos.nombre,
    precio_detal: datos.precioDetal,
    precio_mayor: datos.precioMayor,
    codigo_barras: datos.codigoBarras,
    stock: datos.stock,
  }

  if (imagenUrl) {
    camposAActualizar.imagen_url = imagenUrl
  }

  const camposRelevantes = [
    ['nombre', productoActual.nombre, datos.nombre],
    ['precio_detal', productoActual.precio_detal, datos.precioDetal],
    ['precio_mayor', productoActual.precio_mayor, datos.precioMayor],
    ['codigo_barras', productoActual.codigo_barras, datos.codigoBarras],
    ['stock', productoActual.stock, datos.stock],
  ] as const

  for (const [campo, anterior, nuevo] of camposRelevantes) {
    if (String(anterior ?? '') !== String(nuevo ?? '')) {
      cambiosPendientes.push({
        campo,
        valor_anterior: anterior ?? null,
        valor_nuevo: nuevo ?? null,
      })
    }
  }

  if (sesion.rol === 'dueno') {
    const { error } = await supabaseAdmin.from('productos').update(camposAActualizar).eq('id', productoId)

    if (error) return { error: 'No se pudo actualizar el producto' }

    revalidatePath('/productos')
    revalidatePath('/ventas')
    return { ok: true }
  }

  if (cambiosPendientes.length === 0) {
    return { ok: true }
  }

  const solicitudes = cambiosPendientes.map((cambio) => ({
    id_producto: productoId,
    nombre_producto: datos.nombre,
    campo: cambio.campo,
    valor_anterior: cambio.valor_anterior,
    valor_nuevo: cambio.valor_nuevo,
    estado: 'pendiente',
    created_at: new Date().toISOString(),
  }))

  const { error: errorSolicitud } = await supabaseAdmin.from('solicitudes_producto').insert(solicitudes)

  if (errorSolicitud) {
    return { error: 'No se pudo enviar la solicitud para aprobación del dueño.' }
  }

  return { ok: true, pendienteAprobacion: true }
}

export async function agregarStock(productoId: string, cantidad: number) {
  const sesion = await obtenerSesion()
  if (!sesion || (sesion.rol !== 'bodegero' && sesion.rol !== 'dueno')) {
    return { error: 'No autorizado' }
  }
  if (cantidad <= 0) return { error: 'La cantidad debe ser mayor a 0' }

  const { data, error } = await supabaseAdmin.rpc('incrementar_stock', {
    p_producto_id: productoId,
    p_cantidad: cantidad,
  })

  if (error) return { error: 'No se pudo actualizar el stock' }

  revalidatePath('/productos')
  return { ok: true, nuevoStock: data as number }
}