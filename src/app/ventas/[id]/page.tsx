// src/app/ventas/[id]/page.tsx
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { obtenerSesion } from '@/lib/auth-server'
import NuevaFactura from '@/components/ventas/NuevaFactura'

export default async function EditarFacturaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sesion = await obtenerSesion()
  if (!sesion) return null

  const { data: factura } = await supabaseAdmin.from('ventas').select('id, estado, id_vendedor').eq('id', id).single()

  if (!factura) notFound()
  if (factura.estado !== 'borrador') return <p className="text-danger">Esta factura ya no se puede editar.</p>
  if (factura.id_vendedor !== sesion.sub && sesion.rol !== 'dueno') return <p className="text-danger">No tienes acceso a esta factura.</p>

  const [{ data: productos }, { data: detalles }] = await Promise.all([
    supabaseAdmin.from('productos').select('id, nombre, precio_detal, precio_mayor, stock, imagen_url').order('nombre'),
    supabaseAdmin.from('detalle_venta').select('id_producto, cantidad, tipo_venta').eq('id_venta', id),
  ])

  return <NuevaFactura productos={productos ?? []} facturaId={id} itemsIniciales={detalles ?? []} />
}