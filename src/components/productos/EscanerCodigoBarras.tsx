'use client'

import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface Props {
  onScan: (codigo: string) => void
  onClose: () => void
}

export default function EscanerCodigoBarras({ onScan, onClose }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    const scanner = new Html5Qrcode('lector-camara')
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (codigoDetectado) => {
          onScan(codigoDetectado)
          scanner.stop().catch(() => {})
        },
        () => {}
      )
      .catch((err) => console.error('No se pudo iniciar la cámara', err))

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [onScan])

  return (
    <div className="scanner-overlay">
      <div id="lector-camara" className="scanner-viewport" />
      <button type="button" onClick={onClose} className="btn-secondary">
        Cancelar
      </button>
    </div>
  )
}