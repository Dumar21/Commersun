import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { crearSessionToken } from '@/lib/session'

export async function POST(request: NextRequest) {
  const { pin } = await request.json()

  if (!pin || typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN inválido' }, { status: 400 })
  }

  const { data: usuarios, error } = await supabaseAdmin
    .from('usuarios')
    .select('id, nombre, rol, pin_hash')
    .eq('activo', true)

  if (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }

  let usuarioEncontrado = null
  for (const usuario of usuarios) {
    const coincide = await bcrypt.compare(pin, usuario.pin_hash)
    if (coincide) {
      usuarioEncontrado = usuario
      break
    }
  }

  if (!usuarioEncontrado) {
    return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 })
  }

  const token = await crearSessionToken({
    sub: usuarioEncontrado.id,
    nombre: usuarioEncontrado.nombre,
    rol: usuarioEncontrado.rol,
  })

  const response = NextResponse.json({ ok: true, rol: usuarioEncontrado.rol })
  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })

  return response
}