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
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="card w-full max-w-md">
        <h1 className="mb-4 text-2xl font-display font-semibold text-ink">Crear cuenta super_admin</h1>
        <p className="text-sm text-muted mb-6">
          Este paso solo debe hacerse una vez. Crea la cuenta principal de super_admin con nombre y PIN de 4 dígitos.
        </p>
        <SetupSuperAdminForm />
      </div>
    </div>
  )
}
