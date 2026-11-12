// src/components/dashboard/SolicitudesAprobacion.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { aprobarCambioProducto, rechazarCambioProducto } from '@/app/dashboard/actions'
import { IconoCheck, IconoCerrar } from './iconos'

interface Solicitud {
  id: string
  id_producto: string
  nombre_producto?: string | null
  campo?: string | null
  valor_anterior?: string | number | null
  valor_nuevo?: string | number | null
  created_at?: string | null
}

const nombreCampo = (campo?: string | null) => {
  switch (campo) {
    case 'precio_detal':
      return 'Precio al detal'
    case 'precio_mayor':
      return 'Precio al por mayor'
    case 'stock':
      return 'Stock'
    case 'nombre':
      return 'Nombre'
    case 'codigo_barras':
      return 'Código de barras'
    default:
      return campo ?? 'Campo'
  }
}

const formatearValor = (campo?: string | null, valor?: string | number | null) => {
  if (valor === null || valor === undefined || valor === '') return '—'
  if (campo === 'precio_detal' || campo === 'precio_mayor') {
    const n = Number(valor)
    if (Number.isNaN(n)) return String(valor)
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(n)
  }
  return String(valor)
}

const tiempoRelativo = (valor?: string | null) => {
  if (!valor) return '—'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return '—'

  const seg = Math.round((fecha.getTime() - Date.now()) / 1000)
  const abs = Math.abs(seg)
  const rtf = new Intl.RelativeTimeFormat('es-CO', { numeric: 'auto' })

  if (abs < 60) return 'justo ahora'
  if (abs < 3600) return rtf.format(Math.round(seg / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(seg / 3600), 'hour')
  return rtf.format(Math.round(seg / 86400), 'day')
}

export default function SolicitudesAprobacion({ solicitudes }: { solicitudes: Solicitud[] }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [procesando, setProcesando] = useState<string | null>(null)

  const ejecutarAccion = async (id: string, accion: 'aprobar' | 'rechazar') => {
    setError('')
    setProcesando(id)

    const formData = new FormData()
    formData.set('solicitudId', id)

    const resultado =
      accion === 'aprobar' ? await aprobarCambioProducto(formData) : await rechazarCambioProducto(formData)

    setProcesando(null)

    if ('error' in resultado && resultado.error) {
      setError(resultado.error)
      return
    }

    router.refresh()
  }

  if (solicitudes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
          <IconoCheck className="h-6 w-6" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Todo al día</p>
          <p className="mt-1 text-xs text-muted">No hay cambios pendientes por aprobar.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div role="alert" className="border-b border-danger/20 bg-danger/10 px-5 py-3 text-sm text-danger">{error}</div>
      )}

      <ul className="divide-y divide-border/50 px-3 sm:px-4">
        {solicitudes.map((solicitud) => {
          const ocupado = procesando === solicitud.id

          return (
            <li key={solicitud.id} className="flex flex-col gap-3 px-2.5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {solicitud.nombre_producto ?? 'Producto'}
                  </p>
                  <p className="mt-0.5 text-xs text-muted" suppressHydrationWarning>
                    {tiempoRelativo(solicitud.created_at)}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-muted">
                  {nombreCampo(solicitud.campo)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="min-w-0 truncate text-muted line-through">
                  {formatearValor(solicitud.campo, solicitud.valor_anterior)}
                </span>
                <span className="text-muted">→</span>
                <span className="min-w-0 truncate font-bold text-accent-bright">
                  {formatearValor(solicitud.campo, solicitud.valor_nuevo)}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => ejecutarAccion(solicitud.id, 'aprobar')}
                  className="btn-primary inline-flex flex-1 items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  <IconoCheck className="h-4 w-4" />
                  {ocupado ? 'Procesando...' : 'Aprobar'}
                </button>

                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => ejecutarAccion(solicitud.id, 'rechazar')}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink transition-colors hover:border-danger/40 hover:bg-danger/10 hover:text-danger disabled:opacity-60"
                >
                  <IconoCerrar className="h-4 w-4" />
                  Rechazar
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}