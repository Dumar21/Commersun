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

const ETIQUETAS_ROL: Record<Rol, string> = {
  super_admin: 'Superadministrador',
  dueno: 'Dueño',
  vendedor: 'Vendedor',
  cajero: 'Cajero',
  bodegero: 'Bodeguero',
}

const COLORES_ROL: Record<Rol, string> = {
  super_admin: 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200',
  dueno: 'border-primary-bright/20 bg-primary-bright/10 text-primary-bright',
  vendedor: 'border-sky-400/20 bg-sky-400/10 text-sky-200',
  cajero: 'border-accent/20 bg-accent/10 text-accent-bright',
  bodegero: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
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
  const [busqueda, setBusqueda] = useState('')

  const rolesPermitidos = ROLES_POR_ROL[currentRol]
  const usuariosActivos = usuarios.filter((usuario) => usuario.activo).length
  const usuariosInactivos = usuarios.length - usuariosActivos
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const consulta = busqueda.trim().toLocaleLowerCase('es')
    return (
      usuario.nombre.toLocaleLowerCase('es').includes(consulta) ||
      ETIQUETAS_ROL[usuario.rol].toLocaleLowerCase('es').includes(consulta)
    )
  })

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
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Resumen de usuarios">
        {[
          { label: 'Cuentas registradas', value: usuarios.length, accent: 'text-ink', icon: 'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M20 8v6m3-3h-6', iconColor: 'text-primary-bright bg-primary/10 border-primary-bright/15' },
          { label: 'Acceso activo', value: usuariosActivos, accent: 'text-accent-bright', icon: 'm5 12 4 4L19 6', iconColor: 'text-accent-bright bg-accent/10 border-accent/15' },
          { label: 'Desactivados', value: usuariosInactivos, accent: 'text-muted', icon: 'M6 6l12 12M18 6 6 18', iconColor: 'text-muted bg-white/[0.04] border-white/[0.08]' },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-4 rounded-2xl border border-border/80 bg-surface/75 px-5 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${stat.iconColor}`}>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path d={stat.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-medium text-muted">{stat.label}</p>
              <p className={`mt-0.5 text-2xl font-display font-bold ${stat.accent}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="overflow-hidden rounded-2xl border border-border/80 bg-surface/80 shadow-[0_18px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 border-b border-border/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-display font-bold text-ink">Miembros del equipo</h2>
                <span className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted">
                  {usuarios.length}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">Consulta sus roles y el estado de cada cuenta.</p>
            </div>
            <label className="relative block w-full sm:max-w-xs">
              <span className="sr-only">Buscar usuario por nombre o rol</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted">
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4.5 4.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                className="field-input !py-2.5 !pl-10 !text-xs"
                placeholder="Buscar por nombre o rol..."
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
              />
            </label>
          </div>

          <div className="p-4 sm:p-5">
            {usuarios.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary-bright">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6m3-3h-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="font-semibold text-ink">Aún no hay usuarios registrados</p>
                <p className="mt-1 max-w-xs text-sm text-muted">Crea una cuenta para invitar a tu equipo y asignarle un rol.</p>
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
                <p className="font-medium text-ink">No encontramos coincidencias</p>
                <p className="mt-1 text-sm text-muted">Prueba con otro nombre o rol.</p>
                <button type="button" className="mt-3 text-xs font-bold text-primary-bright hover:text-ink" onClick={() => setBusqueda('')}>
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {usuariosFiltrados.map((usuario) => {
                  const puedeDesactivar =
                    usuario.id !== currentUserId && rolesPermitidos.includes(usuario.rol)

                  return (
                    <li
                      key={usuario.id}
                      className="group flex flex-col gap-4 rounded-xl border border-border/70 bg-surface-2/55 p-4 transition-colors hover:border-primary-bright/25 hover:bg-surface-2/80 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary-bright/15 bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-bold uppercase text-primary-bright">
                          {usuario.nombre.trim().slice(0, 1)}
                          {usuario.nombre.trim().split(/\s+/).length > 1
                            ? usuario.nombre.trim().split(/\s+/).at(-1)?.slice(0, 1)
                            : ''}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{usuario.nombre}</p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide ${COLORES_ROL[usuario.rol]}`}>
                              {ETIQUETAS_ROL[usuario.rol]}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${usuario.activo ? 'text-accent-bright' : 'text-muted'}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${usuario.activo ? 'bg-accent-bright' : 'bg-muted/60'}`} />
                              {usuario.activo ? 'Activo' : 'Desactivado'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-danger/15 px-3 py-2 text-xs font-semibold text-danger/90 transition hover:border-danger/35 hover:bg-danger/10 disabled:cursor-not-allowed disabled:border-border/60 disabled:bg-transparent disabled:text-muted/60 disabled:opacity-70 sm:self-auto"
                        disabled={cargando || !usuario.activo || !puedeDesactivar}
                        onClick={() => handleEliminar(usuario.id)}
                        title={
                          usuario.id === currentUserId
                            ? 'No puedes desactivar tu propia cuenta'
                            : !puedeDesactivar
                              ? 'No tienes permiso para desactivar esta cuenta'
                              : usuario.activo
                                ? 'Desactivar cuenta'
                                : 'Esta cuenta ya está desactivada'
                        }
                      >
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                          <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v6m4-6v6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Desactivar
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>

        <aside className="overflow-hidden rounded-2xl border border-primary-bright/20 bg-surface/85 shadow-[0_18px_45px_rgba(0,0,0,0.24)] backdrop-blur-xl">
          <div className="border-b border-border/70 bg-gradient-to-r from-primary/15 to-transparent px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary-bright/20 bg-primary/15 text-primary-bright">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path d="M12 5v14m-7-7h14" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-ink">Agregar usuario</h2>
                <p className="mt-0.5 text-xs text-muted">Crea un nuevo acceso para tu equipo.</p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            {rolesPermitidos.length === 0 ? (
              <div className="rounded-xl border border-border bg-surface-2/65 p-4 text-sm leading-6 text-muted">
                Tu rol no tiene permisos para crear usuarios.
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="usuario-nombre" className="field-label">Nombre completo</label>
                  <input
                    id="usuario-nombre"
                    type="text"
                    className="field-input"
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                    placeholder="Ej. María Gómez"
                    autoComplete="name"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label htmlFor="usuario-rol" className="field-label">Rol y permisos</label>
                  <select id="usuario-rol" className="field-input" value={rol} onChange={(event) => setRol(event.target.value as Rol)}>
                    {rolesPermitidos.map((rolPermitido) => (
                      <option key={rolPermitido} value={rolPermitido}>
                        {ETIQUETAS_ROL[rolPermitido]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="usuario-pin" className="field-label">PIN de acceso</label>
                  <input
                    id="usuario-pin"
                    type="password"
                    inputMode="numeric"
                    autoComplete="new-password"
                    className="field-input tracking-[0.35em]"
                    value={pin}
                    onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="••••"
                    maxLength={4}
                    aria-describedby="usuario-pin-ayuda"
                  />
                  <p id="usuario-pin-ayuda" className="mt-2 text-xs leading-5 text-muted">
                    Debe tener 4 dígitos y ser distinto al de otros usuarios.
                  </p>
                </div>

                {error && (
                  <p role="alert" className="rounded-lg border border-danger/20 bg-danger/10 px-3.5 py-3 text-sm text-rose-200">
                    {error}
                  </p>
                )}

                <button type="button" className="btn-primary w-full" onClick={handleCrear} disabled={cargando}>
                  {cargando ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      Crear usuario
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path d="M5 12h14m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] leading-5 text-muted">
                  El acceso queda disponible al crear la cuenta.
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
