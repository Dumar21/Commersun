import { SignJWT, jwtVerify } from 'jose'
import type { Rol } from '@/lib/database.types'

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!)

export type { Rol } from '@/lib/database.types'

export interface SessionPayload {
  sub: string
  nombre: string
  rol: Rol
}

export async function crearSessionToken(payload: SessionPayload) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(secret)
}

export async function verificarSessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}