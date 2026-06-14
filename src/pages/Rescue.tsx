import { useState } from 'react'
import { Heart, Plus, Activity, MapPin, Send, AlertTriangle, CheckCircle, TrendingUp, Wallet, Clock } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { ANIMALS } from '@/data/gameData'
import type { InjuryLevel } from '@/types/game'

const INJURY_LABELS: Record<InjuryLevel, string> = {
  minor: '轻伤', moderate: '中伤', severe: '重伤', critical: '危重',
}

const INJURY_COLORS: Record<InjuryLevel, string> = {
  minor: 'text-yellow-400', moderate: 'text-orange-400', severe: 'text-red-400', critical: 'text-red-500',
}

const TREATMENTS = [
  { id: 'conservative', name: '保守治疗', budget: 50, success: 50, desc: '静养+药物，恢复缓慢但风险低', icon: '🌿' },
  { id: 'standard', name: '标准治疗', budget: 150, success: 70, desc: '规范处理，效果稳定性价比高', icon: '💊' },
  { id: 'surgery', name: '紧急手术', budget: 300, success: 90, desc: '专业医疗介入，成功率最高', icon: '🏥' },
]

export default function RescuePage() {
  const [pendingAnimal, setPendingAnimal] = useState<{ speciesId: string; injuryLevel: InjuryLevel } | null>(null)
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)
  const { rescues, budget, day, startRescue, treatRescue, releaseAnimal, hexGrid, reputation } = useGameStore()

  const inTreatment = rescues.filter(r => !r.released)
  const released = rescues.filter(r => r.released)

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 3000)
  }

  const discoverAnimal = () => {
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
    const levels: InjuryLevel[] = ['minor', 'moderate', 'severe', 'critical']
    const level = levels[Math.floor(Math.random() * levels.length)]
    setPendingAnimal({ speciesId: animal.id, injuryLevel: level })
  }

  const handleStartRescue = () => {
    if (!pendingAnimal) return
    const animal = ANIMALS.find(a => a.id === pendingAnimal.speciesId)
    startRescue(pendingAnimal.speciesId, pendingAnimal.injuryLevel)
    showToast(`✅ ${animal?.icon} ${animal?.name} 已收入救助中心，等待治疗`, 'success')
    setPendingAnimal(null)
  }

  const handleTreat = (rescueId: string, treatmentId: string, budgetCost: number) => {
    if (budget < budgetCost) {
      showToast('❌ 预算不足，无法进行此项治疗', 'error')
      return
    }
    const rescue = rescues.find(r => r.id === rescueId)
    const animal = ANIMALS.find(a => a.id === rescue?.speciesId)
    const ok = treatRescue(rescueId, treatmentId)
    const treatment = TREATMENTS.find(t => t.id === treatmentId)
    if (ok) {
      const newProgress = Math.min((rescue?.healthProgress || 0) + 30, 100)
      showToast(`✅ ${treatment?.name}成功！${animal?.name}恢复至 ${newProgress}%`, 'success')
    } else {
      showToast(`⚠ ${treatment?.name}效果不佳，消耗部分预算但恢复有限`, 'error')
    }
  }

  const handleRelease = (rescueId: string) => {
    const rescue = rescues.find(r => r.id === rescueId)
    const animal = ANIMALS.find(a => a.id === rescue?.speciesId)
    const campCell = hexGrid.flat().find(c => c.terrain === 'camp')
    releaseAnimal(rescueId, campCell?.coord ?? { q: 5, r: 5 })
    showToast(`🎉 ${animal?.icon} ${animal?.name} 成功放归大自然！声望+5`, 'success')
  }

  return (
    <div className="game-bg min-h-screen p-4 animate-fadeIn">
      <h1 className="font-title text-2xl text-amber-200 mb-4 flex items-center gap-2">
        <Heart className="w-6 h-6 text-pink-400" /> 动物救助中心
      </h1>

      {toast && (
        <div className={`mb-4 px-4 py-3 rounded flex items-center gap-2 text-sm animate-fadeIn wood-card
          ${toast.type === 'success' ? 'border-green-700/50 text-green-300' : ''}
          ${toast.type === 'error' ? 'border-red-700/50 text-red-300' : ''}
          ${toast.type === 'info' ? 'border-blue-700/50 text-blue-300' : ''}
        `}>
          {toast.type === 'success' && <CheckCircle size={16} />}
          {toast.type === 'error' && <AlertTriangle size={16} />}
          {toast.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
        <div className="wood-card p-3 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-yellow-400" />
          <div>
            <div className="text-xs text-gray-400">可用预算</div>
            <div className="text-xl text-yellow-300 font-bold">¥{budget}</div>
          </div>
        </div>
        <div className="wood-card p-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-pink-400" />
          <div>
            <div className="text-xs text-gray-400">治疗中</div>
            <div className="text-xl text-pink-300 font-bold">{inTreatment.length}</div>
          </div>
        </div>
        <div className="wood-card p-3 flex items-center gap-2">
          <Send className="w-5 h-5 text-green-400" />
          <div>
            <div className="text-xs text-gray-400">已放归</div>
            <div className="text-xl text-green-300 font-bold">{released.length}</div>
          </div>
        </div>
        <div className="wood-card p-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-xs text-gray-400">当前声望</div>
            <div className="text-xl text-amber-300 font-bold">{reputation}</div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-title text-lg text-amber-300 mb-2 flex items-center gap-2">
          <span>🆘</span> 紧急接诊
        </h2>
        <div className="wood-card p-3 mb-2">
          {!pendingAnimal ? (
            <div className="space-y-2">
              <button className="btn-wood primary w-full flex items-center justify-center gap-2" onClick={discoverAnimal}>
                <Plus className="w-4 h-4" /> 模拟发现受伤动物（测试用）
              </button>
              <p className="text-xs text-gray-500 text-center">
                💡 提示：巡护途中会随机发现受伤动物，点击「开始救助」后会出现在下方治疗列表
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3 p-2 bg-black/30 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{ANIMALS.find(a => a.id === pendingAnimal.speciesId)?.icon || '🐾'}</span>
                  <div>
                    <div className="text-amber-200 font-bold">
                      {ANIMALS.find(a => a.id === pendingAnimal.speciesId)?.name ?? '未知物种'}
                    </div>
                    <div className={`text-sm ${INJURY_COLORS[pendingAnimal.injuryLevel]}`}>
                      ⚠ {INJURY_LABELS[pendingAnimal.injuryLevel]}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-wood" onClick={() => setPendingAnimal(null)}>取消</button>
                  <button className="btn-wood primary" onClick={handleStartRescue}>🚑 收入救助中心</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-title text-lg text-amber-300 mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5" /> 治疗中 · {inTreatment.length} 只
        </h2>
        {inTreatment.length === 0 && (
          <div className="wood-card p-6 text-center text-amber-200/50">
            <div className="text-4xl mb-2">🏥</div>
            <p>暂无需要治疗的动物</p>
            <p className="text-xs mt-1 text-gray-500">
              巡护时遇到受伤动物点击「开始救助」，或点击上方「模拟发现」进行测试
            </p>
          </div>
        )}
        {inTreatment.map(r => {
          const animal = ANIMALS.find(a => a.id === r.speciesId)
          const daysSince = day - r.startDay
          const progressColor = r.healthProgress >= 80 ? '#34d399' : r.healthProgress >= 50 ? '#f59e0b' : '#ef4444'
          return (
            <div key={r.id} className="wood-card p-4 mb-3 animate-fadeIn">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-5xl">{animal?.icon || '🐾'}</div>
                  <div>
                    <div className="text-amber-200 font-bold text-lg">
                      {animal?.name ?? '未知物种'}
                      <span className={`ml-2 text-sm ${INJURY_COLORS[r.injuryLevel]}`}>
                        · {INJURY_LABELS[r.injuryLevel]}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1"><Clock size={12} /> 第{r.startDay}天收治（已{daysSince}天）</span>
                      {r.treatment && <span>最近: {TREATMENTS.find(t=>t.id===r.treatment)?.name || r.treatment}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">健康值</div>
                  <div className="text-3xl font-bold" style={{ color: progressColor }}>{r.healthProgress}%</div>
                </div>
              </div>

              <div className="w-full bg-black/40 rounded-full h-3 mb-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${r.healthProgress}%`,
                    backgroundColor: progressColor,
                    boxShadow: `0 0 8px ${progressColor}66`,
                  }}
                />
              </div>

              <div className="text-xs text-gray-400 mb-3 flex items-center gap-2">
                {r.healthProgress < 80 ? (
                  <>
                    <AlertTriangle size={12} className="text-yellow-500" />
                    距离可放归标准还需提升 {80 - r.healthProgress}%，每次治疗恢复约30%
                  </>
                ) : (
                  <>
                    <CheckCircle size={12} className="text-green-500" />
                    ✨ 健康状况已达标，可选择安全地点进行放归
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                {TREATMENTS.map(t => {
                  const affordable = budget >= t.budget
                  return (
                    <button
                      key={t.id}
                      className={`wood-card p-2 text-left transition-all
                        ${affordable ? 'hover:ring-2 hover:ring-amber-400/60 hover:-translate-y-0.5' : 'opacity-40 cursor-not-allowed'}
                      `}
                      disabled={!affordable}
                      onClick={() => handleTreat(r.id, t.id, t.budget)}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span>{t.icon}</span>
                        <span className="text-amber-200 font-bold text-sm">{t.name}</span>
                        <span className="ml-auto text-xs text-yellow-400">¥{t.budget}</span>
                      </div>
                      <div className="text-xs text-gray-400 mb-1">{t.desc}</div>
                      <div className="text-xs text-green-400">成功率约 {t.success}%</div>
                    </button>
                  )
                })}
              </div>

              {r.healthProgress >= 80 && (
                <button className="btn-wood primary w-full flex items-center justify-center gap-2 py-2.5" onClick={() => handleRelease(r.id)}>
                  <Send className="w-4 h-4" />
                  🎉 放归自然（声望+5）
                </button>
              )}
            </div>
          )
        })}
      </div>

      {released.length > 0 && (
        <div>
          <h2 className="font-title text-lg text-amber-300 mb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5" /> 放归记录 · {released.length} 只成功回归
          </h2>
          <div className="space-y-2">
            {released.slice().reverse().map(r => {
              const animal = ANIMALS.find(a => a.id === r.speciesId)
              const days = (r.releaseDay || day) - r.startDay
              return (
                <div key={r.id} className="wood-card p-3 opacity-90 flex items-center gap-3 animate-fadeIn">
                  <div className="text-4xl">{animal?.icon || '🐾'}</div>
                  <div className="flex-1">
                    <div className="text-amber-200 font-bold flex items-center gap-2">
                      {animal?.name ?? '未知物种'}
                      <span className="px-2 py-0.5 text-xs bg-green-900/40 text-green-400 rounded-full">已放归</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      治疗{days}天后，于第 {r.releaseDay} 天在 {r.releaseLocation ? `(${r.releaseLocation.q}, ${r.releaseLocation.r})` : '廊道腹地'} 成功放归
                    </div>
                  </div>
                  <CheckCircle className="text-green-400" size={20} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
