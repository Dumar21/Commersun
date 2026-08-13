// src/app/ventas/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { obtenerSesion } from '@/lib/auth-server'

interface ItemFactura {
  id_producto: string
  cantidad: number
  tipo_venta: 'detal' | 'mayor'
}

export async function crearFactura(items: ItemFactura[]) {
  const sesion = await obtenerSesion()
  if (!sesion || (sesion.rol !== 'vendedor' && sesion.rol !== 'dueno')) {
    return { error: 'No autorizado' }
  }
  if (items.length === 0) return { error: 'La factura no tiene productos' }

  const idsProductos = items.map((i) => i.id_producto)
  const { data: productos, error: errorProductos } = await supabaseAdmin
    .from('productos')
    .select('id, precio_detal, precio_mayor')
    .in('id', idsProductos)

  if (errorProductos || !productos) return { error: 'No se pudieron cargar los productos' }

  let total = 0
  const detalles = items.map((item) => {
    const producto = productos.find((p) => p.id === item.id_producto)!
    const precioUnitario = item.tipo_venta === 'mayor' ? producto.precio_mayor : producto.precio_detal
    total += precioUnitario * item.cantidad
    return {
      id_producto: item.id_producto,
      cantidad: item.cantidad,
      tipo_venta: item.tipo_venta,
      precio_unitario: precioUnitario,
    }
  })

  const { data: venta, error: errorVenta } = await supabaseAdmin
    .from('ventas')
    .insert({ id_vendedor: sesion.sub, total, estado: 'borrador', fecha_hora: new Date().toISOString() })
    .select('id')
    .single()

  if (errorVenta || !venta) return { error: 'No se pudo crear la factura' }

  const { error: errorDetalle } = await supabaseAdmin
    .from('detalle_venta')
    .insert(detalles.map((d) => ({ ...d, id_venta: venta.id })))

  if (errorDetalle) return { error: 'No se pudieron guardar los productos de la factura' }

  revalidatePath('/ventas')
  return { ok: true, facturaId: venta.id }
}

export async function actualizarFactura(facturaId: string, items: ItemFactura[]) {
  const sesion = await obtenerSesion()
  if (!sesion) return { error: 'No autorizado' }

  const { data: venta } = await supabaseAdmin
    .from('ventas')
    .select('estado, id_vendedor')
    .eq('id', facturaId)
    .single()

  if (!venta) return { error: 'Factura no encontrada' }
  if (venta.estado !== 'borrador') return { error: 'Esta factura ya no se puede editar, un cajero ya la tomó' }
  if (venta.id_vendedor !== sesion.sub && sesion.rol !== 'dueno') return { error: 'No autorizado' }

  const idsProductos = items.map((i) => i.id_producto)
  const { data: productos } = await supabaseAdmin
    .from('productos')
    .select('id, precio_detal, precio_mayor')
    .in('id', idsProductos)

  if (!productos) return { error: 'No se pudieron cargar los productos' }

  let total = 0
  const detalles = items.map((item) => {
    const producto = productos.find((p) => p.id === item.id_producto)!
    const precioUnitario = item.tipo_venta === 'mayor' ? producto.precio_mayor : producto.precio_detal
    total += precioUnitario * item.cantidad
    return {
      id_venta: facturaId,
      id_producto: item.id_producto,
      cantidad: item.cantidad,
      tipo_venta: item.tipo_venta,
      precio_unitario: precioUnitario,
    }
  })

  await supabaseAdmin.from('detalle_venta').delete().eq('id_venta', facturaId)
  await supabaseAdmin.from('detalle_venta').insert(detalles)
  await supabaseAdmin.from('ventas').update({ total }).eq('id', facturaId)

  revalidatePath('/ventas')
  return { ok: true }
}

export async function confirmarFactura(facturaId: string) {
  const sesion = await obtenerSesion()
  if (!sesion) return { error: 'No autorizado' }

  const { data: venta } = await supabaseAdmin
    .from('ventas')
    .select('estado, id_vendedor')
    .eq('id', facturaId)
    .single()

  if (!venta) return { error: 'Factura no encontrada' }
  if (venta.estado !== 'borrador') return { error: 'La factura ya fue confirmada' }
  if (venta.id_vendedor !== sesion.sub && sesion.rol !== 'dueno') return { error: 'No autorizado' }

  const { error } = await supabaseAdmin
    .from('ventas')
    .update({ estado: 'pendiente_caja', confirmada_at: new Date().toISOString() })
    .eq('id', facturaId)

  if (error) return { error: 'No se pudo confirmar la factura' }

  revalidatePath('/ventas')
  revalidatePath('/caja')
  return { ok: true }
}