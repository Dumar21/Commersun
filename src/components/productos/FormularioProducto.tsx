// src/components/productos/FormularioProducto.tsx
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
  const [escaneando, setEscaneando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const bufferRef = useRef('')
  const lastKeyTimeRef = useRef(0)

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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0]
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
      <form onSubmit={handleSubmit} className="card max-w-2xl flex flex-col gap-5">
        <div className="grid gap-5 md:grid-cols-[1fr_220px]">
          <div className="space-y-4">
            <div>
              <label className="field-label">Nombre del producto</label>
              <input type="text" className="field-input" placeholder="Ej: Luces LED 10m multicolor" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Precio al detal</label>
                <input type="number" className="field-input" placeholder="0" value={precioDetal} onChange={(e) => setPrecioDetal(e.target.value)} required />
              </div>
              <div>
                <label className="field-label">Precio al por mayor</label>
                <input type="number" className="field-input" placeholder="0" value={precioMayor} onChange={(e) => setPrecioMayor(e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="field-label">Stock</label>
              <input type="number" min="0" className="field-input" value={stockInicial} onChange={(e) => setStockInicial(e.target.value)} />
            </div>

            <div>
              <label className="field-label">Código de barras</label>
              <div className="flex flex-col gap-2">
                <input type="text" className="field-input" placeholder="Escanea o escribe el código" value={codigoBarras} onChange={(e) => setCodigoBarras(e.target.value)} required />
                <button type="button" onClick={() => setEscaneando(true)} className="btn-accent whitespace-nowrap self-start">
                  Escanear
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="field-label">Foto del producto</label>
            <div className="flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-surface-2">
              {imagenPreview ? (
                <img src={imagenPreview} alt="Vista previa del producto" className="h-full w-full object-cover" />
              ) : (
                <div className="px-4 text-center text-sm text-muted">Sin imagen aún</div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-white" />
            <p className="text-xs text-muted">Puedes subir una foto desde galería o cámara en móvil.</p>
          </div>
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <button type="submit" className="btn-primary mt-2" disabled={guardando}>
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