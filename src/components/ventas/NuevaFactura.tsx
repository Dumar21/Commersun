// src/components/ventas/NuevaFactura.tsx
'use client'

import type React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearFactura, actualizarFactura, confirmarFactura } from '@/app/ventas/actions'

interface Producto {
  id: string
  nombre: string
  precio_detal: number
  precio_mayor: number
  stock: number
  imagen_url?: string | null
}

interface ItemForm {
  id_producto: string
  cantidad: number
  tipo_venta: 'detal' | 'mayor'
}

interface Props {
  productos: Producto[]
  facturaId?: string
  itemsIniciales?: ItemForm[]
}

// Select temático: sin apariencia nativa del navegador, con flecha propia en cyan
const selectClass =
  'w-full truncate appearance-none rounded-lg border border-border bg-background/60 py-1.5 pl-2.5 pr-7 text-sm font-semibold text-ink outline-none transition focus:border-primary-bright/60 focus:ring-1 focus:ring-primary-bright/30'

const selectChevronStyle: React.CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%2333c7e0' stroke-width='1.8'%3E%3Cpath d='m5 8 5 5 5-5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.55rem center',
  backgroundSize: '13px',
}

export default function NuevaFactura({ productos, facturaId, itemsIniciales }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<ItemForm[]>(itemsIniciales ?? [])
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  // --- Modal de búsqueda de productos ---
  const [buscadorAbierto, setBuscadorAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!buscadorAbierto) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBuscadorAbierto(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [buscadorAbierto])

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return productos
    return productos.filter((producto) => producto.nombre.toLowerCase().includes(texto))
  }, [busqueda, productos])

  const productosSugeridos = useMemo(() => productosFiltrados.slice(0, 8), [productosFiltrados])

  const agregarLinea = (productoId?: string) => {
    if (!productoId || productos.length === 0) return

    setItems((prev) => {
      const posicionExistente = prev.findIndex((item) => item.id_producto === productoId)

      if (posicionExistente >= 0) {
        return prev.map((item, index) =>
          index === posicionExistente ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      }

      return [...prev, { id_producto: productoId, cantidad: 1, tipo_venta: 'detal' }]
    })

    setBuscadorAbierto(false)
  }

  const actualizarLinea = (index: number, cambios: Partial<ItemForm>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...cambios } : item)))
  }

  const cambiarCantidad = (index: number, delta: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item))
    )
  }

  const quitarLinea = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const total = items.reduce((acc, item) => {
    const producto = productos.find((p) => p.id === item.id_producto)
    if (!producto) return acc
    const precio = item.tipo_venta === 'mayor' ? producto.precio_mayor : producto.precio_detal
    return acc + precio * item.cantidad
  }, 0)

  const itemCount = items.reduce((acc, item) => acc + item.cantidad, 0)

  const guardar = async () => {
    setGuardando(true)
    setMensaje('')
    const resultado = facturaId ? await actualizarFactura(facturaId, items) : await crearFactura(items)
    setGuardando(false)
    if (resultado.error) { setMensaje(resultado.error); return }
    router.push('/ventas')
  }

  const confirmarYEnviar = async () => {
    setGuardando(true)
    setMensaje('')

    let idAConfirmar: string | undefined = facturaId

    if (!idAConfirmar) {
      const resultadoCrear = await crearFactura(items)
      if (resultadoCrear.error) {
        setGuardando(false)
        setMensaje(resultadoCrear.error)
        return
      }
      idAConfirmar = resultadoCrear.facturaId
    } else {
      const resultadoGuardar = await actualizarFactura(idAConfirmar, items)
      if (resultadoGuardar.error) {
        setGuardando(false)
        setMensaje(resultadoGuardar.error)
        return
      }
    }

    if (!idAConfirmar) {
      setGuardando(false)
      setMensaje('No se pudo identificar la factura')
      return
    }

    const resultadoConfirmar = await confirmarFactura(idAConfirmar)

    setGuardando(false)
    if (resultadoConfirmar.error) { setMensaje(resultadoConfirmar.error); return }
    router.push('/ventas')
  }

  return (
    <div className="space-y-6">
      <div className="card flex flex-col gap-5 bg-[radial-gradient(circle_at_top_left,_rgba(51,199,224,0.18),transparent_40%)]">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary-bright">Ventas</p>
            <h2 className="font-display font-bold text-ink text-2xl">{facturaId ? 'Editar factura' : 'Nueva factura'}</h2>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm text-muted">
            <span className="h-2.5 w-2.5 rounded-full bg-primary-bright" />
            {items.length} líneas · {itemCount} unidades
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="space-y-4">
            {/* Disparador del buscador: ya no empuja contenido, abre el modal */}
            <button
              type="button"
              onClick={() => {
                setBusqueda('')
                setBuscadorAbierto(true)
                requestAnimationFrame(() => inputRef.current?.focus())
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface-2/80 px-4 py-3 text-left text-muted transition hover:border-primary-bright/60 hover:bg-surface"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="9" cy="9" r="6" />
                <path d="m17 17-3.5-3.5" strokeLinecap="round" />
              </svg>
              <span className="text-sm">Buscar y agregar producto…</span>
              <span className="ml-auto rounded-md border border-border bg-background/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                Click
              </span>
            </button>

            <div className="flex flex-col gap-2">
              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-surface-2/70 p-8 text-center text-muted">
                  Aún no agregas productos. Usa el buscador para empezar la venta.
                </div>
              ) : (
                items.map((item, index) => {
                  const producto = productos.find((p) => p.id === item.id_producto)
                  const precioUnitario = producto ? (item.tipo_venta === 'mayor' ? producto.precio_mayor : producto.precio_detal) : 0
                  const subtotal = precioUnitario * item.cantidad

                  return (
                    <div
                      key={index}
                      className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface-2/80 px-3 py-2.5 lg:flex-row lg:items-center lg:gap-3"
                    >
                      {/* Línea 1 en mobile: imagen + nombre + quitar. En desktop se une a la fila completa. */}
                      <div className="flex items-center gap-3 lg:contents">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
                          {producto?.imagen_url ? (
                            <img src={producto.imagen_url} alt={producto.nombre} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[9px] text-muted">IMG</div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <select
                            className={selectClass}
                            style={selectChevronStyle}
                            value={item.id_producto}
                            onChange={(e) => actualizarLinea(index, { id_producto: e.target.value })}
                          >
                            {productos.map((p) => (
                              <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                          </select>
                          <span className="mt-1 block text-xs text-muted">${precioUnitario.toLocaleString('es-CO')} c/u</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => quitarLinea(index)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-danger transition hover:bg-danger/10 lg:order-last"
                          aria-label="Quitar línea"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Línea 2 en mobile: tipo, cantidad y subtotal. En desktop se une a la fila completa. */}
                      <div className="flex items-center justify-between gap-3 pl-[52px] lg:contents lg:pl-0">
                        {/* Toggle Detal / Mayor */}
                        <div className="flex shrink-0 items-center rounded-lg border border-border bg-background/60 p-0.5 text-xs">
                          <button
                            type="button"
                            onClick={() => actualizarLinea(index, { tipo_venta: 'detal' })}
                            className={`rounded-md px-2 py-1 transition ${item.tipo_venta === 'detal' ? 'bg-primary-bright text-background font-semibold' : 'text-muted'}`}
                          >
                            Detal
                          </button>
                          <button
                            type="button"
                            onClick={() => actualizarLinea(index, { tipo_venta: 'mayor' })}
                            className={`rounded-md px-2 py-1 transition ${item.tipo_venta === 'mayor' ? 'bg-primary-bright text-background font-semibold' : 'text-muted'}`}
                          >
                            Mayor
                          </button>
                        </div>

                        {/* Stepper de cantidad */}
                        <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background/60 px-1.5 py-1">
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(index, -1)}
                            className="flex h-5 w-5 items-center justify-center rounded text-muted hover:text-ink"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-sm font-medium text-ink">{item.cantidad}</span>
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(index, 1)}
                            className="flex h-5 w-5 items-center justify-center rounded text-muted hover:text-ink"
                          >
                            +
                          </button>
                        </div>

                        <span className="w-20 shrink-0 text-right text-sm font-bold text-primary-bright">
                          ${subtotal.toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-surface-2/80 p-5 shadow-[0_20px_40px_rgba(17,24,39,0.25)]">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Resumen</p>
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <p className="text-sm text-muted">Total estimado</p>
                <p className="mt-2 text-3xl font-display font-bold text-ink">${total.toLocaleString('es-CO')}</p>
              </div>

              <div className="space-y-2 text-sm text-muted">
                <div className="flex items-center justify-between">
                  <span>Productos</span>
                  <span className="font-medium text-ink">{items.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Unidades</span>
                  <span className="font-medium text-ink">{itemCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estado</span>
                  <span className="font-medium text-primary-bright">{facturaId ? 'Edición' : 'Borrador'}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {mensaje && <p className="text-danger text-sm">{mensaje}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={guardar} disabled={guardando || items.length === 0} className="btn-secondary flex-1">
          {guardando ? 'Guardando...' : 'Guardar borrador'}
        </button>
        <button type="button" onClick={confirmarYEnviar} disabled={guardando || items.length === 0} className="btn-primary flex-1">
          {guardando ? 'Procesando...' : 'Confirmar y enviar a caja'}
        </button>
      </div>

      {/* Modal de búsqueda de productos */}
      {buscadorAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[10vh] backdrop-blur-sm"
          onClick={() => setBuscadorAbierto(false)}
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
                type="text"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Escribe el nombre del producto"
              />
              <button
                type="button"
                onClick={() => setBuscadorAbierto(false)}
                className="rounded-md border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted hover:text-ink"
              >
                Esc
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-3">
              {productosSugeridos.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-background/60 p-4 text-center text-sm text-muted">
                  No se encontraron productos con ese nombre.
                </div>
              ) : (
                <div className="space-y-2">
                  {productosSugeridos.map((producto) => (
                    <button
                      key={producto.id}
                      type="button"
                      onClick={() => agregarLinea(producto.id)}
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
                          <span className="text-xs text-muted">Precio unitario</span>
                          <span className="text-sm font-bold text-primary-bright">${producto.precio_detal.toLocaleString('es-CO')}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
