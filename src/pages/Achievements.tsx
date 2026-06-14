import { useState } from 'react'
import { Trophy, Lock, Filter } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { ACHIEVEMENTS } from '@/data/gameData'
import type { Achievement } from '@/types/game'

const CATEGORY_LABELS: Record<Achievement['category'], string> = {
  patrol: '巡护', animal: '动物', rescue: '救助',
  anti_poaching: '反盗猎', diplomacy: '外交', collection: '收藏',
}

const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS) as Achievement['category'][]

export default function AchievementsPage() {
  const [filter, setFilter] = useState<Achievement['category'] | 'all'>('all')
  const { achievements } = useGameStore()

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = ACHIEVEMENTS.length

  const filtered = filter === 'all' ? achievements : achievements.filter(a => a.category === filter)

  return (
    <div className="game-bg min-h-screen p-4 animate-fadeIn">
      <h1 className="font-title text-2xl text-amber-200 mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6" /> 成就收集
      </h1>

      <div className="wood-card p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-amber-200 text-sm">解锁进度</span>
          <span className="text-amber-400 font-bold">{unlockedCount}/{totalCount}</span>
        </div>
        <div className="w-full bg-amber-900/40 rounded-full h-3">
          <div className="h-3 rounded-full bg-amber-400 transition-all" style={{ width: `${(unlockedCount / totalCount) * 100}%` }} />
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-thin pb-1">
        <button className={`btn-wood text-xs ${filter === 'all' ? 'primary' : ''}`} onClick={() => setFilter('all')}>全部</button>
        {CATEGORY_KEYS.map(key => (
          <button key={key} className={`btn-wood text-xs ${filter === key ? 'primary' : ''}`} onClick={() => setFilter(key)}>
            {CATEGORY_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map(achievement => {
          const isUnlocked = achievement.unlocked
          const progress = Math.min(achievement.progress / achievement.target, 1)

          return (
            <div
              key={achievement.id}
              className={`wood-card p-3 transition-all ${isUnlocked ? 'glow-text' : 'opacity-50'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>{achievement.icon}</span>
                {isUnlocked ? (
                  <Trophy className="w-4 h-4 text-amber-400" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-200/30" />
                )}
              </div>
              <div className={`text-sm font-bold mb-1 ${isUnlocked ? 'text-amber-200' : 'text-amber-200/40'}`}>
                {achievement.name}
              </div>
              <div className="text-amber-200/50 text-xs mb-2">{achievement.description}</div>
              <div className="w-full bg-amber-900/40 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${progress * 100}%`,
                    backgroundColor: isUnlocked ? '#f59e0b' : '#9ca3af',
                  }}
                />
              </div>
              <div className="text-xs mt-1 text-amber-200/40">
                {achievement.progress}/{achievement.target}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
