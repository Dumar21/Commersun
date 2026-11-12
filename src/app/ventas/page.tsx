// src/app/ventas/page.tsx
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { obtenerSesion } from '@/lib/auth-server'

const FACTURAS_POR_PAGINA = 25

interface FacturaLista {
  id: string
  total: number
  estado: string
  fecha_hora: string
}

const ETIQUETAS_ESTADO: Record<string, string> = {
  borrador: 'Borrador',
  pendiente_caja: 'En caja',
  aceptada: 'Aceptada por caja',
  pagada: 'Pagada',
  cancelada: 'Cancelada',
}

export default async function VentasPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>
}) {
  const sesion = await obtenerSesion()
  if (!sesion) return null

  const parametros = await searchParams
  const paginaSolicitada = Number.parseInt(parametros.pagina ?? '1', 10)
  const pagina = Number.isFinite(paginaSolicitada) ? Math.max(1, paginaSolicitada) : 1
  const desde = (pagina - 1) * FACTURAS_POR_PAGINA
  const { data: facturas } = await supabaseAdmin
    .from('ventas')
    .select('id, total, estado, fecha_hora')
    .eq('id_vendedor', sesion.sub)
    .order('fecha_hora', { ascending: false })
    .range(desde, desde + FACTURAS_POR_PAGINA)
  const facturasLista: FacturaLista[] = facturas ?? []
  const haySiguientePagina = facturasLista.length > FACTURAS_POR_PAGINA
  const facturasVisibles = facturasLista.slice(0, FACTURAS_POR_PAGINA)

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted">Ventas</p>
          <h1 className="text-2xl font-display font-semibold text-ink">Mis facturas</h1>
        </div>
        <Link href="/ventas/nueva" className="btn-primary">+ Nueva factura</Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/80 bg-surface/90">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 bg-surface-2/60 text-left text-muted">
                <th className="px-5 py-3.5 text-xs font-semibold">Factura</th>
                <th className="px-5 py-3.5 text-xs font-semibold">Total</th>
                <th className="px-5 py-3.5 text-xs font-semibold">Estado</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/35">
              {facturasVisibles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-14 text-center">
                    <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-2 text-muted">
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
                        <path d="M5 3h10v14l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2V3Z" strokeLinejoin="round" />
                        <path d="M7 7h6M7 10h6" strokeLinecap="round" />
                      </svg>
                    </span>
                    <p className="text-sm font-semibold text-ink">Aún no tienes facturas</p>
                    <p className="mt-1 text-xs text-muted">Cuando registres una venta, aparecerá aquí.</p>
                  </td>
                </tr>
              ) : (
                facturasVisibles.map((factura) => (
                  <tr key={factura.id} className="transition-colors hover:bg-surface-2/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted">
                          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4">
                            <path d="M5 3h10v14l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2V3Z" strokeLinejoin="round" />
                            <path d="M7 7h6M7 10h6" strokeLinecap="round" />
                          </svg>
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-ink">Factura #{factura.id.slice(0, 8)}</p>
                          <p className="mt-0.5 text-xs text-muted">
                            {new Date(factura.fecha_hora).toLocaleString('es-CO', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold tabular-nums text-ink">${factura.total.toLocaleString('es-CO')}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium ${
                        factura.estado === 'pagada' ? 'bg-accent/10 text-accent-bright border border-accent/20' :
                        factura.estado === 'cancelada' ? 'bg-danger/10 text-danger border border-danger/20' :
                        'bg-primary/10 text-primary-bright border border-primary/20'
                      }`}>
                        {ETIQUETAS_ESTADO[factura.estado]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {factura.estado === 'borrador' && (
                        <Link href={`/ventas/${factura.id}`} className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-primary-bright/20 px-3 py-2 text-xs font-semibold text-primary-bright transition-colors hover:bg-primary/10">
                          Continuar <span aria-hidden="true">→</span>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {(pagina > 1 || haySiguientePagina) && (
          <div className="flex items-center justify-between border-t border-border/60 px-6 py-4">
            {pagina > 1 ? (
              <Link
                href={`/ventas?pagina=${pagina - 1}`}
                className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-primary-bright transition-colors hover:text-ink"
              >
                ← Anteriores
              </Link>
            ) : <span />}
            <span className="text-xs text-muted">Página {pagina}</span>
            {haySiguientePagina ? (
              <Link
                href={`/ventas?pagina=${pagina + 1}`}
                className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-primary-bright transition-colors hover:text-ink"
              >
                Siguientes →
              </Link>
            ) : <span />}
          </div>
        )}
      </div>
    </div>
  )
}
