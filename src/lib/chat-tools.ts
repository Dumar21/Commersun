// src/lib/chat-tools.ts
import { supabaseAdmin } from '@/lib/supabase-admin'

const ZONA = 'America/Bogota'

type Rango = { desde: string; hasta: string }
type ArgsHerramienta = Rango & { agrupar?: string; limite?: number }

function limites({ desde, hasta }: Rango) {
  return {
    inicio: `${desde}T00:00:00-05:00`,
    fin: `${hasta}T23:59:59.999-05:00`,
  }
}

function diaLocal(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: ZONA })
}

async function traerTodo<T>(
  construir: (a: number, b: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
) {
  const filas: T[] = []
  const paso = 1000
  for (let i = 0; ; i += paso) {
    const { data, error } = await construir(i, i + paso - 1)
    if (error) throw new Error(error.message)
    if (!data || data.length === 0) break
    filas.push(...data)
    if (data.length < paso) break
  }
  return filas
}

async function ventasPorPeriodo(args: ArgsHerramienta) {
  const { inicio, fin } = limites(args)
  const facturas = await traerTodo<{ total: number; fecha_hora: string }>((a, b) =>
    supabaseAdmin
      .from('ventas')
      .select('total, fecha_hora')
      .eq('estado', 'pagada')
      .gte('fecha_hora', inicio)
      .lte('fecha_hora', fin)
      .order('fecha_hora')
      .range(a, b)
  )

  const total = facturas.reduce((s, f) => s + Number(f.total), 0)
  const agrupar = args.agrupar === 'dia' || args.agrupar === 'mes' ? args.agrupar : 'total'

  if (agrupar === 'total') {
    return { desde: args.desde, hasta: args.hasta, facturas: facturas.length, total }
  }

  const grupos: Record<string, { facturas: number; total: number }> = {}
  for (const f of facturas) {
    const dia = diaLocal(f.fecha_hora)
    const clave = agrupar === 'mes' ? dia.slice(0, 7) : dia
    grupos[clave] ??= { facturas: 0, total: 0 }
    grupos[clave].facturas += 1
    grupos[clave].total += Number(f.total)
  }

  return {
    desde: args.desde,
    hasta: args.hasta,
    facturas: facturas.length,
    total,
    detalle: Object.entries(grupos).map(([periodo, v]) => ({ periodo, ...v })),
  }
}

async function productosMasVendidos(args: ArgsHerramienta) {
  const { inicio, fin } = limites(args)
  const ventas = await traerTodo<{ id: string }>((a, b) =>
    supabaseAdmin
      .from('ventas')
      .select('id')
      .eq('estado', 'pagada')
      .gte('fecha_hora', inicio)
      .lte('fecha_hora', fin)
      .order('fecha_hora')
      .range(a, b)
  )

  const idsVentas = ventas.map((venta) => venta.id)
  const detalles = (await Promise.all(
    Array.from({ length: Math.ceil(idsVentas.length / 500) }, (_, i) =>
      traerTodo<{ id_producto: string; cantidad: number; precio_unitario: number }>((a, b) =>
        supabaseAdmin
          .from('detalle_venta')
          .select('id_producto, cantidad, precio_unitario')
          .in('id_venta', idsVentas.slice(i * 500, (i + 1) * 500))
          .range(a, b)
      )
    )
  )).flat()

  const idsProductos = [...new Set(detalles.map((detalle) => detalle.id_producto))]
  const productos = (await Promise.all(
    Array.from({ length: Math.ceil(idsProductos.length / 500) }, (_, i) =>
      supabaseAdmin
        .from('productos')
        .select('id, nombre')
        .in('id', idsProductos.slice(i * 500, (i + 1) * 500))
    )
  )).flatMap((resultado) => {
    const { data, error } = resultado as unknown as {
      data: Array<{ id: string; nombre: string }> | null
      error: { message: string } | null
    }
    if (error) throw new Error(error.message)
    return data ?? []
  })

  const nombrePorId = new Map(productos.map((producto) => [producto.id, producto.nombre]))
  const mapa: Record<string, { unidades: number; ingresos: number }> = {}
  for (const detalle of detalles) {
    const nombre = nombrePorId.get(detalle.id_producto) ?? 'Producto eliminado'
    mapa[nombre] ??= { unidades: 0, ingresos: 0 }
    mapa[nombre].unidades += Number(detalle.cantidad)
    mapa[nombre].ingresos += Number(detalle.cantidad) * Number(detalle.precio_unitario)
  }

  const limite = Math.min(Math.max(args.limite ?? 10, 1), 50)
  return {
    desde: args.desde,
    hasta: args.hasta,
    productos: Object.entries(mapa)
      .map(([nombre, v]) => ({ nombre, ...v }))
      .sort((x, y) => y.unidades - x.unidades)
      .slice(0, limite),
  }
}

async function ventasPorVendedor(args: ArgsHerramienta) {
  const { inicio, fin } = limites(args)
  const facturas = await traerTodo<{ total: number; id_vendedor: string }>((a, b) =>
    supabaseAdmin
      .from('ventas')
      .select('total, id_vendedor')
      .eq('estado', 'pagada')
      .gte('fecha_hora', inicio)
      .lte('fecha_hora', fin)
      .range(a, b)
  )

  const idsVendedores = [...new Set(facturas.map((factura) => factura.id_vendedor))]
  const usuarios = (await Promise.all(
    Array.from({ length: Math.ceil(idsVendedores.length / 500) }, (_, i) =>
      supabaseAdmin
        .from('usuarios')
        .select('id, nombre')
        .in('id', idsVendedores.slice(i * 500, (i + 1) * 500))
    )
  )).flatMap((resultado) => {
    const { data, error } = resultado as unknown as {
      data: Array<{ id: string; nombre: string }> | null
      error: { message: string } | null
    }
    if (error) throw new Error(error.message)
    return data ?? []
  })

  const nombrePorId = new Map(usuarios.map((usuario) => [usuario.id, usuario.nombre]))
  const mapa: Record<string, { facturas: number; total: number }> = {}
  for (const f of facturas) {
    const nombre = nombrePorId.get(f.id_vendedor) ?? 'Sin vendedor'
    mapa[nombre] ??= { facturas: 0, total: 0 }
    mapa[nombre].facturas += 1
    mapa[nombre].total += Number(f.total)
  }

  return {
    desde: args.desde,
    hasta: args.hasta,
    vendedores: Object.entries(mapa)
      .map(([nombre, v]) => ({ nombre, ...v }))
      .sort((x, y) => y.total - x.total),
  }
}

const rango = {
  desde: { type: 'string', description: 'Fecha inicial inclusive, formato YYYY-MM-DD' },
  hasta: { type: 'string', description: 'Fecha final inclusive, formato YYYY-MM-DD' },
}

export const declaraciones = [
  {
    name: 'ventas_por_periodo',
    description: 'Total vendido y número de facturas pagadas en un rango de fechas, opcionalmente agrupado por día o mes.',
    parameters: {
      type: 'object',
      properties: {
        ...rango,
        agrupar: { type: 'string', enum: ['total', 'dia', 'mes'], description: 'Cómo agrupar el resultado' },
      },
      required: ['desde', 'hasta'],
    },
  },
  {
    name: 'productos_mas_vendidos',
    description: 'Ranking de productos por unidades vendidas e ingresos en un rango de fechas.',
    parameters: {
      type: 'object',
      properties: {
        ...rango,
        limite: { type: 'integer', description: 'Cantidad de productos a devolver, por defecto 10' },
      },
      required: ['desde', 'hasta'],
    },
  },
  {
    name: 'ventas_por_vendedor',
    description: 'Total vendido y número de facturas pagadas por cada vendedor en un rango de fechas.',
    parameters: {
      type: 'object',
      properties: rango,
      required: ['desde', 'hasta'],
    },
  },
]

const ejecutores: Record<string, (args: ArgsHerramienta) => Promise<unknown>> = {
  ventas_por_periodo: ventasPorPeriodo,
  productos_mas_vendidos: productosMasVendidos,
  ventas_por_vendedor: ventasPorVendedor,
}

export async function ejecutarHerramienta(nombre: string, args: unknown) {
  const fn = ejecutores[nombre]
  if (!fn) return { error: 'Herramienta no disponible' }
  if (typeof args !== 'object' || args === null) {
    return { error: 'Argumentos de consulta inválidos' }
  }

  const datos = args as Record<string, unknown>
  if (typeof datos.desde !== 'string' || typeof datos.hasta !== 'string') {
    return { error: 'Se requieren fechas inicial y final válidas' }
  }

  try {
    return await fn({
      desde: datos.desde,
      hasta: datos.hasta,
      agrupar: typeof datos.agrupar === 'string' ? datos.agrupar : undefined,
      limite: typeof datos.limite === 'number' ? datos.limite : undefined,
    })
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error consultando datos' }
  }
}