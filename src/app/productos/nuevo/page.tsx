// src/app/productos/nuevo/page.tsx
import FormularioProducto from '@/components/productos/FormularioProducto'

export default function NuevoProductoPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-bright">Inventario</p>
        <h1 className="text-3xl font-display font-bold text-ink">Agregar producto</h1>
        <p className="text-sm text-muted">Completa los datos y sube una foto para identificarlo rápido en ventas.</p>
      </div>
      <FormularioProducto />
    </div>
  )
}
