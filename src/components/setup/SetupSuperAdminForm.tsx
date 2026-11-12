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
        <label htmlFor="setup-nombre" className="field-label">Nombre del super_admin</label>
        <input
          id="setup-nombre"
          type="text"
          className="field-input"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre completo"
        />
      </div>
      <div>
        <label htmlFor="setup-pin" className="field-label">PIN</label>
        <input
          id="setup-pin"
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          className="field-input"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="4 dígitos"
          maxLength={4}
        />
      </div>
      {error && <p role="alert" className="text-danger text-sm">{error}</p>}
      <button type="button" className="btn-primary w-full" onClick={handleCrear} disabled={cargando}>
        {cargando ? 'Creando...' : 'Crear super_admin'}
      </button>
    </div>
  )
}
