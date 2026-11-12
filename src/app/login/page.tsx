'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageLoading from '@/components/ui/PageLoading'
import Skeleton from '@/components/ui/Skeleton'

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
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const res = await fetch('/api/auth/login')
        const data = await res.json()
        setHydrated(true)

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
        setHydrated(true)
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
    <div className="login-page fixed inset-0 isolate overflow-y-auto bg-background font-sans lg:overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(36rem,78vh)] bg-[url('/top-atmosphere.svg')] bg-cover bg-[center_38%] opacity-20"
      />

      <div className="relative z-10 mx-auto grid min-h-dvh w-full max-w-7xl items-center gap-10 px-4 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-12">
        <section className="hidden max-w-xl lg:block">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-border bg-surface/80 px-4 py-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted">
              <span className="barcode-mark" aria-hidden="true" />
            </span>
            <span className="font-display text-sm font-bold tracking-[0.22em] text-ink">VENTO<span className="text-accent-bright">.</span></span>
            <span className="h-4 w-px bg-border" />
            <span className="text-xs text-muted">Punto de venta</span>
          </div>

          <p className="text-sm text-muted">Tu negocio, bajo control</p>
          <p aria-hidden="true" className="mt-4 max-w-lg text-4xl font-display font-semibold leading-tight tracking-tight text-ink xl:text-5xl">
            Cada venta.
            <br />
            Todo en orden.
          </p>
          <p className="mt-5 max-w-md text-base leading-7 text-muted">
            Inventario, ventas y caja conectados en un solo espacio para que tu equipo trabaje con claridad.
          </p>

          <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-surface/75 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4"><path d="M4 19V5m0 14h16M7 15l4-4 3 2 5-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">Visibilidad en tiempo real</p>
              <p className="mt-1 text-xs leading-5 text-muted">Decisiones claras para cada jornada.</p>
            </div>
            <div className="rounded-xl border border-border bg-surface/75 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4"><path d="M12 3 5 6v5c0 4.5 2.9 7.7 7 10 4.1-2.3 7-5.5 7-10V6l-7-3Z" strokeLinejoin="round" /><path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">Acceso para tu equipo</p>
              <p className="mt-1 text-xs leading-5 text-muted">Cada persona con su rol y terminal.</p>
            </div>
          </div>
          <p className="mt-8 text-xs text-muted">Simple para operar · Completo para crecer</p>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-5 flex items-center justify-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted">
              <span className="barcode-mark" aria-hidden="true" />
            </span>
            <span className="font-display text-sm font-bold tracking-[0.22em] text-ink">VENTO<span className="text-accent-bright">.</span></span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface/95">
            <div className="p-6 sm:p-9">
              <div className="mb-8">
                <p className="text-sm text-muted">Acceso seguro</p>
                <h1 className="mt-2 text-2xl font-display font-bold text-ink">
                  {usuarioSeleccionado ? 'Ingresa tu PIN' : 'Bienvenido'}
                </h1>
                <p className="mt-2 text-sm text-muted">
                  {usuarioSeleccionado ? 'Confirma tu identidad para continuar.' : 'Selecciona tu perfil para entrar a tu espacio.'}
                </p>
              </div>

              {!hydrated ? (
                <PageLoading className="space-y-2.5">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex min-h-14 items-center gap-3 rounded-lg border border-border bg-surface-2/80 p-3.5"
                    >
                      <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32 max-w-full" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </PageLoading>
              ) : !usuarioSeleccionado ? (
                <div className="space-y-2.5">
                  {usuarios.length === 0 ? (
                    <p className="rounded-xl border border-white/10 bg-surface-2/80 px-4 py-5 text-center text-sm text-muted">No hay usuarios activos.</p>
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
                        className="group flex min-h-14 w-full items-center gap-3 rounded-lg border border-border bg-surface-2/80 p-3.5 text-left transition-colors hover:border-primary-bright/40 hover:bg-surface-2 disabled:opacity-40"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary-bright/20 bg-primary/15 font-display text-sm font-bold uppercase text-primary-bright">
                          {usuario.nombre.trim().slice(0, 1)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink">{usuario.nombre}</span>
                          <span className="mt-0.5 block text-xs text-muted">{ETIQUETAS_ROL[usuario.rol] ?? usuario.rol}</span>
                        </span>
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary-bright"><path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="mb-5 flex items-center gap-3 rounded-full border border-border bg-surface-2/70 py-2 pl-2 pr-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface font-display text-sm font-semibold text-muted">
                      {usuarioSeleccionado.nombre.trim().slice(0, 1)}
                    </span>
                    <span>
                      <span className="block text-xs text-muted">Accediendo como</span>
                      <span className="block max-w-[14rem] truncate text-sm font-semibold text-ink">{usuarioSeleccionado.nombre}</span>
                    </span>
                  </div>

                  <div className="w-full rounded-xl border border-border bg-background/80 px-4 py-4">
                    <div className="flex justify-center gap-4">
                      {[0, 1, 2, 3].map((i) => {
                        const activo = i < pin.length
                        return <div key={i} className={`h-3 w-3 rounded-full border transition-colors ${activo ? 'border-primary-bright bg-primary-bright' : 'border-slate-600 bg-slate-800/80'}`} />
                      })}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2.5">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                      <button key={n} type="button" disabled={cargando} onClick={() => manejarDigito(n)} className="h-12 w-16 rounded-lg border border-border bg-surface-2/90 font-display text-lg font-semibold text-ink transition-colors hover:border-primary-bright/30 hover:bg-surface-2 disabled:opacity-40 sm:h-14 sm:w-20">
                        {n}
                      </button>
                    ))}
                    <button type="button" onClick={() => setPin((p) => p.slice(0, -1))} disabled={cargando} className="h-12 w-16 rounded-lg border border-border bg-surface/50 text-xs font-semibold text-muted transition-colors hover:border-danger/30 hover:text-danger disabled:opacity-40 sm:h-14 sm:w-20">Borrar</button>
                    <button type="button" disabled={cargando} onClick={() => manejarDigito('0')} className="h-12 w-16 rounded-lg border border-border bg-surface-2/90 font-display text-lg font-semibold text-ink transition-colors hover:border-primary-bright/30 hover:bg-surface-2 disabled:opacity-40 sm:h-14 sm:w-20">0</button>
                    <button type="button" onClick={resetearSeleccion} disabled={cargando} className="h-12 w-16 rounded-lg border border-border bg-surface/50 text-xs font-semibold text-muted transition-colors hover:border-primary-bright/30 hover:text-ink disabled:opacity-40 sm:h-14 sm:w-20">Volver</button>
                  </div>
                </div>
              )}

              {cargando && (
                <p role="status" className="mt-5 flex items-center justify-center gap-2 text-center text-sm text-muted">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-bright/30 border-t-primary-bright" />
                  Verificando acceso
                </p>
              )}
              {error && !cargando && (
                <p role="alert" className="mt-4 rounded-xl border border-danger/20 bg-danger/10 px-3 py-2.5 text-center text-xs font-medium text-rose-200">{error}</p>
              )}

              <div className="mt-7 flex items-center justify-center gap-2 border-t border-border pt-5 text-xs text-muted">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-3.5 w-3.5"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" strokeLinecap="round" /></svg>
                Sesión protegida · Vento
              </div>
            </div>
          </div>
          <p className="mt-5 text-center text-xs text-muted lg:text-right">Una plataforma creada para que tu negocio siga avanzando.</p>
        </section>
      </div>

    </div>
  )
}
