import { useState, useCallback } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { TERRAIN_DATA } from '@/data/gameData'
import { hexToPixel } from '@/utils/hexUtils'
import type { HexCell } from '@/types/game'

const HEX_SIZE = 30

function hexPoints(cx: number, cy: number, size: number): string {
  const pts: string[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30)
    pts.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`)
  }
  return pts.join(' ')
}

export default function HexGrid() {
  const hexGrid = useGameStore((s) => s.hexGrid)
  const mapWidth = useGameStore((s) => s.mapWidth)
  const mapHeight = useGameStore((s) => s.mapHeight)
  const [hovered, setHovered] = useState<HexCell | null>(null)

  const { viewBox, offsetX, offsetY } = (() => {
    const lastQ = mapWidth - 1
    const lastR = mapHeight - 1
    const p0 = hexToPixel({ q: 0, r: 0 }, HEX_SIZE)
    const p1 = hexToPixel({ q: lastQ, r: lastR }, HEX_SIZE)
    const pad = HEX_SIZE * 2
    return {
      viewBox: `${p0.x - pad} ${p0.y - pad} ${p1.x - p0.x + pad * 2} ${p1.y - p0.y + pad * 2}`,
      offsetX: 0,
      offsetY: 0,
    }
  })()

  const campQ = Math.floor(mapWidth / 2)
  const campR = Math.floor(mapHeight / 2)

  const handleClick = useCallback((cell: HexCell) => {
    if (cell.revealed) {
      useGameStore.getState().setScreen('camp')
    }
  }, [])

  const renderCell = (cell: HexCell) => {
    const { x, y } = hexToPixel(cell.coord, HEX_SIZE)
    const terrain = TERRAIN_DATA[cell.terrain]
    const isCamp = cell.coord.q === campQ && cell.coord.r === campR
    const isHovered = hovered?.coord.q === cell.coord.q && hovered?.coord.r === cell.coord.r

    return (
      <g
        key={`${cell.coord.q}-${cell.coord.r}`}
        onClick={() => handleClick(cell)}
        onMouseEnter={() => setHovered(cell)}
        onMouseLeave={() => setHovered(null)}
        className={cell.revealed ? 'cursor-pointer' : ''}
      >
        <polygon
          points={hexPoints(x, y, HEX_SIZE - 1)}
          fill={cell.revealed ? terrain.color : '#0a0a0a'}
          stroke={isHovered && cell.revealed ? '#f59e0b' : 'rgba(139,105,20,0.3)'}
          strokeWidth={isHovered && cell.revealed ? 2 : 1}
          opacity={cell.revealed ? (cell.explored ? 1 : 0.7) : 0.5}
        />
        {cell.revealed && isCamp && (
          <text
            x={x}
            y={y + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={16}
          >
            ⛺
          </text>
        )}
        {cell.revealed && !isCamp && cell.explored && (
          <text
            x={x}
            y={y + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            opacity={0.8}
          >
            {terrain.icon}
          </text>
        )}
      </g>
    )
  }

  return (
    <div className="relative animate-fadeIn">
      <svg viewBox={viewBox} className="w-full h-auto max-h-[60vh]">
        {hexGrid.flat().map(renderCell)}
      </svg>
      {hovered && hovered.revealed && (
        <div className="absolute bottom-2 left-2 wood-card px-3 py-1.5 text-xs pointer-events-none">
          <span>{TERRAIN_DATA[hovered.terrain].icon}</span>
          <span className="ml-1 text-gray-300">{TERRAIN_DATA[hovered.terrain].name}</span>
          <span className="ml-2 text-gray-500">({hovered.coord.q},{hovered.coord.r})</span>
        </div>
      )}
    </div>
  )
}
