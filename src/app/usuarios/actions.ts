'use server'

import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verificarSessionToken } from '@/lib/session'

async function obtenerSesion() {
  const token = (await cookies()).get('session')?.value
  if (!token) return null
  return verificarSessionToken(token)
}

const ROLES_QUE_PUEDE_GESTIONAR: Record<string, string[]> = {
  super_admin: ['dueno', 'vendedor', 'cajero', 'bodegero'],
  dueno: ['vendedor', 'cajero', 'bodegero'],
}

export async function crearUsuario(nombre: string, rol: string, pin: string) {
  const sesion = await obtenerSesion()
  if (!sesion) return { error: 'No autorizado' }

  const rolesPermitidos = ROLES_QUE_PUEDE_GESTIONAR[sesion.rol]
  if (!rolesPermitidos?.includes(rol)) {
    return { error: 'No tienes permiso para crear ese rol' }
  }

  if (!/^\d{4}$/.test(pin)) {
    return { error: 'El PIN debe ser de 4 dígitos' }
  }

  const { data: usuariosExistentes, error: errorConsulta } = await supabaseAdmin
    .from('usuarios')
    .select('pin_hash')
    .eq('activo', true)

  if (errorConsulta) {
    return { error: 'No se pudo validar el PIN' }
  }

  for (const usuario of usuariosExistentes ?? []) {
    const coincide = await bcrypt.compare(pin, usuario.pin_hash)
    if (coincide) {
      return { error: 'Ya existe un usuario con ese PIN. Elige otro.' }
    }
  }

  const pinHash = await bcrypt.hash(pin, 10)

  const { error } = await supabaseAdmin.from('usuarios').insert({
    nombre,
    rol,
    pin_hash: pinHash,
    creado_por: sesion.sub,
  })

  if (error) return { error: 'No se pudo crear el usuario' }
  return { ok: true }
}

export async function eliminarUsuario(usuarioId: string) {
  const sesion = await obtenerSesion()
  if (!sesion) return { error: 'No autorizado' }

  if (usuarioId === sesion.sub) {
    return { error: 'No puedes eliminar tu propia cuenta' }
  }

  const { data: objetivo, error: errorConsulta } = await supabaseAdmin
    .from('usuarios')
    .select('rol')
    .eq('id', usuarioId)
    .single()

  if (errorConsulta || !objetivo) return { error: 'Usuario no encontrado' }

  const rolesPermitidos = ROLES_QUE_PUEDE_GESTIONAR[sesion.rol]
  if (!rolesPermitidos?.includes(objetivo.rol)) {
    return { error: 'No tienes permiso para eliminar ese rol' }
  }

  const { error } = await supabaseAdmin.from('usuarios').update({ activo: false }).eq('id', usuarioId)
  if (error) return { error: 'No se pudo eliminar el usuario' }
  return { ok: true }
}