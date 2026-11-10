'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import EscanerCodigoBarras from './EscanerCodigoBarras'
import { crearProducto, actualizarProducto } from '@/app/productos/actions'

interface ProductoForm {
  id?: string
  nombre?: string
  precio_detal?: number
  precio_mayor?: number
  stock?: number
  codigo_barras?: string | null
  imagen_url?: string | null
}

export default function FormularioProducto({ producto }: { producto?: ProductoForm }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [nombre, setNombre] = useState(producto?.nombre ?? '')
  const [precioDetal, setPrecioDetal] = useState(producto ? String(producto.precio_detal ?? '') : '')
  const [precioMayor, setPrecioMayor] = useState(producto ? String(producto.precio_mayor ?? '') : '')
  const [codigoBarras, setCodigoBarras] = useState(producto?.codigo_barras ?? searchParams.get('codigo') ?? '')
  const [stockInicial, setStockInicial] = useState(producto ? String(producto.stock ?? 0) : '0')
  const [imagenPreview, setImagenPreview] = useState(producto?.imagen_url ?? '')
  const [imagenBase64, setImagenBase64] = useState('')
  const [imagenNombre, setImagenNombre] = useState('')
  const [arrastrandoImagen, setArrastrandoImagen] = useState(false)
  const [escaneando, setEscaneando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const bufferRef = useRef('')
  const lastKeyTimeRef = useRef(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTypingInInput =
        target?.matches('input, textarea, select, [contenteditable="true"]') ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement

      if (isTypingInInput) return

      const now = performance.now()
      if (now - lastKeyTimeRef.current > 200) {
        bufferRef.current = ''
      }
      lastKeyTimeRef.current = now

      if (event.key === 'Enter') {
        const codigo = bufferRef.current.trim()
        bufferRef.current = ''
        if (codigo.length > 0) setCodigoBarras(codigo)
        return
      }

      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        bufferRef.current += event.key
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      bufferRef.current = ''
      lastKeyTimeRef.current = 0
    }
  }, [])

  const leerArchivo = (archivo?: File | null) => {
    if (!archivo) return
    const reader = new FileReader()
    reader.onload = () => {
      const resultado = typeof reader.result === 'string' ? reader.result : ''
      setImagenPreview(resultado)
      setImagenBase64(resultado)
      setImagenNombre(archivo.name)
    }
    reader.readAsDataURL(archivo)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    leerArchivo(event.target.files?.[0])
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setArrastrandoImagen(false)
    leerArchivo(event.dataTransfer.files?.[0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    setError('')

    const payload = {
      nombre,
      precioDetal: parseFloat(precioDetal),
      precioMayor: parseFloat(precioMayor),
      codigoBarras,
      stockInicial: parseInt(stockInicial, 10) || 0,
      imagenBase64: imagenBase64 || undefined,
      imagenNombre: imagenNombre || undefined,
    }

    const resultado = producto?.id
      ? await actualizarProducto(producto.id, {
          nombre,
          precioDetal: parseFloat(precioDetal),
          precioMayor: parseFloat(precioMayor),
          codigoBarras,
          stock: parseInt(stockInicial, 10) || 0,
          imagenBase64: imagenBase64 || undefined,
          imagenNombre: imagenNombre || undefined,
        })
      : await crearProducto(payload)

    setGuardando(false)

    if ('error' in resultado && resultado.error) {
      setError(resultado.error)
      setMensaje('')
      return
    }

    if ('pendienteAprobacion' in resultado && resultado.pendienteAprobacion) {
      setError('')
      setMensaje('Cambio enviado al dueño para aprobación. No se aplicará hasta que lo apruebe.')
      return
    }

    router.push('/productos')
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="card space-y-6 bg-surface/50 border border-border/60">
        {/* Mensajes de error/estado */}
        {mensaje && <div className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent-bright">{mensaje}</div>}
        {error && <div className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <label className="field-label">Nombre del producto</label>
              <input
                type="text"
                className="field-input"
                placeholder="Ej: Luces LED 10m"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="field-label">Precio Detal</label>
                <div className="relative">
                  <span className="absolute left-3 top-[13px] text-sm text-muted">$</span>
                  <input type="number" className="field-input pl-8" value={precioDetal} onChange={(e) => setPrecioDetal(e.target.value)} required />
                </div>
              </div>
              <div className="sm:col-span-1">
                <label className="field-label">Precio Mayor</label>
                <div className="relative">
                  <span className="absolute left-3 top-[13px] text-sm text-muted">$</span>
                  <input type="number" className="field-input pl-8" value={precioMayor} onChange={(e) => setPrecioMayor(e.target.value)} required />
                </div>
              </div>
              <div className="sm:col-span-1">
                <label className="field-label">Stock Inicial</label>
                <input type="number" className="field-input" value={stockInicial} onChange={(e) => setStockInicial(e.target.value)} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="field-label mb-0">Código de Barras</label>
                <span className="text-[10px] text-muted">Usa escáner USB directamente o la cámara</span>
              </div>
              <div className="flex gap-2">
                <input type="text" className="field-input" value={codigoBarras} onChange={(e) => setCodigoBarras(e.target.value)} required />
                <button type="button" onClick={() => setEscaneando(true)} className="btn-secondary px-4" title="Escanear con cámara">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h10M7 13h10M7 17h10"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Columna lateral (Imagen) */}
          <div className="lg:col-span-1">
            <label className="field-label mb-2 block">Imagen del producto</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setArrastrandoImagen(true); }}
              onDragLeave={() => setArrastrandoImagen(false)}
              onDrop={handleDrop}
              className={`group relative aspect-[3/2] lg:aspect-square w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-border bg-surface-2 transition hover:border-primary-bright ${arrastrandoImagen ? 'border-primary-bright bg-primary/10' : ''}`}
            >
              {imagenPreview ? (
                <img src={imagenPreview} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-muted">
                  <svg className="h-8 w-8 mb-2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7M16 5l4 4M20 5l-4 4"/></svg>
                  <span className="text-xs">Subir foto</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
        </div>

        {/* Botón de acción */}
        <div className="pt-4 border-t border-border/60">
          <button type="submit" className="btn-primary w-full h-12 text-base" disabled={guardando}>
            {guardando ? 'Guardando...' : producto?.id ? 'Actualizar Producto' : 'Guardar Producto'}
          </button>
        </div>
      </form>

      {escaneando && (
        <EscanerCodigoBarras
          onScan={(codigo) => {
            setCodigoBarras(codigo)
            setEscaneando(false)
          }}
          onClose={() => setEscaneando(false)}
        />
      )}
    </>
  )
}
