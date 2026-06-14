import { useMemo } from 'react'
import type { Season } from '@/types/game'

interface SeasonalEffectProps {
  season: Season
}

const SEASON_PARTICLES: Record<Season, { emoji: string; animName: string }> = {
  spring: { emoji: '🌸', animName: 'leafFall' },
  summer: { emoji: '✨', animName: 'leafFall' },
  autumn: { emoji: '🍂', animName: 'leafFall' },
  winter: { emoji: '❄️', animName: 'snowFall' },
}

export default function SeasonalEffect({ season }: SeasonalEffectProps) {
  const particles = useMemo(() => {
    const config = SEASON_PARTICLES[season]
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${6 + Math.random() * 6}s`,
      fontSize: `${12 + Math.random() * 10}px`,
      emoji: config.emoji,
      animName: config.animName,
      opacity: 0.5 + Math.random() * 0.5,
    }))
  }, [season])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: '-20px',
            fontSize: p.fontSize,
            opacity: p.opacity,
            animation: `${p.animName} ${p.duration} ${p.delay} linear infinite`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  )
}
