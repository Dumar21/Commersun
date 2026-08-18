'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

interface Producto {
  id: string
  nombre: string
  codigo_barras?: string | null
  stock: number
  precio_detal: number
  precio_mayor: number
  imagen_url?: string | null
}

export default function BuscadorProductos({ productos }: { productos: Producto[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [abierto, setAbierto] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputName = useId()

  useEffect(() => {
    if (!abierto) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [abierto])

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return productos
    return productos.filter((producto) => {
      const nombre = producto.nombre.toLowerCase()
      const codigo = (producto.codigo_barras ?? '').toLowerCase()
      return nombre.includes(texto) || codigo.includes(texto)
    })
  }, [busqueda, productos])

  const productosSugeridos = useMemo(() => productosFiltrados.slice(0, 8), [productosFiltrados])

  return (
    <>
      {/* Disparador */}
      <button
        type="button"
        onClick={() => {
          setBusqueda('')
          setAbierto(true)
          requestAnimationFrame(() => inputRef.current?.focus())
        }}
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-left text-sm text-muted transition hover:border-primary-bright/60 sm:w-72"
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="9" cy="9" r="6" />
          <path d="m17 17-3.5-3.5" strokeLinecap="round" />
        </svg>
        <span className="truncate">Buscar producto para editar</span>
      </button>

      {/* Modal de búsqueda */}
      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[10vh] backdrop-blur-sm"
          onClick={() => setAbierto(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="9" cy="9" r="6" />
                <path d="m17 17-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
  ref={inputRef}
  type="search"
  name="product-search"
  id="product-search"
  autoComplete="new-password"
  autoCorrect="off"
  autoCapitalize="off"
  spellCheck={false}
  data-1p-ignore="true"
  data-lpignore="true"
  data-form-type="other"
  inputMode="search"
  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
  value={busqueda}
  onChange={(e) => setBusqueda(e.target.value)}
  placeholder="Buscar por nombre o código"
/>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="rounded-md border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted hover:text-ink"
              >
                Esc
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-3">
              {productosSugeridos.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-background/60 p-4 text-center text-sm text-muted">
                  No se encontraron productos con ese nombre o código.
                </div>
              ) : (
                <div className="space-y-2">
                  {productosSugeridos.map((producto) => (
                    <Link
                      key={producto.id}
                      href={`/productos/${producto.id}/editar`}
                      onClick={() => setAbierto(false)}
                      className="flex w-full items-center gap-3 rounded-xl border border-border bg-background/60 p-2.5 text-left transition hover:border-primary-bright/60 hover:bg-surface-2"
                    >
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
                        {producto.imagen_url ? (
                          <img src={producto.imagen_url} alt={producto.nombre} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-muted">IMG</div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-ink">{producto.nombre}</p>
                          <span className="text-xs text-muted">Stock {producto.stock}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-3">
                          <span className="text-xs text-muted">{producto.codigo_barras || 'Sin código'}</span>
                          <span className="text-sm font-bold text-primary-bright">${producto.precio_detal.toLocaleString('es-CO')}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}