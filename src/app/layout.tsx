import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Sora, Manrope } from 'next/font/google'
import './globals.css'
import Nav from '@/components/layout/Nav'
import PageMotion from '@/components/layout/PageMotion'
import InteractionMotion from '@/components/layout/InteractionMotion'
import BackgroundParticles from '@/components/layout/BackgroundParticles'

const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['600', '700'] })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', weight: ['400', '500', '600', '700'] })

function NavLoading() {
  return (
    <header className="app-header-container page-loading">
      <nav className="app-nav-glass" aria-label="Navegación principal" aria-busy="true">
        <span role="status" className="sr-only">Cargando navegación</span>
        <div className="hidden items-center gap-2.5 px-2 sm:flex" aria-hidden="true">
          <span className="h-8 w-8 rounded-lg bg-surface-2/80" />
          <span className="h-4 w-16 rounded bg-surface-2/80" />
        </div>
        <div className="hidden h-5 w-px bg-border/60 sm:block" aria-hidden="true" />
        <div className="app-nav-scroll min-w-0 flex-1 overflow-hidden">
          <div className="flex h-12 w-max min-w-full items-center justify-around gap-0.5 sm:h-auto sm:justify-start sm:gap-1" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
            <span
              key={index}
                className={`h-11 shrink-0 rounded-full bg-surface-2/80 ${index === 0 ? 'w-16 sm:w-24' : 'w-11 sm:w-20'}`}
            />
            ))}
          </div>
        </div>
        <span aria-hidden="true" className="h-11 w-11 shrink-0 rounded-full border border-white/10 bg-surface-2/80 sm:w-20" />
      </nav>
    </header>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL('https://tudominio.com'),
  title: 'Vento',
  description: 'Sistema de punto de venta e inventario',
  openGraph: {
    title: 'Vento',
    description: 'Sistema de punto de venta e inventario',
    url: '/',
    siteName: 'Vento',
    locale: 'es_CO',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Vista previa de Vento',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vento',
    description: 'Sistema de punto de venta e inventario',
    images: ['/og.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${sora.variable} ${manrope.variable}`}>
        <a
          href="#main-content"
          className="sr-only rounded-lg bg-surface-2 px-4 py-3 text-sm font-semibold text-ink focus:not-sr-only"
        >
          Saltar al contenido
        </a>
        <BackgroundParticles />
        <div className="app-top-atmosphere" aria-hidden="true" />
        <div className="app-shell">
          <Suspense fallback={<NavLoading />}>
            <Nav />
          </Suspense>
          <main id="main-content" tabIndex={-1} className="app-main">
            <InteractionMotion>
              <PageMotion>{children}</PageMotion>
            </InteractionMotion>
          </main>
        </div>
      </body>
    </html>
  )
}