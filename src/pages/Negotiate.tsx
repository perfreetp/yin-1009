import { useState } from 'react'
import { Users, MessageCircle, ThumbsUp, ThumbsDown, BookOpen } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { NEGOTIATION_EVENTS } from '@/data/gameData'

const STANCE_INFO: Record<string, { label: string; repChange: number; budgetCost: number; desc: string }> = {
  empathetic: { label: '共情理解', repChange: 5, budgetCost: 100, desc: '以情感打动，但需要投入补偿资金' },
  pragmatic: { label: '务实协商', repChange: 3, budgetCost: 50, desc: '寻找折中方案，成本适中' },
  strict: { label: '严格执行', repChange: -2, budgetCost: 0, desc: '坚持法规，可能损害关系' },
  educational: { label: '教育引导', repChange: 8, budgetCost: 80, desc: '以科普和教育化解，效果最佳但需投入' },
}

export default function NegotiatePage() {
  const [activeEvent, setActiveEvent] = useState<string | null>(null)
  const { negotiations, reputation, budget, resolveNegotiation } = useGameStore()

  const resolvedIds = negotiations.filter(n => n.resolved).map(n => n.id)
  const availableEvents = NEGOTIATION_EVENTS.filter(e => !resolvedIds.includes(e.id))
  const resolvedEvents = NEGOTIATION_EVENTS.filter(e => resolvedIds.includes(e.id))

  const activeEventData = NEGOTIATION_EVENTS.find(e => e.id === activeEvent)

  const handleResolve = (eventId: string, stance: string) => {
    resolveNegotiation(eventId, stance)
    setActiveEvent(null)
  }

  return (
    <div className="game-bg min-h-screen p-4 animate-fadeIn">
      <h1 className="font-title text-2xl text-amber-200 mb-4 flex items-center gap-2">
        <Users className="w-6 h-6" /> 村庄协商
      </h1>

      <div className="wood-card p-3 mb-4 flex gap-4">
        <div className="text-amber-200">声望: <span className="text-amber-400 font-bold">{reputation}</span></div>
        <div className="text-amber-200">预算: <span className="text-amber-400 font-bold">¥{budget}</span></div>
      </div>

      {activeEvent && activeEventData ? (
        <div className="animate-fadeIn">
          <div className="wood-card p-4 mb-4">
            <h2 className="font-title text-lg text-amber-300 mb-2">{activeEventData.title}</h2>
            <p className="text-amber-200/80 text-sm mb-3">{activeEventData.description}</p>
            <div className="text-amber-200/60 text-sm">
              <MessageCircle className="w-4 h-4 inline mr-1" /> 村民: {activeEventData.villagerName}
            </div>
          </div>

          <h3 className="font-title text-amber-300 mb-2">选择立场</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {activeEventData.stanceOptions.map(stance => {
              const info = STANCE_INFO[stance]
              if (!info) return null
              const canAfford = budget >= info.budgetCost
              return (
                <button
                  key={stance}
                  className={`wood-card p-3 text-left transition-all ${canAfford ? 'hover:ring-2 hover:ring-amber-400 cursor-pointer' : 'opacity-40'}`}
                  disabled={!canAfford}
                  onClick={() => handleResolve(activeEvent, stance)}
                >
                  <div className="text-amber-200 font-bold mb-1">{info.label}</div>
                  <div className="text-amber-200/60 text-xs mb-2">{info.desc}</div>
                  <div className="flex gap-2 text-xs">
                    <span className={info.repChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {info.repChange >= 0 ? <ThumbsUp className="w-3 h-3 inline" /> : <ThumbsDown className="w-3 h-3 inline" />}
                      {' '}声望{info.repChange > 0 ? '+' : ''}{info.repChange}
                    </span>
                    {info.budgetCost > 0 && (
                      <span className="text-amber-400">¥{info.budgetCost}</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          <button className="btn-wood w-full" onClick={() => setActiveEvent(null)}>取消</button>
        </div>
      ) : (
        <div className="animate-fadeIn">
          <h2 className="font-title text-lg text-amber-300 mb-2">可协商事件</h2>
          {availableEvents.length === 0 ? (
            <div className="wood-card p-4 text-center text-amber-200/50">暂无可协商事件</div>
          ) : (
            <div className="space-y-2 mb-6">
              {availableEvents.map(event => (
                <button
                  key={event.id}
                  className="wood-card p-3 w-full text-left hover:ring-2 hover:ring-amber-400 transition-all"
                  onClick={() => setActiveEvent(event.id)}
                >
                  <div className="text-amber-200 font-bold mb-1">{event.title}</div>
                  <div className="text-amber-200/60 text-sm">{event.description.slice(0, 40)}...</div>
                  <div className="text-amber-200/40 text-xs mt-1">{event.villagerName} · {event.conflictType}</div>
                </button>
              ))}
            </div>
          )}

          {resolvedEvents.length > 0 && (
            <div>
              <h2 className="font-title text-lg text-amber-300 mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> 协商记录
              </h2>
              <div className="space-y-2">
                {resolvedEvents.map(event => (
                  <div key={event.id} className="wood-card p-3 opacity-60">
                    <div className="text-amber-200 text-sm">{event.title} - 已解决</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
