import { NextRequest, NextResponse } from 'next/server'
import { crearUsuario, eliminarUsuario } from '@/app/usuarios/actions'

export async function POST(request: NextRequest) {
  const { nombre, rol, pin } = await request.json()

  if (!nombre || !rol || !pin) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const resultado = await crearUsuario(nombre, rol, pin)
  if (resultado.error) {
    return NextResponse.json({ error: resultado.error }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const { usuarioId } = await request.json()

  if (!usuarioId) {
    return NextResponse.json({ error: 'Usuario no especificado' }, { status: 400 })
  }

  const resultado = await eliminarUsuario(usuarioId)
  if (resultado.error) {
    return NextResponse.json({ error: resultado.error }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
