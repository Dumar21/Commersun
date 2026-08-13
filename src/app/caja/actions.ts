// src/app/caja/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { obtenerSesion } from '@/lib/auth-server'

export async function aceptarFactura(facturaId: string) {
  const sesion = await obtenerSesion()
  if (!sesion || (sesion.rol !== 'cajero' && sesion.rol !== 'dueno')) {
    return { error: 'No autorizado' }
  }

  const { data: venta } = await supabaseAdmin
    .from('ventas')
    .select('estado')
    .eq('id', facturaId)
    .single()

  if (!venta) return { error: 'Factura no encontrada' }
  if (venta.estado !== 'pendiente_caja') return { error: 'Esta factura ya fue tomada o no está lista' }

  const { error } = await supabaseAdmin
    .from('ventas')
    .update({ estado: 'aceptada', id_cajero: sesion.sub, aceptada_at: new Date().toISOString() })
    .eq('id', facturaId)

  if (error) return { error: 'No se pudo aceptar la factura' }

  revalidatePath('/caja')
  return { ok: true }
}

export async function pagarFactura(facturaId: string) {
  const sesion = await obtenerSesion()
  if (!sesion || (sesion.rol !== 'cajero' && sesion.rol !== 'dueno')) {
    return { error: 'No autorizado' }
  }

  const { data: venta } = await supabaseAdmin
    .from('ventas')
    .select('estado, id_cajero')
    .eq('id', facturaId)
    .single()

  if (!venta) return { error: 'Factura no encontrada' }
  if (venta.estado !== 'aceptada') return { error: 'La factura debe estar aceptada primero' }
  if (venta.id_cajero !== sesion.sub && sesion.rol !== 'dueno') return { error: 'Solo el cajero que la aceptó puede pagarla' }

  const { error } = await supabaseAdmin.rpc('pagar_factura', {
    p_venta_id: facturaId,
    p_cajero_id: sesion.sub,
  })

  if (error) return { error: error.message }

  revalidatePath('/caja')
  return { ok: true }
}