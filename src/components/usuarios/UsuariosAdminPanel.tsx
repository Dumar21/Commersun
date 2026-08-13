'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Rol = 'super_admin' | 'dueno' | 'vendedor' | 'cajero' | 'bodegero'

interface Usuario {
  id: string
  nombre: string
  rol: Rol
  activo: boolean
}

interface Props {
  currentRol: Rol
  currentUserId: string
  usuarios: Usuario[]
}

const ROLES_POR_ROL: Record<Rol, Rol[]> = {
  super_admin: ['dueno', 'vendedor', 'cajero', 'bodegero'],
  dueno: ['vendedor', 'cajero', 'bodegero'],
  vendedor: [],
  cajero: [],
  bodegero: [],
}

export default function UsuariosAdminPanel({ currentRol, currentUserId, usuarios }: Props) {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState<Rol>(ROLES_POR_ROL[currentRol][0] ?? 'vendedor')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const rolesPermitidos = ROLES_POR_ROL[currentRol]

  const handleCrear = async () => {
    setError('')
    if (!nombre.trim() || !rol || !/^[0-9]{4}$/.test(pin)) {
      setError('Nombre, rol y PIN de 4 dígitos son obligatorios.')
      return
    }

    setCargando(true)
    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombre.trim(), rol, pin }),
    })

    const data = await res.json()
    setCargando(false)

    if (!res.ok) {
      setError(data.error ?? 'No se pudo crear el usuario')
      return
    }

    setNombre('')
    setPin('')
    router.refresh()
  }

  const handleEliminar = async (usuarioId: string) => {
    if (!confirm('¿Eliminar este usuario?')) return

    setCargando(true)
    const res = await fetch('/api/usuarios', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId }),
    })

    const data = await res.json()
    setCargando(false)

    if (!res.ok) {
      setError(data.error ?? 'No se pudo eliminar el usuario')
      return
    }

    router.refresh()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="card overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">Usuarios existentes</h2>
        </div>
        <div className="p-4">
          {usuarios.length === 0 ? (
            <p className="text-muted">No hay usuarios registrados.</p>
          ) : (
            <div className="space-y-3">
              {usuarios.map((usuario) => (
                <div key={usuario.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                  <div>
                    <p className="font-medium text-ink">{usuario.nombre}</p>
                    <p className="text-sm text-muted">Rol: {usuario.rol}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={cargando || usuario.id === currentUserId || !rolesPermitidos.includes(usuario.rol)}
                    onClick={() => handleEliminar(usuario.id)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">Crear usuario</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="field-label">Nombre</label>
            <input
              type="text"
              className="field-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="field-label">Rol</label>
            <select className="field-input" value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
              {rolesPermitidos.map((rolPermitido) => (
                <option key={rolPermitido} value={rolPermitido}>
                  {rolPermitido}
                </option>
              ))}
            </select>
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
            {cargando ? 'Guardando...' : 'Crear usuario'}
          </button>
        </div>
      </div>
    </div>
  )
}
