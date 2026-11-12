// src/app/reportes/page.tsx
import ChatReportes from '@/components/dashboard/ChatReportes'
import { obtenerSesion } from '@/lib/auth-server'

export default async function ReportesPage() {
  const sesion = await obtenerSesion()
  if (!sesion || sesion.rol !== 'dueno') return null

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted">Reportes</p>
        <h1 className="text-2xl font-display font-semibold text-ink">Asistente de reportes</h1>
        <p className="max-w-[65ch] text-sm text-muted">Consulta datos de ventas, productos y vendedores con preguntas en lenguaje natural.</p>
      </div>
      <ChatReportes />
    </div>
  )
}