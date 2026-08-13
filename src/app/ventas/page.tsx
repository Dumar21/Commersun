// src/app/ventas/page.tsx
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { obtenerSesion } from '@/lib/auth-server'

const ETIQUETAS_ESTADO: Record<string, string> = {
  borrador: 'Borrador',
  pendiente_caja: 'En caja',
  aceptada: 'Aceptada por caja',
  pagada: 'Pagada',
  cancelada: 'Cancelada',
}

export default async function VentasPage() {
  const sesion = await obtenerSesion()
  if (!sesion) return null

  const { data: facturas } = await supabaseAdmin
    .from('ventas')
    .select('id, total, estado, fecha_hora')
    .eq('id_vendedor', sesion.sub)
    .order('fecha_hora', { ascending: false })
    .limit(50)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-ink">Mis facturas</h1>
        <Link href="/ventas/nueva" className="btn-primary">+ Nueva factura</Link>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {facturas?.map((factura) => (
              <tr key={factura.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-ink">{new Date(factura.fecha_hora).toLocaleString('es-CO')}</td>
                <td className="px-4 py-3 text-ink">${factura.total.toLocaleString('es-CO')}</td>
                <td className="px-4 py-3 text-muted">{ETIQUETAS_ESTADO[factura.estado]}</td>
                <td className="px-4 py-3">
                  {factura.estado === 'borrador' && (
                    <Link href={`/ventas/${factura.id}`} className="text-primary-bright hover:underline">Editar</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}