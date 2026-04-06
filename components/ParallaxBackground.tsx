'use client'

import { useEffect, useRef, useState } from 'react'

interface StarConfig {
  size: number
  x: number
  y: number
  color: string
  parallaxSpeed: number
  floatDuration: number
  floatDistance: number
  delay: number
}

const starConfigs: StarConfig[] = [
  { size: 3, x: 15, y: 20, color: '#C15F3C', parallaxSpeed: 0.15, floatDuration: 20, floatDistance: 30, delay: 0 },
  { size: 4, x: 85, y: 15, color: '#E07B5C', parallaxSpeed: 0.1, floatDuration: 25, floatDistance: 25, delay: -5 },
  { size: 2, x: 70, y: 40, color: '#D4A574', parallaxSpeed: 0.25, floatDuration: 18, floatDistance: 35, delay: -8 },
  { size: 3, x: 25, y: 60, color: '#C15F3C', parallaxSpeed: 0.2, floatDuration: 22, floatDistance: 28, delay: -3 },
  { size: 4, x: 90, y: 70, color: '#E8A87C', parallaxSpeed: 0.12, floatDuration: 28, floatDistance: 20, delay: -12 },
  { size: 2, x: 45, y: 85, color: '#C15F3C', parallaxSpeed: 0.3, floatDuration: 15, floatDistance: 40, delay: -7 },
  { size: 3, x: 60, y: 25, color: '#D4A574', parallaxSpeed: 0.18, floatDuration: 24, floatDistance: 32, delay: -15 },
  { size: 2, x: 35, y: 45, color: '#E07B5C', parallaxSpeed: 0.22, floatDuration: 20, floatDistance: 26, delay: -10 },
]

function Star({
  config,
  scrollY,
}: {
  config: StarConfig
  scrollY: number
}) {
  const parallaxOffset = scrollY * config.parallaxSpeed

  return (
    <div
      className="star"
      style={{
        '--size': `${config.size}px`,
        '--x': `${config.x}%`,
        '--y': `${config.y}%`,
        '--color': config.color,
        '--parallax-offset': `${parallaxOffset}px`,
        '--float-distance': `${config.floatDistance}px`,
        '--duration': `${config.floatDuration}s`,
        '--delay': `${config.delay}s`,
      } as React.CSSProperties}
    />
  )
}

export function ParallaxBackground() {
  const [scrollY, setScrollY] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      rafRef.current = requestAnimationFrame(() => {
        setScrollY(window.scrollY)
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return (
    <>
      {/* 噪点纹理层 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <svg className="w-full h-full opacity-[0.025]">
          <filter id="noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* 星点层 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {starConfigs.map((config, index) => (
          <Star key={index} config={config} scrollY={scrollY} />
        ))}
      </div>
    </>
  )
}
