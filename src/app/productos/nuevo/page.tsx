// src/app/productos/nuevo/page.tsx
import FormularioProducto from '@/components/productos/FormularioProducto'

export default function NuevoProductoPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted">Inventario</p>
        <h1 className="text-2xl font-display font-semibold text-ink">Agregar producto</h1>
        <p className="text-sm text-muted">Completa los datos del producto y añade una foto para identificarlo en ventas.</p>
      </div>
      <FormularioProducto />
    </div>
  )
}
