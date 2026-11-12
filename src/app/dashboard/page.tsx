// src/app/dashboard/page.tsx
import Link from 'next/link'
import SolicitudesAprobacion from '@/components/dashboard/SolicitudesAprobacion'
import PanelKPIs from '@/components/dashboard/PanelKPIs'
import { IconoAprobacion, IconoFactura, IconoFlecha } from '@/components/dashboard/iconos'
import { obtenerSesion } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const ZONA = 'America/Bogota'
const DIA = 24 * 60 * 60 * 1000

type VentaPeriodo = { id: string; total: number | null; estado: string; fecha_hora: string }
type VentaEnCaja = { id: string; total: number | null; estado: string }

const formatoMoneda = (valor: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor)

const formatearFecha = (valor?: string) => {
  if (!valor) return '—'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return '—'
  return fecha.toLocaleString('es-CO', {
    timeZone: ZONA,
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatoHora = new Intl.DateTimeFormat('en-US', {
  timeZone: ZONA,
  hour: 'numeric',
  hourCycle: 'h23',
})

const ESTADOS: Record<string, { label: string; clase: string }> = {
  pagada: { label: 'Pagada', clase: 'border-accent/20 bg-accent/10 text-accent-bright' },
  aceptada: { label: 'Aceptada', clase: 'border-primary/20 bg-primary/10 text-primary-bright' },
  pendiente_caja: { label: 'En caja', clase: 'border-border bg-surface-2 text-muted' },
}

const esAprobada = (estado: string) => estado === 'aceptada' || estado === 'pagada'

export default async function DashboardPage() {
  const sesion = await obtenerSesion()
  if (!sesion || sesion.rol !== 'dueno') {
    return null
  }

  // "Hoy" según la hora de Colombia (no la del servidor)
  const ahora = new Date()
  const horaActual = Number(formatoHora.format(ahora)) % 24
  const hoyBogota = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(ahora) // YYYY-MM-DD
  const inicioHoy = new Date(`${hoyBogota}T00:00:00-05:00`)
  const inicioAyer = new Date(inicioHoy.getTime() - DIA)
  const finHoy = new Date(inicioHoy.getTime() + DIA)

  const [ventasPeriodoQuery, facturasPendientesQuery, ventasRecientesQuery, solicitudesPendientesQuery] =
    await Promise.all([
      // Ayer y hoy en una sola consulta (ayer sirve para comparar a la misma hora)
      supabaseAdmin
        .from('ventas')
        .select('id, total, estado, fecha_hora')
        .gte('fecha_hora', inicioAyer.toISOString())
        .lt('fecha_hora', finHoy.toISOString())
        .overrideTypes<VentaPeriodo[]>(),
      supabaseAdmin
        .from('ventas')
        .select('id, total, estado')
        .in('estado', ['pendiente_caja', 'aceptada'])
        .overrideTypes<VentaEnCaja[]>(),
      supabaseAdmin
        .from('ventas')
        .select('id, total, estado, fecha_hora')
        .order('fecha_hora', { ascending: false })
        .limit(6)
        .overrideTypes<VentaPeriodo[]>(),
      supabaseAdmin
        .from('solicitudes_producto')
        .select('id, id_producto, nombre_producto, campo, valor_anterior, valor_nuevo, estado, created_at', {
          count: 'exact',
        })
        .eq('estado', 'pendiente')
        .order('created_at', { ascending: false })
        .limit(10),
    ])

  const ventasPeriodo = ventasPeriodoQuery.error ? [] : (ventasPeriodoQuery.data ?? [])
  const facturasPendientes = facturasPendientesQuery.error ? [] : (facturasPendientesQuery.data ?? [])
  const ventasRecientes = ventasRecientesQuery.error ? [] : (ventasRecientesQuery.data ?? [])
  const solicitudesPendientes = solicitudesPendientesQuery.error ? [] : (solicitudesPendientesQuery.data ?? [])
  const totalSolicitudes = solicitudesPendientesQuery.count ?? solicitudesPendientes.length

  // Ventas aprobadas de hoy
  const aprobadas = ventasPeriodo.filter((venta) => esAprobada(venta.estado))
  const limiteAyer = ahora.getTime() - DIA
  const aprobadasHoy = aprobadas.filter((venta) => {
    const tiempo = new Date(venta.fecha_hora).getTime()
    return tiempo >= inicioHoy.getTime() && tiempo <= ahora.getTime()
  })
  const aprobadasAyerMismaHora = aprobadas.filter((venta) => {
    const tiempo = new Date(venta.fecha_hora).getTime()
    return tiempo >= inicioAyer.getTime() && tiempo < inicioHoy.getTime() && tiempo <= limiteAyer
  })
  const ingresoHoy = aprobadasHoy.reduce((total, venta) => total + Number(venta.total ?? 0), 0)
  const ticketPromedio = aprobadasHoy.length > 0 ? ingresoHoy / aprobadasHoy.length : 0

  // Compara con el mismo tramo horario del día anterior.
  const ingresoAyerMismaHora = aprobadasAyerMismaHora.reduce(
    (total, venta) => total + Number(venta.total ?? 0),
    0
  )
  const ticketAyerMismaHora =
    aprobadasAyerMismaHora.length > 0
      ? ingresoAyerMismaHora / aprobadasAyerMismaHora.length
      : 0

  const ventasPorHora: number[] = Array(24).fill(0)
  const ingresoAyerPorHora: number[] = Array(24).fill(0)
  const facturasPorHora: number[] = Array(24).fill(0)
  const facturasAyerPorHora: number[] = Array(24).fill(0)
  aprobadasHoy.forEach((venta) => {
    const fecha = new Date(venta.fecha_hora)
    if (Number.isNaN(fecha.getTime())) return
    const hora = Number(formatoHora.format(fecha)) % 24
    const total = Number(venta.total ?? 0)
    ventasPorHora[hora] += total
    facturasPorHora[hora] += 1
  })
  aprobadasAyerMismaHora.forEach((venta) => {
    const fecha = new Date(venta.fecha_hora)
    if (Number.isNaN(fecha.getTime())) return
    const hora = Number(formatoHora.format(fecha)) % 24
    const total = Number(venta.total ?? 0)
    ingresoAyerPorHora[hora] += total
    facturasAyerPorHora[hora] += 1
  })
  const ticketPorHora = ventasPorHora.map((total, hora) =>
    facturasPorHora[hora] > 0 ? total / facturasPorHora[hora] : 0
  )
  const ticketAyerPorHora = ingresoAyerPorHora.map((total, hora) =>
    facturasAyerPorHora[hora] > 0 ? total / facturasAyerPorHora[hora] : 0
  )

  // Facturas en caja
  const enEspera = facturasPendientes.filter((venta) => venta.estado === 'pendiente_caja').length
  const aceptadas = facturasPendientes.filter((venta) => venta.estado === 'aceptada').length

  // Encabezado
  const fechaTexto = new Intl.DateTimeFormat('es-CO', {
    timeZone: ZONA,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(ahora)
  const saludo = horaActual < 12 ? 'Buenos días' : horaActual < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="dashboard-page mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted first-letter:uppercase">{fechaTexto}</p>
        <h1 className="text-balance text-2xl font-display font-semibold text-ink">{saludo}</h1>
        <p className="text-sm text-muted">Así va el negocio hoy.</p>
      </div>

      <PanelKPIs
        ingresoHoy={ingresoHoy}
        ingresoAyerMismaHora={ingresoAyerMismaHora}
        facturasProcesadas={aprobadasHoy.length}
        facturasAyerMismaHora={aprobadasAyerMismaHora.length}
        ticketPromedio={ticketPromedio}
        ticketAyerMismaHora={ticketAyerMismaHora}
        ingresoPorHora={ventasPorHora}
        ingresoAyerPorHora={ingresoAyerPorHora}
        facturasPorHora={facturasPorHora}
        facturasAyerPorHora={facturasAyerPorHora}
        ticketPorHora={ticketPorHora}
        ticketAyerPorHora={ticketAyerPorHora}
        horaActual={horaActual}
        ventasPorHora={ventasPorHora}
        enEspera={enEspera}
        aceptadas={aceptadas}
        totalSolicitudes={totalSolicitudes}
      />

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Últimas facturas */}
        <section className="overflow-hidden rounded-xl border border-border/70 bg-surface/65">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted">
                <IconoFactura className="h-4 w-4" />
              </span>
              <h2 className="text-balance text-base font-semibold text-ink">Últimas facturas</h2>
            </div>
            <Link
              href="/ventas"
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-primary-bright hover:underline"
            >
              Ver todas
              <IconoFlecha className="h-3.5 w-3.5" />
            </Link>
          </div>

          {ventasRecientes.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted">Aún no hay ventas registradas.</p>
          ) : (
            <ul className="divide-y divide-border/50 px-3 sm:px-4">
              {ventasRecientes.map((venta) => {
                const estado = ESTADOS[venta.estado] ?? {
                  label: venta.estado,
                  clase: 'border-border bg-surface-2 text-muted',
                }

                return (
                  <li
                    key={venta.id}
                    className="flex items-center justify-between gap-3 px-2.5 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center text-muted">
                        <IconoFactura className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-ink">Factura #{venta.id.slice(0, 8)}</p>
                        <p className="mt-0.5 text-[10px] text-muted">{formatearFecha(venta.fecha_hora)}</p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs font-bold tabular-nums text-ink">
                        {formatoMoneda(Number(venta.total ?? 0))}
                      </p>
                      <span
                        className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${estado.clase}`}
                      >
                        {estado.label}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* Solicitudes */}
        <section id="solicitudes" className="relative scroll-mt-24 overflow-hidden rounded-xl border border-border/70 bg-surface/65">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-muted">
                <IconoAprobacion className="h-4 w-4" />
              </span>
              <h2 className="text-balance text-base font-semibold text-ink">Solicitudes</h2>
            </div>
            {totalSolicitudes > 0 && (
              <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-xs font-bold tabular-nums text-accent-bright">
                {totalSolicitudes}
              </span>
            )}
          </div>

          <div className="max-h-[480px] overflow-y-auto">
            <SolicitudesAprobacion solicitudes={solicitudesPendientes} />
          </div>
        </section>
      </div>
    </div>
  )
}