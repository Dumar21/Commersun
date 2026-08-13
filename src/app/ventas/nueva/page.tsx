// src/app/ventas/nueva/page.tsx
import { supabaseAdmin } from '@/lib/supabase-admin'
import NuevaFactura from '@/components/ventas/NuevaFactura'

export default async function NuevaFacturaPage() {
  const { data: productos } = await supabaseAdmin
    .from('productos')
    .select('id, nombre, precio_detal, precio_mayor, stock, imagen_url')
    .order('nombre')

  return <NuevaFactura productos={productos ?? []} />
}