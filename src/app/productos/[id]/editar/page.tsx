import { notFound } from 'next/navigation'
import FormularioProducto from '@/components/productos/FormularioProducto'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: producto, error } = await supabaseAdmin
    .from('productos')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !producto) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-primary-bright">Inventario</p>
        <h1 className="text-2xl font-display font-bold text-ink">Editar producto</h1>
        <p className="text-sm text-muted">{producto.nombre}</p>
      </div>
      <FormularioProducto producto={producto} />
    </div>
  )
}
