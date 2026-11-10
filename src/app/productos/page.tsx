// src/app/productos/page.tsx
import Link from 'next/link'
import Image from 'next/image'
import { supabaseAdmin } from '@/lib/supabase-admin'
import EntradaInventario from '@/components/productos/EntradaInventario'
import BuscadorProductos from '@/components/productos/BuscadorProductos'

interface ProductoCatalogo {
  id: string
  nombre: string
  codigo_barras: string | null
  stock: number
  precio_detal: number
  precio_mayor: number
  imagen_url: string | null
}

export default async function ProductosPage() {
  const { data: productos, error } = await supabaseAdmin
    .from('productos')
    .select('id, nombre, codigo_barras, stock, precio_detal, precio_mayor, imagen_url')
    .order('nombre')

  if (error || !productos) {
    return <p className="text-danger">Error cargando productos</p>
  }

  const productosCatalogo: ProductoCatalogo[] = productos

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-bright">Gestión de Inventario</p>
          <h1 className="text-3xl font-display font-bold text-ink">Catálogo de Productos</h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <BuscadorProductos productos={productosCatalogo.map((p) => ({
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

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface/80 shadow-[0_16px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border/70 bg-surface-2/75 text-left text-muted">
                <th className="px-5 py-3.5 font-bold uppercase tracking-[0.16em] text-[9px]">Producto</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-[0.16em] text-[9px]">Precio detal</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-[0.16em] text-[9px]">Precio mayor</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-[0.16em] text-[9px]">Existencias</th>
                <th className="px-5 py-3.5 font-bold uppercase tracking-[0.16em] text-[9px]">Código</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/35">
              {productosCatalogo.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <p className="text-sm font-semibold text-ink">Aún no hay productos</p>
                    <p className="mt-1 text-xs text-muted">Agrega el primer producto para empezar a gestionar tu inventario.</p>
                    <Link href="/productos/nuevo" className="mt-4 inline-flex rounded-lg border border-primary-bright/20 px-3 py-1.5 text-xs font-bold text-primary-bright transition hover:bg-primary/10">
                      Agregar producto
                    </Link>
                  </td>
                </tr>
              ) : productosCatalogo.map((producto) => (
                <tr key={producto.id} className="group transition-colors hover:bg-primary/[0.04]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 overflow-hidden rounded-xl border border-border/80 bg-surface-2 shadow-sm">
                        {producto.imagen_url ? (
                          <Image
                            src={producto.imagen_url}
                            alt={producto.nombre}
                            width={48}
                            height={48}
                            sizes="48px"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-muted">IMG</div>
                        )}
                      </div>
                      <div className="font-semibold text-ink">{producto.nombre}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-medium tabular-nums text-ink">${producto.precio_detal.toLocaleString('es-CO')}</td>
                  <td className="px-5 py-3.5 font-medium tabular-nums text-ink">${producto.precio_mayor.toLocaleString('es-CO')}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold tabular-nums ${
                      producto.stock <= 0
                        ? 'border-danger/20 bg-danger/10 text-danger'
                        : producto.stock <= 5
                          ? 'border-amber-300/20 bg-amber-300/10 text-amber-200'
                          : 'border-accent/20 bg-accent/10 text-accent-bright'
                    }`}>
                      {producto.stock} un.
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-muted">{producto.codigo_barras || '—'}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/productos/${producto.id}/editar`} className="inline-flex rounded-lg border border-border/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-bright transition hover:border-primary-bright/30 hover:bg-primary/10">Editar</Link>
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
