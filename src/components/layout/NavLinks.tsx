// src/components/layout/NavLinks.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

type NavLink = { href: string; label: string; mobileLabel: string; icon: string }

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
  actividad: (
    <>
      <path d="M4 5h16M4 12h10M4 19h7" />
      <circle cx="18" cy="12" r="2" />
      <circle cx="15" cy="19" r="2" />
    </>
  ),
}

export default function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname()
  const activeHref = links.find(
    (link) => pathname === link.href || pathname.startsWith(link.href + '/'),
  )?.href
  const listRef = useRef<HTMLUListElement>(null)
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>())
  const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties | null>(null)

  useLayoutEffect(() => {
    const list = listRef.current
    const activeLink = activeHref ? linkRefs.current.get(activeHref) : undefined
    if (!list || !activeLink) {
      setIndicatorStyle(null)
      return
    }

    const updateIndicator = () => {
      const listBounds = list.getBoundingClientRect()
      const linkBounds = activeLink.getBoundingClientRect()
      setIndicatorStyle({
        left: linkBounds.left - listBounds.left,
        top: linkBounds.top - listBounds.top,
        width: linkBounds.width,
        height: linkBounds.height,
      })

      const scroller = list.parentElement
      if (!scroller) return
      const scrollerBounds = scroller.getBoundingClientRect()
      if (linkBounds.left < scrollerBounds.left) {
        scroller.scrollLeft += linkBounds.left - scrollerBounds.left
      } else if (linkBounds.right > scrollerBounds.right) {
        scroller.scrollLeft += linkBounds.right - scrollerBounds.right
      }
    }

    updateIndicator()
    const resizeObserver = new ResizeObserver(updateIndicator)
    resizeObserver.observe(list)
    resizeObserver.observe(activeLink)
    window.addEventListener('resize', updateIndicator)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateIndicator)
    }
  }, [activeHref])

  return (
    <ul ref={listRef} className="relative flex h-12 w-max min-w-full items-center gap-0.5 sm:h-auto sm:w-auto sm:gap-1">
      <li
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full border border-border/80 bg-surface-2/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] opacity-0 transition-[left,top,width,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={indicatorStyle ? { ...indicatorStyle, opacity: 1 } : undefined}
      />
      {links.map((link) => {
        const activo = pathname === link.href || pathname.startsWith(link.href + '/')

        return (
          <li
            key={link.href}
            className="flex shrink-0 items-center justify-center self-stretch"
          >
            <Link
              ref={(element) => {
                if (element) linkRefs.current.set(link.href, element)
                else linkRefs.current.delete(link.href)
              }}
              href={link.href}
              title={link.label}
              aria-label={link.label}
              aria-current={activo ? 'page' : undefined}
              className={`relative z-10 flex h-11 min-w-11 flex-row items-center justify-center gap-0 rounded-full border border-transparent text-xs leading-4 font-semibold transition-[color,transform] duration-200 active:scale-95 sm:h-11 sm:gap-0 sm:py-2 sm:text-xs sm:font-semibold lg:w-auto lg:gap-2 lg:px-3 ${
                activo
                  ? 'w-max px-2.5 text-white sm:w-max'
                  : 'w-11 px-1.5 text-ink/60 hover:bg-surface-2/60 hover:text-ink sm:w-11 sm:px-1.5 md:w-max md:px-2'
              }`}
            >
              <svg
                className={`h-5 w-5 shrink-0 transition-transform duration-200 sm:h-4 sm:w-4 md:hidden lg:block ${
                  activo ? 'scale-105' : ''
                }`}
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
              <span
                aria-hidden={!activo}
                className={`block min-w-0 overflow-hidden whitespace-nowrap text-left transition-[max-width,opacity,margin] duration-200 ease-out sm:hidden ${
                  activo ? 'ml-1 max-w-[6rem] opacity-100' : 'ml-0 max-w-0 opacity-0'
                }`}
              >
                {link.mobileLabel}
              </span>
              <span aria-hidden="true" className="hidden text-left md:inline lg:hidden">
                {link.mobileLabel}
              </span>
              <span className="hidden text-left lg:inline">{link.label}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}