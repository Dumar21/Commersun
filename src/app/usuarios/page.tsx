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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Administrar usuarios</h1>
          <p className="text-sm text-muted">
            Aquí puedes crear cuentas para dueños, vendedores, cajeros y bodegueros.
          </p>
        </div>
      </div>
      <UsuariosAdminPanel
        currentRol={sesion.rol}
        currentUserId={sesion.sub}
        usuarios={usuarios ?? []}
      />
    </div>
  )
}
