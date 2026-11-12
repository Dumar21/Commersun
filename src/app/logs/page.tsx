import Link from 'next/link'
import { redirect } from 'next/navigation'
import { obtenerSesion } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { Database, Json } from '@/lib/database.types'
import {
  AUDIT_CATEGORY_OPTIONS,
  AUDIT_ROLE_LABELS,
  type AuditCategory,
} from '@/components/logs/audit-options'
import AuditFilters from '@/components/logs/AuditFilters'

type SearchParams = Record<string, string | string[] | undefined>
type AuditLog = Database['public']['Tables']['audit_logs']['Row']
type Category = AuditCategory

const PAGE_SIZE = 50
const ROLE_LABELS = AUDIT_ROLE_LABELS

const ROLE_STYLES: Record<AuditLog['actor_role'], string> = {
  super_admin: 'border-border bg-surface-2 text-muted',
  dueno: 'border-accent-bright/30 bg-accent/10 text-accent-bright',
  vendedor: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  cajero: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  bodegero: 'border-primary-bright/30 bg-primary/10 text-primary-bright',
  sistema: 'border-border bg-surface-2 text-muted',
}

const ACTION_LABELS: Record<string, { label: string; category: string }> = {
  'auth.login': { label: 'Inició sesión', category: 'Accesos' },
  'system.setup': { label: 'Configuración inicial', category: 'Equipo' },
  'sales.draft_created': { label: 'Creó un borrador de factura', category: 'Ventas y caja' },
  'sales.draft_updated': { label: 'Editó una factura', category: 'Ventas y caja' },
  'sales.confirmed': { label: 'Envió una factura a caja', category: 'Ventas y caja' },
  'sales.accepted': { label: 'Aceptó una factura', category: 'Ventas y caja' },
  'sales.paid': { label: 'Registró el pago de una factura', category: 'Ventas y caja' },
  'products.created': { label: 'Creó un producto', category: 'Productos e inventario' },
  'products.updated': { label: 'Actualizó un producto', category: 'Productos e inventario' },
  'products.change_requested': { label: 'Solicitó un cambio de producto', category: 'Productos e inventario' },
  'products.stock_added': { label: 'Aumentó existencias', category: 'Productos e inventario' },
  'products.change_approved': { label: 'Aprobó un cambio de producto', category: 'Productos e inventario' },
  'products.change_rejected': { label: 'Rechazó un cambio de producto', category: 'Productos e inventario' },
  'users.created': { label: 'Creó un usuario', category: 'Equipo' },
  'users.deactivated': { label: 'Desactivó un usuario', category: 'Equipo' },
}

const DETAIL_LABELS: Record<string, string> = {
  nombre: 'Nombre',
  rol: 'Rol',
  producto: 'Producto',
  productos: 'Productos',
  cantidad: 'Cantidad',
  unidades: 'Unidades',
  total: 'Total',
  tipo_venta: 'Tipo de venta',
  precio_unitario: 'Precio unitario',
  precio_detal: 'Precio al detal',
  precio_mayor: 'Precio al por mayor',
  codigo_barras: 'Código de barras',
  stock: 'Existencias',
  campo: 'Campo',
  anterior: 'Antes',
  nuevo: 'Después',
  valor_anterior: 'Antes',
  valor_nuevo: 'Propuesto',
  total_anterior: 'Total antes',
  total_nuevo: 'Total después',
  productos_antes: 'Productos antes',
  productos_despues: 'Productos después',
  cambios: 'Cambios',
  estado: 'Estado',
  factura: 'Factura',
  imagen: 'Imagen',
  propuesto: 'Propuesto',
}

function readParam(params: SearchParams, key: string): string | undefined {
  const value = params[key]
  return typeof value === 'string' ? value : undefined
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

function dateBoundary(value: string, nextDay = false): string {
  const result = new Date(`${value}T00:00:00-05:00`)
  if (nextDay) result.setUTCDate(result.getUTCDate() + 1)
  return result.toISOString()
}

function categoryFromParam(value: string | undefined): Category {
  return AUDIT_CATEGORY_OPTIONS.find((option) => option.value === value)?.value ?? 'all'
}

function categoryPrefix(category: Category): string | null {
  if (category === 'sales') return 'sales.%'
  if (category === 'products') return 'products.%'
  if (category === 'access') return 'auth.%'
  return null
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.slice(0, 1))
    .join('')
    .toLocaleUpperCase('es')
}

function formatDetailValue(value: Json | undefined): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string') return value
  if (typeof value === 'number') return new Intl.NumberFormat('es-CO').format(value)
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (Array.isArray(value)) return value.map((item) => formatDetailValue(item)).join(' · ')

  return Object.entries(value)
    .filter(([key]) => !['pin', 'pin_hash', 'token', 'secret'].includes(key))
    .map(([key, nestedValue]) => `${DETAIL_LABELS[key] ?? key}: ${formatDetailValue(nestedValue)}`)
    .join(' · ')
}

function detailRows(details: Json): Array<{ label: string; value: string }> {
  if (details === null || typeof details !== 'object' || Array.isArray(details)) {
    return [{ label: 'Detalle', value: formatDetailValue(details) }]
  }

  return Object.entries(details)
    .filter(([key]) => !['pin', 'pin_hash', 'token', 'secret'].includes(key))
    .map(([key, value]) => ({
      label: DETAIL_LABELS[key] ?? key.replaceAll('_', ' '),
      value: formatDetailValue(value),
    }))
}

function statusPresentation(result: AuditLog['result']): { label: string; style: string; description: string } {
  if (result === 'success') {
    return {
      label: 'Registrado',
      style: 'border-accent-bright/25 bg-accent/10 text-accent-bright',
      description: 'La acción terminó y quedó registrada.',
    }
  }
  if (result === 'failure') {
    return {
      label: 'Con error',
      style: 'border-danger/30 bg-danger/10 text-danger',
      description: 'La acción terminó con un error; puede requerir revisión.',
    }
  }
  return {
    label: 'Pendiente de verificar',
    style: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    description: 'No se confirmó el resultado de esta acción. Verifícala antes de repetirla.',
  }
}

function formatDate(value: string): { date: string; time: string } {
  const date = new Date(value)
  return {
    date: new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date),
    time: new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date),
  }
}

function buildPageHref(
  page: number,
  filters: { actor: string; area: Category; from: string; to: string },
): string {
  const params = new URLSearchParams()
  if (filters.actor) params.set('actor', filters.actor)
  if (filters.area !== 'all') params.set('area', filters.area)
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  params.set('page', String(page))
  return `/logs?${params.toString()}`
}

function AuditDetails({ log }: { log: AuditLog }) {
  const rows = detailRows(log.details)
  const status = statusPresentation(log.result)

  return (
    <details className="group mt-2">
      <summary className="inline-flex min-h-9 cursor-pointer items-center rounded-md text-xs font-semibold text-primary-bright underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary-bright">
        Ver detalles
        <span className="sr-only"> de {log.summary}</span>
      </summary>
      <div className="mt-2 rounded-lg border border-border/70 bg-background/70 p-3 text-xs">
        <p className="text-muted">{status.description}</p>
        {rows.length > 0 && (
          <dl className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-[minmax(7rem,auto)_1fr]">
            {rows.map((row) => (
              <div key={row.label} className="contents">
                <dt className="font-medium capitalize text-muted">{row.label}</dt>
                <dd className="min-w-0 break-words text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {log.entity_id && (
          <p className="mt-3 border-t border-border/70 pt-2 font-mono text-[11px] text-muted">
            Referencia: {log.entity_id}
          </p>
        )}
      </div>
    </details>
  )
}

function Actor({ log }: { log: AuditLog }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden="true"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${ROLE_STYLES[log.actor_role]}`}
      >
        {initials(log.actor_name)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-ink">{log.actor_name}</span>
        <span className={`mt-1 inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${ROLE_STYLES[log.actor_role]}`}>
          {ROLE_LABELS[log.actor_role]}
        </span>
      </span>
    </div>
  )
}

function ResultBadge({ result }: { result: AuditLog['result'] }) {
  const status = statusPresentation(result)
  return (
    <span className={`inline-flex min-h-7 items-center rounded-md border px-2 py-1 text-[11px] font-semibold ${status.style}`}>
      {status.label}
    </span>
  )
}

function AuditRecord({ log }: { log: AuditLog }) {
  const action = ACTION_LABELS[log.action] ?? { label: log.action, category: 'Actividad' }
  const date = formatDate(log.created_at)

  return (
    <article className="rounded-lg border border-border/80 bg-surface/75 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Actor log={log} />
        <ResultBadge result={log.result} />
      </div>
      <div className="mt-4 border-t border-border/70 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{action.category}</p>
        <p className="mt-1 text-sm font-semibold text-ink">{action.label}</p>
        <p className="mt-1 break-words text-sm text-muted">{log.summary}</p>
        <p className="mt-3 text-xs tabular-nums text-muted">
          <time dateTime={log.created_at}>{date.date} · {date.time}</time>
        </p>
        <AuditDetails log={log} />
      </div>
    </article>
  )
}

export default async function LogsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await obtenerSesion()
  if (!session) redirect('/login')

  if (session.rol !== 'dueno') {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-border bg-surface/90 p-6 sm:p-8" role="status">
        <p className="text-sm font-semibold text-muted">Acceso restringido</p>
        <h1 className="mt-2 text-xl font-display font-semibold text-ink">Registro de actividad</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Esta bitácora solo está disponible para el dueño del negocio.</p>
      </section>
    )
  }

  const params = await searchParams
  const rawActor = readParam(params, 'actor') ?? ''
  const rawArea = readParam(params, 'area')
  const rawFrom = readParam(params, 'from') ?? ''
  const rawTo = readParam(params, 'to') ?? ''
  const rawPage = readParam(params, 'page') ?? '1'
  const area = categoryFromParam(rawArea)
  const pageNumber = Number(rawPage)
  const page = Number.isSafeInteger(pageNumber) && pageNumber > 0 && pageNumber <= 10000 ? pageNumber : 1
  const actorIsValid = !rawActor || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawActor)
  const fromIsValid = !rawFrom || isValidDate(rawFrom)
  const toIsValid = !rawTo || isValidDate(rawTo)
  const rangeIsValid = !rawFrom || !rawTo || rawFrom <= rawTo
  const areaIsValid = rawArea === undefined || AUDIT_CATEGORY_OPTIONS.some((option) => option.value === rawArea)
  const pageIsValid = Number.isSafeInteger(pageNumber) && pageNumber > 0 && pageNumber <= 10000
  const filterError =
    !actorIsValid || !fromIsValid || !toIsValid || !rangeIsValid || !areaIsValid || !pageIsValid
      ? 'Uno o más filtros no son válidos. Corrígelos y vuelve a aplicar la búsqueda.'
      : ''

  let auditQuery = supabaseAdmin
    .from('audit_logs')
    .select('id, created_at, actor_id, actor_name, actor_role, action, entity_type, entity_id, summary, details, result')
    .order('created_at', { ascending: false })

  if (actorIsValid && rawActor) auditQuery = auditQuery.eq('actor_id', rawActor)
  const prefix = categoryPrefix(area)
  if (areaIsValid && area === 'users') {
    auditQuery = auditQuery.or('action.like.users.%,action.eq.system.setup')
  } else if (prefix && areaIsValid) {
    auditQuery = auditQuery.like('action', prefix)
  }
  if (fromIsValid && rawFrom) auditQuery = auditQuery.gte('created_at', dateBoundary(rawFrom))
  if (toIsValid && rawTo) auditQuery = auditQuery.lt('created_at', dateBoundary(rawTo, true))

  const [logsResult, usersResult] = await Promise.all([
    auditQuery.range((page - 1) * PAGE_SIZE, (page - 1) * PAGE_SIZE + PAGE_SIZE),
    supabaseAdmin.from('usuarios').select('id, nombre, rol, activo').order('nombre'),
  ])

  if (logsResult.error || usersResult.error) {
    console.error('No se pudo cargar la bitácora', {
      logs: logsResult.error?.message,
      users: usersResult.error?.message,
    })

    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-danger/30 bg-surface/90 p-6 sm:p-8" role="alert">
        <p className="text-sm font-semibold text-danger">No se pudo cargar el registro</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          Verifica la conexión y que el script <code className="font-mono text-ink">supabase/audit_logs.sql</code> se haya ejecutado en Supabase.
        </p>
        <Link href="/logs" className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-semibold text-ink hover:bg-surface-2">
          Intentar de nuevo
        </Link>
      </section>
    )
  }

  const logs = logsResult.data ?? []
  const visibleLogs = logs.slice(0, PAGE_SIZE)
  const hasNextPage = logs.length > PAGE_SIZE
  const users = usersResult.data ?? []
  const filters = {
    actor: actorIsValid ? rawActor : '',
    area: areaIsValid ? area : 'all',
    from: fromIsValid ? rawFrom : '',
    to: toIsValid ? rawTo : '',
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="flex flex-col gap-2 border-b border-border/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Control del negocio</p>
          <h1 className="mt-1 text-balance text-2xl font-display font-semibold text-ink">Registro de actividad</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Revisa quién realizó cada cambio, incluido el dueño. La bitácora empieza a guardar actividad desde su activación; no reconstruye cambios anteriores.
          </p>
        </div>
        <p className="shrink-0 text-xs tabular-nums text-muted">Ordenado del más reciente al más antiguo</p>
      </header>

      <AuditFilters
        actor={filters.actor}
        area={filters.area}
        from={filters.from}
        to={filters.to}
        users={users}
        filterError={filterError}
      />

      <section aria-labelledby="audit-list-heading" className="overflow-hidden rounded-xl border border-border/80 bg-surface/90">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3.5 sm:px-5">
          <div>
            <h2 id="audit-list-heading" className="text-sm font-semibold text-ink">Actividad registrada</h2>
            <p className="mt-1 text-xs text-muted">
              {visibleLogs.length === 0
                ? 'Sin eventos en esta página'
                : `${visibleLogs.length} eventos · página ${page}`}
            </p>
          </div>
          <p className="text-xs text-muted">Zona horaria: Colombia</p>
        </div>

        {visibleLogs.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="font-semibold text-ink">
              {page === 1 && !rawActor && area === 'all' && !rawFrom && !rawTo
                ? 'Aún no hay actividad registrada'
                : 'No hay resultados para estos filtros'}
            </p>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">
              {page === 1 && !rawActor && area === 'all' && !rawFrom && !rawTo
                ? 'Cuando alguien cree o cambie una factura, un producto o un usuario, el evento aparecerá aquí con su autor.'
                : 'Prueba con otra persona, área o rango de fechas.'}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[920px] border-collapse text-left">
                <caption className="sr-only">Actividad del negocio, con autor, acción, detalle, fecha y resultado</caption>
                <thead className="bg-background/45 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  <tr>
                    <th scope="col" className="px-5 py-3">Persona</th>
                    <th scope="col" className="px-4 py-3">Acción</th>
                    <th scope="col" className="px-4 py-3">Detalle</th>
                    <th scope="col" className="px-4 py-3">Fecha y hora</th>
                    <th scope="col" className="px-4 py-3">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {visibleLogs.map((log) => {
                    const action = ACTION_LABELS[log.action] ?? { label: log.action, category: 'Actividad' }
                    const date = formatDate(log.created_at)
                    return (
                      <tr key={log.id} className="align-top hover:bg-surface-2/30">
                        <td className="px-5 py-4"><Actor log={log} /></td>
                        <td className="px-4 py-4">
                          <span className="block text-[11px] font-medium text-muted">{action.category}</span>
                          <span className="mt-1 block text-sm font-semibold text-ink">{action.label}</span>
                        </td>
                        <td className="max-w-sm px-4 py-4">
                          <p className="break-words text-sm text-ink">{log.summary}</p>
                          {log.entity_id && <p className="mt-1 font-mono text-[10px] text-muted">Ref. {log.entity_id.slice(0, 8)}</p>}
                          <AuditDetails log={log} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-xs tabular-nums text-muted">
                          <time dateTime={log.created_at}>{date.date}<br />{date.time}</time>
                        </td>
                        <td className="px-4 py-4"><ResultBadge result={log.result} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <ul className="grid gap-3 p-3 lg:hidden" aria-label="Eventos recientes">
              {visibleLogs.map((log) => <li key={log.id}><AuditRecord log={log} /></li>)}
            </ul>
          </>
        )}
      </section>

      {(page > 1 || hasNextPage) && (
        <nav aria-label="Paginación del registro" className="flex items-center justify-between gap-3">
          {page > 1 ? (
            <Link href={buildPageHref(page - 1, filters)} className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface/80 px-4 text-sm font-semibold text-ink hover:bg-surface-2">
              Página anterior
            </Link>
          ) : <span />}
          <span className="text-xs tabular-nums text-muted">Página {page}</span>
          {hasNextPage ? (
            <Link href={buildPageHref(page + 1, filters)} className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface/80 px-4 text-sm font-semibold text-ink hover:bg-surface-2">
              Página siguiente
            </Link>
          ) : <span />}
        </nav>
      )}
    </div>
  )
}
