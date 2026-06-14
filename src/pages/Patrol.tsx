import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/stores/gameStore'
import { TERRAIN_DATA, WEATHER_DATA, ANIMALS } from '@/data/gameData'
import type { HexCoord, PatrolEvent } from '@/types/game'
import { hexDistance, hexToPixel } from '@/utils/hexUtils'
import { Footprints, Shield, Heart, Camera, MessageSquare, ChevronRight, XCircle, Zap, MapPin } from 'lucide-react'

const MINI_HEX = 16

function hexPoints(cx: number, cy: number, size: number): string {
  const pts: string[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2
    pts.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`)
  }
  return pts.join(' ')
}

export default function Patrol() {
  const navigate = useNavigate()
  const {
    activePatrol, hexGrid, mapWidth, mapHeight, stamina, maxStamina,
    season, traps, processPatrolStep, endPatrol, identifyFootprint,
    collectSample, disarmTrap, startRescue, deployCamera, setScreen
  } = useGameStore()

  const handleEndPatrol = () => {
    endPatrol()
    navigate('/camp')
  }

  const campQ = Math.floor(mapWidth / 2)
  const campR = Math.floor(mapHeight / 2)

  const viewBox = useMemo(() => {
    const pad = MINI_HEX * 2
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (let r = 0; r < mapHeight; r++) {
      for (let q = 0; q < mapWidth; q++) {
        const { x, y } = hexToPixel({ q, r }, MINI_HEX)
        minX = Math.min(minX, x); minY = Math.min(minY, y)
        maxX = Math.max(maxX, x); maxY = Math.max(maxY, y)
      }
    }
    return `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`
  }, [mapWidth, mapHeight])

  if (!activePatrol) {
    return (
      <div className="game-bg w-full h-full flex items-center justify-center gap-4">
        <p className="text-gray-400">没有进行中的巡护</p>
        <button className="btn-wood" onClick={() => { setScreen('camp'); navigate('/camp') }}>返回营地</button>
      </div>
    )
  }

  const { route, currentStep, events, staminaUsed } = activePatrol
  const currentPos: HexCoord = currentStep > 0 ? route[currentStep - 1] : route[0]
  const currentCell = hexGrid[currentPos.r]?.[currentPos.q]
  const currentTerrain = currentCell ? TERRAIN_DATA[currentCell.terrain] : null
  const unresolved = events.filter(e => !e.resolved)
  const isComplete = currentStep >= route.length

  const terrainAnimals = currentCell
    ? ANIMALS.filter(a => a.seasons.includes(season) && a.terrains.includes(currentCell.terrain)).slice(0, 3)
    : []

  const localTraps = traps.filter(t =>
    !t.disarmed && t.hexPos.q === currentPos.q && t.hexPos.r === currentPos.r
  )

  const handleDisarm = () => {
    if (localTraps.length > 0) {
      disarmTrap(localTraps[0].id)
    }
  }

  const handleStartRescue = () => {
    const animal = terrainAnimals[0]
    if (animal) startRescue(animal.id, 'moderate')
  }

  const renderEvent = (event: PatrolEvent) => {
    switch (event.type) {
      case 'footprint':
        return (
          <div className="wood-card p-4 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-amber-400 font-title">
              <Footprints size={18} /> 发现足迹
            </div>
            <p className="text-sm text-gray-300">
              {currentTerrain?.icon} 区域发现不明动物足迹，请尝试辨认
            </p>
            <div className="space-y-1">
              {terrainAnimals.map(a => (
                <div key={a.id} className="wood-card px-3 py-1.5 flex items-center justify-between text-sm">
                  <span>{a.icon} {a.name}</span>
                  <span className="text-xs text-gray-500">{a.footprintDesc}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                className="bg-black/40 border border-amber-900/50 rounded px-2 py-1 text-sm text-gray-200"
                value={selectedSpecies}
                onChange={e => setSelectedSpecies(e.target.value)}
              >
                <option value="">选择物种...</option>
                {terrainAnimals.map(a => (
                  <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                ))}
              </select>
              <button
                className="btn-wood primary text-sm"
                onClick={() => selectedSpecies && identifyFootprint(selectedSpecies)}
                disabled={!selectedSpecies}
              >
                鉴定足迹
              </button>
              <button
                className="btn-wood text-sm"
                onClick={() => selectedSpecies && collectSample(selectedSpecies, 'footprint')}
                disabled={!selectedSpecies}
              >
                采集样本
              </button>
            </div>
          </div>
        )
      case 'trap':
        return (
          <div className="wood-card p-4 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-red-400 font-title">
              <Shield size={18} /> 发现陷阱
            </div>
            <p className="text-sm text-gray-300">此处发现疑似盗猎陷阱，需要尽快拆除</p>
            <p className="text-xs text-yellow-600">⚠ 拆除失败可能受伤并消耗额外体力</p>
            <button className="btn-wood danger text-sm" onClick={handleDisarm}>
              拆除陷阱
            </button>
          </div>
        )
      case 'rescue':
        return (
          <div className="wood-card p-4 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-pink-400 font-title">
              <Heart size={18} /> 救助事件
            </div>
            <p className="text-sm text-gray-300">发现受伤的野生动物，需要紧急救助</p>
            <button className="btn-wood primary text-sm" onClick={handleStartRescue}>
              开始救助
            </button>
          </div>
        )
      case 'camera_deploy':
        return (
          <div className="wood-card p-4 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-cyan-400 font-title">
              <Camera size={18} /> 相机布设点
            </div>
            <p className="text-sm text-gray-300">此处适合布设红外相机监测动物活动</p>
            <button className="btn-wood primary text-sm" onClick={() => deployCamera(currentPos)}>
              布设相机
            </button>
          </div>
        )
      case 'negotiate':
        return (
          <div className="wood-card p-4 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-purple-400 font-title">
              <MessageSquare size={18} /> 村民对话
            </div>
            <p className="text-sm text-gray-300">遇到当地村民，可以尝试沟通协商</p>
            <button className="btn-wood text-sm" onClick={() => setScreen('negotiate')}>
              开始对话
            </button>
          </div>
        )
      default:
        return (
          <div className="wood-card p-4 animate-fadeIn">
            <p className="text-sm text-gray-400">{event.description}</p>
          </div>
        )
    }
  }

  return (
    <div className="game-bg w-full h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 wood-border">
        <h1 className="font-title text-xl text-amber-400">巡护进行中</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-yellow-300">
            <Zap size={14} /> {stamina}/{maxStamina}
          </span>
          <span className="flex items-center gap-1 text-green-300">
            <MapPin size={14} /> 步骤 {currentStep}/{route.length}
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 p-3 wood-border overflow-auto scrollbar-thin">
          <svg viewBox={viewBox} className="w-full h-full">
            {hexGrid.flat().filter(c => c.revealed).map(cell => {
              const { q, r } = cell.coord
              const { x, y } = hexToPixel({ q, r }, MINI_HEX)
              const onRoute = route.some(h => h.q === q && h.r === r)
              const isCurrent = q === currentPos.q && r === currentPos.r
              const ti = TERRAIN_DATA[cell.terrain]
              return (
                <polygon
                  key={`${q},${r}`}
                  points={hexPoints(x, y, MINI_HEX - 1)}
                  fill={isCurrent ? '#fbbf24' : onRoute ? 'rgba(251,191,36,0.3)' : ti.color}
                  stroke={isCurrent ? '#fbbf24' : onRoute ? 'rgba(251,191,36,0.5)' : 'rgba(139,105,20,0.2)'}
                  strokeWidth={isCurrent ? 2 : 1}
                />
              )
            })}
            {route.length > 1 && (
              <polyline
                points={route.map(c => {
                  const { x, y } = hexToPixel(c, MINI_HEX)
                  return `${x},${y}`
                }).join(' ')}
                fill="none" stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="3,2"
              />
            )}
            {currentStep > 0 && (() => {
              const { x, y } = hexToPixel(currentPos, MINI_HEX)
              return <circle cx={x} cy={y} r={4} fill="#fbbf24" />
            })()}
          </svg>
        </div>

        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
          {currentTerrain && (
            <div className="text-sm text-gray-300 mb-3">
              当前位置: {currentTerrain.icon} {currentTerrain.name} ({currentPos.q}, {currentPos.r})
            </div>
          )}

          <div className="space-y-3 mb-4">
            {unresolved.length > 0 && unresolved.map(ev => (
              <div key={ev.id}>{renderEvent(ev)}</div>
            ))}
          </div>

          {isComplete ? (
            <div className="wood-card p-6 text-center animate-fadeIn">
              <p className="text-green-400 font-title text-lg mb-2">巡护路线已完成</p>
              <p className="text-sm text-gray-400 mb-4">共遭遇 {events.length} 个事件，消耗 {staminaUsed} 体力</p>
              <button className="btn-wood primary" onClick={handleEndPatrol}>返回营地</button>
            </div>
          ) : unresolved.length === 0 ? (
            <div className="wood-card p-6 text-center text-gray-400">
              <p>点击"继续前进"前往下一个位置</p>
            </div>
          ) : null}

          <div className="flex gap-3 mt-4">
            {!isComplete && (
              <button className="btn-wood primary flex items-center gap-2" onClick={processPatrolStep}>
                <ChevronRight size={16} /> 继续前进
              </button>
            )}
            <button className="btn-wood danger flex items-center gap-2" onClick={handleEndPatrol}>
              <XCircle size={16} /> 结束巡护
            </button>
          </div>
        </div>

        <div className="w-52 wood-border p-4 space-y-4 overflow-y-auto scrollbar-thin animate-fadeIn">
          <div>
            <h3 className="font-title text-amber-400 mb-2 text-sm">体力状态</h3>
            <div className="w-full bg-black/40 rounded-full h-3">
              <div
                className="stamina-bar h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, (stamina / maxStamina) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{stamina}/{maxStamina} (已消耗 {staminaUsed})</p>
          </div>

          <div className="wood-card px-3 py-2">
            <h3 className="font-title text-amber-400 text-sm mb-1">遭遇事件</h3>
            <p className="text-2xl text-white font-bold">{events.length}</p>
          </div>

          <div className="wood-card px-3 py-2">
            <h3 className="font-title text-amber-400 text-sm mb-1">样本收集</h3>
            <p className="text-2xl text-white font-bold">
              {events.filter(e => e.type === 'footprint' && e.resolved).length}
            </p>
          </div>

          <div className="wood-card px-3 py-2">
            <h3 className="font-title text-amber-400 text-sm mb-1">已探索</h3>
            <p className="text-lg text-white">{currentStep}/{route.length} 步</p>
          </div>
        </div>
      </div>
    </div>
  )
}
