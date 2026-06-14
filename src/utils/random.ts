import type { Season, Weather } from '@/types/game'
import { SEASON_WEATHER, WEATHER_DATA } from '@/data/gameData'

export function weightedRandom<T>(items: { item: T; weight: number }[]): T {
  const total = items.reduce((sum, i) => sum + i.weight, 0)
  let roll = Math.random() * total
  for (const { item, weight } of items) {
    roll -= weight
    if (roll <= 0) return item
  }
  return items[items.length - 1].item
}

export function generateWeather(season: Season): Weather {
  const pool = SEASON_WEATHER[season]
  return weightedRandom(pool.map(w => ({ item: w.weather as Weather, weight: w.weight })))
}

export function generateForecast(season: Season, days: number = 3): Weather[] {
  return Array.from({ length: days }, () => generateWeather(season))
}

export function getDaySeason(day: number): Season {
  const seasonDay = ((day - 1) % 120) + 1
  if (seasonDay <= 30) return 'spring'
  if (seasonDay <= 60) return 'summer'
  if (seasonDay <= 90) return 'autumn'
  return 'winter'
}

export function getYearNumber(day: number): number {
  return Math.floor((day - 1) / 120) + 1
}

export function getSeasonDay(day: number): number {
  return ((day - 1) % 30) + 1
}

export function isSeasonEnd(day: number): boolean {
  return day % 30 === 0
}

export function isYearEnd(day: number): boolean {
  return day % 120 === 0
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

export function checkEventTrigger(eventRate: number, weatherMod: number): boolean {
  return Math.random() < eventRate * weatherMod
}

export function determineEventType(terrain: string): string {
  const events: { item: string; weight: number }[] = []
  switch (terrain) {
    case 'forest':
      events.push({ item: 'footprint', weight: 40 }, { item: 'trap', weight: 25 }, { item: 'camera_deploy', weight: 15 }, { item: 'rescue', weight: 20 })
      break
    case 'mountain':
      events.push({ item: 'footprint', weight: 30 }, { item: 'trap', weight: 30 }, { item: 'camera_deploy', weight: 20 }, { item: 'rescue', weight: 20 })
      break
    case 'stream':
      events.push({ item: 'footprint', weight: 45 }, { item: 'rescue', weight: 30 }, { item: 'camera_deploy', weight: 25 })
      break
    case 'meadow':
      events.push({ item: 'footprint', weight: 45 }, { item: 'camera_deploy', weight: 30 }, { item: 'trap', weight: 25 })
      break
    case 'village':
      events.push({ item: 'negotiate', weight: 70 }, { item: 'footprint', weight: 30 })
      break
    default:
      events.push({ item: 'footprint', weight: 100 })
  }
  return weightedRandom(events)
}

export function calculateRating(stats: { totalPatrols: number; animalsRescued: number; trapsRemoved: number; speciesIdentified: number; negotiationsCompleted: number }): { score: number; rank: string; title: string } {
  const patrolScore = Math.min(stats.totalPatrols * 5, 25)
  const rescueScore = Math.min(stats.animalsRescued * 10, 25)
  const trapScore = Math.min(stats.trapsRemoved * 8, 25)
  const speciesScore = Math.min(stats.speciesIdentified * 3, 15)
  const negotiateScore = Math.min(stats.negotiationsCompleted * 5, 10)
  const score = patrolScore + rescueScore + trapScore + speciesScore + negotiateScore

  let rank: string
  let title: string
  if (score >= 90) { rank = 'S'; title = '传奇守护者' }
  else if (score >= 75) { rank = 'A'; title = '优秀巡护员' }
  else if (score >= 60) { rank = 'B'; title = '合格巡护员' }
  else if (score >= 40) { rank = 'C'; title = '见习巡护员' }
  else { rank = 'D'; title = '实习巡护员' }

  return { score, rank, title }
}
