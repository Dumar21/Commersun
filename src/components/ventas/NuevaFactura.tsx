// src/components/ventas/NuevaFactura.tsx
'use client'

import Image from 'next/image'
import * as Select from '@radix-ui/react-select'
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
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

export default function NuevaFactura({ productos, facturaId, itemsIniciales }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<ItemForm[]>(itemsIniciales ?? [])
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  // --- Modal de búsqueda de productos ---
  const [buscadorAbierto, setBuscadorAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const busquedaDiferida = useDeferredValue(busqueda)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const cerrarBuscador = useCallback(() => {
    setBuscadorAbierto(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }, [])

  useEffect(() => {
    if (!buscadorAbierto) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrarBuscador()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [buscadorAbierto, cerrarBuscador])

  const productosFiltrados = useMemo(() => {
    const texto = busquedaDiferida.trim().toLowerCase()
    if (!texto) return productos
    return productos.filter((producto) => producto.nombre.toLowerCase().includes(texto))
  }, [busquedaDiferida, productos])

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

    cerrarBuscador()
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
      if (!('ok' in resultadoCrear)) {
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
      <div className="card flex flex-col gap-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted">Ventas</p>
            <h1 className="font-display font-semibold text-ink text-2xl">{facturaId ? 'Editar factura' : 'Nueva factura'}</h1>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm text-muted">
            <span className="h-2 w-2 rounded-full bg-primary-bright" aria-hidden="true" />
            {items.length} líneas · {itemCount} unidades
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
          <div className="space-y-4">
            {/* Disparador del buscador: ya no empuja contenido, abre el modal */}
            <button
              ref={triggerRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={buscadorAbierto}
              onClick={() => {
                setBusqueda('')
                setBuscadorAbierto(true)
                requestAnimationFrame(() => inputRef.current?.focus())
              }}
              className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-border bg-surface-2/70 px-4 py-3 text-left text-muted transition-colors hover:border-primary-bright/50 hover:bg-surface"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="9" cy="9" r="6" />
                <path d="m17 17-3.5-3.5" strokeLinecap="round" />
              </svg>
              <span className="text-sm">Buscar y agregar producto…</span>
            </button>

            <div className="flex flex-col gap-2">
              {items.length === 0 ? (
                <div className="rounded-xl border border-border bg-surface-2/50 p-8 text-center text-sm text-muted">
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
                      className="rounded-xl border border-border/70 bg-surface-2/55 p-3 sm:p-4"
                    >
                      <div className="grid grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-2 sm:gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-background/60">
                          {producto?.imagen_url ? (
                            <Image
                              src={producto.imagen_url}
                              alt={producto.nombre}
                              width={40}
                              height={40}
                              sizes="40px"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-muted">
                              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                                <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
                                <path d="m4.2 7.6 7.8 4.5 7.8-4.5M12 12.1V21" />
                              </svg>
                            </div>
                          )}
                        </div>

                        <Select.Root
                          value={item.id_producto}
                          onValueChange={(id_producto) => actualizarLinea(index, { id_producto })}
                        >
                          <Select.Trigger
                            aria-label={`Producto de la línea ${index + 1}`}
                            className="group flex min-h-11 min-w-0 w-full items-center justify-between gap-2 rounded-lg border border-border/70 bg-background/50 px-3 text-left text-base font-semibold text-ink transition-colors hover:border-primary-bright/50 hover:bg-background/70 focus-visible:outline-2 focus-visible:outline-primary-bright focus-visible:outline-offset-2 sm:text-sm"
                          >
                            <Select.Value className="truncate" />
                            <Select.Icon className="shrink-0 text-muted transition-transform duration-150 group-data-[state=open]:rotate-180">
                              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </Select.Icon>
                          </Select.Trigger>
                          <Select.Portal>
                            <Select.Content
                              position="popper"
                              align="start"
                              sideOffset={6}
                              className="z-[1100] w-[max(var(--radix-select-trigger-width),16rem)] max-w-[calc(100vw-2rem)] max-h-[min(60vh,24rem)] overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-xl shadow-black/30"
                            >
                              <Select.Viewport className="flex flex-col gap-1 p-0.5">
                                {productos.map((p) => (
                                  <Select.Item
                                    key={p.id}
                                    value={p.id}
                                    textValue={p.nombre}
                                    className="product-select-option relative flex min-h-11 cursor-pointer select-none items-center rounded-lg px-3 py-2 pr-10 text-sm text-ink"
                                  >
                                    <Select.ItemText>{p.nombre}</Select.ItemText>
                                    <Select.ItemIndicator className="absolute right-3 text-primary-bright">
                                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                        <path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    </Select.ItemIndicator>
                                  </Select.Item>
                                ))}
                              </Select.Viewport>
                            </Select.Content>
                          </Select.Portal>
                        </Select.Root>

                        <button
                          type="button"
                          onClick={() => quitarLinea(index)}
                          className="flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                          aria-label={`Quitar ${producto?.nombre ?? 'producto'} de la factura`}
                        >
                          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                            <path d="m6 6 8 8M14 6l-8 8" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-2 border-t border-border/70 pt-3 md:grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-x-4">
                        <div role="group" aria-label={`Tipo de venta de ${producto?.nombre ?? 'producto'}`} className="flex items-center rounded-lg bg-background/60 p-0.5 text-xs">
                          <button
                            type="button"
                            onClick={() => actualizarLinea(index, { tipo_venta: 'detal' })}
                            aria-pressed={item.tipo_venta === 'detal'}
                            className={`min-h-11 rounded-md px-2.5 transition-colors ${item.tipo_venta === 'detal' ? 'bg-primary-bright text-background font-semibold' : 'text-muted hover:bg-surface-2 hover:text-ink'}`}
                          >
                            Detal
                          </button>
                          <button
                            type="button"
                            onClick={() => actualizarLinea(index, { tipo_venta: 'mayor' })}
                            aria-pressed={item.tipo_venta === 'mayor'}
                            className={`min-h-11 rounded-md px-2.5 transition-colors ${item.tipo_venta === 'mayor' ? 'bg-primary-bright text-background font-semibold' : 'text-muted hover:bg-surface-2 hover:text-ink'}`}
                          >
                            Mayor
                          </button>
                        </div>

                        <div className="min-w-0 text-right md:text-left">
                          <span className="block text-[11px] leading-4 text-muted">Precio unitario</span>
                          <span className="block whitespace-nowrap text-xs font-medium tabular-nums text-ink sm:text-sm">
                            ${precioUnitario.toLocaleString('es-CO')}
                          </span>
                        </div>

                        <div role="group" aria-label={`Cantidad de ${producto?.nombre ?? 'producto'}`} className="flex w-fit items-center gap-0.5 rounded-lg bg-background/60 p-0.5">
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(index, -1)}
                            aria-label={`Reducir cantidad de ${producto?.nombre ?? 'producto'}`}
                            className="flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-sm font-medium tabular-nums text-ink">{item.cantidad}</span>
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(index, 1)}
                            aria-label={`Aumentar cantidad de ${producto?.nombre ?? 'producto'}`}
                            className="flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                          >
                            +
                          </button>
                        </div>

                        <div className="min-w-0 text-right">
                          <span className="block text-[11px] leading-4 text-muted">Subtotal</span>
                          <span className="block whitespace-nowrap text-xs font-semibold tabular-nums text-primary-bright sm:text-sm">
                            ${subtotal.toLocaleString('es-CO')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <aside className="rounded-xl border border-border bg-surface-2/70 p-5">
            <p className="text-sm font-medium text-muted">Resumen</p>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-border bg-background/60 p-4">
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

      {mensaje && <p role="alert" className="text-danger text-sm">{mensaje}</p>}

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
          role="dialog"
          aria-modal="true"
          aria-labelledby="buscar-producto-titulo"
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[10vh]"
          onClick={cerrarBuscador}
          onKeyDown={(event) => {
            if (event.key !== 'Tab') return
            const elementos = event.currentTarget.querySelectorAll<HTMLElement>(
              'input:not(:disabled), button:not(:disabled)'
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
              <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="9" cy="9" r="6" />
                <path d="m17 17-3.5-3.5" strokeLinecap="round" />
              </svg>
              <h2 id="buscar-producto-titulo" className="sr-only">Buscar producto para agregar</h2>
              <input
                ref={inputRef}
                type="text"
                autoFocus
                aria-label="Nombre del producto"
                className="min-h-11 w-full bg-transparent text-sm text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-primary-bright focus-visible:outline-offset-2"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Escribe el nombre del producto"
              />
              <button
                type="button"
                onClick={cerrarBuscador}
                className="min-h-11 min-w-11 rounded-md border border-border px-2 text-xs text-muted transition-colors hover:text-ink"
              >
                Cerrar
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
                          <Image
                            src={producto.imagen_url}
                            alt={producto.nombre}
                            width={40}
                            height={40}
                            sizes="40px"
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
