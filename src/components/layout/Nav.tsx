// src/components/layout/Nav.tsx
import { obtenerSesion } from '@/lib/auth-server'
import NavLinks from './NavLinks'

const LINKS_POR_ROL: Record<string, { href: string; label: string; mobileLabel: string; icon: string }[]> = {
  super_admin: [{ href: '/usuarios', label: 'Usuarios', mobileLabel: 'Usuarios', icon: 'usuarios' }],
  dueno: [
    { href: '/dashboard', label: 'Dashboard', mobileLabel: 'Inicio', icon: 'dashboard' },
    { href: '/ventas', label: 'Ventas', mobileLabel: 'Ventas', icon: 'ventas' },
    { href: '/caja', label: 'Caja', mobileLabel: 'Caja', icon: 'caja' },
    { href: '/productos', label: 'Productos', mobileLabel: 'Stock', icon: 'productos' },
    { href: '/reportes', label: 'Asistente IA', mobileLabel: 'Asistente', icon: 'asistente' },
    { href: '/usuarios', label: 'Usuarios', mobileLabel: 'Usuarios', icon: 'usuarios' },
    { href: '/logs', label: 'Actividad', mobileLabel: 'Logs', icon: 'actividad' },
  ],
  vendedor: [{ href: '/ventas', label: 'Ventas', mobileLabel: 'Ventas', icon: 'ventas' }],
  cajero: [{ href: '/caja', label: 'Caja', mobileLabel: 'Caja', icon: 'caja' }],
  bodegero: [{ href: '/productos', label: 'Productos', mobileLabel: 'Stock', icon: 'productos' }],
}

export default async function Nav() {
  const sesion = await obtenerSesion()
  if (!sesion) return null

  const links = LINKS_POR_ROL[sesion.rol] ?? []

  return (
    <header className="app-header-container">
      <nav className="app-nav-glass" aria-label="Navegación principal">
        <div className="hidden items-center gap-2.5 px-2 sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted">
            <span className="barcode-mark" aria-hidden="true" />
          </div>
          <span className="font-display text-lg font-bold tracking-wider text-ink hidden md:inline">
            VENTO<span className="text-accent-bright">.</span>
          </span>
        </div>

        <div className="hidden h-5 w-[1px] bg-border/60 sm:block" />

        <div className="app-nav-scroll min-w-0 flex-1 overflow-x-auto">
          <NavLinks links={links} />
        </div>

        <form action="/logout" method="post" className="flex shrink-0 items-center">
          <button
            type="submit"
            aria-label="Cerrar sesión"
            className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-full border border-white/10 bg-white/[0.04] text-danger/90 transition-colors hover:border-danger/30 hover:bg-danger/15 hover:text-danger active:scale-95 sm:h-11 sm:w-auto sm:flex-row sm:gap-2 sm:rounded-full sm:bg-surface-2/60 sm:px-3 sm:py-2 sm:text-xs sm:font-semibold"
            title="Cerrar sesión"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden text-xs font-semibold sm:inline">Salir</span>
          </button>
        </form>
      </nav>
    </header>
  )
}
