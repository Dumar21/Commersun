import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export default function PageLoading({ children, className = '' }: Props) {
  return (
    <div
      role="status"
      aria-label="Cargando contenido"
      aria-busy="true"
      className={`page-loading ${className}`}
    >
      {children}
    </div>
  )
}
