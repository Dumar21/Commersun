'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const ICONOS: Record<string, ReactNode> = {
  '/dashboard': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  '/ventas': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2.5 3h2.4l2.2 11.2a2 2 0 0 0 2 1.6h8.3a2 2 0 0 0 2-1.6L21 7H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  '/caja': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="7" width="18" height="13" rx="1.5" />
      <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" strokeLinecap="round" />
      <path d="M3 12h18M9 16h6" strokeLinecap="round" />
    </svg>
  ),
  '/productos': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 8l9 5 9-5M12 13v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  '/usuarios': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" strokeLinecap="round" />
      <path d="M16.5 5.2a3.2 3.2 0 0 1 0 6.1M21 20a6 6 0 0 0-4.2-5.7" strokeLinecap="round" />
    </svg>
  ),
}

interface Link_ {
  href: string
  label: string
}

export default function NavLinks({ links }: { links: Link_[] }) {
  const pathname = usePathname()

  return (
    <ul className="app-nav-links">
      {links.map((link) => {
        const activo = pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <li key={link.href} className="flex-1 md:flex-none">
            <Link href={link.href} className="app-nav-link" data-active={activo}>
              <span className="app-nav-icon">{ICONOS[link.href]}</span>
              <span>{link.label}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}