import { useState } from 'react'
import { Shield, Scissors, Puzzle, CheckCircle, XCircle, MapPin } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import type { TrapType } from '@/types/game'

type Tab = 'traps' | 'clues'

const TRAP_LABELS: Record<TrapType, string> = {
  snare: '钢丝套', trap_clamp: '夹子', net: '网套', pitfall: '陷阱坑',
}

export default function PoacherPage() {
  const [tab, setTab] = useState<Tab>('traps')
  const [disarmingId, setDisarmingId] = useState<string | null>(null)
  const [disarmResult, setDisarmResult] = useState<{ id: string; success: boolean } | null>(null)
  const { traps, clueFragments, poacherCases, disarmTrap, assembleClues, hexGrid } = useGameStore()

  const discoveredTraps = traps.filter(t => t.discovered && !t.disarmed)
  const disarmedTraps = traps.filter(t => t.disarmed)
  const unassembledClues = clueFragments.filter(c => !c.assembled)

  const handleDisarm = (trapId: string) => {
    setDisarmingId(trapId)
    setDisarmResult(null)
    setTimeout(() => {
      const success = disarmTrap(trapId)
      setDisarmResult({ id: trapId, success })
      setDisarmingId(null)
    }, 600)
  }

  const handleAssemble = () => {
    const clueIds = unassembledClues.map(c => c.id)
    if (clueIds.length > 0) assembleClues(clueIds)
  }

  const solvedCases = poacherCases.filter(p => p.solved).length
  const totalCases = poacherCases.length

  return (
    <div className="game-bg min-h-screen p-4 animate-fadeIn">
      <h1 className="font-title text-2xl text-amber-200 mb-4 flex items-center gap-2">
        <Shield className="w-6 h-6" /> 反盗猎
      </h1>

      <div className="flex gap-2 mb-4">
        <button className={`btn-wood ${tab === 'traps' ? 'primary' : ''}`} onClick={() => setTab('traps')}>
          <Scissors className="w-4 h-4 inline mr-1" /> 陷阱
        </button>
        <button className={`btn-wood ${tab === 'clues' ? 'primary' : ''}`} onClick={() => setTab('clues')}>
          <Puzzle className="w-4 h-4 inline mr-1" /> 线索
        </button>
      </div>

      {tab === 'traps' && (
        <div className="animate-fadeIn">
          {discoveredTraps.length === 0 && disarmedTraps.length === 0 && (
            <div className="wood-card p-4 text-center text-amber-200/50">暂未发现陷阱</div>
          )}
          {discoveredTraps.map(trap => {
            const cell = hexGrid[trap.hexPos.r]?.[trap.hexPos.q]
            const isDisarming = disarmingId === trap.id
            const result = disarmResult?.id === trap.id ? disarmResult : null
            return (
              <div key={trap.id} className="wood-card p-3 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-red-400 font-bold">{TRAP_LABELS[trap.type]}</span>
                    <span className="text-amber-200/60 ml-2 text-sm">
                      <MapPin className="w-3 h-3 inline" /> ({trap.hexPos.q},{trap.hexPos.r}) {cell?.terrain ?? ''}
                    </span>
                  </div>
                  {!isDisarming && !result && (
                    <button className="btn-wood danger text-sm" onClick={() => handleDisarm(trap.id)}>
                      拆除
                    </button>
                  )}
                </div>
                {isDisarming && (
                  <div className="text-amber-300 text-sm animate-pulse">正在拆除中...</div>
                )}
                {result && result.id === trap.id && (
                  <div className={`text-sm flex items-center gap-1 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                    {result.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {result.success ? '拆除成功！获得线索碎片' : '拆除失败，体力-10'}
                  </div>
                )}
              </div>
            )
          })}
          {disarmedTraps.length > 0 && (
            <div className="mt-4">
              <h3 className="text-amber-200/60 text-sm mb-2">已拆除 ({disarmedTraps.length})</h3>
              {disarmedTraps.map(trap => (
                <div key={trap.id} className="wood-card p-2 mb-1 opacity-50 flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-amber-200/60 text-sm">{TRAP_LABELS[trap.type]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'clues' && (
        <div className="animate-fadeIn">
          <div className="wood-card p-3 mb-3">
            <div className="text-amber-200 mb-2">案件进度: {solvedCases}/{totalCases}</div>
            <div className="w-full bg-amber-900/40 rounded-full h-2 mb-3">
              <div className="h-2 rounded-full bg-green-400 transition-all" style={{ width: `${(solvedCases / totalCases) * 100}%` }} />
            </div>
            {poacherCases.map(pc => (
              <div key={pc.id} className="text-sm mb-1">
                <span className={pc.solved ? 'text-green-400' : 'text-amber-200/70'}>{pc.solved ? '✓' : '○'} {pc.name}</span>
              </div>
            ))}
          </div>

          <h3 className="font-title text-lg text-amber-300 mb-2">线索碎片</h3>
          {unassembledClues.length === 0 ? (
            <div className="wood-card p-4 text-center text-amber-200/50">暂无线索</div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {unassembledClues.map(clue => (
                <div key={clue.id} className="wood-card p-2">
                  <Puzzle className="w-5 h-5 text-amber-400 mb-1" />
                  <div className="text-amber-200 text-sm">{clue.description}</div>
                  <div className="text-amber-200/50 text-xs mt-1">第{clue.foundDay}天发现</div>
                </div>
              ))}
            </div>
          )}
          {unassembledClues.length >= 2 && (
            <button className="btn-wood primary w-full" onClick={handleAssemble}>
              拼合线索 ({unassembledClues.length}片)
            </button>
          )}

          {clueFragments.filter(c => c.assembled).length > 0 && (
            <div className="mt-3">
              <h3 className="text-amber-200/60 text-sm mb-2">已拼合线索</h3>
              {clueFragments.filter(c => c.assembled).map(c => (
                <div key={c.id} className="wood-card p-2 mb-1 opacity-60 text-sm text-amber-200/70">
                  ✓ {c.description}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
