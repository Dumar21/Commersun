// src/components/layout/Nav.tsx
import { obtenerSesion } from '@/lib/auth-server'
import NavLinks from './NavLinks'

const LINKS_POR_ROL: Record<string, { href: string; label: string; icon: string }[]> = {
  super_admin: [{ href: '/usuarios', label: 'Usuarios', icon: 'usuarios' }],
  dueno: [
    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { href: '/ventas', label: 'Ventas', icon: 'ventas' },
    { href: '/caja', label: 'Caja', icon: 'caja' },
    { href: '/productos', label: 'Productos', icon: 'productos' },
    { href: '/reportes', label: 'Asistente IA', icon: 'asistente' },
    { href: '/usuarios', label: 'Usuarios', icon: 'usuarios' },
  ],
  vendedor: [{ href: '/ventas', label: 'Ventas', icon: 'ventas' }],
  cajero: [{ href: '/caja', label: 'Caja', icon: 'caja' }],
  bodegero: [{ href: '/productos', label: 'Productos', icon: 'productos' }],
}

export default async function Nav() {
  const sesion = await obtenerSesion()
  if (!sesion) return null

  const links = LINKS_POR_ROL[sesion.rol] ?? []

  return (
    <header className="app-header-container">
      <nav className="app-nav-glass" aria-label="Navegación principal">
        <div className="hidden items-center gap-2.5 px-2 sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 text-primary-bright shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <span className="barcode-mark" aria-hidden="true" />
          </div>
          <span className="font-display text-lg font-bold tracking-wider text-ink hidden md:inline">
            VENTO<span className="text-accent-bright">.</span>
          </span>
        </div>

        <div className="hidden h-5 w-[1px] bg-border/60 sm:block" />

        <div className="flex-1 overflow-x-auto no-scrollbar">
          <NavLinks links={links} />
        </div>

        <form action="/logout" method="post" className="flex items-center">
          <button
            type="submit"
            aria-label="Cerrar sesión"
            className="flex items-center gap-2 rounded-full border border-border/80 bg-surface-2/60 px-3 py-2 text-xs font-semibold text-danger/90 transition-all hover:bg-danger/15 hover:border-danger/30 hover:text-danger active:scale-95"
            title="Cerrar sesión"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Salir</span>
          </button>
        </form>
      </nav>
    </header>
  )
}