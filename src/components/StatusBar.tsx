import { useGameStore } from '@/stores/gameStore'
import { SEASON_LABELS, SEASON_COLORS, WEATHER_DATA } from '@/data/gameData'

export default function StatusBar() {
  const day = useGameStore((s) => s.day)
  const season = useGameStore((s) => s.season)
  const weather = useGameStore((s) => s.weather)
  const stamina = useGameStore((s) => s.stamina)
  const maxStamina = useGameStore((s) => s.maxStamina)
  const budget = useGameStore((s) => s.budget)
  const reputation = useGameStore((s) => s.reputation)

  const seasonColor = SEASON_COLORS[season]
  const weatherInfo = WEATHER_DATA[weather]
  const staminaPct = Math.round((stamina / maxStamina) * 100)
  const staminaColor =
    staminaPct > 60 ? '#4ade80' : staminaPct > 30 ? '#f59e0b' : '#ef4444'

  return (
    <div className="wood-border flex items-center gap-4 px-4 py-2 text-sm flex-wrap">
      <div className="flex items-center gap-1.5">
        <span className="text-gray-400">第</span>
        <span className="font-title text-lg glow-text">{day}</span>
        <span className="text-gray-400">天</span>
      </div>

      <div className="w-px h-5 bg-amber-900/50" />

      <div
        className="flex items-center gap-1 px-2 py-0.5 rounded"
        style={{ background: seasonColor.bg, color: seasonColor.accent }}
      >
        <span className="font-title font-bold">{SEASON_LABELS[season]}</span>
      </div>

      <div className="w-px h-5 bg-amber-900/50" />

      <div className="flex items-center gap-1">
        <span>{weatherInfo?.icon}</span>
        <span className="text-gray-300">{weatherInfo?.name}</span>
      </div>

      <div className="w-px h-5 bg-amber-900/50" />

      <div className="flex items-center gap-2 min-w-[140px]">
        <span className="text-gray-400 text-xs">体力</span>
        <div className="flex-1 h-3 rounded-full bg-black/40 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${staminaPct}%`,
              background: `linear-gradient(90deg, #ef4444 0%, #f59e0b ${Math.min(staminaPct, 40)}%, ${staminaColor} 100%)`,
            }}
          />
        </div>
        <span className="text-xs font-mono" style={{ color: staminaColor }}>
          {stamina}/{maxStamina}
        </span>
      </div>

      <div className="w-px h-5 bg-amber-900/50" />

      <div className="flex items-center gap-1">
        <span>💰</span>
        <span className="font-mono text-yellow-400">{budget}</span>
      </div>

      <div className="w-px h-5 bg-amber-900/50" />

      <div className="flex items-center gap-1">
        <span>⭐</span>
        <span className="font-mono text-amber-300">{reputation}</span>
      </div>
    </div>
  )
}
