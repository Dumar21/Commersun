// src/components/dashboard/KPIAnimado.tsx
'use client'

import { useEffect, useRef } from 'react'
import { animate } from 'animejs'

type Props = {
  valor: number
  prefijo?: string
  sufijo?: string
  decimales?: number
  duracion?: number
  className?: string
}

export default function KPIAnimado({
  valor,
  prefijo = '',
  sufijo = '',
  decimales = 0,
  duracion = 1200,
  className = '',
}: Props) {
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const formatear = (n: number) =>
      `${prefijo}${new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales,
      }).format(n)}${sufijo}`

    const estado = { n: 0 }
    el.textContent = formatear(0)

    const animacion = animate(estado, {
      n: valor,
      duration: duracion,
      ease: 'outExpo',
      onUpdate: () => {
        el.textContent = formatear(estado.n)
      },
      onComplete: () => {
        el.textContent = formatear(valor)
      },
    })

    return () => {
      animacion.revert()
    }
  }, [valor, prefijo, sufijo, decimales, duracion])

  return (
    <p ref={ref} className={className}>
      {prefijo}
      {valor.toLocaleString('es-CO', {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales,
      })}
      {sufijo}
    </p>
  )
}