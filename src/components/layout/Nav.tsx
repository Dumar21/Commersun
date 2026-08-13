// src/components/layout/Nav.tsx
import Link from 'next/link'
import { obtenerSesion } from '@/lib/auth-server'

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
      <ul className="app-nav-links">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="app-nav-link">{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}