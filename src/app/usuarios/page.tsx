// src/app/usuarios/page.tsx
import { supabaseAdmin } from '@/lib/supabase-admin'
import { obtenerSesion } from '@/lib/auth-server'
import UsuariosAdminPanel from '@/components/usuarios/UsuariosAdminPanel'

export default async function UsuariosPage() {
  const sesion = await obtenerSesion()
  if (!sesion) return null

  const { data: usuarios } = await supabaseAdmin
    .from('usuarios')
    .select('id, nombre, rol, activo')
    .order('nombre', { ascending: true })

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted">Equipo</p>
        <h1 className="text-2xl font-display font-semibold text-ink">Administrar usuarios</h1>
      </div>
      <UsuariosAdminPanel
        currentRol={sesion.rol}
        currentUserId={sesion.sub}
        usuarios={usuarios ?? []}
      />
    </div>
  )
}
