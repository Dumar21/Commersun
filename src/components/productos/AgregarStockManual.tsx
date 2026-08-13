// src/components/productos/AgregarStockManual.tsx
'use client'

import { useState } from 'react'
import { agregarStock } from '@/app/productos/actions'

interface Producto {
  id: string
  nombre: string
  stock: number
}

export default function AgregarStockManual({ productos }: { productos: Producto[] }) {
  const [productoId, setProductoId] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productoId || !cantidad) return

    setGuardando(true)
    setMensaje('')

    const resultado = await agregarStock(productoId, parseInt(cantidad, 10))

    setGuardando(false)

    if (resultado.error) {
      setMensaje(resultado.error)
      return
    }

    setMensaje(`Stock actualizado: ${resultado.nuevoStock} unidades`)
    setCantidad('')
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
      <h2 className="font-display font-bold text-ink">Agregar stock manualmente</h2>

      <div>
        <label className="field-label">Producto</label>
        <select className="field-input" value={productoId} onChange={(e) => setProductoId(e.target.value)} required>
          <option value="">Selecciona un producto</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre} (stock actual: {p.stock})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Cantidad a agregar</label>
        <input type="number" min="1" className="field-input" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required />
      </div>

      {mensaje && <p className="text-sm text-ink">{mensaje}</p>}

      <button type="submit" className="btn-primary" disabled={guardando}>
        {guardando ? 'Guardando...' : 'Agregar stock'}
      </button>
    </form>
  )
}