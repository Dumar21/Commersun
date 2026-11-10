import type { Metadata } from 'next'
import { Sora, Manrope } from 'next/font/google'
import './globals.css'
import Nav from '@/components/layout/Nav'
import PageMotion from '@/components/layout/PageMotion'
import InteractionMotion from '@/components/layout/InteractionMotion'
import BackgroundParticles from '@/components/layout/BackgroundParticles'

const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['600', '700'] })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'Vento',
  description: 'Sistema de punto de venta e inventario',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${sora.variable} ${manrope.variable}`}>
        <BackgroundParticles />
        <div className="app-top-atmosphere" aria-hidden="true" />
        <div className="app-shell">
          <Nav />
          <main className="app-main">
            <InteractionMotion>
              <PageMotion>{children}</PageMotion>
            </InteractionMotion>
          </main>
        </div>
      </body>
    </html>
  )
}
