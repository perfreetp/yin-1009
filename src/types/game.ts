export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'storm'
export type TerrainType = 'forest' | 'mountain' | 'stream' | 'meadow' | 'village' | 'camp'
export type AnimalCategory = 'mammal' | 'bird' | 'reptile' | 'amphibian'
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'
export type InjuryLevel = 'minor' | 'moderate' | 'severe' | 'critical'
export type TrapType = 'snare' | 'trap_clamp' | 'net' | 'pitfall'
export type ClueType = 'footprint_clue' | 'tool_mark' | 'camp_remnant' | 'witness'
export type NegotiationStance = 'empathetic' | 'pragmatic' | 'strict' | 'educational'
export type EndingType = 'guardian' | 'mediator' | 'detective' | 'naturalist' | 'failure'

export interface HexCoord {
  q: number
  r: number
}

export interface HexCell {
  coord: HexCoord
  terrain: TerrainType
  revealed: boolean
  explored: boolean
  hasEvent: boolean
  eventId?: string
  hasCamera: boolean
  cameraId?: string
  hasTrap: boolean
  trapId?: string
  hasFootprint: boolean
  footprintSpecies?: string
  animalDensity: number
}

export interface AnimalSpecies {
  id: string
  name: string
  category: AnimalCategory
  rarity: Rarity
  seasons: Season[]
  terrains: TerrainType[]
  footprintDesc: string
  description: string
  icon: string
}

export interface AnimalEntry {
  speciesId: string
  identified: boolean
  discoveryDay: number
  photoCount: number
  sampleCount: number
}

export interface Equipment {
  id: string
  name: string
  price: number
  weight: number
  effect: string
  effectValue: number
  effectType: 'identify' | 'treat' | 'explore' | 'sample' | 'camera' | 'storm' | 'trap' | 'negotiate'
  description: string
  icon: string
}

export interface OwnedEquipment extends Equipment {
  quantity: number
  equipped: boolean
}

export interface PatrolRecord {
  id: string
  day: number
  season: Season
  route: HexCoord[]
  events: PatrolEvent[]
  staminaUsed: number
  samples: SampleRecord[]
  score: number
}

export interface PatrolEvent {
  id: string
  type: 'footprint' | 'camera_deploy' | 'rescue' | 'trap' | 'negotiate' | 'weather' | 'discovery'
  description: string
  resolved: boolean
  outcome?: string
  day: number
}

export interface SampleRecord {
  id: string
  speciesId: string
  type: 'footprint' | 'feces' | 'hair'
  collectedDay: number
  identified: boolean
}

export interface CameraDeploy {
  id: string
  hexPos: HexCoord
  deployDay: number
  photos: CameraPhoto[]
  retrieved: boolean
  retrieveDay?: number
}

export interface CameraPhoto {
  speciesId: string
  day: number
  quality: number
  season: Season
}

export interface RescueRecord {
  id: string
  speciesId: string
  injuryType: string
  injuryLevel: InjuryLevel
  treatment: string
  startDay: number
  healthProgress: number
  released: boolean
  releaseDay?: number
  releaseLocation?: HexCoord
}

export interface TrapInstance {
  id: string
  type: TrapType
  hexPos: HexCoord
  discovered: boolean
  disarmed: boolean
  disarmMethod?: string
  clueFragmentId?: string
}

export interface ClueFragment {
  id: string
  type: ClueType
  description: string
  foundDay: number
  assembled: boolean
  poacherCaseId?: string
}

export interface PoacherCase {
  id: string
  name: string
  clueIds: string[]
  solved: boolean
  description: string
}

export interface NegotiationEvent {
  id: string
  eventId?: string
  title: string
  description: string
  villagerName: string
  conflictType: 'crop_damage' | 'livestock' | 'encroachment' | 'tradition'
  stanceOptions: NegotiationStance[]
  resolved: boolean
  outcome?: string
  reputationChange?: number
  budgetCost?: number
  stance?: NegotiationStance | string
  day?: number
  season?: Season
  icon?: string
  villagerQuote?: string
  repChange?: number
}

export interface Mission {
  id: string
  title: string
  description: string
  season: Season
  type: 'patrol' | 'rescue' | 'investigate' | 'negotiate' | 'camera'
  difficulty: number
  reward: number
  rewardType: 'budget' | 'reputation' | 'equipment'
  completed: boolean
  requiredTerrain?: TerrainType
  targetSpecies?: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'patrol' | 'animal' | 'rescue' | 'anti_poaching' | 'diplomacy' | 'collection'
  condition: string
  unlocked: boolean
  unlockedDay?: number
  progress: number
  target: number
}

export interface PlayerStats {
  totalPatrols: number
  animalsRescued: number
  trapsRemoved: number
  speciesIdentified: number
  camerasDeployed: number
  negotiationsCompleted: number
  totalDistanceTraveled: number
  totalSamplesCollected: number
  totalPhotosTaken: number
  perfectPatrols: number
}

export interface GameState {
  initialized: boolean
  day: number
  season: Season
  year: number
  budget: number
  reputation: number
  stamina: number
  maxStamina: number
  baseStaminaRegen: number
  weather: Weather
  weatherForecast: Weather[]
  currentScreen: string
  hexGrid: HexCell[][]
  mapWidth: number
  mapHeight: number
  inventory: OwnedEquipment[]
  animalCodex: AnimalEntry[]
  patrolRecords: PatrolRecord[]
  cameras: CameraDeploy[]
  rescues: RescueRecord[]
  traps: TrapInstance[]
  clueFragments: ClueFragment[]
  poacherCases: PoacherCase[]
  negotiations: NegotiationEvent[]
  missions: Mission[]
  achievements: Achievement[]
  stats: PlayerStats
  activePatrol: {
    route: HexCoord[]
    currentStep: number
    events: PatrolEvent[]
    staminaUsed: number
  } | null
  pendingEventId: string | null
  ending: EndingType | null
  gamePhase: 'menu' | 'playing' | 'season_end' | 'year_end' | 'game_over'
}
