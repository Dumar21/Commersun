// src/app/productos/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { obtenerSesion } from '@/lib/auth-server'

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

export async function actualizarProducto(productoId: string, datos: {
  nombre: string
  precioDetal: number
  precioMayor: number
  codigoBarras: string
  stock: number
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

  const payload: Record<string, unknown> = {
    nombre: datos.nombre,
    precio_detal: datos.precioDetal,
    precio_mayor: datos.precioMayor,
    codigo_barras: datos.codigoBarras,
    stock: datos.stock,
  }

  if (imagenUrl) {
    payload.imagen_url = imagenUrl
  }

  const { error } = await supabaseAdmin.from('productos').update(payload).eq('id', productoId)

  if (error) return { error: 'No se pudo actualizar el producto' }

  revalidatePath('/productos')
  return { ok: true }
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