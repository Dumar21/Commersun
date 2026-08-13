'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const RUTAS_POR_ROL: Record<string, string> = {
  super_admin: '/usuarios',
  dueno: '/dashboard',
  vendedor: '/ventas',
  cajero: '/caja',
  bodegero: '/productos',
}

type Usuario = {
  id: string
  nombre: string
  rol: string
}

export default function LoginPage() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const res = await fetch('/api/auth/login')
        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? 'No se pudieron cargar los usuarios')
          return
        }

        const usuariosDisponibles = data.usuarios ?? []
        setUsuarios(usuariosDisponibles)

        if (usuariosDisponibles.length === 1) {
          setUsuarioSeleccionado(usuariosDisponibles[0])
        }
      } catch {
        setError('No se pudo conectar con el servidor')
      }
    }

    cargarUsuarios()
  }, [])

  const ingresar = async (pinCompleto: string, usuarioId?: string) => {
    const usuarioIdFinal = usuarioId ?? usuarioSeleccionado?.id

    if (!usuarioIdFinal) {
      setError('Primero selecciona tu usuario.')
      return
    }

    setCargando(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pinCompleto, usuarioId: usuarioIdFinal }),
    })

    const data = await res.json()
    setCargando(false)

    if (!res.ok) {
      if (res.status === 409 && Array.isArray(data.usuarios) && data.usuarios.length > 0) {
        setUsuarios(data.usuarios)
        setUsuarioSeleccionado(null)
        setPin('')
        setError('Hay varios usuarios con ese PIN. Elige quién eres.')
        return
      }

      setError(data.error ?? 'Error al ingresar')
      setPin('')
      return
    }

    router.push(RUTAS_POR_ROL[data.rol] ?? '/')
    router.refresh()
  }

  const manejarDigito = (digito: string) => {
    if (!usuarioSeleccionado || pin.length >= 4 || cargando) return
    const nuevoPin = pin + digito
    setPin(nuevoPin)
    setError('')
    if (nuevoPin.length === 4) ingresar(nuevoPin, usuarioSeleccionado.id)
  }

  const resetearSeleccion = () => {
    setUsuarioSeleccionado(null)
    setPin('')
    setError('')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="card w-full max-w-xs flex flex-col items-center gap-6">
        <h1 className="text-xl font-display font-bold text-ink">
          {usuarioSeleccionado ? 'Ingresa tu PIN' : 'Selecciona tu usuario'}
        </h1>

        {!usuarioSeleccionado ? (
          <div className="w-full space-y-2">
            {usuarios.length === 0 ? (
              <p className="text-sm text-muted">No hay usuarios activos.</p>
            ) : (
              usuarios.map((usuario) => (
                <button
                  key={usuario.id}
                  type="button"
                  className="btn-secondary w-full justify-between"
                  disabled={cargando}
                  onClick={() => {
                    setUsuarioSeleccionado(usuario)
                    setError('')
                    setPin('')
                  }}
                >
                  <span>{usuario.nombre}</span>
                  <span className="text-xs uppercase tracking-wide text-muted">{usuario.rol}</span>
                </button>
              ))
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-sm text-muted">Accediendo como</p>
              <p className="text-lg font-semibold text-ink">{usuarioSeleccionado.nombre}</p>
            </div>

            <div className="flex gap-3">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-3 w-3 rounded-full border border-primary-bright ${
                    i < pin.length ? 'bg-primary-bright' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {error && <p className="text-danger text-sm">{error}</p>}

        {usuarioSeleccionado && (
          <div className="grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
              <button key={n} type="button" disabled={cargando} onClick={() => manejarDigito(n)} className="btn-secondary h-14 w-14 text-lg">
                {n}
              </button>
            ))}
            <button type="button" onClick={() => setPin((p) => p.slice(0, -1))} disabled={cargando} className="btn-secondary h-14 w-14 text-sm">
              Borrar
            </button>
            <button type="button" disabled={cargando} onClick={() => manejarDigito('0')} className="btn-secondary h-14 w-14 text-lg">
              0
            </button>
            <button type="button" onClick={() => resetearSeleccion()} disabled={cargando} className="btn-secondary h-14 w-14 text-sm">
              Volver
            </button>
          </div>
        )}
      </div>
    </div>
  )
}