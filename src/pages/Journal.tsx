import { useState } from 'react'
import { Map, ChevronDown, ChevronUp, Footprints, Zap, Star } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { SEASON_LABELS } from '@/data/gameData'

export default function JournalPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { patrolRecords, stats, day } = useGameStore()

  const sortedRecords = [...patrolRecords].reverse()

  return (
    <div className="game-bg min-h-screen p-4 animate-fadeIn">
      <h1 className="font-title text-2xl text-amber-200 mb-4 flex items-center gap-2">
        <Map className="w-6 h-6" /> 巡护日志
      </h1>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="wood-card p-3 text-center">
          <div className="text-amber-400 text-xl font-bold">{stats.totalPatrols}</div>
          <div className="text-amber-200/60 text-xs">总巡护</div>
        </div>
        <div className="wood-card p-3 text-center">
          <div className="text-amber-400 text-xl font-bold">{stats.totalDistanceTraveled}</div>
          <div className="text-amber-200/60 text-xs">总距离</div>
        </div>
        <div className="wood-card p-3 text-center">
          <div className="text-amber-400 text-xl font-bold">{day}</div>
          <div className="text-amber-200/60 text-xs">当前天数</div>
        </div>
      </div>

      {sortedRecords.length === 0 ? (
        <div className="wood-card p-8 text-center text-amber-200/50">
          <Footprints className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <div>尚未有巡护记录</div>
          <div className="text-sm mt-1">出发巡护以记录日志</div>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedRecords.map(record => {
            const isExpanded = expandedId === record.id
            return (
              <div key={record.id} className="wood-card overflow-hidden">
                <button
                  className="w-full p-3 flex items-center justify-between text-left"
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-amber-400 font-bold text-sm">第{record.day}天</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-300">
                        {SEASON_LABELS[record.season]}
                      </span>
                    </div>
                    <div className="text-amber-200/60 text-xs">
                      路线 {record.route.length}格 · {record.events.length}事件 · 体力-{record.staminaUsed}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-sm flex items-center gap-1">
                      <Star className="w-3 h-3" /> {record.score}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-amber-200/40" /> : <ChevronDown className="w-4 h-4 text-amber-200/40" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-amber-800/30 animate-fadeIn">
                    <div className="mt-2 text-sm">
                      <div className="text-amber-200/60 mb-2">路线概要: {record.route.slice(0, 5).map(c => `(${c.q},${c.r})`).join(' → ')}{record.route.length > 5 ? ' ...' : ''}</div>

                      {record.events.length > 0 ? (
                        <div className="space-y-1">
                          <div className="text-amber-300 text-xs mb-1">事件记录:</div>
                          {record.events.map(event => (
                            <div key={event.id} className="flex items-center gap-2 text-amber-200/70 text-xs">
                              <Zap className="w-3 h-3 text-amber-400 flex-shrink-0" />
                              <span>{event.description}</span>
                              <span className={`ml-auto ${event.resolved ? 'text-green-400' : 'text-amber-400'}`}>
                                {event.resolved ? '已处理' : '待处理'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-amber-200/40 text-xs">无特殊事件</div>
                      )}

                      <div className="mt-2 flex gap-3 text-xs text-amber-200/50">
                        <span>体力消耗: {record.staminaUsed}</span>
                        <span>得分: {record.score}</span>
                        <span>样本: {record.samples.length}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
