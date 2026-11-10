// src/app/productos/[id]/editar/page.tsx
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
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-bright">Inventario</p>
        <h1 className="text-3xl font-display font-bold text-ink">Editar producto</h1>
        <p className="text-sm text-muted">Estás editando: <span className="font-semibold text-primary-bright">{producto.nombre}</span></p>
      </div>
      <FormularioProducto producto={producto} />
    </div>
  )
}
