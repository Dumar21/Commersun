import FormularioProducto from '@/components/productos/FormularioProducto'

export default function NuevoProductoPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-primary-bright">Inventario</p>
        <h1 className="text-2xl font-display font-bold text-ink">Agregar producto</h1>
        <p className="text-sm text-muted">Completa los datos y sube una foto para identificarlo rápido en ventas.</p>
      </div>
      <FormularioProducto />
    </div>
  )
}
