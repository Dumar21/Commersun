import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { crearSessionToken } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json()

    if (!pin || typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN inválido' },
        { status: 400 }
      )
    }

    const { data: usuarios, error } = await supabaseAdmin
      .from('usuarios')
      .select('id, nombre, rol, pin_hash')
      .eq('activo', true)

    if (error) {
      console.error('SUPABASE ERROR:', error)

      return NextResponse.json(
        { error: 'Error del servidor' },
        { status: 500 }
      )
    }

    let usuarioEncontrado = null

    for (const usuario of usuarios ?? []) {
      const coincide = await bcrypt.compare(pin, usuario.pin_hash)

      if (coincide) {
        usuarioEncontrado = usuario
        break
      }
    }

    if (!usuarioEncontrado) {
      return NextResponse.json(
        { error: 'PIN incorrecto' },
        { status: 401 }
      )
    }

    console.log('Usuario encontrado:', usuarioEncontrado.id)

    const token = await crearSessionToken({
      sub: usuarioEncontrado.id,
      nombre: usuarioEncontrado.nombre,
      rol: usuarioEncontrado.rol,
    })

    console.log('Token creado correctamente')

    const response = NextResponse.json({
      ok: true,
      rol: usuarioEncontrado.rol,
    })

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    })

    return response
  } catch (error) {
    console.error('LOGIN ERROR:', error)

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
