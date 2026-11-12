'use client'

import Image from 'next/image'
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
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
  const busquedaDiferida = useDeferredValue(busqueda)
  const [abierto, setAbierto] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!abierto) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAbierto(false)
        requestAnimationFrame(() => triggerRef.current?.focus())
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [abierto])

  const productosFiltrados = useMemo(() => {
    const texto = busquedaDiferida.trim().toLowerCase()
    if (!texto) return productos
    return productos.filter((producto) => {
      const nombre = producto.nombre.toLowerCase()
      const codigo = (producto.codigo_barras ?? '').toLowerCase()
      return nombre.includes(texto) || codigo.includes(texto)
    })
  }, [busquedaDiferida, productos])

  const productosSugeridos = useMemo(() => productosFiltrados.slice(0, 8), [productosFiltrados])

  return (
    <>
      {/* Disparador */}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={abierto}
        onClick={() => {
          setBusqueda('')
          setAbierto(true)
          requestAnimationFrame(() => inputRef.current?.focus())
        }}
        className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-left text-sm text-muted transition-colors hover:border-primary-bright/60 sm:w-72"
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
          role="dialog"
          aria-modal="true"
          aria-labelledby="buscar-producto-titulo"
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[10vh] backdrop-blur-sm"
          onClick={() => {
            setAbierto(false)
            requestAnimationFrame(() => triggerRef.current?.focus())
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Tab') return
            const elementos = event.currentTarget.querySelectorAll<HTMLElement>(
              'input:not(:disabled), a[href], button:not(:disabled)'
            )
            const primero = elementos[0]
            const ultimo = elementos[elementos.length - 1]
            if (!primero || !ultimo) return
            if (event.shiftKey && document.activeElement === primero) {
              event.preventDefault()
              ultimo.focus()
            } else if (!event.shiftKey && document.activeElement === ultimo) {
              event.preventDefault()
              primero.focus()
            }
          }}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-border bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <h2 id="buscar-producto-titulo" className="sr-only">Buscar producto para editar</h2>
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
  className="min-h-11 w-full bg-transparent text-sm text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-primary-bright focus-visible:outline-offset-2"
  value={busqueda}
  onChange={(e) => setBusqueda(e.target.value)}
  placeholder="Buscar por nombre o código"
/>
              <button
                type="button"
                onClick={() => {
                  setAbierto(false)
                  requestAnimationFrame(() => triggerRef.current?.focus())
                }}
                className="min-h-11 rounded-md border border-border px-3 text-xs text-muted transition-colors hover:text-ink"
              >
                Cerrar
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
                      className="flex min-h-14 w-full items-center gap-3 rounded-lg border border-border bg-background/60 p-2.5 text-left transition-colors hover:border-primary-bright/50 hover:bg-surface-2"
                    >
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
                        {producto.imagen_url ? (
                          <Image
                            src={producto.imagen_url}
                            alt={producto.nombre}
                            width={44}
                            height={44}
                            sizes="44px"
                            className="h-full w-full object-cover"
                          />
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