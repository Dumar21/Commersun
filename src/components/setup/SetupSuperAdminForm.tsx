'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupSuperAdminForm() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleCrear = async () => {
    setError('')
    if (!nombre.trim() || !/^[0-9]{4}$/.test(pin)) {
      setError('Nombre y PIN de 4 dígitos son obligatorios.')
      return
    }

    setCargando(true)
    const res = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombre.trim(), pin }),
    })
    const data = await res.json()
    setCargando(false)

    if (!res.ok) {
      setError(data.error ?? 'No se pudo crear la cuenta super_admin')
      return
    }

    router.push('/login')
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="field-label">Nombre del super_admin</label>
        <input
          type="text"
          className="field-input"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre completo"
        />
      </div>
      <div>
        <label className="field-label">PIN</label>
        <input
          type="text"
          className="field-input"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="4 dígitos"
          maxLength={4}
        />
      </div>
      {error && <p className="text-danger text-sm">{error}</p>}
      <button type="button" className="btn-primary w-full" onClick={handleCrear} disabled={cargando}>
        {cargando ? 'Creando...' : 'Crear super_admin'}
      </button>
    </div>
  )
}
