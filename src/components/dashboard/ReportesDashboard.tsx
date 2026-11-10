'use client'

const REPORTES = [
  { periodo: 'diario', etiqueta: 'Hoy', detalle: 'Ventas del día' },
  { periodo: 'mensual', etiqueta: 'Este mes', detalle: 'Resumen mensual' },
  { periodo: 'anual', etiqueta: 'Este año', detalle: 'Resumen anual' },
]

function IconoDescarga() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 15.5v1h12v-1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ReportesDashboard() {
  return (
    <section className="card relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(178,67,154,0.14),transparent_48%)]" data-motion>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent-bright">Exportar CSV</p>
          <h2 className="text-lg font-display font-bold text-ink">Elige un periodo</h2>
        </div>
        <p className="text-xs text-muted">Solo ventas aceptadas o pagadas</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {REPORTES.map((reporte) => (
          <a
            key={reporte.periodo}
            href={`/api/reportes?periodo=${reporte.periodo}`}
            download
            className="group flex items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-primary-bright/60 hover:bg-surface-2/80 hover:shadow-[0_8px_24px_rgba(23,169,196,0.12)]"
          >
            <span>
              <span className="block text-sm font-semibold text-ink">{reporte.etiqueta}</span>
              <span className="block text-xs text-muted">{reporte.detalle} · CSV</span>
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-primary-bright transition-colors group-hover:bg-primary/15">
              <IconoDescarga />
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
