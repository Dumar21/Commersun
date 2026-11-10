// src/app/reportes/page.tsx
import ChatReportes from '@/components/dashboard/ChatReportes'
import { obtenerSesion } from '@/lib/auth-server'

export default async function ReportesPage() {
  const sesion = await obtenerSesion()
  if (!sesion || sesion.rol !== 'dueno') return null

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent-bright">Analítica con IA</p>
        <h1 className="text-3xl font-display font-bold text-ink">Asistente de reportes</h1>
        <p className="text-sm text-muted">Pregunta sobre tus ventas, productos y vendedores en lenguaje normal.</p>
      </div>
      <ChatReportes />
    </div>
  )
}