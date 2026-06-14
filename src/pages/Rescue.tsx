import { useState } from 'react'
import { Heart, Plus, Activity, MapPin, Send } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { ANIMALS } from '@/data/gameData'
import type { InjuryLevel } from '@/types/game'

const INJURY_LABELS: Record<InjuryLevel, string> = {
  minor: '轻伤', moderate: '中伤', severe: '重伤', critical: '危重',
}

const TREATMENTS = [
  { id: 'conservative', name: '保守治疗', budget: 50, success: 50 },
  { id: 'standard', name: '标准治疗', budget: 150, success: 70 },
  { id: 'surgery', name: '紧急手术', budget: 300, success: 90 },
]

export default function RescuePage() {
  const [pendingAnimal, setPendingAnimal] = useState<{ speciesId: string; injuryLevel: InjuryLevel } | null>(null)
  const { rescues, budget, day, startRescue, treatRescue, releaseAnimal, hexGrid } = useGameStore()

  const pending = rescues.filter(r => !r.released && r.healthProgress === 0)
  const inTreatment = rescues.filter(r => !r.released && r.healthProgress > 0)
  const released = rescues.filter(r => r.released)

  const discoverAnimal = () => {
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
    const levels: InjuryLevel[] = ['minor', 'moderate', 'severe', 'critical']
    const level = levels[Math.floor(Math.random() * levels.length)]
    setPendingAnimal({ speciesId: animal.id, injuryLevel: level })
  }

  const handleStartRescue = () => {
    if (!pendingAnimal) return
    startRescue(pendingAnimal.speciesId, pendingAnimal.injuryLevel)
    setPendingAnimal(null)
  }

  const handleTreat = (rescueId: string, treatmentId: string, budgetCost: number) => {
    if (budget < budgetCost) return
    treatRescue(rescueId, treatmentId)
  }

  const handleRelease = (rescueId: string) => {
    const campCell = hexGrid.flat().find(c => c.terrain === 'camp')
    releaseAnimal(rescueId, campCell?.coord ?? { q: 5, r: 5 })
  }

  return (
    <div className="game-bg min-h-screen p-4 animate-fadeIn">
      <h1 className="font-title text-2xl text-amber-200 mb-4 flex items-center gap-2">
        <Heart className="w-6 h-6" /> 动物救助
      </h1>

      <div className="mb-6">
        <h2 className="font-title text-lg text-amber-300 mb-2">待救助</h2>
        <div className="wood-card p-3 mb-2">
          {!pendingAnimal ? (
            <button className="btn-wood primary w-full flex items-center justify-center gap-2" onClick={discoverAnimal}>
              <Plus className="w-4 h-4" /> 发现受伤动物
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-amber-200">{ANIMALS.find(a => a.id === pendingAnimal.speciesId)?.name ?? '未知'}</span>
                <span className="ml-2 text-red-400 text-sm">{INJURY_LABELS[pendingAnimal.injuryLevel]}</span>
              </div>
              <button className="btn-wood primary" onClick={handleStartRescue}>开始救助</button>
            </div>
          )}
        </div>
        {pending.map(r => {
          const animal = ANIMALS.find(a => a.id === r.speciesId)
          return (
            <div key={r.id} className="wood-card p-3 mb-2">
              <div className="text-amber-200">{animal?.name ?? '未知'} <span className="text-red-400 text-sm">{INJURY_LABELS[r.injuryLevel]}</span></div>
              <button className="btn-wood primary mt-2" onClick={() => startRescue(r.speciesId, r.injuryLevel)}>开始救助</button>
            </div>
          )
        })}
      </div>

      <div className="mb-6">
        <h2 className="font-title text-lg text-amber-300 mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5" /> 治疗中
        </h2>
        {inTreatment.length === 0 && (
          <div className="wood-card p-4 text-center text-amber-200/50">暂无治疗中的动物</div>
        )}
        {inTreatment.map(r => {
          const animal = ANIMALS.find(a => a.id === r.speciesId)
          return (
            <div key={r.id} className="wood-card p-3 mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-200">{animal?.name ?? '未知'}</span>
                <span className="text-amber-200/60 text-sm">第{r.startDay}天收治</span>
              </div>
              <div className="w-full bg-amber-900/40 rounded-full h-3 mb-2">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{
                    width: `${r.healthProgress}%`,
                    backgroundColor: r.healthProgress >= 80 ? '#34d399' : r.healthProgress >= 50 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
              <div className="text-amber-200/60 text-sm mb-2">健康值: {r.healthProgress}%</div>
              <div className="flex gap-2 mb-2">
                {TREATMENTS.map(t => (
                  <button
                    key={t.id}
                    className={`btn-wood text-xs ${budget < t.budget ? 'opacity-30' : ''}`}
                    disabled={budget < t.budget}
                    onClick={() => handleTreat(r.id, t.id, t.budget)}
                  >
                    {t.name} ¥{t.budget} ({t.success}%)
                  </button>
                ))}
              </div>
              {r.healthProgress >= 80 && (
                <button className="btn-wood primary" onClick={() => handleRelease(r.id)}>
                  <MapPin className="w-3 h-3 inline mr-1" /> 放归
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div>
        <h2 className="font-title text-lg text-amber-300 mb-2">已放归</h2>
        {released.length === 0 && (
          <div className="wood-card p-4 text-center text-amber-200/50">暂无放归记录</div>
        )}
        {released.map(r => {
          const animal = ANIMALS.find(a => a.id === r.speciesId)
          return (
            <div key={r.id} className="wood-card p-3 mb-2 opacity-70">
              <div className="flex items-center justify-between">
                <span className="text-amber-200">{animal?.name ?? '未知'}</span>
                <span className="text-green-400 text-sm">第{r.releaseDay}天放归</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
