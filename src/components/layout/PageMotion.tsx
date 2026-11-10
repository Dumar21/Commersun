'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export default function PageMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/login') return <>{children}</>

  return <div>{children}</div>
}
