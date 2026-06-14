import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/stores/gameStore'
import { TERRAIN_DATA, WEATHER_DATA } from '@/data/gameData'
import type { HexCoord } from '@/types/game'
import { hexDistance, hexToPixel } from '@/utils/hexUtils'
import { Map, CloudSun, ArrowLeft, Play, Trash2, Zap, Tent } from 'lucide-react'

const HEX_SIZE = 28

function hexPoints(cx: number, cy: number, size: number): string {
  const pts: string[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2
    pts.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`)
  }
  return pts.join(' ')
}

export default function RouteSelect() {
  const { hexGrid, mapWidth, mapHeight, stamina, maxStamina, weather, season, startPatrol, setScreen } = useGameStore()
  const navigate = useNavigate()
  const [route, setRoute] = useState<HexCoord[]>([])
  const campQ = Math.floor(mapWidth / 2)
  const campR = Math.floor(mapHeight / 2)

  const toggleHex = (q: number, r: number) => {
    const exists = route.some(h => h.q === q && h.r === r)
    if (exists) {
      setRoute(route.filter(h => !(h.q === q && h.r === r)))
      return
    }
    if (route.length === 0) {
      if (hexDistance({ q, r }, { q: campQ, r: campR }) <= 1) {
        setRoute([{ q, r }])
      }
    } else {
      const last = route[route.length - 1]
      if (hexDistance({ q, r }, last) <= 1) {
        setRoute([...route, { q, r }])
      }
    }
  }

  const totalCost = route.reduce((sum, c) => {
    if (c.r >= 0 && c.r < mapHeight && c.q >= 0 && c.q < mapWidth) {
      return sum + TERRAIN_DATA[hexGrid[c.r][c.q].terrain].staminaCost
    }
    return sum
  }, 0)

  const weatherMod = WEATHER_DATA[weather]?.staminaMod || 1
  const adjustedCost = Math.ceil(totalCost * weatherMod)
  const canStart = route.length >= 2 && adjustedCost <= stamina

  const handleStart = () => {
    if (canStart) {
      startPatrol(route)
      navigate('/patrol')
    }
  }

  const viewBox = useMemo(() => {
    const pad = HEX_SIZE * 2
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (let r = 0; r < mapHeight; r++) {
      for (let q = 0; q < mapWidth; q++) {
        const { x, y } = hexToPixel({ q, r }, HEX_SIZE)
        minX = Math.min(minX, x); minY = Math.min(minY, y)
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y)
      }
    }
    return `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`
  }, [mapWidth, mapHeight])

  return (
    <div className="game-bg w-full h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 wood-border">
        <h1 className="font-title text-xl text-amber-400">路线规划</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-yellow-300">
            <Zap size={14} /> {stamina}/{maxStamina}
          </span>
          <span className="flex items-center gap-1 text-blue-300">
            <CloudSun size={14} /> {WEATHER_DATA[weather]?.icon} {WEATHER_DATA[weather]?.name}
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4 overflow-auto scrollbar-thin">
          <svg viewBox={viewBox} className="w-full h-full">
            {hexGrid.flat().map(cell => {
              const { q, r } = cell.coord
              const { x, y } = hexToPixel({ q, r }, HEX_SIZE)
              const isSelected = route.some(h => h.q === q && h.r === r)
              const isCamp = q === campQ && r === campR
              const terrainInfo = TERRAIN_DATA[cell.terrain]

              return (
                <g
                  key={`${q},${r}`}
                  onClick={() => cell.revealed && toggleHex(q, r)}
                  className={cell.revealed ? 'cursor-pointer' : ''}
                >
                  <polygon
                    points={hexPoints(x, y, HEX_SIZE - 1)}
                    fill={cell.revealed ? terrainInfo.color : '#0a0a0a'}
                    stroke={isSelected ? '#fbbf24' : isCamp ? '#f59e0b' : cell.revealed ? 'rgba(139,105,20,0.3)' : 'rgba(30,30,30,0.5)'}
                    strokeWidth={isSelected ? 3 : isCamp ? 2 : 1}
                  />
                  {cell.revealed && (
                    <text x={x} y={y + 4} textAnchor="middle" fontSize={12} fill="rgba(255,255,255,0.8)">
                      {terrainInfo.icon}
                    </text>
                  )}
                  {isCamp && (
                    <text x={x} y={y - HEX_SIZE * 0.55} textAnchor="middle" fontSize={8} fill="#f59e0b" fontWeight="bold">
                      营地
                    </text>
                  )}
                  {!cell.revealed && (
                    <text x={x} y={y + 4} textAnchor="middle" fontSize={10} fill="rgba(80,80,80,0.6)">?</text>
                  )}
                </g>
              )
            })}
            {route.length > 1 && (
              <polyline
                points={route.map(c => {
                  const { x, y } = hexToPixel(c, HEX_SIZE)
                  return `${x},${y}`
                }).join(' ')}
                fill="none"
                stroke="#fbbf24"
                strokeWidth={2}
                strokeDasharray="6,3"
                opacity={0.8}
              />
            )}
            {route.length > 0 && route.map((c, i) => {
              const { x, y } = hexToPixel(c, HEX_SIZE)
              return (
                <circle key={`dot-${i}`} cx={x} cy={y} r={3} fill="#fbbf24" opacity={0.9} />
              )
            })}
          </svg>
        </div>

        <div className="w-72 wood-border flex flex-col p-4 overflow-y-auto scrollbar-thin animate-fadeIn">
          <h2 className="font-title text-lg text-amber-400 mb-3 flex items-center gap-2">
            <Map size={18} /> 巡护路线
          </h2>

          {route.length === 0 ? (
            <p className="text-gray-400 text-sm">点击营地附近已揭示的六角格开始规划路线</p>
          ) : (
            <div className="space-y-1 mb-4 flex-1 overflow-y-auto scrollbar-thin">
              {route.map((c, i) => {
                const cell = hexGrid[c.r]?.[c.q]
                const terrain = cell ? TERRAIN_DATA[cell.terrain] : null
                return (
                  <div key={i} className="wood-card px-3 py-2 flex items-center justify-between text-sm">
                    <span>
                      <span className="text-amber-600 mr-1">{i + 1}.</span>
                      {terrain?.icon} {terrain?.name ?? '未知'}
                    </span>
                    <span className="text-yellow-300 text-xs">-{terrain?.staminaCost ?? 0}</span>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-auto space-y-3 pt-3 border-t border-amber-900/30">
            <div className="wood-card px-3 py-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">基础消耗</span>
                <span className="text-yellow-300">{totalCost}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">天气修正</span>
                <span className="text-blue-300">×{weatherMod}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-amber-900/50 pt-1">
                <span>总计消耗</span>
                <span className={adjustedCost > stamina ? 'text-red-400' : 'text-green-400'}>
                  {adjustedCost}
                </span>
              </div>
            </div>

            <button
              className="btn-wood primary w-full flex items-center justify-center gap-2"
              onClick={handleStart}
              disabled={!canStart}
            >
              <Play size={16} /> 出发
            </button>
            <button
              className="btn-wood w-full flex items-center justify-center gap-2"
              onClick={() => setRoute([])}
            >
              <Trash2 size={16} /> 清除路线
            </button>
            <button
              className="btn-wood danger w-full flex items-center justify-center gap-2"
              onClick={() => { setScreen('camp'); navigate('/camp') }}
            >
              <ArrowLeft size={16} /> 返回营地
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
