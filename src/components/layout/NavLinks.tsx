// src/components/layout/NavLinks.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

type NavLink = { href: string; label: string; icon: string }

const ICONOS: Record<string, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  ventas: (
    <>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </>
  ),
  caja: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  productos: (
    <>
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
      <path d="M3 8l9 5 9-5" />
      <path d="M12 13v8" />
    </>
  ),
  asistente: (
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M12 7l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
    </>
  ),
  usuarios: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
}

export default function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname()

  return (
    <ul className="flex items-center gap-1">
      {links.map((link) => {
        const activo = pathname === link.href || pathname.startsWith(link.href + '/')

        return (
          <li key={link.href} className="shrink-0">
            <Link
              href={link.href}
              title={link.label}
              aria-label={link.label}
              aria-current={activo ? 'page' : undefined}
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-all active:scale-95 ${
                activo
                  ? 'border-primary/30 bg-primary/20 text-primary-bright'
                  : 'border-transparent text-ink/70 hover:bg-surface-2/60 hover:text-ink'
              }`}
            >
              <svg
                className="h-5 w-5 shrink-0 sm:h-4 sm:w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {ICONOS[link.icon]}
              </svg>
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}