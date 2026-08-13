import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { crearSessionToken } from '@/lib/session'

export async function GET() {
  const { data: usuarios, error } = await supabaseAdmin
    .from('usuarios')
    .select('id, nombre, rol')
    .eq('activo', true)
    .order('nombre', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }

  return NextResponse.json({ usuarios: usuarios ?? [] })
}

export async function POST(request: NextRequest) {
  const { pin, usuarioId } = await request.json()

  if (!pin || typeof pin !== 'string' || !/^[0-9]{4}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN inválido' }, { status: 400 })
  }

  const { data: usuarios, error } = await supabaseAdmin
    .from('usuarios')
    .select('id, nombre, rol, pin_hash')
    .eq('activo', true)

  if (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }

  const usuariosCoincidentes = [] as Array<(typeof usuarios)[number]>
  for (const usuario of usuarios ?? []) {
    const coincide = await bcrypt.compare(pin, usuario.pin_hash)
    if (coincide) {
      usuariosCoincidentes.push(usuario)
    }
  }

  if (usuarioId) {
    const usuarioSeleccionado = usuariosCoincidentes.find((usuario) => usuario.id === usuarioId)

    if (!usuarioSeleccionado) {
      return NextResponse.json({ error: 'Usuario o PIN incorrectos' }, { status: 401 })
    }

    const token = await crearSessionToken({
      sub: usuarioSeleccionado.id,
      nombre: usuarioSeleccionado.nombre,
      rol: usuarioSeleccionado.rol,
    })

    const response = NextResponse.json({ ok: true, rol: usuarioSeleccionado.rol })
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    })

    return response
  }

  if (usuariosCoincidentes.length === 0) {
    return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 })
  }

  if (usuariosCoincidentes.length > 1) {
    return NextResponse.json(
      {
        error: 'Hay varios usuarios con ese PIN. Elige quién eres.',
        usuarios: usuariosCoincidentes.map(({ id, nombre, rol }) => ({ id, nombre, rol })),
      },
      { status: 409 }
    )
  }

  const [usuarioEncontrado] = usuariosCoincidentes
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
