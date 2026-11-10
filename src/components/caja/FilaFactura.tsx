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
    <article className="rounded-2xl border border-border/80 bg-surface-2/75 p-4 shadow-[0_14px_30px_rgba(11,14,19,0.16)] transition hover:border-primary-bright/40 hover:bg-surface-2">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full border border-primary-bright/20 bg-primary-bright/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-primary-bright">
              {accion === 'aceptar' ? 'Por aceptar' : 'En proceso'}
            </span>
            <span className="rounded-full border border-border/70 bg-background/40 px-2.5 py-1 text-[9px] font-mono text-muted">#{factura.id.slice(0, 8)}</span>
          </div>

          <div>
            <p className="text-2xl font-display font-bold tabular-nums text-ink">${factura.total.toLocaleString('es-CO')}</p>
            <p className="mt-1 text-xs text-muted">{factura.nombreVendedor} · {new Date(factura.fecha_hora).toLocaleString('es-CO')}</p>
          </div>

          <div className="rounded-xl border border-border/70 bg-background/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Detalle de productos</p>
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[9px] font-semibold text-muted">{items.length} {items.length === 1 ? 'artículo' : 'artículos'}</span>
            </div>
            <div className="space-y-1.5 text-sm text-ink">
              {items.length === 0 ? (
                <p className="text-muted">Sin detalle disponible</p>
              ) : (
                items.map((item, index) => (
                  <div key={`${item.nombre}-${index}`} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-xs odd:bg-white/[0.025] sm:text-sm">
                    <span className="min-w-0 flex-1 truncate">
                      {item.nombre} <span className="text-muted">× {item.cantidad}</span>
                    </span>
                    <span className="rounded-full border border-border/60 px-2 py-0.5 text-[9px] text-muted">{item.tipo_venta === 'mayor' ? 'Mayor' : 'Detal'}</span>
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