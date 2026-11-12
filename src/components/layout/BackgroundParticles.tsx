'use client'

import { useEffect, useRef } from 'react'

export default function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number

      constructor() {
        this.x = Math.random() * canvas!.width
        this.y = Math.random() * canvas!.height
        this.size = Math.random() * 1.5 + 0.5
        this.speedX = Math.random() * 0.2 - 0.1
        this.speedY = Math.random() * 0.2 - 0.1
        this.opacity = Math.random() * 0.25 + 0.1
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas!.width) this.x = 0
        else if (this.x < 0) this.x = canvas!.width
        if (this.y > canvas!.height) this.y = 0
        else if (this.y < 0) this.y = canvas!.height
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = `rgba(148, 163, 184, ${this.opacity})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const init = () => {
      particles = []
      const numberOfParticles = Math.floor((window.innerWidth * window.innerHeight) / 15000)
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle())
      }
    }

    const draw = (moveParticles: boolean) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((particle) => {
        if (moveParticles) particle.update()
        particle.draw()
      })
    }

    const animate = () => {
      draw(true)
      animationFrameId = requestAnimationFrame(animate)
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      init()
      if (prefersReducedMotion.matches) draw(false)
    }

    const handleMotionChange = () => {
      cancelAnimationFrame(animationFrameId)
      if (prefersReducedMotion.matches) draw(false)
      else animate()
    }

    window.addEventListener('resize', resize)
    prefersReducedMotion.addEventListener('change', handleMotionChange)
    resize()
    if (!prefersReducedMotion.matches) animate()

    return () => {
      window.removeEventListener('resize', resize)
      prefersReducedMotion.removeEventListener('change', handleMotionChange)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 opacity-15"
    />
  )
}
