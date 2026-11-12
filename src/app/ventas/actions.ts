// src/app/ventas/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { obtenerSesion } from '@/lib/auth-server'
import { ejecutarConAuditoria } from '@/lib/audit-log'

interface ItemFactura {
  id_producto: string
  cantidad: number
  tipo_venta: 'detal' | 'mayor'
}

interface LineaPreparada extends ItemFactura {
  nombre_producto: string
  precio_unitario: number
}

interface DetalleExistente {
  id_producto: string
  cantidad: number
  tipo_venta: 'detal' | 'mayor'
  precio_unitario: number
}

async function prepararDetalles(items: ItemFactura[]): Promise<{ detalles: LineaPreparada[]; total: number } | { error: string }> {
  if (items.length === 0) return { error: 'La factura no tiene productos' }
  if (items.some((item) =>
    !item.id_producto
    || !Number.isInteger(item.cantidad)
    || item.cantidad <= 0
    || (item.tipo_venta !== 'detal' && item.tipo_venta !== 'mayor')
  )) {
    return { error: 'La factura contiene productos o cantidades no válidas' }
  }

  const idsProductos = [...new Set(items.map((item) => item.id_producto))]
  const { data: productos, error } = await supabaseAdmin
    .from('productos')
    .select('id, nombre, precio_detal, precio_mayor')
    .in('id', idsProductos)

  if (error || !productos) return { error: 'No se pudieron cargar los productos' }

  const productosPorId = new Map(productos.map((producto) => [producto.id, producto]))
  if (items.some((item) => !productosPorId.has(item.id_producto))) {
    return { error: 'Uno o más productos de la factura ya no existen' }
  }

  let total = 0
  const detalles = items.map((item) => {
    const producto = productosPorId.get(item.id_producto)
    if (!producto) return null
    const precioUnitario = item.tipo_venta === 'mayor' ? producto.precio_mayor : producto.precio_detal
    total += precioUnitario * item.cantidad
    return { ...item, nombre_producto: producto.nombre, precio_unitario: precioUnitario }
  })

  if (detalles.some((detalle) => detalle === null)) {
    return { error: 'No se pudieron resolver todos los productos de la factura' }
  }

  return { detalles: detalles.filter((detalle): detalle is LineaPreparada => detalle !== null), total }
}

function formatoTotal(total: number): string {
  return `$ ${new Intl.NumberFormat('es-CO').format(total)}`
}

async function restaurarDetalles(facturaId: string, anteriores: DetalleExistente[]): Promise<boolean> {
  const { error: errorBorrado } = await supabaseAdmin
    .from('detalle_venta')
    .delete()
    .eq('id_venta', facturaId)

  if (errorBorrado) return false
  if (anteriores.length === 0) return true

  const { error: errorRestauracion } = await supabaseAdmin
    .from('detalle_venta')
    .insert(anteriores.map((detalle) => ({ ...detalle, id_venta: facturaId })))

  return !errorRestauracion
}

export async function crearFactura(items: ItemFactura[]) {
  const sesion = await obtenerSesion()
  if (!sesion || (sesion.rol !== 'vendedor' && sesion.rol !== 'dueno')) {
    return { error: 'No autorizado' }
  }

  const preparado = await prepararDetalles(items)
  if ('error' in preparado) return preparado

  return ejecutarConAuditoria(sesion, {
    action: 'sales.draft_created',
    entityType: 'venta',
    summary: `Creó un borrador de factura por ${formatoTotal(preparado.total)}`,
    details: {
      total: preparado.total,
      productos: preparado.detalles.map((detalle) => ({
        producto: detalle.nombre_producto,
        cantidad: detalle.cantidad,
        tipo_venta: detalle.tipo_venta,
        precio_unitario: detalle.precio_unitario,
      })),
    },
  }, async (setEntityId) => {
    const { data: venta, error: errorVenta } = await supabaseAdmin
      .from('ventas')
      .insert({ id_vendedor: sesion.sub, total: preparado.total, estado: 'borrador', fecha_hora: new Date().toISOString() })
      .select('id')
      .single()

    if (errorVenta || !venta) return { error: 'No se pudo crear la factura' }
    setEntityId(venta.id)

    const { error: errorDetalle } = await supabaseAdmin
      .from('detalle_venta')
      .insert(preparado.detalles.map(({ id_producto, cantidad, tipo_venta, precio_unitario }) => ({
        id_venta: venta.id,
        id_producto,
        cantidad,
        tipo_venta,
        precio_unitario,
      })))

    if (errorDetalle) {
      const { error: errorLimpieza } = await supabaseAdmin.from('ventas').delete().eq('id', venta.id)
      return {
        error: errorLimpieza
          ? 'No se pudieron guardar los productos ni retirar el borrador incompleto'
          : 'No se pudieron guardar los productos de la factura',
      }
    }

    revalidatePath('/ventas')
    return { ok: true, facturaId: venta.id }
  })
}

export async function actualizarFactura(facturaId: string, items: ItemFactura[]) {
  const sesion = await obtenerSesion()
  if (!sesion) return { error: 'No autorizado' }

  const { data: venta, error: errorVenta } = await supabaseAdmin
    .from('ventas')
    .select('estado, id_vendedor, total')
    .eq('id', facturaId)
    .single()

  if (errorVenta || !venta) return { error: 'Factura no encontrada' }
  if (venta.estado !== 'borrador') return { error: 'Esta factura ya no se puede editar, un cajero ya la tomó' }
  if (venta.id_vendedor !== sesion.sub && sesion.rol !== 'dueno') return { error: 'No autorizado' }

  const { data: detallesAnteriores, error: errorDetallesAnteriores } = await supabaseAdmin
    .from('detalle_venta')
    .select('id_producto, cantidad, tipo_venta, precio_unitario')
    .eq('id_venta', facturaId)

  if (errorDetallesAnteriores || !detallesAnteriores) {
    return { error: 'No se pudieron cargar los productos actuales de la factura' }
  }

  const preparado = await prepararDetalles(items)
  if ('error' in preparado) return preparado

  const idsProductosAnteriores = [...new Set(detallesAnteriores.map((detalle) => detalle.id_producto))]
  const { data: productosAnteriores, error: errorProductosAnteriores } = idsProductosAnteriores.length
    ? await supabaseAdmin.from('productos').select('id, nombre').in('id', idsProductosAnteriores)
    : { data: [], error: null }

  if (errorProductosAnteriores || !productosAnteriores) {
    return { error: 'No se pudieron cargar los nombres de los productos actuales' }
  }

  const nombresAnteriores = new Map(productosAnteriores.map((producto) => [producto.id, producto.nombre]))
  const detallesActuales: DetalleExistente[] = detallesAnteriores.map((detalle) => ({
    id_producto: detalle.id_producto,
    cantidad: detalle.cantidad,
    tipo_venta: detalle.tipo_venta,
    precio_unitario: detalle.precio_unitario,
  }))
  const productosAntes = detallesActuales.map((detalle) => ({
    producto: nombresAnteriores.get(detalle.id_producto) ?? `Producto ${detalle.id_producto.slice(0, 8)}`,
    cantidad: detalle.cantidad,
    tipo_venta: detalle.tipo_venta,
    precio_unitario: detalle.precio_unitario,
  }))
  const productosDespues = preparado.detalles.map((detalle) => ({
    producto: detalle.nombre_producto,
    cantidad: detalle.cantidad,
    tipo_venta: detalle.tipo_venta,
    precio_unitario: detalle.precio_unitario,
  }))

  return ejecutarConAuditoria(sesion, {
    action: 'sales.draft_updated',
    entityType: 'venta',
    entityId: facturaId,
    summary: `Editó la factura ${facturaId.slice(0, 8)} · ${formatoTotal(venta.total)} → ${formatoTotal(preparado.total)}`,
    details: {
      total_anterior: venta.total,
      total_nuevo: preparado.total,
      productos_antes: productosAntes,
      productos_despues: productosDespues,
    },
  }, async () => {
    const { error: errorBorrado } = await supabaseAdmin
      .from('detalle_venta')
      .delete()
      .eq('id_venta', facturaId)

    if (errorBorrado) return { error: 'No se pudieron reemplazar los productos de la factura' }

    const { error: errorInsercion } = await supabaseAdmin
      .from('detalle_venta')
      .insert(preparado.detalles.map(({ id_producto, cantidad, tipo_venta, precio_unitario }) => ({
        id_venta: facturaId,
        id_producto,
        cantidad,
        tipo_venta,
        precio_unitario,
      })))

    if (errorInsercion) {
      const restaurado = await restaurarDetalles(facturaId, detallesActuales)
      return {
        error: restaurado
          ? 'No se pudieron guardar los nuevos productos; se restauraron los anteriores'
          : 'No se pudieron guardar los nuevos productos ni restaurar los anteriores',
      }
    }

    const { error: errorTotal } = await supabaseAdmin
      .from('ventas')
      .update({ total: preparado.total })
      .eq('id', facturaId)

    if (errorTotal) {
      const restaurado = await restaurarDetalles(facturaId, detallesActuales)
      return {
        error: restaurado
          ? 'No se pudo actualizar el total; se restauraron los productos anteriores'
          : 'No se pudo actualizar el total ni restaurar los productos anteriores',
      }
    }

    revalidatePath('/ventas')
    return { ok: true }
  })
}

export async function confirmarFactura(facturaId: string) {
  const sesion = await obtenerSesion()
  if (!sesion) return { error: 'No autorizado' }

  const { data: factura, error: errorFactura } = await supabaseAdmin
    .from('ventas')
    .select('estado, id_vendedor')
    .eq('id', facturaId)
    .single()

  if (errorFactura || !factura) return { error: 'Factura no encontrada' }
  if (factura.estado !== 'borrador') return { error: 'La factura ya fue confirmada' }
  if (factura.id_vendedor !== sesion.sub && sesion.rol !== 'dueno') return { error: 'No autorizado' }

  return ejecutarConAuditoria(sesion, {
    action: 'sales.confirmed',
    entityType: 'venta',
    entityId: facturaId,
    summary: `Envió la factura ${facturaId.slice(0, 8)} a caja`,
    details: { estado_anterior: 'borrador', estado_nuevo: 'pendiente_caja' },
  }, async () => {
    const { error } = await supabaseAdmin
      .from('ventas')
      .update({ estado: 'pendiente_caja', confirmada_at: new Date().toISOString() })
      .eq('id', facturaId)

    if (error) return { error: 'No se pudo confirmar la factura' }

    revalidatePath('/ventas')
    revalidatePath('/caja')
    return { ok: true }
  })
}