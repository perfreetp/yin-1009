import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Star, TrendingUp, ArrowRight } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { ACHIEVEMENTS } from '@/data/gameData'

const RANK_COLORS: Record<string, string> = {
  S: '#f59e0b', A: '#34d399', B: '#60a5fa', C: '#9ca3af', D: '#6b7280',
}

const ENDING_TEXT: Record<string, string> = {
  guardian: '你成为了传说中的森林守护者，人与自然在你手中找到了平衡。',
  mediator: '你是沟通人与自然的桥梁，村民与野生动物因你而和谐共处。',
  detective: '你揭开了盗猎者的阴谋，保护区的安全因你而稳固。',
  naturalist: '你用知识照亮了森林的每一个角落，成为了真正的博物学家。',
  failure: '这一年的努力还不够，但森林仍在等待你的守护。',
}

export default function RatingPage() {
  const [showRank, setShowRank] = useState(false)
  const { stats, year, reputation, achievements, calculateEnding, advanceDay, setScreen } = useGameStore()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => setShowRank(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const patrolScore = Math.min(stats.totalPatrols * 5, 25)
  const rescueScore = Math.min(stats.animalsRescued * 10, 25)
  const trapScore = Math.min(stats.trapsRemoved * 8, 25)
  const speciesScore = Math.min(stats.speciesIdentified * 3, 15)
  const negotiateScore = Math.min(stats.negotiationsCompleted * 5, 10)
  const totalScore = patrolScore + rescueScore + trapScore + speciesScore + negotiateScore

  const rank = totalScore >= 90 ? 'S' : totalScore >= 75 ? 'A' : totalScore >= 60 ? 'B' : totalScore >= 40 ? 'C' : 'D'
  const ending = calculateEnding()

  const yearAchievements = achievements.filter(a => a.unlocked)

  const statItems = [
    { label: '巡护', value: stats.totalPatrols, max: 10, score: patrolScore, color: '#60a5fa' },
    { label: '救助', value: stats.animalsRescued, max: 5, score: rescueScore, color: '#34d399' },
    { label: '拆陷阱', value: stats.trapsRemoved, max: 5, score: trapScore, color: '#f59e0b' },
    { label: '物种', value: stats.speciesIdentified, max: 12, score: speciesScore, color: '#a78bfa' },
    { label: '协商', value: stats.negotiationsCompleted, max: 5, score: negotiateScore, color: '#fb923c' },
  ]

  return (
    <div className="game-bg min-h-screen p-4 animate-fadeIn">
      <h1 className="font-title text-2xl text-amber-200 mb-4 flex items-center gap-2">
        <Award className="w-6 h-6" /> 第{year}年 年度评定
      </h1>

      <div className="flex justify-center mb-6">
        <div className={`text-8xl font-title font-bold transition-all duration-1000 ${showRank ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
          style={{ color: RANK_COLORS[rank], textShadow: `0 0 40px ${RANK_COLORS[rank]}80` }}>
          {showRank && rank}
        </div>
      </div>
      <div className="text-center text-amber-200/60 mb-6">
        总分: {totalScore}/100
        {rank === 'S' && <span className="ml-2 text-amber-400">传奇守护者</span>}
        {rank === 'A' && <span className="ml-2 text-green-400">优秀巡护员</span>}
        {rank === 'B' && <span className="ml-2 text-blue-400">合格巡护员</span>}
        {rank === 'C' && <span className="ml-2 text-gray-400">见习巡护员</span>}
        {rank === 'D' && <span className="ml-2 text-gray-500">实习巡护员</span>}
      </div>

      <div className="wood-card p-4 mb-4">
        <h2 className="font-title text-amber-300 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> 数据看板
        </h2>
        {statItems.map(item => (
          <div key={item.label} className="mb-2">
            <div className="flex justify-between text-sm text-amber-200 mb-1">
              <span>{item.label}</span>
              <span>{item.value} (+{item.score}分)</span>
            </div>
            <div className="w-full bg-amber-900/40 rounded-full h-2">
              <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%`, backgroundColor: item.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="wood-card p-4 mb-4">
        <h2 className="font-title text-amber-300 mb-2">声望变化</h2>
        <div className="text-amber-200">当前声望: <span className="text-amber-400 font-bold">{reputation}</span></div>
        <div className="text-amber-200/60 text-sm">声望奖励: +{rank === 'S' ? 30 : rank === 'A' ? 20 : rank === 'B' ? 10 : 0}</div>
      </div>

      {yearAchievements.length > 0 && (
        <div className="wood-card p-4 mb-4">
          <h2 className="font-title text-amber-300 mb-2 flex items-center gap-2">
            <Star className="w-5 h-5" /> 本年成就
          </h2>
          <div className="flex flex-wrap gap-2">
            {yearAchievements.map(a => (
              <span key={a.id} className="bg-amber-900/50 px-2 py-1 rounded text-sm text-amber-200">
                {a.icon} {a.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="wood-card p-4 mb-4">
        <h2 className="font-title text-amber-300 mb-2">结局叙事</h2>
        <p className="text-amber-200/80 text-sm leading-relaxed">{ENDING_TEXT[ending]}</p>
      </div>

      <button className="btn-wood primary w-full flex items-center justify-center gap-2" onClick={() => {
        useGameStore.setState({ gamePhase: 'playing' })
        setScreen('camp')
        navigate('/camp')
      }}>
        开始新年 <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}
