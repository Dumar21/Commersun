// src/components/dashboard/ChatReportes.tsx
'use client'

import { useEffect, useRef, useState } from 'react'

type Mensaje = { rol: 'usuario' | 'asistente'; texto: string }

const SUGERENCIAS = [
  { titulo: 'Ventas por mes', texto: '¿Cuánto vendimos en noviembre y diciembre?' },
  { titulo: 'Más vendidos', texto: 'Top 10 productos más vendidos este mes' },
  { titulo: 'Rendimiento', texto: '¿Qué vendedor ha vendido más?' },
  { titulo: 'Tendencia diaria', texto: 'Muéstrame las ventas por día de esta semana' },
]

const MASCARA =
  '[mask-image:linear-gradient(to_bottom,transparent,black_28px,black_calc(100%-28px),transparent)]'

function Chispa({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
      <path d="M19 15l.7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z" />
    </svg>
  )
}

function Negrita({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') && p.length > 4 ? (
          <strong key={i} className="font-semibold text-ink">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  )
}

function celdasTabla(linea: string) {
  return linea
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((celda) => celda.trim())
}

function esSeparadorTabla(linea: string) {
  return /^\s*\|?[\s:|-]+\|[\s:|-]*\|?\s*$/.test(linea) && linea.includes('-')
}

function fechaLegible(valor: string) {
  const coincidencia = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!coincidencia) return valor

  const fecha = new Date(Number(coincidencia[1]), Number(coincidencia[2]) - 1, Number(coincidencia[3]), 12)
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(fecha)
}

function Formateado({ texto }: { texto: string }) {
  const lineas = texto.split('\n')
  const bloques: Array<{ tipo: 'texto'; linea: string; indice: number } | { tipo: 'tabla'; filas: string[][]; indice: number }> = []

  for (let i = 0; i < lineas.length; i++) {
    if (lineas[i].includes('|') && i + 1 < lineas.length && esSeparadorTabla(lineas[i + 1])) {
      const filas = [celdasTabla(lineas[i])]
      i += 2
      while (i < lineas.length && lineas[i].includes('|') && lineas[i].trim()) {
        filas.push(celdasTabla(lineas[i]))
        i++
      }
      i--
      bloques.push({ tipo: 'tabla', filas, indice: i })
      continue
    }

    bloques.push({ tipo: 'texto', linea: lineas[i], indice: i })
  }

  return (
    <div className="space-y-3">
      {bloques.map((bloque) => {
        if (bloque.tipo === 'tabla') {
          const [encabezados, ...filas] = bloque.filas
          return (
            <div key={`tabla-${bloque.indice}`} className="overflow-hidden rounded-xl border border-border/70 bg-background/45">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[400px] border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border/70 bg-surface-2/80">
                      {encabezados.map((celda, j) => (
                        <th key={j} className="px-4 py-3 font-semibold text-muted">
                          {celda}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filas.map((fila, filaIndex) => (
                      <tr key={filaIndex} className="border-b border-border/40 last:border-0 even:bg-white/[0.025]">
                        {encabezados.map((_, celdaIndex) => {
                          const valor = fila[celdaIndex] ?? ''
                          const esNumero = /^\$?[\d.,]+$/.test(valor.replace(/\s/g, ''))
                          return (
                            <td key={celdaIndex} className={`px-4 py-3 ${esNumero ? 'whitespace-nowrap text-right font-medium tabular-nums text-ink' : 'text-ink/85'}`}>
                              {fechaLegible(valor)}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }

        const linea = bloque.linea
        const item = linea.match(/^\s*[*-]\s+(.*)$/)
        if (item) {
          return (
            <div key={bloque.indice} className="flex gap-2.5">
              <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-muted" />
              <span>
                <Negrita texto={item[1]} />
              </span>
            </div>
          )
        }
        if (!linea.trim()) return <div key={bloque.indice} className="h-0.5" />
        const titulo = linea.match(/^#{1,3}\s+(.+)$/)
        return (
          <p key={bloque.indice} className={titulo ? 'font-display text-base font-semibold text-ink' : ''}>
            <Negrita texto={titulo ? titulo[1] : linea} />
          </p>
        )
      })}
    </div>
  )
}

export default function ChatReportes() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [entrada, setEntrada] = useState('')
  const [cargando, setCargando] = useState(false)
  const fondo = useRef<HTMLDivElement>(null)
  const campo = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    fondo.current?.scrollIntoView({ behavior, block: 'end' })
  }, [mensajes, cargando])

  useEffect(() => {
    const el = campo.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [entrada])

  async function enviar(texto: string) {
    const limpio = texto.trim()
    if (!limpio || cargando) return

    const siguiente: Mensaje[] = [...mensajes, { rol: 'usuario', texto: limpio }]
    setMensajes(siguiente)
    setEntrada('')
    setCargando(true)

    try {
      const res = await fetch('/api/reportes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensajes: siguiente }),
      })
      const data = await res.json()
      setMensajes([...siguiente, { rol: 'asistente', texto: data.texto ?? data.error ?? 'Error inesperado.' }])
    } catch {
      setMensajes([...siguiente, { rol: 'asistente', texto: 'No se pudo conectar con el asistente.' }])
    } finally {
      setCargando(false)
      campo.current?.focus()
    }
  }

  const vacio = mensajes.length === 0
  const puedeEnviar = entrada.trim().length > 0 && !cargando

  return (
    <div className="flex h-[calc(100dvh-15.5rem)] min-h-0 flex-col">
      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        className={`flex-1 overflow-y-auto px-1 pr-3 ${MASCARA}`}
      >
        {vacio ? (
          <div className="flex h-full flex-col items-center justify-center gap-8 py-8 text-center animate-fade-up">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted">
                <Chispa className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h2 className="font-display text-xl font-semibold text-ink">¿Qué quieres saber de tu negocio?</h2>
                <p className="text-sm text-muted">Consulto tus ventas, productos y vendedores en tiempo real.</p>
              </div>
            </div>

            <div className="grid w-full max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s.texto}
                  type="button"
                  onClick={() => enviar(s.texto)}
                  className="group min-h-20 rounded-lg border border-border/80 bg-surface-2/40 px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-surface-2"
                >
                  <span className="block text-xs font-medium text-muted">{s.titulo}</span>
                  <span className="mt-1 block text-sm text-ink/80 group-hover:text-ink">{s.texto}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-6">
            {mensajes.map((m, i) =>
              m.rol === 'usuario' ? (
                <div key={i} className="flex justify-end animate-fade-up">
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-xl rounded-br-sm border border-border bg-surface-2 px-4 py-3 text-sm leading-relaxed text-ink">
                    {m.texto}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex items-start gap-3 animate-fade-up">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted">
                    <Chispa className="h-4 w-4" />
                  </div>
                  <div className="max-w-[88%] pt-1 text-sm leading-relaxed text-ink/90">
                    <Formateado texto={m.texto} />
                  </div>
                </div>
              )
            )}

            {cargando && (
              <div role="status" className="flex items-center gap-3 animate-fade-up">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted">
                  <Chispa className="h-4 w-4 animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted motion-reduce:animate-none"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                  <span className="ml-2 text-xs text-muted">Consultando datos…</span>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={fondo} />
      </div>

      <div className="pt-3">
        <div className="relative rounded-xl border border-border bg-surface-2/70 transition-colors focus-within:border-primary-bright">
          <textarea
            ref={campo}
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                enviar(entrada)
              }
            }}
            rows={1}
            aria-label="Escribe una pregunta sobre tus reportes"
            placeholder="Pregunta sobre tus ventas…"
            className="block max-h-40 w-full resize-none bg-transparent py-4 pl-4 pr-16 text-sm text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-primary-bright focus-visible:outline-offset-2"
          />
          <button
            type="button"
            onClick={() => enviar(entrada)}
            disabled={!puedeEnviar}
            aria-label="Enviar mensaje"
            className="absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary-dark disabled:bg-surface-2 disabled:text-muted"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 19V5" />
              <path d="M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted/70">Enter para enviar · Shift + Enter para nueva línea</p>
      </div>
    </div>
  )
}