'use server'

import { revalidatePath } from 'next/cache'
import { obtenerSesion } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { Database } from '@/lib/database.types'

const camposNumericos = new Set(['precio_detal', 'precio_mayor', 'stock'])

type ResultadoAccion =
  | { ok: true }
  | { error: string }

export async function aprobarCambioProducto(formData: FormData): Promise<ResultadoAccion> {
  const solicitudId = String(formData.get('solicitudId') ?? '')
  if (!solicitudId) {
    return { error: 'Falta la solicitud' }
  }

  const sesion = await obtenerSesion()
  if (!sesion || sesion.rol !== 'dueno') {
    return { error: 'No autorizado' }
  }

  const { data: solicitud, error: errorSolicitud } = await supabaseAdmin
    .from('solicitudes_producto')
    .select('id, id_producto, campo, valor_nuevo, estado')
    .eq('id', solicitudId)
    .single()

  if (errorSolicitud || !solicitud) {
    return { error: 'No se encontró la solicitud' }
  }

  if (solicitud.estado !== 'pendiente') {
    return { error: 'Esta solicitud ya no está pendiente' }
  }

  let payload: Database['public']['Tables']['productos']['Update']
  if (solicitud.campo === 'nombre') {
    payload = { nombre: String(solicitud.valor_nuevo ?? '') }
  } else if (solicitud.campo === 'codigo_barras') {
    payload = { codigo_barras: String(solicitud.valor_nuevo ?? '') }
  } else if (solicitud.campo === 'precio_detal' || solicitud.campo === 'precio_mayor' || solicitud.campo === 'stock') {
    if (!camposNumericos.has(solicitud.campo)) {
      return { error: 'El campo solicitado no es válido' }
    }
    payload = { [solicitud.campo]: Number(solicitud.valor_nuevo) }
  } else {
    return { error: 'El campo solicitado no es válido' }
  }

  const { error: errorUpdate } = await supabaseAdmin
    .from('productos')
    .update(payload)
    .eq('id', solicitud.id_producto)

  if (errorUpdate) {
    return { error: 'No se pudo aprobar el cambio del producto' }
  }

  const { error: errorEstado } = await supabaseAdmin
    .from('solicitudes_producto')
    .update({
      estado: 'aprobada',
      revisado_por: sesion.sub,
      revisado_en: new Date().toISOString(),
    })
    .eq('id', solicitudId)

  if (errorEstado) {
    return { error: 'No se pudo cerrar la solicitud.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/productos')
  revalidatePath('/ventas')
  return { ok: true }
}

export async function rechazarCambioProducto(formData: FormData): Promise<ResultadoAccion> {
  const solicitudId = String(formData.get('solicitudId') ?? '')
  if (!solicitudId) {
    return { error: 'Falta la solicitud' }
  }

  const sesion = await obtenerSesion()
  if (!sesion || sesion.rol !== 'dueno') {
    return { error: 'No autorizado' }
  }

  const { error } = await supabaseAdmin
    .from('solicitudes_producto')
    .update({
      estado: 'rechazada',
      revisado_por: sesion.sub,
      revisado_en: new Date().toISOString(),
    })
    .eq('id', solicitudId)

  if (error) {
    return { error: 'No se pudo rechazar la solicitud.' }
  }

  revalidatePath('/dashboard')
  return { ok: true }
}
