import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, MessageCircle, ThumbsUp, ThumbsDown, BookOpen, ArrowLeft, TrendingUp, TrendingDown, Wallet, Award } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { NEGOTIATION_EVENTS } from '@/data/gameData'
import type { NegotiationEvent } from '@/types/game'

const STANCE_INFO: Record<string, { label: string; repChange: number; budgetCost: number; desc: string; icon: string }> = {
  empathetic: { label: '共情理解', repChange: 5, budgetCost: 100, desc: '以情感打动，耐心倾听村民诉求，给予合理补偿', icon: '🤝' },
  pragmatic: { label: '务实协商', repChange: 3, budgetCost: 50, desc: '寻找双方均可接受的折中方案，成本适中', icon: '⚖️' },
  strict: { label: '严格执法', repChange: -2, budgetCost: 0, desc: '坚持法规底线，不徇私情，可能损害关系', icon: '📜' },
  educational: { label: '教育引导', repChange: 8, budgetCost: 80, desc: '以科普和教育化解矛盾，效果最佳但需投入', icon: '📚' },
}

export default function NegotiatePage() {
  const navigate = useNavigate()
  const [activeEvent, setActiveEvent] = useState<string | null>(null)
  const [resultMsg, setResultMsg] = useState<{ title: string; rep: number; budget: number } | null>(null)
  const {
    negotiations, reputation, budget, pendingEventId, activePatrol,
    resolveNegotiation, markEventResolved, setPendingEvent
  } = useGameStore()

  useEffect(() => {
    if (pendingEventId) {
      setActiveEvent(pendingEventId)
    }
  }, [pendingEventId])

  const recordList: NegotiationEvent[] = negotiations
  const templateEvent = activeEvent ? NEGOTIATION_EVENTS.find(e => e.id === activeEvent) : null
  const fallbackEvent = NEGOTIATION_EVENTS[0]

  const usedTemplateIds = recordList.map(r => r.eventId)
  const availableTemplates = NEGOTIATION_EVENTS.filter(e => !usedTemplateIds.includes(e.id))

  const currentEventData = templateEvent || (activeEvent ? fallbackEvent : null)

  const handleResolve = (eventId: string, stance: string) => {
    const info = STANCE_INFO[stance]
    if (!info) return
    if (budget < info.budgetCost) return

    const result = resolveNegotiation(eventId, stance)

    if (activePatrol && eventId) {
      markEventResolved(eventId)
    }
    setPendingEvent(null)

    if (result) {
      setResultMsg({
        title: info.label + ' · 协商完成',
        rep: result.repChange,
        budget: result.budgetCost,
      })
      setTimeout(() => setResultMsg(null), 3500)
    }
    setActiveEvent(null)
  }

  const backToPatrol = () => {
    if (activePatrol) {
      navigate('/patrol')
    } else {
      navigate('/camp')
    }
  }

  return (
    <div className="game-bg min-h-screen p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-title text-2xl text-amber-200 flex items-center gap-2">
          <Users className="w-6 h-6" /> 村庄协商
        </h1>
        <button className="btn-wood text-sm flex items-center gap-1" onClick={backToPatrol}>
          <ArrowLeft size={14} /> {activePatrol ? '返回巡护' : '返回营地'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="wood-card p-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-xs text-gray-400">当前声望</div>
            <div className="text-xl text-amber-300 font-bold">{reputation}</div>
          </div>
        </div>
        <div className="wood-card p-3 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-yellow-400" />
          <div>
            <div className="text-xs text-gray-400">可用预算</div>
            <div className="text-xl text-yellow-300 font-bold">¥{budget}</div>
          </div>
        </div>
        <div className="wood-card p-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-400" />
          <div>
            <div className="text-xs text-gray-400">历史协商</div>
            <div className="text-xl text-green-300 font-bold">{recordList.length} 次</div>
          </div>
        </div>
      </div>

      {resultMsg && (
        <div className="mb-4 wood-card p-4 border border-green-700/50 bg-green-900/30 animate-fadeIn">
          <h3 className="font-title text-green-300 text-lg mb-2">✅ {resultMsg.title}</h3>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className={`flex items-center gap-1 ${resultMsg.rep >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {resultMsg.rep >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              声望 {resultMsg.rep > 0 ? '+' : ''}{resultMsg.rep}
            </div>
            <div className="flex items-center gap-1 text-yellow-400">
              <Wallet size={14} />
              预算 -¥{resultMsg.budget}
            </div>
          </div>
        </div>
      )}

      {activeEvent && currentEventData ? (
        <div className="animate-fadeIn">
          <div className="wood-card p-5 mb-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="text-4xl">{currentEventData.icon || '🏘️'}</div>
              <div className="flex-1">
                <h2 className="font-title text-xl text-amber-300 mb-1">{currentEventData.title}</h2>
                <div className="text-amber-200/60 text-xs flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  村民代表: {currentEventData.villagerName} · {currentEventData.conflictType}
                </div>
              </div>
            </div>
            <p className="text-amber-200/85 leading-relaxed text-sm mb-3">
              {currentEventData.description}
            </p>
            <div className="bg-black/30 rounded p-3 text-xs text-amber-200/70 italic">
              「{currentEventData.villagerQuote || '这是我们世代赖以生存的山林，凭什么说不让进就不让进？'}」
            </div>
          </div>

          <h3 className="font-title text-amber-300 mb-2 flex items-center gap-2">
            <span>🎯</span> 选择你的立场与应对策略
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {currentEventData.stanceOptions.map(stance => {
              const info = STANCE_INFO[stance]
              if (!info) return null
              const canAfford = budget >= info.budgetCost
              return (
                <button
                  key={stance}
                  className={`wood-card p-4 text-left transition-all ${canAfford ? 'hover:ring-2 hover:ring-amber-400 hover:-translate-y-0.5 cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
                  disabled={!canAfford}
                  onClick={() => handleResolve(activeEvent, stance)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{info.icon}</span>
                    <span className="text-amber-200 font-bold">{info.label}</span>
                  </div>
                  <div className="text-amber-200/65 text-xs mb-3 leading-relaxed">{info.desc}</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${info.repChange >= 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                      {info.repChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      声望{info.repChange > 0 ? '+' : ''}{info.repChange}
                    </span>
                    {info.budgetCost > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-yellow-900/50 text-yellow-400 flex items-center gap-1">
                        <Wallet className="w-3 h-3" /> ¥{info.budgetCost}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-300">零成本</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          <button className="btn-wood w-full" onClick={() => {
            setActiveEvent(null)
            if (pendingEventId) setPendingEvent(null)
          }}>稍后处理</button>
        </div>
      ) : (
        <div className="animate-fadeIn space-y-6">
          <div>
            <h2 className="font-title text-lg text-amber-300 mb-2 flex items-center gap-2">
              <span>📋</span> 当前待协商
            </h2>
            {availableTemplates.length === 0 && !pendingEventId ? (
              <div className="wood-card p-6 text-center text-amber-200/50">
                <div className="text-4xl mb-2">🏡</div>
                <p>暂无需要协商的事件</p>
                <p className="text-xs mt-1 text-gray-500">巡护途中可能会随机遇到村民纠纷</p>
              </div>
            ) : (
              <div className="space-y-2 mb-2">
                {pendingEventId && (
                  <div className="wood-card p-4 ring-2 ring-purple-500/60 border-purple-600/40">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-purple-300 font-bold mb-1 flex items-center gap-1">
                          <span className="animate-pulse">🔔</span> 来自巡护的紧急事件
                        </div>
                        <p className="text-xs text-gray-400 mb-2">请尽快前往处理，以继续巡护进度</p>
                      </div>
                      <button
                        className="btn-wood primary text-sm"
                        onClick={() => setActiveEvent(pendingEventId)}
                      >立即处理</button>
                    </div>
                  </div>
                )}
                {availableTemplates.map(event => (
                  <button
                    key={event.id}
                    className="wood-card p-3 w-full text-left hover:ring-2 hover:ring-amber-400 transition-all"
                    onClick={() => setActiveEvent(event.id)}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">{event.icon || '🏘️'}</span>
                      <div className="flex-1">
                        <div className="text-amber-200 font-bold mb-0.5">{event.title}</div>
                        <div className="text-amber-200/60 text-xs">{event.villagerName} · {event.conflictType}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {recordList.length > 0 && (
            <div>
              <h2 className="font-title text-lg text-amber-300 mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> 协商记录
              </h2>
              <div className="space-y-2">
                {recordList.slice().reverse().map(record => {
                  const stanceInfo = STANCE_INFO[record.stance || '']
                  return (
                    <div key={record.id} className="wood-card p-3 opacity-90">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-amber-200 font-bold flex items-center gap-1.5">
                          {stanceInfo?.icon || '📝'} {record.title}
                        </div>
                        <div className="text-xs text-gray-500">第 {record.day} 天</div>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{record.outcome || '协商顺利完成'}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {typeof record.repChange === 'number' && (
                          <span className={`px-2 py-0.5 rounded-full ${record.repChange >= 0 ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                            声望{record.repChange > 0 ? '+' : ''}{record.repChange}
                          </span>
                        )}
                        {typeof record.budgetCost === 'number' && record.budgetCost > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-yellow-900/40 text-yellow-400">
                            支出 ¥{record.budgetCost}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
