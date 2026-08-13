// src/components/caja/FilaFactura.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { aceptarFactura, pagarFactura } from '@/app/caja/actions'

interface ItemFacturaResumen {
  nombre: string
  cantidad: number
  tipo_venta: string
  precio_unitario: number
  subtotal: number
}

interface Props {
  factura: { id: string; total: number; fecha_hora: string; nombreVendedor: string }
  accion: 'aceptar' | 'pagar'
  items?: ItemFacturaResumen[]
}

export default function FilaFactura({ factura, accion, items = [] }: Props) {
  const router = useRouter()
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')

  const ejecutar = async () => {
    setProcesando(true)
    setError('')
    const resultado = accion === 'aceptar' ? await aceptarFactura(factura.id) : await pagarFactura(factura.id)
    setProcesando(false)
    if (resultado.error) { setError(resultado.error); return }
    router.refresh()
  }

  return (
    <article className="rounded-2xl border border-border bg-surface-2/90 p-4 shadow-[0_14px_30px_rgba(11,14,19,0.16)] transition hover:border-primary-bright/50 hover:bg-surface-2">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-full border border-primary-bright/30 bg-primary-bright/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-bright">
              {accion === 'aceptar' ? 'Por aceptar' : 'En proceso'}
            </span>
            <span className="text-xs text-muted">#{factura.id.slice(0, 8)}</span>
          </div>

          <div>
            <p className="text-2xl font-display font-bold text-ink">${factura.total.toLocaleString('es-CO')}</p>
            <p className="text-sm text-muted">Vendedor: {factura.nombreVendedor}</p>
            <p className="text-sm text-muted">{new Date(factura.fecha_hora).toLocaleString('es-CO')}</p>
          </div>

          <div className="rounded-xl border border-border bg-background/60 p-2.5">
            <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted">Productos</p>
            <div className="space-y-1.5 text-sm text-ink">
              {items.length === 0 ? (
                <p className="text-muted">Sin detalle disponible</p>
              ) : (
                items.map((item, index) => (
                  <div key={`${item.nombre}-${index}`} className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                    <span className="min-w-0 flex-1 truncate">
                      {item.nombre} <span className="text-muted">x{item.cantidad}</span>
                    </span>
                    <span className="text-muted">{item.tipo_venta === 'mayor' ? 'Mayor' : 'Detal'}</span>
                    <span className="font-semibold text-ink">${item.subtotal.toLocaleString('es-CO')}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={ejecutar}
          disabled={procesando}
          className={accion === 'pagar' ? 'btn-primary' : 'btn-accent'}
        >
          {procesando ? 'Procesando...' : accion === 'aceptar' ? 'Aceptar' : 'Marcar como pagada'}
        </button>
      </div>

      {error && <p className="mt-3 text-danger text-sm">{error}</p>}
    </article>
  )
}