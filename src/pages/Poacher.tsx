import { useState } from 'react'
import { Shield, Scissors, Puzzle, CheckCircle, XCircle, MapPin, AlertTriangle, Lock, Unlock, Award, TrendingUp } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import type { TrapType } from '@/types/game'

type Tab = 'traps' | 'clues'

const TRAP_LABELS: Record<TrapType, string> = {
  snare: '钢丝套', trap_clamp: '铁夹子', net: '捕网', pitfall: '陷阱坑',
}

const TRAP_ICONS: Record<TrapType, string> = {
  snare: '🪤', trap_clamp: '🔩', net: '🕸️', pitfall: '🕳️',
}

export default function PoacherPage() {
  const [tab, setTab] = useState<Tab>('traps')
  const [disarmingId, setDisarmingId] = useState<string | null>(null)
  const [disarmResult, setDisarmResult] = useState<{ id: string; success: boolean } | null>(null)
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

  const {
    traps, clueFragments, poacherCases, disarmTrap, assembleClues,
    hexGrid, reputation, stats
  } = useGameStore()

  const discoveredTraps = traps.filter(t => t.discovered && !t.disarmed)
  const disarmedTraps = traps.filter(t => t.disarmed)
  const unassembledClues = clueFragments.filter(c => !c.assembled)
  const assembledClues = clueFragments.filter(c => c.assembled)

  const solvedCases = poacherCases.filter(p => p.solved).length
  const totalCases = poacherCases.length

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleDisarm = (trapId: string) => {
    setDisarmingId(trapId)
    setDisarmResult(null)
    setTimeout(() => {
      const success = disarmTrap(trapId)
      setDisarmResult({ id: trapId, success })
      setDisarmingId(null)
      if (success) {
        showToast('✅ 陷阱成功拆除！获得盗猎线索碎片 +1', 'success')
      } else {
        showToast('❌ 拆除失败！手部受伤，体力下降', 'error')
      }
    }, 700)
  }

  const handleAssemble = () => {
    const clueIds = unassembledClues.map(c => c.id)
    if (clueIds.length === 0) return

    const beforeSolved = poacherCases.filter(p => p.solved).length
    assembleClues(clueIds)

    setTimeout(() => {
      const state = useGameStore.getState()
      const afterSolved = state.poacherCases.filter(p => p.solved).length
      const newSolved = afterSolved - beforeSolved
      if (newSolved > 0) {
        showToast(`🎉 侦破 ${newSolved} 起盗猎案件！声望+${20 * newSolved}`, 'success')
      } else {
        const stillNeed = poacherCases
          .filter(p => !p.solved)
          .map(p => `${p.name}还需${Math.max(0, p.clueIds.length - state.clueFragments.length)}线索`)
        showToast(`🧩 线索已整理归档。${stillNeed.join('；') || '所有案件已侦破！'}`, 'info')
      }
    }, 100)
  }

  return (
    <div className="game-bg min-h-screen p-4 animate-fadeIn">
      <h1 className="font-title text-2xl text-amber-200 mb-4 flex items-center gap-2">
        <Shield className="w-6 h-6 text-red-400" /> 反盗猎行动
      </h1>

      {toast && (
        <div className={`mb-4 px-4 py-3 rounded wood-card flex items-center gap-2 animate-fadeIn
          ${toast.type === 'success' ? 'border-green-700/60 text-green-300' : ''}
          ${toast.type === 'error' ? 'border-red-700/60 text-red-300' : ''}
          ${toast.type === 'info' ? 'border-blue-700/60 text-blue-300' : ''}
        `}>
          {toast.type === 'success' && <CheckCircle size={16} />}
          {toast.type === 'error' && <XCircle size={16} />}
          {toast.type === 'info' && <Puzzle size={16} />}
          {toast.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="wood-card p-3 flex items-center gap-2">
          <Scissors className="w-5 h-5 text-yellow-400" />
          <div>
            <div className="text-xs text-gray-400">已拆除陷阱</div>
            <div className="text-xl text-yellow-300 font-bold">{stats.trapsRemoved}</div>
          </div>
        </div>
        <div className="wood-card p-3 flex items-center gap-2">
          <Puzzle className="w-5 h-5 text-purple-400" />
          <div>
            <div className="text-xs text-gray-400">收集线索</div>
            <div className="text-xl text-purple-300 font-bold">{clueFragments.length}</div>
          </div>
        </div>
        <div className="wood-card p-3 flex items-center gap-2">
          <Lock className={`w-5 h-5 ${solvedCases === totalCases ? 'text-green-400' : 'text-orange-400'}`} />
          <div>
            <div className="text-xs text-gray-400">案件侦破</div>
            <div className={`text-xl font-bold ${solvedCases === totalCases ? 'text-green-400' : 'text-orange-300'}`}>
              {solvedCases}/{totalCases}
            </div>
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

      <div className="flex gap-2 mb-4">
        <button className={`btn-wood ${tab === 'traps' ? 'primary' : ''} flex items-center gap-1`} onClick={() => setTab('traps')}>
          <Scissors className="w-4 h-4" /> 陷阱排查 ({discoveredTraps.length})
        </button>
        <button className={`btn-wood ${tab === 'clues' ? 'primary' : ''} flex items-center gap-1`} onClick={() => setTab('clues')}>
          <Puzzle className="w-4 h-4" /> 线索拼合 ({clueFragments.length})
        </button>
      </div>

      {tab === 'traps' && (
        <div className="animate-fadeIn">
          <h2 className="font-title text-lg text-red-300 mb-2 flex items-center gap-2">
            <AlertTriangle size={18} /> 待拆除陷阱
          </h2>

          {discoveredTraps.length === 0 && disarmedTraps.length === 0 && (
            <div className="wood-card p-6 text-center text-amber-200/50">
              <div className="text-4xl mb-2">🪤</div>
              <p>暂未发现盗猎陷阱</p>
              <p className="text-xs mt-1 text-gray-500">巡护途中会随机发现盗猎陷阱</p>
            </div>
          )}

          {discoveredTraps.length > 0 && (
            <div className="space-y-2 mb-4">
              {discoveredTraps.map(trap => {
                const cell = hexGrid[trap.hexPos.r]?.[trap.hexPos.q]
                const isDisarming = disarmingId === trap.id
                const result = disarmResult?.id === trap.id ? disarmResult : null
                return (
                  <div key={trap.id} className="wood-card p-4 border-red-900/40">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{TRAP_ICONS[trap.type]}</div>
                        <div>
                          <div className="text-red-400 font-bold text-lg">
                            {TRAP_LABELS[trap.type] || '未知陷阱'}
                          </div>
                          <div className="text-amber-200/60 text-xs flex items-center gap-1.5">
                            <MapPin size={12} />
                            位置: ({trap.hexPos.q},{trap.hexPos.r})
                            {cell?.terrain && ` · ${cell.terrain}`}
                          </div>
                        </div>
                      </div>
                      {!isDisarming && !result && (
                        <button className="btn-wood danger flex items-center gap-1" onClick={() => handleDisarm(trap.id)}>
                          <Scissors size={14} /> 立即拆除
                        </button>
                      )}
                    </div>

                    {isDisarming && (
                      <div className="text-amber-300 text-sm animate-pulse flex items-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        正在拆除陷阱，请小心操作...
                      </div>
                    )}

                    {result && result.id === trap.id && (
                      <div className={`text-sm flex items-center gap-1.5
                        ${result.success ? 'text-green-400' : 'text-red-400'}
                      `}>
                        {result.success ? <CheckCircle size={15} /> : <XCircle size={15} />}
                        {result.success
                          ? '拆除成功！已获得 1 个盗猎线索碎片（前往「线索」页面查看）'
                          : '拆除失败！手部受伤，体力 -10。建议配备钢丝剪后重试'
                        }
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {disarmedTraps.length > 0 && (
            <div>
              <h3 className="font-title text-amber-300 mb-2 flex items-center gap-1">
                <CheckCircle size={16} className="text-green-400" /> 已拆除 ({disarmedTraps.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {disarmedTraps.map(trap => (
                  <div key={trap.id} className="wood-card p-2 opacity-70 flex items-center gap-2">
                    <span className="text-2xl">{TRAP_ICONS[trap.type]}</span>
                    <div>
                      <div className="text-sm text-gray-300">{TRAP_LABELS[trap.type]}</div>
                      <div className="text-xs text-gray-500">
                        ({trap.hexPos.q},{trap.hexPos.r})
                      </div>
                    </div>
                    <CheckCircle className="ml-auto text-green-400" size={14} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'clues' && (
        <div className="animate-fadeIn space-y-4">
          <div>
            <h2 className="font-title text-lg text-amber-300 mb-2 flex items-center gap-2">
              <Award size={18} /> 案件调查进度
            </h2>
            <div className="wood-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-200">总侦破进度</span>
                <span className={`font-bold ${solvedCases === totalCases ? 'text-green-400' : 'text-amber-300'}`}>
                  {solvedCases}/{totalCases} 案件已侦破
                </span>
              </div>
              <div className="w-full bg-amber-900/40 rounded-full h-3 mb-4 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-green-400 transition-all duration-500"
                  style={{ width: `${totalCases > 0 ? (solvedCases / totalCases) * 100 : 0}%` }}
                />
              </div>

              <div className="space-y-3">
                {poacherCases.map(pc => {
                  const required = pc.clueIds.length
                  const have = clueFragments.length
                  const progress = Math.min(100, Math.floor((have / required) * 100))
                  return (
                    <div key={pc.id} className={`p-3 rounded wood-card border ${pc.solved ? 'border-green-700/40' : 'border-amber-900/30'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className={`font-bold flex items-center gap-1.5 ${pc.solved ? 'text-green-400' : 'text-amber-200'}`}>
                            {pc.solved
                              ? <><Unlock size={14} /> {pc.name} · 已侦破</>
                              : <><Lock size={14} /> {pc.name}</>
                            }
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{pc.description}</div>
                        </div>
                        <div className="text-right ml-3 shrink-0">
                          <div className="text-xs text-gray-400">线索进度</div>
                          <div className="text-lg font-bold" style={{ color: pc.solved ? '#34d399' : have >= required ? '#f59e0b' : '#9ca3af' }}>
                            {Math.min(have, required)}/{required}
                          </div>
                        </div>
                      </div>

                      {!pc.solved && (
                        <div className="w-full bg-black/30 rounded-full h-2">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: progress >= 100 ? '#f59e0b' : '#6b7280',
                            }}
                          />
                        </div>
                      )}

                      {!pc.solved && have < required && (
                        <div className="text-xs text-gray-500 mt-2">
                          还需收集 <span className="text-yellow-500 font-bold">{required - have}</span> 个线索碎片即可尝试拼合
                        </div>
                      )}
                      {!pc.solved && have >= required && (
                        <div className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                          <Puzzle size={12} /> 线索已充足，点击下方「拼合线索」按钮尝试破案
                        </div>
                      )}
                      {pc.solved && (
                        <div className="text-xs text-green-400 mt-2 flex items-center gap-1">
                          <CheckCircle size={12} /> 案件已侦破，声望 +20 已发放
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-title text-lg text-amber-300 mb-2 flex items-center gap-2">
              <Puzzle size={18} /> 待拼合线索碎片 ({unassembledClues.length})
            </h3>

            {unassembledClues.length === 0 ? (
              <div className="wood-card p-6 text-center text-amber-200/50">
                <div className="text-4xl mb-2">🧩</div>
                <p>暂未收集到线索碎片</p>
                <p className="text-xs mt-1 text-gray-500">成功拆除盗猎陷阱可获得线索碎片</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {unassembledClues.map((clue, idx) => (
                    <div key={clue.id} className="wood-card p-3 flex items-start gap-2">
                      <div className="w-10 h-10 rounded bg-purple-900/40 flex items-center justify-center shrink-0 text-xl">
                        {['🔩', '🧵', '👣', '📝', '🪜', '💰'][idx % 6]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-amber-200 text-sm font-bold">线索 #{String(idx + 1).padStart(2, '0')}</div>
                        <div className="text-amber-200/70 text-xs mt-0.5">{clue.description}</div>
                        <div className="text-gray-500 text-xs mt-1">第 {clue.foundDay} 天发现</div>
                      </div>
                    </div>
                  ))}
                </div>

                {unassembledClues.length >= 1 && (
                  <button
                    className={`btn-wood primary w-full py-3 flex items-center justify-center gap-2 text-base
                      ${poacherCases.every(p => p.solved) ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={handleAssemble}
                    disabled={poacherCases.every(p => p.solved)}
                  >
                    <Puzzle className="w-5 h-5" />
                    🔍 拼合分析所有线索 ({unassembledClues.length} 片)
                  </button>
                )}

                {poacherCases.every(p => p.solved) && poacherCases.length > 0 && (
                  <div className="mt-2 wood-card p-3 border-green-700/50 bg-green-900/20 text-center text-green-300 text-sm">
                    🎊 恭喜！所有案件均已侦破
                  </div>
                )}
              </>
            )}
          </div>

          {assembledClues.length > 0 && (
            <div>
              <h3 className="font-title text-amber-300 mb-2 flex items-center gap-1">
                <CheckCircle size={16} className="text-green-400" /> 已归档线索 ({assembledClues.length})
              </h3>
              <div className="wood-card p-3 opacity-75">
                {assembledClues.map((c, i) => (
                  <div key={c.id} className="py-1 flex items-center gap-2 text-xs text-gray-400 border-b border-black/30 last:border-0">
                    <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                    <span>#{String(i + 1).padStart(2, '0')}</span>
                    <span className="flex-1 truncate">{c.description}</span>
                    <span className="text-gray-600 shrink-0">第{c.foundDay}天</span>
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
