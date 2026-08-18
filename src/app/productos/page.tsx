// src/app/productos/page.tsx
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import EntradaInventario from '@/components/productos/EntradaInventario'
import BuscadorProductos from '@/components/productos/BuscadorProductos'

export default async function ProductosPage() {
  const { data: productos, error } = await supabaseAdmin.from('productos').select('*').order('nombre')

  if (error || !productos) {
    return <p className="text-danger">Error cargando productos</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="card flex flex-col gap-4 bg-[radial-gradient(circle_at_top_left,_rgba(51,199,224,0.18),transparent_40%)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary-bright">Inventario</p>
          <h1 className="mt-1 text-2xl font-display font-bold text-ink">Productos</h1>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm text-muted">
            <span className="h-2.5 w-2.5 rounded-full bg-primary-bright" />
            {productos.length} productos registrados
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <BuscadorProductos productos={productos.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            codigo_barras: p.codigo_barras,
            stock: p.stock,
            precio_detal: p.precio_detal,
            precio_mayor: p.precio_mayor,
            imagen_url: p.imagen_url,
          }))} />
          <Link href="/productos/nuevo" className="btn-primary whitespace-nowrap">+ Nuevo producto</Link>
        </div>
      </div>

      <EntradaInventario />

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto md:overflow-visible">
          <table className="w-full min-w-[760px] text-sm md:min-w-0">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="whitespace-nowrap px-4 py-3 font-medium">Producto</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Detal</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Mayor</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Stock</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Código</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id} className="border-b border-border transition hover:bg-surface-2/60 last:border-0">
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
    </div>
  )
}
