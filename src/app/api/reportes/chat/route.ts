import { NextResponse } from 'next/server'
import { obtenerSesion } from '@/lib/auth-server'
import { declaraciones, ejecutarHerramienta } from '@/lib/chat-tools'

type Mensaje = { rol: 'usuario' | 'asistente'; texto: string }
type Rol = 'system' | 'user' | 'assistant' | 'tool'
type ChatMessage = {
  role: Rol
  content: string
  tool_call_id?: string
  tool_calls?: ToolCall[]
}
type ToolCall = {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}
type Provider = {
  id: string
  endpoint: string
  apiKey: string
  model?: string
}
type ModelCatalog = { data?: Array<Record<string, unknown>> }
type GoogleModelCatalog = { models?: Array<Record<string, unknown>> }
type Completion = {
  choices?: Array<{
    message?: {
      content?: string | null
      tool_calls?: ToolCall[]
    }
  }>
}

const providerOrder = ['groq', 'openrouter', 'huggingface', 'google', 'bai']
const modelCache = new Map<string, { model: string; expiresAt: number }>()
const providerEndpoints: Record<string, string> = {
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  huggingface: 'https://router.huggingface.co/v1/chat/completions',
  google: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
}

class ProviderError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly provider?: string
  ) {
    super(message)
  }
}

function configuredProviders(): Provider[] {
  const keys: Record<string, string | undefined> = {
    groq: process.env.GROQ_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
    huggingface: process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY,
    google: process.env.GEMINI_API_KEY,
    bai: process.env.BAI_API_KEY,
  }
  const models: Record<string, string | undefined> = {
    groq: process.env.GROQ_MODEL,
    openrouter: process.env.OPENROUTER_MODEL,
    huggingface: process.env.HF_MODEL || process.env.HUGGINGFACE_MODEL,
    google: process.env.GEMINI_MODEL,
    bai: process.env.BAI_MODEL,
  }
  const order = (process.env.CHAT_AI_PROVIDER_ORDER || providerOrder.join(','))
    .split(',')
    .map((provider) => provider.trim().toLowerCase())
    .filter((provider) => providerOrder.includes(provider))

  return order.flatMap((id) => {
    const apiKey = keys[id]?.trim()
    const model = models[id]?.trim()
    let endpoint: string | undefined = providerEndpoints[id]

    if (id === 'bai') {
      const baseUrl = process.env.BAI_API_BASE_URL?.trim().replace(/\/+$/, '')
      if (baseUrl) {
        try {
          const parsed = new URL(baseUrl)
          if (parsed.protocol === 'https:') {
            endpoint = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`
          }
        } catch {
          endpoint = undefined
        }
      }
    }

    if (!apiKey || !endpoint || (id === 'bai' && !model)) return []
    return [{ id, endpoint, apiKey, model }]
  })
}

async function traerCatalogo<T>(url: string, apiKey: string, id: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(6_000),
  })

  if (!response.ok) {
    throw new ProviderError(`No se pudo consultar el catálogo (HTTP ${response.status})`, response.status, id)
  }
  return (await response.json()) as T
}

async function descubrirModelo(provider: Provider): Promise<string> {
  if (provider.model) return provider.model

  const cached = modelCache.get(provider.id)
  if (cached && cached.expiresAt > Date.now()) return cached.model

  let model: string | undefined
  if (provider.id === 'openrouter') {
    const catalogo = await traerCatalogo<ModelCatalog>(
      'https://openrouter.ai/api/v1/models',
      provider.apiKey,
      provider.id
    )
    const modelos = (catalogo.data ?? []).filter((item) => {
      const parametros = item.supported_parameters
      const precios = item.pricing as Record<string, unknown> | undefined
      const esGratis = item.id?.toString().endsWith(':free') ||
        (precios?.prompt === '0' && precios?.completion === '0')
      return typeof item.id === 'string' &&
        Array.isArray(parametros) &&
        parametros.includes('tools') &&
        esGratis
    })
    model = modelos[0]?.id as string | undefined
  } else if (provider.id === 'huggingface') {
    const catalogo = await traerCatalogo<ModelCatalog>(
      'https://router.huggingface.co/v1/models',
      provider.apiKey,
      provider.id
    )
    const modelos = (catalogo.data ?? []).filter((item) => {
      const proveedores = item.providers
      return typeof item.id === 'string' &&
        Array.isArray(proveedores) &&
        proveedores.some((proveedor) => {
          if (typeof proveedor !== 'object' || proveedor === null) return false
          const datos = proveedor as Record<string, unknown>
          return datos.status === 'live' && datos.supports_tools === true && datos.is_free === true
        })
    })
    model = modelos[0]?.id as string | undefined
  } else if (provider.id === 'groq') {
    const catalogo = await traerCatalogo<ModelCatalog>(
      'https://api.groq.com/openai/v1/models',
      provider.apiKey,
      provider.id
    )
    const modelos = (catalogo.data ?? [])
      .filter((item) =>
        typeof item.id === 'string' &&
        item.active !== false &&
        !/whisper|guard|embedding|speech|transcription/i.test(item.id)
      )
      .map((item) => item.id as string)
    const preferidos = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b']
    model = preferidos.find((id) => modelos.includes(id)) ?? modelos[0]
  } else if (provider.id === 'google') {
    const catalogo = await traerCatalogo<GoogleModelCatalog>(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(provider.apiKey)}`,
      provider.apiKey,
      provider.id
    )
    const modelos = (catalogo.models ?? [])
      .filter((item) =>
        typeof item.baseModelId === 'string' &&
        item.baseModelId.includes('flash') &&
        Array.isArray(item.supportedGenerationMethods) &&
        item.supportedGenerationMethods.includes('generateContent')
      )
      .map((item) => item.baseModelId as string)
    model = modelos[0]
  }

  if (!model) {
    throw new ProviderError('No se encontró un modelo gratuito disponible que admita herramientas', 404, provider.id)
  }

  modelCache.set(provider.id, { model, expiresAt: Date.now() + 5 * 60_000 })
  return model
}

function esReintentable(status: number) {
  return [401, 403, 404, 408, 409, 429].includes(status) || status >= 500
}

function sanearMensajeError(mensaje: string) {
  const claves = [
    process.env.GROQ_API_KEY,
    process.env.OPENROUTER_API_KEY,
    process.env.HF_TOKEN,
    process.env.HUGGINGFACE_API_KEY,
    process.env.GEMINI_API_KEY,
    process.env.BAI_API_KEY,
  ].filter((clave): clave is string => Boolean(clave))

  return claves.reduce((texto, clave) => texto.replaceAll(clave, '[REDACTED]'), mensaje)
    .replace(/([?&]key=)[^&\s]+/gi, '$1[REDACTED]')
}

async function solicitarAProveedor(provider: Provider, messages: ChatMessage[]) {
  const model = await descubrirModelo(provider)
  const response = await fetch(provider.endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
      ...(provider.id === 'openrouter'
        ? { 'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', 'X-Title': 'Caja Navidad' }
        : {}),
    },
    body: JSON.stringify({
      model,
      messages,
      tools: declaraciones.map((declaracion) => ({
        type: 'function',
        function: declaracion,
      })),
      tool_choice: 'auto',
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(12_000),
  })

  if (!response.ok) {
    throw new ProviderError(`El proveedor respondió HTTP ${response.status}`, response.status, provider.id)
  }

  const data = (await response.json()) as Completion
  const message = data.choices?.[0]?.message
  if (!message || (typeof message.content !== 'string' && !Array.isArray(message.tool_calls))) {
    throw new ProviderError('El proveedor devolvió una respuesta incompleta', undefined, provider.id)
  }
  return { message, provider: provider.id, model }
}

async function generarRespuesta(messages: ChatMessage[], proveedoresFallidos: Set<string>) {
  const providers = configuredProviders()
  if (providers.length === 0) {
    throw new ProviderError('No hay proveedores de IA configurados', 503)
  }

  const errores: string[] = []
  for (const provider of providers.filter(({ id }) => !proveedoresFallidos.has(id))) {
    try {
      return await solicitarAProveedor(provider, messages)
    } catch (error) {
      proveedoresFallidos.add(provider.id)
      const status = error instanceof ProviderError ? error.status : undefined
      const message = error instanceof Error ? error.message : 'Error desconocido'
      console.warn('[reportes/chat] Proveedor no disponible; probando el siguiente', {
        provider: provider.id,
        status,
        message: sanearMensajeError(message),
      })
      errores.push(`${provider.id}: ${message}`)

      if (status !== undefined && !esReintentable(status)) {
        throw error
      }
    }
  }

  throw new ProviderError(
    `Todos los proveedores configurados fallaron (${errores.join('; ')})`,
    503
  )
}

export async function POST(req: Request) {
  const sesion = await obtenerSesion()
  if (!sesion || sesion.rol !== 'dueno') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  let cuerpo: { mensajes?: Mensaje[] }
  try {
    cuerpo = (await req.json()) as { mensajes?: Mensaje[] }
  } catch {
    return NextResponse.json({ error: 'Solicitud JSON inválida' }, { status: 400 })
  }

  if (
    !Array.isArray(cuerpo.mensajes) ||
    cuerpo.mensajes.length === 0 ||
    cuerpo.mensajes.some(
      (mensaje) =>
        !mensaje ||
        (mensaje.rol !== 'usuario' && mensaje.rol !== 'asistente') ||
        typeof mensaje.texto !== 'string'
    )
  ) {
    return NextResponse.json({ error: 'Mensajes inválidos' }, { status: 400 })
  }

  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
  const systemInstruction = [
    'Eres el asistente de reportes de un sistema de caja e inventario en Colombia.',
    `La fecha de hoy es ${hoy}. Interpreta fechas relativas y meses sin año usando el año actual.`,
    'Responde siempre en español, claro y breve. Montos en pesos colombianos con separador de miles.',
    'Nunca inventes cifras: usa únicamente los resultados de las herramientas.',
    'Si la pregunta no tiene que ver con los datos del negocio, indícalo amablemente.',
  ].join(' ')

  const messages: ChatMessage[] = [
    { role: 'system', content: systemInstruction },
    ...cuerpo.mensajes.slice(-12).map((mensaje) => ({
      role: mensaje.rol === 'usuario' ? 'user' as const : 'assistant' as const,
      content: mensaje.texto,
    })),
  ]

  try {
    const proveedoresFallidos = new Set<string>()
    let proveedorFinal = ''
    for (let i = 0; i < 4; i++) {
      const respuesta = await generarRespuesta(messages, proveedoresFallidos)
      proveedorFinal = respuesta.provider

      const llamadas = respuesta.message.tool_calls ?? []
      if (llamadas.length === 0) {
        return NextResponse.json({
          texto: respuesta.message.content ?? 'No pude generar una respuesta.',
          proveedor: proveedorFinal,
        })
      }

      messages.push({
        role: 'assistant',
        content: respuesta.message.content ?? '',
        tool_calls: llamadas,
      })

      for (const llamada of llamadas) {
        let resultado: unknown
        try {
          const argumentos: unknown = JSON.parse(llamada.function.arguments)
          resultado = await ejecutarHerramienta(llamada.function.name, argumentos)
        } catch {
          resultado = { error: 'No se pudieron procesar los argumentos de la consulta.' }
        }

        messages.push({
          role: 'tool',
          tool_call_id: llamada.id,
          content: JSON.stringify(resultado),
        })
      }
    }

    return NextResponse.json({
      texto: 'La consulta fue demasiado compleja, intenta ser más específico.',
      proveedor: proveedorFinal,
    })
  } catch (error) {
    const status = error instanceof ProviderError ? error.status : undefined
    const provider = error instanceof ProviderError ? error.provider : undefined
    console.error('[reportes/chat] Falló el asistente', {
      provider,
      status,
      message: sanearMensajeError(error instanceof Error ? error.message : 'Error desconocido'),
    })

    const mensajeUsuario = status === 401 || status === 403
      ? 'Un proveedor rechazó la API Key o denegó el acceso. Revisa las variables configuradas.'
      : status === 429
        ? 'Los proveedores configurados alcanzaron su límite. Intenta de nuevo más tarde.'
        : status === 503
          ? 'Ningún proveedor de IA está disponible. Intenta de nuevo en unos momentos.'
          : 'El asistente no pudo completar la solicitud. Revisa la terminal para ver el error.'

    return NextResponse.json({ error: mensajeUsuario }, { status: 502 })
  }
}
