import type { Metadata } from 'next'
import { Sora, Manrope } from 'next/font/google'
import './globals.css'
import Nav from '@/components/layout/Nav'

const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['600', '700'] })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'Caja Navidad',
  description: 'Sistema de flujo de caja e inventario',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${sora.variable} ${manrope.variable}`}>
        <div className="app-shell">
          <Nav />
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  )
}