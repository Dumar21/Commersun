import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  const { nombre, pin } = await request.json()

  if (!nombre || typeof nombre !== 'string' || !pin || typeof pin !== 'string' || !/^[0-9]{4}$/.test(pin)) {
    return NextResponse.json({ error: 'Nombre y PIN de 4 dígitos son obligatorios' }, { status: 400 })
  }

  const { data: usuarios, error: errorConsulta } = await supabaseAdmin
    .from('usuarios')
    .select('id')
    .eq('activo', true)
    .limit(1)

  if (errorConsulta) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }

  if (usuarios && usuarios.length > 0) {
    return NextResponse.json({ error: 'Ya existe una cuenta activa, este setup no puede ejecutarse' }, { status: 403 })
  }

  const pinHash = await bcrypt.hash(pin, 10)

  const { error } = await supabaseAdmin.from('usuarios').insert({
    nombre,
    rol: 'super_admin',
    pin_hash: pinHash,
    activo: true,
  })

  if (error) {
    return NextResponse.json({ error: 'No se pudo crear el super_admin' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
