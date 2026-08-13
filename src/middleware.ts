import { NextResponse, type NextRequest } from 'next/server'
import { verificarSessionToken } from '@/lib/session'

const RUTAS_PERMITIDAS: Record<string, string[]> = {
  '/usuarios': ['super_admin', 'dueno'],
  '/dashboard': ['dueno'],
  '/productos': ['bodegero', 'dueno'],
  '/ventas': ['vendedor', 'dueno'],
  '/caja': ['cajero', 'dueno'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const token = request.cookies.get('session')?.value
  const session = token ? await verificarSessionToken(token) : null

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const seccionBase = '/' + pathname.split('/')[1]
  const rolesPermitidos = RUTAS_PERMITIDAS[seccionBase]

  if (rolesPermitidos && !rolesPermitidos.includes(session.rol)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}