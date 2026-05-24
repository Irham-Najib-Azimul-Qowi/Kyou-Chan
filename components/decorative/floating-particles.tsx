'use client'

import React, { useState, useEffect } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  delay: number
  duration: number
  drift: number
}

export function FloatingParticles() {
  const [mounted, setMounted] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    // Generate particles on the client side after mounting to guarantee perfect hydration matching
    const handle = requestAnimationFrame(() => {
      setParticles(
        Array.from({ length: 12 }).map((_, i) => ({
          id: i,
          x: Math.random() * 100, // percentage width
          y: Math.random() * 80 + 20, // percentage height
          size: Math.random() * 2 + 1.5, // 1.5px to 3.5px
          color: Math.random() > 0.5 ? 'var(--jade)' : 'var(--gold)',
          delay: Math.random() * -8, // negative delay so particles start instantly
          duration: Math.random() * 6 + 6, // 6s to 12s
          drift: Math.random() * 40 - 20, // -20px to 20px drift
        }))
      )
      setMounted(true)
    })
    return () => cancelAnimationFrame(handle)
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float-up"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 6px ${p.color}`,
            animationDelay: `${p.delay}s`,
            // Set custom properties for float-up keyframes
            ['--duration' as any]: `${p.duration}s`,
            ['--drift' as any]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
