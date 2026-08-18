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

const ETIQUETAS_ROL: Record<string, string> = {
  super_admin: 'Admin',
  dueno: 'Dueño',
  vendedor: 'Vendedor',
  cajero: 'Cajero',
  bodegero: 'Bodega',
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
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-background p-6 font-sans">
      <div className="w-full max-w-xs animate-[fadeIn_0.4s_ease-out]">
        {/* filo perforado tipo recibo */}
        <div
          className="h-3 rounded-t-sm"
          style={{
            backgroundImage:
              'radial-gradient(circle, var(--color-background) 2.5px, var(--color-border) 2.5px)',
            backgroundSize: '10px 10px',
            backgroundPosition: 'top center',
          }}
        />

        <div className="rounded-b-2xl border border-border bg-surface bg-[radial-gradient(circle_at_top_left,_rgba(51,199,224,0.16),transparent_45%)] px-6 pb-6 pt-5 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.7)]">
          <div className="mb-6 text-center">
            <p className="text-[10px] font-display uppercase tracking-[0.35em] text-accent-bright">
              Commersun · Terminal
            </p>
            <h1 className="mt-1 text-lg font-extrabold text-ink">
              {usuarioSeleccionado ? 'Ingresa tu PIN' : 'Selecciona tu usuario'}
            </h1>
          </div>

          {!usuarioSeleccionado ? (
            <div className="space-y-2">
              {usuarios.length === 0 ? (
                <p className="text-center text-sm text-muted">No hay usuarios activos.</p>
              ) : (
                usuarios.map((usuario) => (
                  <button
                    key={usuario.id}
                    type="button"
                    disabled={cargando}
                    onClick={() => {
                      setUsuarioSeleccionado(usuario)
                      setError('')
                      setPin('')
                    }}
                    className="group flex w-full items-center justify-between rounded-lg border border-border bg-surface-2 px-4 py-3 text-left transition hover:border-primary-bright/50 disabled:opacity-40"
                  >
                    <span className="text-sm font-semibold text-ink">{usuario.nombre}</span>
                    <span className="text-[10px] font-display uppercase tracking-widest text-muted transition group-hover:text-primary-bright">
                      {ETIQUETAS_ROL[usuario.rol] ?? usuario.rol}
                    </span>
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-muted">Accediendo como</p>
                <p className="text-base font-bold text-ink">{usuarioSeleccionado.nombre}</p>
              </div>

              {/* visor LED del PIN */}
              <div className="relative w-full overflow-hidden rounded-md border border-border bg-background px-4 py-5">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)',
                  }}
                />
                <div className="relative flex justify-center gap-3">
                  {[0, 1, 2, 3].map((i) => {
                    const activo = i < pin.length
                    return (
                      <div
                        key={i}
                        className={`h-8 w-6 rounded-[3px] border transition-all duration-150 ${
                          activo
                            ? 'border-primary-bright bg-primary-bright shadow-[0_0_14px_2px_rgba(51,199,224,0.65)]'
                            : 'border-border bg-transparent'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={cargando}
                    onClick={() => manejarDigito(n)}
                    className="h-14 w-14 rounded-lg border border-border bg-surface-2 font-display text-lg font-bold text-ink transition active:translate-y-0.5 active:border-primary-bright/60 disabled:opacity-40"
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPin((p) => p.slice(0, -1))}
                  disabled={cargando}
                  className="h-14 w-14 rounded-lg border border-border bg-surface-2 text-xs font-semibold text-muted transition active:translate-y-0.5 disabled:opacity-40"
                >
                  Borrar
                </button>
                <button
                  type="button"
                  disabled={cargando}
                  onClick={() => manejarDigito('0')}
                  className="h-14 w-14 rounded-lg border border-border bg-surface-2 font-display text-lg font-bold text-ink transition active:translate-y-0.5 active:border-primary-bright/60 disabled:opacity-40"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={resetearSeleccion}
                  disabled={cargando}
                  className="h-14 w-14 rounded-lg border border-border bg-surface-2 text-xs font-semibold text-muted transition active:translate-y-0.5 disabled:opacity-40"
                >
                  Volver
                </button>
              </div>
            </div>
          )}

          {cargando && (
            <p className="mt-4 animate-pulse text-center text-[11px] font-display uppercase tracking-widest text-primary-bright">
              Verificando…
            </p>
          )}

          {error && !cargando && (
            <p className="mt-4 text-center text-xs text-danger">{error}</p>
          )}
        </div>
      </div>

      <style jsx global>{`
        html,
        body {
          overflow: hidden;
          overscroll-behavior: none;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}
