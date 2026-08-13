import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import SetupSuperAdminForm from '@/components/setup/SetupSuperAdminForm'

export default async function SetupPage() {
  const { data: usuarios } = await supabaseAdmin
    .from('usuarios')
    .select('id')
    .eq('activo', true)
    .limit(1)

  if (usuarios && usuarios.length > 0) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-display font-bold text-ink mb-4">Crear cuenta super_admin</h1>
        <p className="text-sm text-muted mb-6">
          Este paso solo debe hacerse una vez. Crea la cuenta principal de super_admin con nombre y PIN de 4 dígitos.
        </p>
        <SetupSuperAdminForm />
      </div>
    </div>
  )
}
