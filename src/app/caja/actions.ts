// src/app/caja/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { obtenerSesion } from '@/lib/auth-server'
import { ejecutarConAuditoria } from '@/lib/audit-log'

export async function aceptarFactura(facturaId: string) {
  const sesion = await obtenerSesion()
  if (!sesion || (sesion.rol !== 'cajero' && sesion.rol !== 'dueno')) {
    return { error: 'No autorizado' }
  }

  const { data: venta, error: errorVenta } = await supabaseAdmin
    .from('ventas')
    .select('estado')
    .eq('id', facturaId)
    .single()

  if (errorVenta || !venta) return { error: 'Factura no encontrada' }
  if (venta.estado !== 'pendiente_caja') return { error: 'Esta factura ya fue tomada o no está lista' }

  return ejecutarConAuditoria(sesion, {
    action: 'sales.accepted',
    entityType: 'venta',
    entityId: facturaId,
    summary: `Aceptó la factura ${facturaId.slice(0, 8)} para pago`,
    details: { estado_anterior: 'pendiente_caja', estado_nuevo: 'aceptada' },
  }, async () => {
    const { error } = await supabaseAdmin
      .from('ventas')
      .update({ estado: 'aceptada', id_cajero: sesion.sub, aceptada_at: new Date().toISOString() })
      .eq('id', facturaId)

    if (error) return { error: 'No se pudo aceptar la factura' }

    revalidatePath('/caja')
    return { ok: true }
  })
}

export async function pagarFactura(facturaId: string) {
  const sesion = await obtenerSesion()
  if (!sesion || (sesion.rol !== 'cajero' && sesion.rol !== 'dueno')) {
    return { error: 'No autorizado' }
  }

  const { data: venta, error: errorVenta } = await supabaseAdmin
    .from('ventas')
    .select('estado, id_cajero, total')
    .eq('id', facturaId)
    .single()

  if (errorVenta || !venta) return { error: 'Factura no encontrada' }
  if (venta.estado !== 'aceptada') return { error: 'La factura debe estar aceptada primero' }
  const cajeroId = venta.id_cajero
  if (!cajeroId) return { error: 'Esta factura no tiene un cajero asignado' }
  if (cajeroId !== sesion.sub && sesion.rol !== 'dueno') return { error: 'Solo el cajero que la aceptó puede pagarla' }

  const { data: detalles, error: errorDetalles } = await supabaseAdmin
    .from('detalle_venta')
    .select('id_producto, cantidad, tipo_venta, precio_unitario')
    .eq('id_venta', facturaId)

  if (errorDetalles || !detalles) return { error: 'No se pudieron cargar los productos de la factura' }

  const idsProductos = [...new Set(detalles.map((detalle) => detalle.id_producto))]
  const { data: productos, error: errorProductos } = idsProductos.length
    ? await supabaseAdmin.from('productos').select('id, nombre').in('id', idsProductos)
    : { data: [], error: null }

  if (errorProductos || !productos) return { error: 'No se pudieron cargar los nombres de los productos' }

  const nombres = new Map(productos.map((producto) => [producto.id, producto.nombre]))
  const productosFacturados = detalles.map((detalle) => ({
    producto: nombres.get(detalle.id_producto) ?? `Producto ${detalle.id_producto.slice(0, 8)}`,
    cantidad: detalle.cantidad,
    tipo_venta: detalle.tipo_venta,
    precio_unitario: detalle.precio_unitario,
  }))

  return ejecutarConAuditoria(sesion, {
    action: 'sales.paid',
    entityType: 'venta',
    entityId: facturaId,
    summary: `Registró el pago de la factura ${facturaId.slice(0, 8)} por $ ${new Intl.NumberFormat('es-CO').format(venta.total)}`,
    details: { total: venta.total, productos: productosFacturados },
  }, async () => {
    const { error } = await supabaseAdmin.rpc('pagar_factura', {
      p_venta_id: facturaId,
      p_cajero_id: cajeroId,
    })

    if (error) return { error: error.message }

    revalidatePath('/caja')
    revalidatePath('/productos')
    return { ok: true }
  })
}