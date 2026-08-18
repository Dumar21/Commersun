// src/components/layout/Nav.tsx
import { obtenerSesion } from '@/lib/auth-server'
import NavLinks from './NavLinks'

const LINKS_POR_ROL: Record<string, { href: string; label: string }[]> = {
  super_admin: [{ href: '/usuarios', label: 'Usuarios' }],
  dueno: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/ventas', label: 'Ventas' },
    { href: '/caja', label: 'Caja' },
    { href: '/productos', label: 'Productos' },
    { href: '/usuarios', label: 'Usuarios' },
  ],
  vendedor: [{ href: '/ventas', label: 'Ventas' }],
  cajero: [{ href: '/caja', label: 'Caja' }],
  bodegero: [{ href: '/productos', label: 'Productos' }],
}

export default async function Nav() {
  const sesion = await obtenerSesion()
  if (!sesion) return null

  const links = LINKS_POR_ROL[sesion.rol] ?? []

  return (
    <nav className="app-nav" aria-label="Navegación principal">
      <div className="app-nav-brand">
        <span className="barcode-mark" aria-hidden="true" />
        <span className="app-nav-title">
          <span className="brand-commer">COMMER</span>
          <span className="brand-sun">SUN</span>
        </span>
      </div>

      <div className="flex items-stretch md:flex-1 md:flex-col">
        <NavLinks links={links} />

        {/* Logout: icono suelto al final de la fila en mobile, botón completo abajo en desktop */}
        <form action="/logout" method="post" className="app-nav-logout-mobile">
          <button
            type="submit"
            className="app-nav-link w-full text-danger hover:bg-danger/10 hover:text-danger"
          >
            <span className="app-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span>Salir</span>
          </button>
        </form>
      </div>

      <form action="/logout" method="post" className="app-nav-logout">
        <button
          type="submit"
          className="app-nav-link w-full border border-border bg-surface-2 text-danger hover:bg-danger/10 hover:text-danger"
        >
          <span className="app-nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>Cerrar sesión</span>
        </button>
      </form>
    </nav>
  )
}
