// src/components/productos/EntradaInventario.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { buscarProductoPorCodigo, agregarStock } from '@/app/productos/actions'

interface LogEntry {
  nombre: string
  stock: number
  hora: string
}

export default function EntradaInventario() {
  const [ultimoNoEncontrado, setUltimoNoEncontrado] = useState<string | null>(null)
  const [log, setLog] = useState<LogEntry[]>([])
  const [procesando, setProcesando] = useState(false)
  const bufferRef = useRef('')
  const lastKeyTimeRef = useRef(0)

  const procesarCodigo = async (codigo: string) => {
    setProcesando(true)
    setUltimoNoEncontrado(null)

    const producto = await buscarProductoPorCodigo(codigo)

    if (!producto) {
      setUltimoNoEncontrado(codigo)
      setProcesando(false)
      return
    }

    const resultado = await agregarStock(producto.id, 1)
    setProcesando(false)

    if (resultado.error) {
      alert(resultado.error)
      return
    }

    setLog((prev) => [
      { nombre: producto.nombre, stock: resultado.nuevoStock!, hora: new Date().toLocaleTimeString() },
      ...prev,
    ])
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTypingInInput =
        target?.matches('input, textarea, select, [contenteditable="true"]') ||
        target instanceof HTMLInputElement

      if (isTypingInInput) return

      const now = performance.now()
      if (now - lastKeyTimeRef.current > 200) {
        bufferRef.current = ''
      }
      lastKeyTimeRef.current = now

      if (event.key === 'Enter') {
        const codigo = bufferRef.current.trim()
        bufferRef.current = ''
        if (codigo.length > 0) procesarCodigo(codigo)
        return
      }

      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        bufferRef.current += event.key
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="card flex flex-col gap-4">
      <div>
        <h2 className="font-display font-bold text-ink">Entrada rápida por escáner</h2>
        <p className="text-sm text-muted">
          Cada lectura de la pistola suma 1 unidad al stock. No necesitas enfocar ningún campo, siempre está escuchando.
        </p>
      </div>

      {procesando && <p className="text-sm text-primary-bright">Procesando...</p>}

      {ultimoNoEncontrado && (
        <div className="rounded-lg border border-danger bg-danger/10 p-3 text-sm text-ink flex items-center justify-between gap-4">
          <span>El código <strong>{ultimoNoEncontrado}</strong> no está registrado.</span>
          <a href={`/productos/nuevo?codigo=${ultimoNoEncontrado}`} className="btn-secondary whitespace-nowrap">
            Registrar producto
          </a>
        </div>
      )}

      <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
        {log.map((entrada, i) => (
          <div key={i} className="flex items-center justify-between text-sm border-b border-border py-2 last:border-0">
            <span className="text-ink">{entrada.nombre}</span>
            <span className="text-muted">stock: {entrada.stock}</span>
            <span className="text-muted text-xs">{entrada.hora}</span>
          </div>
        ))}
        {log.length === 0 && <p className="text-sm text-muted">Aún no has escaneado nada en esta sesión.</p>}
      </div>
    </div>
  )
}