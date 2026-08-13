// src/app/caja/page.tsx
import { obtenerSesion } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import FilaFactura from '@/components/caja/FilaFactura'

export default async function CajaPage() {
  const sesion = await obtenerSesion()
  if (!sesion) return null

  const { data: pendientes } = await supabaseAdmin
    .from('ventas').select('id, total, fecha_hora, id_vendedor')
    .eq('estado', 'pendiente_caja').order('fecha_hora')

  const { data: aceptadas } = await supabaseAdmin
    .from('ventas').select('id, total, fecha_hora, id_vendedor')
    .eq('estado', 'aceptada').eq('id_cajero', sesion.sub).order('fecha_hora')

  const idsVentas = [...new Set([...(pendientes ?? []), ...(aceptadas ?? [])].map((f) => f.id))]
  const { data: detalles } = idsVentas.length > 0
    ? await supabaseAdmin
        .from('detalle_venta')
        .select('id_venta, id_producto, cantidad, tipo_venta, precio_unitario')
        .in('id_venta', idsVentas)
    : { data: [] }

  const idsProductos = [...new Set((detalles ?? []).map((d) => d.id_producto))]
  const { data: productos } = idsProductos.length > 0
    ? await supabaseAdmin
        .from('productos')
        .select('id, nombre')
        .in('id', idsProductos)
    : { data: [] }

  const nombreProductoPorId = new Map((productos ?? []).map((p) => [p.id, p.nombre]))
  const detallesPorVenta = new Map<string, Array<{ nombre: string; cantidad: number; tipo_venta: string; precio_unitario: number; subtotal: number }>>()

  for (const detalle of detalles ?? []) {
    const nombre = nombreProductoPorId.get(detalle.id_producto) ?? 'Producto'
    const item = {
      nombre,
      cantidad: detalle.cantidad,
      tipo_venta: detalle.tipo_venta,
      precio_unitario: detalle.precio_unitario,
      subtotal: detalle.precio_unitario * detalle.cantidad,
    }

    const actual = detallesPorVenta.get(detalle.id_venta) ?? []
    actual.push(item)
    detallesPorVenta.set(detalle.id_venta, actual)
  }

  const idsVendedores = [...new Set([...(pendientes ?? []), ...(aceptadas ?? [])].map((f) => f.id_vendedor))]
  const { data: vendedores } = await supabaseAdmin
    .from('usuarios').select('id, nombre')
    .in('id', idsVendedores.length > 0 ? idsVendedores : ['00000000-0000-0000-0000-000000000000'])

  const nombrePorId = new Map(vendedores?.map((v) => [v.id, v.nombre]))

  return (
    <div className="space-y-8">
      <div className="card bg-[radial-gradient(circle_at_top_left,_rgba(139,42,119,0.12),transparent_35%)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent-bright">Caja</p>
            <h1 className="text-2xl font-display font-bold text-ink">Facturas pendientes</h1>
          </div>
          <span className="rounded-full border border-border bg-surface-2 px-3 py-1 text-sm text-muted">{pendientes?.length ?? 0} en cola</span>
        </div>

        <div className="flex flex-col gap-3">
          {pendientes?.map((f) => (
            <FilaFactura
              key={f.id}
              factura={{ ...f, nombreVendedor: nombrePorId.get(f.id_vendedor) ?? '—' }}
              accion="aceptar"
              items={detallesPorVenta.get(f.id) ?? []}
            />
          ))}
          {pendientes?.length === 0 && <p className="rounded-2xl border border-dashed border-border bg-surface-2/70 p-5 text-sm text-muted">No hay facturas esperando.</p>}
        </div>
      </div>

      <div className="card bg-[radial-gradient(circle_at_top_left,_rgba(23,169,196,0.12),transparent_35%)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary-bright">Mi flujo</p>
            <h2 className="text-2xl font-display font-bold text-ink">Mis facturas aceptadas</h2>
          </div>
          <span className="rounded-full border border-border bg-surface-2 px-3 py-1 text-sm text-muted">{aceptadas?.length ?? 0} activas</span>
        </div>

        <div className="flex flex-col gap-3">
          {aceptadas?.map((f) => (
            <FilaFactura
              key={f.id}
              factura={{ ...f, nombreVendedor: nombrePorId.get(f.id_vendedor) ?? '—' }}
              accion="pagar"
              items={detallesPorVenta.get(f.id) ?? []}
            />
          ))}
          {aceptadas?.length === 0 && <p className="rounded-2xl border border-dashed border-border bg-surface-2/70 p-5 text-sm text-muted">No tienes facturas en proceso.</p>}
        </div>
      </div>
    </div>
  )
}