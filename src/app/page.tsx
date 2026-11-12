import { redirect } from 'next/navigation'
import { obtenerSesion } from '@/lib/auth-server'

const RUTAS_POR_ROL: Record<string, string> = {
  super_admin: '/usuarios',
  dueno: '/dashboard',
  vendedor: '/ventas',
  cajero: '/caja',
  bodegero: '/productos',
}

export default async function Home() {
  const sesion = await obtenerSesion()
  if (!sesion) redirect('/login')
  redirect(RUTAS_POR_ROL[sesion.rol] ?? '/login')
}
