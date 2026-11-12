// src/components/dashboard/PanelKPIs.tsx
'use client'

import { useEffect, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { IconoAprobacion, IconoCheck, IconoFactura, IconoFlecha, IconoVentas } from './iconos'

type Props = {
  ingresoHoy: number
  ingresoAyerMismaHora: number
  facturasProcesadas: number
  facturasAyerMismaHora: number
  ticketPromedio: number
  ticketAyerMismaHora: number
  ingresoPorHora: number[]
  ingresoAyerPorHora: number[]
  facturasPorHora: number[]
  facturasAyerPorHora: number[]
  ticketPorHora: number[]
  ticketAyerPorHora: number[]
  horaActual: number
  ventasPorHora: number[]
  enEspera: number
  aceptadas: number
  totalSolicitudes: number
}

const numero = (n: number) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
const dinero = (n: number) => `$${numero(n)}`
const hora12 = (h: number) => `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`

// Un solo progreso (0 a 1) que mueve los números y los gráficos al mismo tiempo
function useProgreso(duracion = 1600) {
  const [p, setP] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const raf = requestAnimationFrame(() => setP(1))
      return () => cancelAnimationFrame(raf)
    }

    let raf = 0
    let inicio: number | null = null

    const paso = (ahora: number) => {
      if (inicio === null) inicio = ahora
      const x = Math.min((ahora - inicio) / duracion, 1)
      setP(1 - Math.pow(1 - x, 4))
      if (x < 1) raf = requestAnimationFrame(paso)
    }

    raf = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(raf)
  }, [duracion])

  return p
}

// Curva suave que pasa por todos los puntos (Catmull-Rom a Bézier)
function trazoSuave(pts: number[][]) {
  if (pts.length < 2) return ''
  const limitar = (v: number) => Math.min(100, Math.max(0, v))
  let d = `M ${pts[0][0]} ${pts[0][1]}`

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2

    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = limitar(p1[1] + (p2[1] - p0[1]) / 6)
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = limitar(p2[1] - (p3[1] - p1[1]) / 6)

    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`
  }

  return d
}

function Cambio({ actual, anterior, p }: { actual: number; anterior: number; p: number }) {
  if (anterior <= 0) {
    const nuevo = actual > 0
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium ${nuevo ? 'text-accent-bright' : 'text-muted'}`}>
        {nuevo ? <IconoFlecha className="h-3 w-3 -rotate-90" /> : null}
        {nuevo ? 'Nuevo' : 'Sin base'}
      </span>
    )
  }

  const porcentaje = ((actual - anterior) / anterior) * 100
  const mejora = porcentaje >= 0

  return (
    <span className={`inline-flex shrink-0 items-center gap-1 text-xs font-medium tabular-nums ${mejora ? 'text-accent-bright' : 'text-danger'}`}>
      <IconoFlecha className={`h-3 w-3 ${mejora ? '-rotate-90' : 'rotate-90'}`} />
      {mejora ? '+' : ''}{numero(Math.round(porcentaje * p))}%
    </span>
  )
}

function MiniGrafico({
  actual,
  anterior,
  horaActual,
  progreso,
  color,
}: {
  actual: number[]
  anterior: number[]
  horaActual: number
  progreso: number
  color: string
}) {
  const actualVisible = actual.slice(0, horaActual + 1)
  const anteriorVisible = anterior.slice(0, horaActual + 1)
  const max = Math.max(...actualVisible, ...anteriorVisible, 0)
  const puntos = (serie: number[]) =>
    serie.map((valor, indice) => [
      2 + (indice / Math.max(serie.length - 1, 1)) * 76,
      25 - (max > 0 ? (valor / max) * 21 * progreso : 0),
    ])

  return (
    <svg
      viewBox="0 0 80 28"
      preserveAspectRatio="none"
      role="img"
      aria-label="Comparación de la tendencia de hoy con ayer"
      className={`h-8 w-[4.5rem] shrink-0 overflow-visible ${color}`}
    >
      <path d={trazoSuave(puntos(anteriorVisible))} fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.5" strokeLinecap="round" />
      <path d={trazoSuave(puntos(actualVisible))} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function TarjetaKPI({
  icono,
  color,
  valor,
  etiqueta,
  detalle,
  actual,
  anterior,
  progreso,
  actualPorHora,
  anteriorPorHora,
  horaActual,
}: {
  icono: ReactNode
  color: string
  valor: string
  etiqueta: string
  detalle: string
  actual: number
  anterior: number
  progreso: number
  actualPorHora: number[]
  anteriorPorHora: number[]
  horaActual: number
}) {
  return (
    <article className="rounded-xl border border-border/70 bg-surface/65 p-4 transition-colors hover:border-border">
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-5 w-5 items-center justify-center text-muted">{icono}</span>
        <Cambio actual={actual} anterior={anterior} p={progreso} />
      </div>
      <p className="mt-3 truncate text-2xl font-display font-bold tabular-nums tracking-tight text-ink">
        {valor}
      </p>
      <p className="mt-0.5 truncate text-xs font-semibold text-ink/90">{etiqueta}</p>
      <div className="mt-2 flex min-h-7 items-end justify-between gap-1.5">
        <p className="line-clamp-2 text-xs leading-4 text-muted">{detalle}</p>
        <MiniGrafico actual={actualPorHora} anterior={anteriorPorHora} horaActual={horaActual} progreso={progreso} color={color} />
      </div>
    </article>
  )
}

function AreaVentas({ valores, p }: { valores: number[]; p: number }) {
  const [activo, setActivo] = useState<number | null>(null)

  // Solo mostramos el horario del negocio (7am a 8pm), y se amplía si hay ventas fuera de ese rango
  const primera = valores.findIndex((v) => v > 0)
  const ultima = valores.map((v) => v > 0).lastIndexOf(true)
  const desde = primera === -1 ? 7 : Math.min(7, primera)
  const hasta = ultima === -1 ? 20 : Math.max(20, ultima)
  const horas = Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i)
  const datos = horas.map((h) => valores[h] ?? 0)
  const max = Math.max(...datos, 0)
  const n = datos.length

  const xDe = (i: number) => (i / (n - 1)) * 100
  const yDe = (v: number) => (max > 0 ? 100 - (v / max) * 86 * p : 100)

  const puntos = datos.map((v, i) => [xDe(i), yDe(v)])
  const linea = trazoSuave(puntos)
  const area = `${linea} L 100 100 L 0 100 Z`

  const mover = (e: PointerEvent<HTMLDivElement>) => {
    const caja = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - caja.left) / caja.width
    setActivo(Math.min(n - 1, Math.max(0, Math.round(x * (n - 1)))))
  }

  const moverConTeclado = (e: KeyboardEvent<HTMLDivElement>) => {
    let siguiente: number
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        siguiente = Math.max(0, (activo ?? 0) - 1)
        break
      case 'ArrowRight':
      case 'ArrowUp':
        siguiente = Math.min(n - 1, (activo ?? 0) + 1)
        break
      case 'Home':
        siguiente = 0
        break
      case 'End':
        siguiente = n - 1
        break
      default:
        return
    }

    e.preventDefault()
    setActivo(siguiente)
  }

  const indiceActivo = activo ?? 0

  return (
    <div className="mt-6">
      <div
        role="slider"
        tabIndex={0}
        aria-label="Ventas por hora"
        aria-describedby="area-ventas-instrucciones"
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={n - 1}
        aria-valuenow={indiceActivo}
        aria-valuetext={`${hora12(horas[indiceActivo])}: ${dinero(datos[indiceActivo])}`}
        onKeyDown={moverConTeclado}
        onFocus={() => setActivo(indiceActivo)}
        onBlur={() => setActivo(null)}
        className="relative h-48 touch-pan-y rounded-lg text-primary-bright"
        onPointerMove={mover}
        onPointerDown={mover}
        onPointerLeave={() => setActivo(null)}
      >
        <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id="areaVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[25, 50, 75].map((y) => (
            <line
              key={y}
              x1="0"
              x2="100"
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeOpacity="0.12"
              strokeDasharray="3 4"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          <path d={area} fill="url(#areaVentas)" />
          <path
            d={linea}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {activo !== null && (
          <>
            <div
              className="pointer-events-none absolute bottom-0 top-0 w-px bg-primary-bright/30"
              style={{ left: `${xDe(activo)}%` }}
            />
            <span
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-bright ring-4 ring-primary/25"
              style={{ left: `${xDe(activo)}%`, top: `${yDe(datos[activo])}%` }}
            />
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs shadow-lg"
              style={{
                left: `${Math.min(88, Math.max(12, xDe(activo)))}%`,
                top:
                  yDe(datos[activo]) > 35
                    ? `calc(${yDe(datos[activo])}% - 56px)`
                    : `calc(${yDe(datos[activo])}% + 14px)`,
              }}
            >
              <p className="text-muted">{hora12(horas[activo])}</p>
              <p className="font-bold tabular-nums text-ink">{dinero(datos[activo])}</p>
            </div>
          </>
        )}
      </div>

      <span id="area-ventas-instrucciones" className="sr-only">
        Usa las teclas de flecha para explorar las ventas por hora; inicio y fin van al primer o último horario.
      </span>
      <div className="relative mt-2 h-4 text-[11px] text-muted">
        {horas.map((h, i) =>
          h % 3 === 0 ? (
            <span key={h} className="absolute -translate-x-1/2" style={{ left: `${xDe(i)}%` }}>
              {hora12(h)}
            </span>
          ) : null
        )}
      </div>

      {max === 0 && <p className="mt-3 text-center text-xs text-muted">Aún no hay ventas aprobadas hoy.</p>}
    </div>
  )
}

export default function PanelKPIs({
  ingresoHoy,
  ingresoAyerMismaHora,
  facturasProcesadas,
  facturasAyerMismaHora,
  ticketPromedio,
  ticketAyerMismaHora,
  ingresoPorHora,
  ingresoAyerPorHora,
  facturasPorHora,
  facturasAyerPorHora,
  ticketPorHora,
  ticketAyerPorHora,
  horaActual,
  ventasPorHora,
  enEspera,
  aceptadas,
  totalSolicitudes,
}: Props) {
  const p = useProgreso()
  const totalFacturas = enEspera + aceptadas

  const maxVenta = Math.max(...ventasPorHora, 0)
  const horaPico = maxVenta > 0 ? ventasPorHora.indexOf(maxVenta) : -1

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaKPI
          icono={<IconoVentas className="h-4 w-4" />}
          color="text-primary-bright/75"
          valor={dinero(Math.round(ingresoHoy * p))}
          etiqueta="Ventas de hoy"
          detalle={`${numero(Math.round(facturasProcesadas * p))} facturas aprobadas`}
          actual={ingresoHoy}
          anterior={ingresoAyerMismaHora}
          progreso={p}
          actualPorHora={ingresoPorHora}
          anteriorPorHora={ingresoAyerPorHora}
          horaActual={horaActual}
        />
        <TarjetaKPI
          icono={<IconoFactura className="h-4 w-4" />}
          color="text-primary-bright/75"
          valor={numero(Math.round(facturasProcesadas * p))}
          etiqueta="Facturas aprobadas"
          detalle={`${numero(Math.round(facturasAyerMismaHora * p))} ayer a esta hora`}
          actual={facturasProcesadas}
          anterior={facturasAyerMismaHora}
          progreso={p}
          actualPorHora={facturasPorHora}
          anteriorPorHora={facturasAyerPorHora}
          horaActual={horaActual}
        />
        <TarjetaKPI
          icono={
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          color="text-primary-bright/75"
          valor={dinero(Math.round(ticketPromedio * p))}
          etiqueta="Ticket promedio"
          detalle={`Ayer a esta hora: ${dinero(Math.round(ticketAyerMismaHora * p))}`}
          actual={ticketPromedio}
          anterior={ticketAyerMismaHora}
          progreso={p}
          actualPorHora={ticketPorHora}
          anteriorPorHora={ticketAyerPorHora}
          horaActual={horaActual}
        />
        <article className="rounded-xl border border-border/70 bg-surface/65 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="flex h-5 w-5 items-center justify-center text-muted">
              <IconoFactura className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-display font-bold tabular-nums tracking-tight text-ink">
            {numero(Math.round(totalFacturas * p))}
          </p>
          <p className="mt-0.5 truncate text-xs font-semibold text-ink/90">Facturas en caja</p>
          <div className="mt-2">
            <div className="flex h-1.5 overflow-hidden rounded-full bg-surface-2">
              {totalFacturas > 0 && (
                <>
                  <span className="h-full bg-primary-bright" style={{ width: `${(enEspera / totalFacturas) * 100 * p}%` }} />
                  <span className="h-full bg-accent-bright" style={{ width: `${(aceptadas / totalFacturas) * 100 * p}%` }} />
                </>
              )}
            </div>
            <p className="mt-1.5 truncate text-[11px] leading-4 text-muted">
              {numero(Math.round(enEspera * p))} esperando · {numero(Math.round(aceptadas * p))} aceptadas
            </p>
          </div>
        </article>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-surface/65 px-3.5 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${totalSolicitudes > 0 ? 'border-amber-300/15 bg-amber-300/10 text-amber-200' : 'border-accent/15 bg-accent/10 text-accent-bright'}`}>
            {totalSolicitudes > 0 ? <IconoAprobacion className="h-4 w-4" /> : <IconoCheck className="h-4 w-4" />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-ink">Cambios por aprobar</p>
            <p className="truncate text-[10px] text-muted">
              {totalSolicitudes > 0 ? 'Requieren revisión de inventario' : 'Todo al día'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-lg font-display font-bold tabular-nums text-ink">{numero(Math.round(totalSolicitudes * p))}</span>
          {totalSolicitudes > 0 && (
            <a href="#solicitudes" className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-semibold text-amber-200 hover:underline">
              Revisar <IconoFlecha className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      <section className="rounded-xl border border-border/70 bg-surface/65 p-4 sm:p-5">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted">Rendimiento del día</p>
              <h2 className="mt-1 text-balance text-base font-semibold text-ink">Ventas por hora</h2>
              <p className="mt-1 text-sm text-muted">Comportamiento de las ventas aprobadas durante el día.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">Hora pico</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-ink">
                {horaPico >= 0 ? hora12(horaPico) : '—'}
              </p>
            </div>
          </div>
          <AreaVentas valores={ventasPorHora} p={p} />
        </div>
      </section>
    </div>
  )
}