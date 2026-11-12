import type { Rol } from '@/lib/database.types'

export type AuditCategory = 'all' | 'sales' | 'products' | 'users' | 'access'
export type AuditRole = Rol | 'sistema'

export const AUDIT_CATEGORY_OPTIONS: Array<{ value: AuditCategory; label: string }> = [
  { value: 'all', label: 'Todas las áreas' },
  { value: 'sales', label: 'Ventas y caja' },
  { value: 'products', label: 'Productos e inventario' },
  { value: 'users', label: 'Equipo' },
  { value: 'access', label: 'Accesos' },
]

export const AUDIT_ROLE_LABELS: Record<AuditRole, string> = {
  super_admin: 'Superadministrador',
  dueno: 'Dueño',
  vendedor: 'Vendedor',
  cajero: 'Cajero',
  bodegero: 'Bodeguero',
  sistema: 'Sistema',
}
