// src/components/dashboard/iconos.tsx

type IconoProps = { className?: string }

export function IconoVentas({ className = 'h-5 w-5' }: IconoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 13.5 8 8l3 3 6-6.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 4.5h4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconoFactura({ className = 'h-5 w-5' }: IconoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 3h10v14l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2V3Z" strokeLinejoin="round" />
      <path d="M7 7h6M7 10h6" strokeLinecap="round" />
    </svg>
  )
}

export function IconoAprobacion({ className = 'h-5 w-5' }: IconoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="m9 12 2 2 4-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconoCheck({ className = 'h-4 w-4' }: IconoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconoCerrar({ className = 'h-4 w-4' }: IconoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconoFlecha({ className = 'h-4 w-4' }: IconoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}