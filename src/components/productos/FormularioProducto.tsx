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
  codigo_barras?: string
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

    if (resultado.error) {
      setError(resultado.error)
      return
    }

    router.push('/productos')
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="card flex flex-col gap-6 bg-[radial-gradient(circle_at_top_right,_rgba(140,42,119,0.16),transparent_45%)]">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Columna de datos */}
          <div className="space-y-5">
            <div>
              <label className="field-label">Nombre del producto</label>
              <input
                type="text"
                className="field-input"
                placeholder="Ej: Luces LED 10m multicolor"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">Precio al detal</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                  <input
                    type="number"
                    className="field-input pl-6"
                    placeholder="0"
                    value={precioDetal}
                    onChange={(e) => setPrecioDetal(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="field-label">Precio al por mayor</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                  <input
                    type="number"
                    className="field-input pl-6"
                    placeholder="0"
                    value={precioMayor}
                    onChange={(e) => setPrecioMayor(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="field-label">Stock</label>
              <input
                type="number"
                min="0"
                className="field-input sm:max-w-[160px]"
                value={stockInicial}
                onChange={(e) => setStockInicial(e.target.value)}
              />
            </div>

            <div>
              <label className="field-label">Código de barras</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  className="field-input"
                  placeholder="Escanea o escribe el código"
                  value={codigoBarras}
                  onChange={(e) => setCodigoBarras(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setEscaneando(true)}
                  className="btn-accent shrink-0 whitespace-nowrap"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="4" width="14" height="12" rx="1.5" />
                    <path d="M6 4v12M9 4v12M13 4v12" strokeLinecap="round" />
                  </svg>
                  Escanear
                </button>
              </div>
            </div>
          </div>

          {/* Columna de imagen */}
          <div className="space-y-3">
            <label className="field-label">Foto del producto</label>

            <div
              onDragOver={(e) => {
                e.preventDefault()
                setArrastrandoImagen(true)
              }}
              onDragLeave={() => setArrastrandoImagen(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed transition ${
                arrastrandoImagen
                  ? 'border-primary-bright bg-primary/10'
                  : 'border-border bg-surface-2 hover:border-primary-bright/60 hover:bg-surface'
              }`}
            >
              {imagenPreview ? (
                <>
                  <img src={imagenPreview} alt="Vista previa del producto" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/50 group-hover:opacity-100">
                    <span className="rounded-lg border border-white/30 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white">
                      Cambiar foto
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 px-4 text-center">
                  <svg className="h-8 w-8 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <circle cx="8.5" cy="10.5" r="1.5" />
                    <path d="m21 15-5-5-4 4-2-2-5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm font-medium text-ink">Sube una foto</p>
                  <p className="text-xs text-muted">Arrastra o haz clic · galería o cámara en móvil</p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <button type="submit" className="btn-primary self-start px-8" disabled={guardando}>
          {guardando ? 'Guardando...' : producto?.id ? 'Actualizar producto' : 'Guardar producto'}
        </button>
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
