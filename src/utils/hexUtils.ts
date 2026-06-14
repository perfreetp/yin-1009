import type { HexCoord, HexCell, TerrainType } from '@/types/game'
import { TERRAIN_DATA } from '@/data/gameData'

export function hexDistance(a: HexCoord, b: HexCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2
}

export function hexNeighbors(coord: HexCoord): HexCoord[] {
  const dirs = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
  ]
  return dirs.map(d => ({ q: coord.q + d.q, r: coord.r + d.r }))
}

export function hexToPixel(coord: HexCoord, size: number): { x: number; y: number } {
  const x = size * (Math.sqrt(3) * coord.q + Math.sqrt(3) / 2 * coord.r)
  const y = size * (3 / 2 * coord.r)
  return { x, y }
}

export function pixelToHex(x: number, y: number, size: number): HexCoord {
  const q = (Math.sqrt(3) / 3 * x - 1 / 3 * y) / size
  const r = (2 / 3 * y) / size
  return hexRound({ q, r })
}

export function hexRound(coord: HexCoord): HexCoord {
  let rq = coord.q
  let rr = coord.r
  const rs = -rq - rr

  let rq2 = Math.round(rq)
  let rr2 = Math.round(rr)
  const rs2 = Math.round(rs)

  const dq = Math.abs(rq2 - rq)
  const dr = Math.abs(rr2 - rr)
  const ds = Math.abs(rs2 - rs)

  if (dq > dr && dq > ds) {
    rq2 = -rr2 - rs2
  } else if (dr > ds) {
    rr2 = -rq2 - rs2
  }

  return { q: rq2, r: rr2 }
}

export function generateMap(width: number, height: number): HexCell[][] {
  const grid: HexCell[][] = []
  const terrains: TerrainType[] = ['forest', 'mountain', 'stream', 'meadow', 'village']
  const terrainWeights = [0.35, 0.2, 0.15, 0.2, 0.1]

  for (let r = 0; r < height; r++) {
    grid[r] = []
    for (let q = 0; q < width; q++) {
      const terrain = selectTerrain(q, r, width, height, terrains, terrainWeights)
      const isCamp = q === Math.floor(width / 2) && r === Math.floor(height / 2)
      grid[r][q] = {
        coord: { q, r },
        terrain: isCamp ? 'camp' : terrain,
        revealed: isCamp || hexDistance({ q, r }, { q: Math.floor(width / 2), r: Math.floor(height / 2) }) <= 2,
        explored: isCamp,
        hasEvent: false,
        hasCamera: false,
        hasTrap: Math.random() < 0.08 && !isCamp,
        hasFootprint: Math.random() < 0.25 && !isCamp && terrain !== 'village',
        animalDensity: Math.random() * 0.5 + 0.3,
      }
    }
  }
  return grid
}

function selectTerrain(q: number, r: number, w: number, h: number, terrains: TerrainType[], weights: number[]): TerrainType {
  const distFromCenter = hexDistance({ q, r }, { q: Math.floor(w / 2), r: Math.floor(h / 2) })
  const normalizedDist = distFromCenter / (Math.max(w, h) / 2)

  if (normalizedDist < 0.2) return 'meadow'
  if (normalizedDist > 0.7 && Math.random() < 0.4) return 'mountain'

  if (Math.abs(r - Math.floor(h / 2)) <= 1 && Math.random() < 0.3) return 'stream'

  const roll = Math.random()
  let cumulative = 0
  for (let i = 0; i < terrains.length; i++) {
    cumulative += weights[i]
    if (roll < cumulative) return terrains[i]
  }
  return terrains[0]
}

export function calculateRouteStamina(route: HexCoord[], grid: HexCell[][]): number {
  let total = 0
  for (const coord of route) {
    if (coord.r >= 0 && coord.r < grid.length && coord.q >= 0 && coord.q < grid[0].length) {
      total += TERRAIN_DATA[grid[coord.r][coord.q].terrain].staminaCost
    }
  }
  return total
}

export function getReachableHexes(
  start: HexCoord,
  maxStamina: number,
  grid: HexCell[][],
  weatherMod: number = 1
): Set<string> {
  const reachable = new Set<string>()
  const queue: { coord: HexCoord; cost: number }[] = [{ coord: start, cost: 0 }]
  const visited = new Map<string, number>()

  while (queue.length > 0) {
    const { coord, cost } = queue.shift()!
    const key = `${coord.q},${coord.r}`
    if (visited.has(key)) continue
    visited.set(key, cost)
    reachable.add(key)

    for (const neighbor of hexNeighbors(coord)) {
      const nKey = `${neighbor.q},${neighbor.r}`
      if (neighbor.r < 0 || neighbor.r >= grid.length || neighbor.q < 0 || neighbor.q >= grid[0].length) continue
      const cell = grid[neighbor.r][neighbor.q]
      const moveCost = Math.ceil(TERRAIN_DATA[cell.terrain].staminaCost * weatherMod)
      const totalCost = cost + moveCost
      if (totalCost <= maxStamina && !visited.has(nKey)) {
        queue.push({ coord: neighbor, cost: totalCost })
      }
    }
  }

  return reachable
}
