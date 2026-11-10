// src/app/caja/page.tsx
import { obtenerSesion } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import FilaFactura from '@/components/caja/FilaFactura'

interface VentaCaja {
  id: string
  total: number
  fecha_hora: string
  id_vendedor: string
}

interface DetalleCaja {
  id_venta: string
  id_producto: string
  cantidad: number
  tipo_venta: string
  precio_unitario: number
}

interface UsuarioCaja {
  id: string
  nombre: string
}

export default async function CajaPage() {
  const sesion = await obtenerSesion()
  if (!sesion) return null

  const [{ data: pendientes }, { data: aceptadas }] = await Promise.all([
    supabaseAdmin
      .from('ventas')
      .select('id, total, fecha_hora, id_vendedor')
      .eq('estado', 'pendiente_caja')
      .order('fecha_hora'),
    supabaseAdmin
      .from('ventas')
      .select('id, total, fecha_hora, id_vendedor')
      .eq('estado', 'aceptada')
      .eq('id_cajero', sesion.sub)
      .order('fecha_hora'),
  ])

  const facturasPendientes: VentaCaja[] = pendientes ?? []
  const facturasAceptadas: VentaCaja[] = aceptadas ?? []
  const idsVentas = [...new Set([...facturasPendientes, ...facturasAceptadas].map((f) => f.id))]
  const idsVendedores = [...new Set([...facturasPendientes, ...facturasAceptadas].map((f) => f.id_vendedor))]
  const [resultadoDetalles, resultadoVendedores] = await Promise.all([
    idsVentas.length > 0
      ? supabaseAdmin
          .from('detalle_venta')
          .select('id_venta, id_producto, cantidad, tipo_venta, precio_unitario')
          .in('id_venta', idsVentas)
      : Promise.resolve({ data: [] as DetalleCaja[], error: null }),
    idsVendedores.length > 0
      ? supabaseAdmin
          .from('usuarios')
          .select('id, nombre')
          .in('id', idsVendedores)
      : Promise.resolve({ data: [] as UsuarioCaja[], error: null }),
  ])
  const detalles: DetalleCaja[] = resultadoDetalles.data ?? []
  const idsProductos = [...new Set((detalles ?? []).map((d) => d.id_producto))]
  const { data: productosConsultados } = idsProductos.length > 0
    ? await supabaseAdmin.from('productos').select('id, nombre').in('id', idsProductos)
    : { data: [] }
  const productos: Array<{ id: string; nombre: string }> = productosConsultados ?? []

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

  const vendedores: UsuarioCaja[] = resultadoVendedores.data ?? []
  const nombrePorId = new Map(vendedores.map((v) => [v.id, v.nombre]))

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent-bright">Operaciones de Pago</p>
        <h1 className="text-3xl font-display font-bold text-ink">Terminal de Caja</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Facturas pendientes en cola */}
        <div className="card space-y-6 bg-gradient-to-br from-accent/5 to-transparent border-white/5">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent-bright">En espera</p>
              <h2 className="text-xl font-display font-bold text-ink">Facturas pendientes</h2>
            </div>
            <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-bold text-accent-bright">
              {facturasPendientes.length} en cola
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {facturasPendientes.map((f) => (
              <FilaFactura
                key={f.id}
                factura={{ ...f, nombreVendedor: nombrePorId.get(f.id_vendedor) ?? '—' }}
                accion="aceptar"
                items={detallesPorVenta.get(f.id) ?? []}
              />
            ))}
            {facturasPendientes.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border/60 bg-surface-2/40 p-8 text-center text-sm text-muted">
                No hay facturas esperando cobro en este momento.
              </div>
            )}
          </div>
        </div>

        {/* Facturas aceptadas / activas */}
        <div className="card space-y-6 bg-gradient-to-br from-primary/5 to-transparent border-white/5">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-bright">En proceso</p>
              <h2 className="text-xl font-display font-bold text-ink">Mis facturas aceptadas</h2>
            </div>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary-bright">
              {facturasAceptadas.length} activas
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {facturasAceptadas.map((f) => (
              <FilaFactura
                key={f.id}
                factura={{ ...f, nombreVendedor: nombrePorId.get(f.id_vendedor) ?? '—' }}
                accion="pagar"
                items={detallesPorVenta.get(f.id) ?? []}
              />
            ))}
            {facturasAceptadas.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border/60 bg-surface-2/40 p-8 text-center text-sm text-muted">
                No tienes facturas activas aceptadas por procesar.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
