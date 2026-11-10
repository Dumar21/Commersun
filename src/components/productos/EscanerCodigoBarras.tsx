'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface Props {
  onScan: (codigo: string) => void
  onClose: () => void
}

export default function EscanerCodigoBarras({ onScan, onClose }: Props) {
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    const scanner = new Html5Qrcode('lector-camara')
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 100 } },
        (codigoDetectado) => {
          onScan(codigoDetectado)
          scanner.stop().catch(() => {})
        },
        () => {}
      )
      .catch((err) => {
        console.error('Error al iniciar cámara:', err)
        setError('No se pudo acceder a la cámara. Revisa los permisos o usa un escáner USB.')
      })

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/90 p-4">
      <div className="text-center">
        <h3 className="text-white font-bold text-lg">Escaneando código...</h3>
        <p className="text-muted text-xs mt-1">Apunta el código hacia la cámara</p>
      </div>

      <div id="lector-camara" className="w-full max-w-sm overflow-hidden rounded-2xl border-2 border-primary" />

      {error && (
        <div className="bg-danger/10 border border-danger/50 text-danger px-4 py-3 rounded-lg text-sm max-w-sm text-center">
          {error}
        </div>
      )}

      <button type="button" onClick={onClose} className="btn-secondary mt-2">
        Cerrar escáner
      </button>
    </div>
  )
}
