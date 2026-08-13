// src/app/productos/page.tsx
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import EntradaInventario from '@/components/productos/EntradaInventario'
import AgregarStockManual from '@/components/productos/AgregarStockManual'

export default async function ProductosPage() {
  const { data: productos, error } = await supabaseAdmin.from('productos').select('*').order('nombre')

  if (error || !productos) {
    return <p className="text-danger">Error cargando productos</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Productos</h1>
          <p className="text-muted text-sm">{productos.length} productos registrados</p>
        </div>
        <Link href="/productos/nuevo" className="btn-primary">+ Nuevo producto</Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <EntradaInventario />
        <AgregarStockManual productos={productos.map((p) => ({ id: p.id, nombre: p.nombre, stock: p.stock }))} />
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Detal</th>
              <th className="px-4 py-3 font-medium">Mayor</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 overflow-hidden rounded-lg border border-border bg-surface-2">
                      {producto.imagen_url ? (
                        <img src={producto.imagen_url} alt={producto.nombre} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-muted">IMG</div>
                      )}
                    </div>
                    <div className="font-medium text-ink">{producto.nombre}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink">${producto.precio_detal.toLocaleString('es-CO')}</td>
                <td className="px-4 py-3 text-ink">${producto.precio_mayor.toLocaleString('es-CO')}</td>
                <td className="px-4 py-3 text-ink">{producto.stock}</td>
                <td className="px-4 py-3 text-muted">{producto.codigo_barras}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/productos/${producto.id}/editar`} className="text-primary-bright hover:underline">Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}