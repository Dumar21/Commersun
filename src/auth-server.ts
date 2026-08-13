import { cookies } from 'next/headers'
import { verificarSessionToken, type SessionPayload } from '@/lib/session'

export async function obtenerSesion(): Promise<SessionPayload | null> {
  const token = (await cookies()).get('session')?.value
  if (!token) return null
  return verificarSessionToken(token)
}