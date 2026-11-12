import { supabaseAdmin } from '@/lib/supabase-admin'
import type { Json, Rol } from '@/lib/database.types'

export type AuditAction =
  | 'auth.login'
  | 'system.setup'
  | 'sales.draft_created'
  | 'sales.draft_updated'
  | 'sales.confirmed'
  | 'sales.accepted'
  | 'sales.paid'
  | 'products.created'
  | 'products.updated'
  | 'products.change_requested'
  | 'products.stock_added'
  | 'products.change_approved'
  | 'products.change_rejected'
  | 'users.created'
  | 'users.deactivated'

export interface AuditActor {
  sub: string | null
  nombre: string
  rol: Rol | 'sistema'
}

export interface AuditEvent {
  action: AuditAction
  entityType: string
  entityId?: string | null
  summary: string
  details?: Json
}

type AuditResult =
  | { error: string }
  | { ok: true }

export async function ejecutarConAuditoria<T extends AuditResult>(
  actor: AuditActor,
  event: AuditEvent,
  operation: (setEntityId: (id: string) => void) => Promise<T>,
): Promise<T | { error: string }> {
  const { data: entry, error: insertError } = await supabaseAdmin
    .from('audit_logs')
    .insert({
      actor_id: actor.sub,
      actor_name: actor.nombre,
      actor_role: actor.rol,
      action: event.action,
      entity_type: event.entityType,
      entity_id: event.entityId ?? null,
      summary: event.summary,
      details: event.details ?? {},
      result: 'in_progress',
    })
    .select('id')
    .single()

  if (insertError || !entry) {
    console.error('No se pudo iniciar el registro de auditoría', {
      action: event.action,
      error: insertError?.message ?? 'No se recibió el identificador del evento',
    })
    return { error: 'No se realizó el cambio porque no se pudo iniciar el registro de auditoría.' }
  }

  let entityId = event.entityId ?? null
  const result = await operation((id) => {
    entityId = id
  })
  const outcome = 'error' in result ? 'failure' : 'success'
  const { data: closedEntry, error: closeError } = await supabaseAdmin
    .from('audit_logs')
    .update({ result: outcome, entity_id: entityId })
    .eq('id', entry.id)
    .eq('result', 'in_progress')
    .select('id')
    .maybeSingle()

  if (closeError || !closedEntry) {
    console.error('No se pudo cerrar el registro de auditoría', {
      action: event.action,
      error: closeError?.message ?? 'El evento ya no estaba en progreso',
    })

    if ('error' in result) {
      return { error: `${result.error} El resultado quedó pendiente de verificación en la bitácora.` }
    }

    return { error: 'El cambio se completó, pero su registro quedó pendiente. Verifica antes de repetirlo.' }
  }

  return result
}
