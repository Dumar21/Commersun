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
    <div className="fixed inset-0 isolate overflow-y-auto bg-background font-sans lg:overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(44rem,85vh)] bg-[url('/top-atmosphere.svg')] bg-cover bg-[center_38%] opacity-90"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.14),transparent_55%),linear-gradient(to_bottom,rgba(9,13,22,0.12),#090d16_78%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-1/3 h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-36 bottom-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-[130px]" />

      <main className="relative z-10 mx-auto grid min-h-dvh w-full max-w-7xl items-center gap-10 px-4 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-12">
        <section className="hidden max-w-xl lg:block">
          <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 shadow-lg backdrop-blur-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary-bright/30 bg-primary/20 text-primary-bright shadow-[0_0_24px_rgba(129,140,248,0.2)]">
              <span className="barcode-mark" aria-hidden="true" />
            </span>
            <span className="font-display text-sm font-bold tracking-[0.22em] text-ink">VENTO<span className="text-accent-bright">.</span></span>
            <span className="h-4 w-px bg-white/15" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Punto de venta</span>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.32em] text-primary-bright">Tu negocio, bajo control</p>
          <h1 className="mt-5 max-w-lg text-5xl font-display font-bold leading-[1.12] tracking-tight text-ink xl:text-6xl">
            Cada venta.
            <br />
            <span className="bg-gradient-to-r from-primary-bright via-cyan-200 to-accent-bright bg-clip-text text-transparent">Todo en orden.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-300/80">
            Inventario, ventas y caja conectados en un solo espacio para que tu equipo trabaje con claridad.
          </p>

          <div className="mt-12 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent-bright/20 bg-accent/10 text-accent-bright">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4"><path d="M4 19V5m0 14h16M7 15l4-4 3 2 5-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <p className="mt-4 text-sm font-semibold text-ink">Visibilidad en tiempo real</p>
              <p className="mt-1 text-xs leading-5 text-muted">Decisiones claras para cada jornada.</p>
            </div>
            <div className="translate-y-5 rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4"><path d="M12 3 5 6v5c0 4.5 2.9 7.7 7 10 4.1-2.3 7-5.5 7-10V6l-7-3Z" strokeLinejoin="round" /><path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <p className="mt-4 text-sm font-semibold text-ink">Acceso para tu equipo</p>
              <p className="mt-1 text-xs leading-5 text-muted">Cada persona con su rol y terminal.</p>
            </div>
          </div>
          <p className="mt-14 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Simple para operar · Completo para crecer</p>
        </section>

        <section className="mx-auto w-full max-w-md animate-[fadeIn_0.5s_ease-out]">
          <div className="mb-5 flex items-center justify-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary-bright/30 bg-primary/20 text-primary-bright shadow-[0_0_24px_rgba(129,140,248,0.2)]">
              <span className="barcode-mark" aria-hidden="true" />
            </span>
            <span className="font-display text-sm font-bold tracking-[0.22em] text-ink">VENTO<span className="text-accent-bright">.</span></span>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-white/[0.14] bg-surface/80 shadow-[0_30px_100px_rgba(0,0,0,0.55),0_0_60px_rgba(99,102,241,0.12)] backdrop-blur-2xl">
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
            <div className="p-6 sm:p-9">
              <div className="mb-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary-bright">Acceso seguro</p>
                <h2 className="mt-2 text-2xl font-display font-bold text-ink">
                  {usuarioSeleccionado ? 'Ingresa tu PIN' : 'Bienvenido'}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {usuarioSeleccionado ? 'Confirma tu identidad para continuar.' : 'Selecciona tu perfil para entrar a tu espacio.'}
                </p>
              </div>

              {!hydrated ? (
                <div className="space-y-3">
                  <div className="h-14 animate-pulse rounded-xl border border-white/10 bg-surface-2" />
                  <div className="h-14 animate-pulse rounded-xl border border-white/10 bg-surface-2" />
                </div>
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
                        className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-surface-2/80 p-3.5 text-left shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:border-primary-bright/40 hover:bg-surface-2 disabled:opacity-40"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary-bright/20 bg-primary/15 font-display text-sm font-bold uppercase text-primary-bright">
                          {usuario.nombre.trim().slice(0, 1)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink">{usuario.nombre}</span>
                          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{ETIQUETAS_ROL[usuario.rol] ?? usuario.rol}</span>
                        </span>
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary-bright"><path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="mb-5 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] py-2 pl-2 pr-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-bright/20 bg-primary/15 font-display text-sm font-bold uppercase text-primary-bright">
                      {usuarioSeleccionado.nombre.trim().slice(0, 1)}
                    </span>
                    <span>
                      <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">Accediendo como</span>
                      <span className="block max-w-[14rem] truncate text-sm font-semibold text-ink">{usuarioSeleccionado.nombre}</span>
                    </span>
                  </div>

                  <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-background/80 px-4 py-4 shadow-inner">
                    <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)' }} />
                    <div className="relative flex justify-center gap-4">
                      {[0, 1, 2, 3].map((i) => {
                        const activo = i < pin.length
                        return <div key={i} className={`h-3 w-3 rounded-full border transition-all duration-150 ${activo ? 'border-primary-bright bg-primary-bright shadow-[0_0_18px_3px_rgba(129,140,248,0.65)]' : 'border-slate-600 bg-slate-800/80'}`} />
                      })}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2.5">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                      <button key={n} type="button" disabled={cargando} onClick={() => manejarDigito(n)} className="h-12 w-16 rounded-xl border border-white/10 bg-surface-2/90 font-display text-lg font-bold text-ink shadow-[0_5px_14px_rgba(0,0,0,0.18)] transition hover:border-primary-bright/30 hover:bg-surface-2 active:scale-95 disabled:opacity-40 sm:h-14 sm:w-20">
                        {n}
                      </button>
                    ))}
                    <button type="button" onClick={() => setPin((p) => p.slice(0, -1))} disabled={cargando} className="h-12 w-16 rounded-xl border border-white/10 bg-white/[0.035] text-[10px] font-bold uppercase tracking-wider text-muted transition hover:border-danger/30 hover:text-danger active:scale-95 disabled:opacity-40 sm:h-14 sm:w-20">Borrar</button>
                    <button type="button" disabled={cargando} onClick={() => manejarDigito('0')} className="h-12 w-16 rounded-xl border border-white/10 bg-surface-2/90 font-display text-lg font-bold text-ink shadow-[0_5px_14px_rgba(0,0,0,0.18)] transition hover:border-primary-bright/30 hover:bg-surface-2 active:scale-95 disabled:opacity-40 sm:h-14 sm:w-20">0</button>
                    <button type="button" onClick={resetearSeleccion} disabled={cargando} className="h-12 w-16 rounded-xl border border-white/10 bg-white/[0.035] text-[10px] font-bold uppercase tracking-wider text-muted transition hover:border-primary-bright/30 hover:text-ink active:scale-95 disabled:opacity-40 sm:h-14 sm:w-20">Volver</button>
                  </div>
                </div>
              )}

              {cargando && (
                <p className="mt-5 flex items-center justify-center gap-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-primary-bright">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-bright/30 border-t-primary-bright" />
                  Verificando acceso
                </p>
              )}
              {error && !cargando && (
                <p role="alert" className="mt-4 rounded-xl border border-danger/20 bg-danger/10 px-3 py-2.5 text-center text-xs font-medium text-rose-200">{error}</p>
              )}

              <div className="mt-7 flex items-center justify-center gap-2 border-t border-white/[0.08] pt-5 text-[10px] text-slate-500">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-3.5 w-3.5"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" strokeLinecap="round" /></svg>
                Sesión protegida · Vento
              </div>
            </div>
          </div>
          <p className="mt-5 text-center text-[10px] text-slate-500 lg:text-right">Una plataforma creada para que tu negocio siga avanzando.</p>
        </section>
      </main>

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
