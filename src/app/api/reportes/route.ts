import { NextRequest, NextResponse } from 'next/server'
import { obtenerSesion } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

type Periodo = 'diario' | 'mensual' | 'anual'
type VentaReporte = {
  id: string
  fecha_hora: string
  total: number
  estado: string
  id_vendedor: string
}

function escaparCsv(valor: string | number) {
  const texto = String(valor)
  return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

function rangoPeriodo(periodo: Periodo) {
  const ahora = new Date()
  const inicio = new Date(ahora)

  if (periodo === 'diario') {
    inicio.setHours(0, 0, 0, 0)
  } else if (periodo === 'mensual') {
    inicio.setDate(1)
    inicio.setHours(0, 0, 0, 0)
  } else {
    inicio.setMonth(0, 1)
    inicio.setHours(0, 0, 0, 0)
  }

  const fin = new Date(inicio)
  if (periodo === 'diario') fin.setDate(fin.getDate() + 1)
  if (periodo === 'mensual') fin.setMonth(fin.getMonth() + 1)
  if (periodo === 'anual') fin.setFullYear(fin.getFullYear() + 1)

  return { inicio, fin }
}

export async function GET(request: NextRequest) {
  const sesion = await obtenerSesion()
  if (!sesion || sesion.rol !== 'dueno') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const valorPeriodo = request.nextUrl.searchParams.get('periodo')
  const periodo: Periodo = valorPeriodo === 'mensual' || valorPeriodo === 'anual' ? valorPeriodo : 'diario'
  const { inicio, fin } = rangoPeriodo(periodo)

  const { data, error } = await supabaseAdmin
    .from('ventas')
    .select('id, fecha_hora, total, estado, id_vendedor')
    .in('estado', ['aceptada', 'pagada'])
    .gte('fecha_hora', inicio.toISOString())
    .lt('fecha_hora', fin.toISOString())
    .order('fecha_hora', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'No se pudo generar el reporte' }, { status: 500 })
  }

  const ventas = (data ?? []) as unknown as VentaReporte[]
  const total = ventas.reduce((acumulado, venta) => acumulado + Number(venta.total ?? 0), 0)
  const filas = [
    ['Periodo', periodo],
    ['Desde', inicio.toISOString()],
    ['Hasta', fin.toISOString()],
    ['Facturas', ventas.length],
    ['Total vendido', total],
    [],
    ['Factura', 'Fecha', 'Total', 'Estado', 'Vendedor'],
    ...ventas.map((venta) => [venta.id, venta.fecha_hora, venta.total, venta.estado, venta.id_vendedor]),
  ]

  const csv = '\uFEFF' + filas.map((fila) => fila.map((valor) => escaparCsv(valor ?? '')).join(',')).join('\n')
  const fechaArchivo = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="reporte-${periodo}-${fechaArchivo}.csv"`,
    },
  })
}
