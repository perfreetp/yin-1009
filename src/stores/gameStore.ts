import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameState, HexCell, Season, Weather, OwnedEquipment, CameraPhoto, AnimalEntry, RescueRecord, PatrolRecord, Achievement, ClueFragment, Mission, NegotiationEvent, TrapInstance, EndingType, PlayerStats } from '@/types/game'
import { EQUIPMENT, ANIMALS, ACHIEVEMENTS, MISSIONS, POACHER_CASES, NEGOTIATION_EVENTS } from '@/data/gameData'
import { generateMap, hexDistance } from '@/utils/hexUtils'
import { generateWeather, generateForecast, getDaySeason, getYearNumber, generateId, checkEventTrigger, determineEventType } from '@/utils/random'
import { WEATHER_DATA, TERRAIN_DATA } from '@/data/gameData'

const MAP_WIDTH = 12
const MAP_HEIGHT = 10

const defaultStats: PlayerStats = {
  totalPatrols: 0, animalsRescued: 0, trapsRemoved: 0, speciesIdentified: 0,
  camerasDeployed: 0, negotiationsCompleted: 0, totalDistanceTraveled: 0,
  totalSamplesCollected: 0, totalPhotosTaken: 0, perfectPatrols: 0,
}

const initialState: GameState = {
  initialized: false,
  day: 1,
  season: 'spring',
  year: 1,
  budget: 1000,
  reputation: 10,
  stamina: 100,
  maxStamina: 100,
  baseStaminaRegen: 30,
  weather: 'sunny',
  weatherForecast: [],
  currentScreen: 'camp',
  hexGrid: [],
  mapWidth: MAP_WIDTH,
  mapHeight: MAP_HEIGHT,
  inventory: [],
  animalCodex: [],
  patrolRecords: [],
  cameras: [],
  rescues: [],
  traps: [],
  clueFragments: [],
  poacherCases: [],
  negotiations: [],
  missions: [],
  achievements: ACHIEVEMENTS.map(a => ({ ...a })),
  stats: { ...defaultStats },
  activePatrol: null,
  pendingEventId: null,
  ending: null,
  gamePhase: 'menu',
}

interface GameActions {
  startNewGame: () => void
  advanceDay: () => void
  rest: () => void
  eat: (amount: number) => void
  buyEquipment: (equipmentId: string) => void
  toggleEquip: (equipmentId: string) => void
  startPatrol: (route: { q: number; r: number }[]) => void
  processPatrolStep: () => void
  endPatrol: () => void
  deployCamera: (hexPos: { q: number; r: number }) => void
  retrieveCamera: (cameraId: string) => void
  identifyFootprint: (speciesId: string) => boolean
  collectSample: (speciesId: string, type: 'footprint' | 'feces' | 'hair') => void
  startRescue: (speciesId: string, injuryLevel: string) => string
  treatRescue: (rescueId: string, treatment: string) => boolean
  releaseAnimal: (rescueId: string, location: { q: number; r: number }) => void
  discoverTrap: (hexPos: { q: number; r: number }) => string
  disarmTrap: (trapId: string) => boolean
  assembleClues: (clueIds: string[]) => void
  startNegotiation: (eventId: string) => void
  resolveNegotiation: (eventId: string, stance: string) => { repChange: number; budgetCost: number } | null
  completeMission: (missionId: string) => void
  processSeasonEnd: () => void
  processYearEnd: () => void
  calculateEnding: () => EndingType
  resetGame: () => void
  setScreen: (screen: string) => void
  revealHexes: (center: { q: number; r: number }, range: number) => void
  checkAchievements: () => void
  updateWeather: () => void
  markEventResolved: (eventId: string) => void
  setPendingEvent: (eventId: string | null) => void
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      startNewGame: () => {
        const grid = generateMap(MAP_WIDTH, MAP_HEIGHT)
        const season: Season = 'spring'
        const weather = generateWeather(season)
        const forecast = generateForecast(season, 3)
        const campQ = Math.floor(MAP_WIDTH / 2)
        const campR = Math.floor(MAP_HEIGHT / 2)

        set({
          ...initialState,
          initialized: true,
          gamePhase: 'playing',
          currentScreen: 'camp',
          season,
          weather,
          weatherForecast: forecast,
          hexGrid: grid,
          inventory: EQUIPMENT.slice(0, 3).map(e => ({ ...e, quantity: 1, equipped: false })),
          animalCodex: ANIMALS.map(a => ({
            speciesId: a.id,
            identified: false,
            discoveryDay: 0,
            photoCount: 0,
            sampleCount: 0,
          })),
          missions: MISSIONS.map(m => ({ ...m, completed: false })),
          poacherCases: POACHER_CASES.map(p => ({ ...p, solved: false, clueIds: [...p.clueIds] })),
          achievements: ACHIEVEMENTS.map(a => ({ ...a, unlocked: false, progress: 0 })),
          stats: { ...defaultStats },
        })

        get().revealHexes({ q: campQ, r: campR }, 3)
      },

      advanceDay: () => {
        const state = get()
        const newDay = state.day + 1
        const newSeason = getDaySeason(newDay)
        const newYear = getYearNumber(newDay)

        let staminaRegen = state.baseStaminaRegen
        const hasFood = state.inventory.find(e => e.id === 'first_aid' && e.equipped)
        if (hasFood) staminaRegen += 10

        const newWeather = generateWeather(newSeason)
        const newForecast = generateForecast(newSeason, 3)

        set({
          day: newDay,
          season: newSeason,
          year: newYear,
          weather: newWeather,
          weatherForecast: newForecast,
          stamina: Math.min(state.stamina + staminaRegen, state.maxStamina),
        })

        if (newDay % 30 === 0) {
          get().processSeasonEnd()
        }
        if (newDay % 120 === 0) {
          get().processYearEnd()
        }

        get().checkAchievements()
      },

      rest: () => {
        const state = get()
        set({
          stamina: Math.min(state.stamina + 40, state.maxStamina),
        })
        get().advanceDay()
      },

      eat: (amount: number) => {
        const state = get()
        set({
          stamina: Math.min(state.stamina + amount, state.maxStamina),
          budget: state.budget - Math.floor(amount / 2),
        })
      },

      buyEquipment: (equipmentId: string) => {
        const state = get()
        const equipment = EQUIPMENT.find(e => e.id === equipmentId)
        if (!equipment || state.budget < equipment.price) return

        const existing = state.inventory.find(e => e.id === equipmentId)
        if (existing) {
          set({
            budget: state.budget - equipment.price,
            inventory: state.inventory.map(e =>
              e.id === equipmentId ? { ...e, quantity: e.quantity + 1 } : e
            ),
          })
        } else {
          set({
            budget: state.budget - equipment.price,
            inventory: [...state.inventory, { ...equipment, quantity: 1, equipped: false }],
          })
        }
      },

      toggleEquip: (equipmentId: string) => {
        const state = get()
        set({
          inventory: state.inventory.map(e =>
            e.id === equipmentId ? { ...e, equipped: !e.equipped } : e
          ),
        })
      },

      startPatrol: (route) => {
        set({
          activePatrol: {
            route,
            currentStep: 0,
            events: [],
            staminaUsed: 0,
          },
          currentScreen: 'patrol',
        })
      },

      processPatrolStep: () => {
        const state = get()
        if (!state.activePatrol) return

        const step = state.activePatrol.currentStep
        if (step >= state.activePatrol.route.length) {
          get().endPatrol()
          return
        }

        const coord = state.activePatrol.route[step]
        if (coord.r < 0 || coord.r >= state.mapHeight || coord.q < 0 || coord.q >= state.mapWidth) {
          set({
            activePatrol: {
              ...state.activePatrol,
              currentStep: step + 1,
            },
          })
          return
        }

        const cell = state.hexGrid[coord.r][coord.q]
        const terrainData = TERRAIN_DATA[cell.terrain]
        const weatherMod = WEATHER_DATA[state.weather]?.staminaMod || 1
        const staminaCost = Math.ceil(terrainData.staminaCost * weatherMod)

        if (state.stamina - state.activePatrol.staminaUsed - staminaCost < 0) {
          get().endPatrol()
          return
        }

        get().revealHexes(coord, 2)

        const newCell = { ...cell, revealed: true, explored: true }

        let newEvents = [...state.activePatrol.events]

        if (checkEventTrigger(terrainData.eventRate, WEATHER_DATA[state.weather]?.eventMod || 1)) {
          const eventType = determineEventType(cell.terrain) as string

          const newEvent: any = {
            id: generateId(),
            type: eventType as any,
            description: `在${terrainData.name}区域发现了异常`,
            resolved: false,
            day: state.day,
          }

          if (eventType === 'negotiate') {
            const usedTemplateIds = state.negotiations.map(n => n.eventId).filter(Boolean) as string[]
            const availableTemplates = NEGOTIATION_EVENTS.filter(e => !usedTemplateIds.includes(e.id))
            if (availableTemplates.length > 0) {
              const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)]
              newEvent.templateId = template.id
              newEvent.description = template.title
            }
          }

          if (eventType === 'rescue') {
            const nearbyAnimals = ANIMALS.filter(a =>
              a.seasons.includes(state.season) && a.terrains.includes(cell.terrain)
            )
            if (nearbyAnimals.length > 0) {
              const animal = nearbyAnimals[Math.floor(Math.random() * nearbyAnimals.length)]
              newEvent.speciesId = animal.id
              newEvent.description = `发现受伤的${animal.name}`
            }
          }

          newEvents.push(newEvent)
        }

        const newGrid = state.hexGrid.map(row => row.map(c => ({ ...c })))
        newGrid[coord.r][coord.q] = newCell

        set({
          hexGrid: newGrid,
          activePatrol: {
            ...state.activePatrol,
            currentStep: step + 1,
            staminaUsed: state.activePatrol.staminaUsed + staminaCost,
            events: newEvents,
          },
          stamina: state.stamina - staminaCost,
        })
      },

      endPatrol: () => {
        const state = get()
        if (!state.activePatrol) return

        const record: PatrolRecord = {
          id: generateId(),
          day: state.day,
          season: state.season,
          route: state.activePatrol.route,
          events: state.activePatrol.events,
          staminaUsed: state.activePatrol.staminaUsed,
          samples: [],
          score: state.activePatrol.events.length * 10 + state.activePatrol.route.length * 2,
        }

        set({
          patrolRecords: [...state.patrolRecords, record],
          stats: {
            ...state.stats,
            totalPatrols: state.stats.totalPatrols + 1,
            totalDistanceTraveled: state.stats.totalDistanceTraveled + state.activePatrol.route.length,
          },
          activePatrol: null,
          currentScreen: 'camp',
        })

        get().checkAchievements()
        get().advanceDay()
      },

      deployCamera: (hexPos) => {
        const state = get()
        const cameraItem = state.inventory.find(e => e.id === 'ir_camera' && e.quantity > 0)
        if (!cameraItem) return

        const camera = {
          id: generateId(),
          hexPos,
          deployDay: state.day,
          photos: [] as CameraPhoto[],
          retrieved: false,
        }

        set({
          cameras: [...state.cameras, camera],
          inventory: state.inventory.map(e =>
            e.id === 'ir_camera' ? { ...e, quantity: e.quantity - 1 } : e
          ).filter(e => e.quantity > 0),
          stats: { ...state.stats, camerasDeployed: state.stats.camerasDeployed + 1 },
        })
      },

      retrieveCamera: (cameraId) => {
        const state = get()
        const camera = state.cameras.find(c => c.id === cameraId)
        if (!camera) return

        const daysDeployed = Math.max(1, state.day - camera.deployDay)
        const newPhotos: CameraPhoto[] = []
        const cameraCell = state.hexGrid[camera.hexPos.r]?.[camera.hexPos.q]
        const nearbyAnimals = ANIMALS.filter(a =>
          a.seasons.includes(state.season) &&
          cameraCell && a.terrains.includes(cameraCell.terrain)
        )

        const updatedCodex = [...state.animalCodex]
        const identifiedThisTime: string[] = []

        for (let d = 0; d < daysDeployed; d++) {
          if (Math.random() < 0.4 && nearbyAnimals.length > 0) {
            const animal = nearbyAnimals[Math.floor(Math.random() * nearbyAnimals.length)]
            newPhotos.push({
              speciesId: animal.id,
              day: camera.deployDay + d,
              quality: Math.random() * 0.5 + 0.5,
              season: getDaySeason(camera.deployDay + d),
            })

            const codexIdx = updatedCodex.findIndex(e => e.speciesId === animal.id)
            if (codexIdx >= 0) {
              updatedCodex[codexIdx] = {
                ...updatedCodex[codexIdx],
                photoCount: updatedCodex[codexIdx].photoCount + 1,
                identified: true,
                discoveryDay: updatedCodex[codexIdx].discoveryDay || state.day,
              }
              if (!identifiedThisTime.includes(animal.id)) identifiedThisTime.push(animal.id)
            }
          }
        }

        const camerasUpdated = state.cameras.map(c =>
          c.id === cameraId ? { ...c, retrieved: true, retrieveDay: state.day, photos: [...c.photos, ...newPhotos] } : c
        )

        const existingCameraItem = state.inventory.find(e => e.id === 'ir_camera')
        let inventoryUpdated = [...state.inventory]
        if (existingCameraItem) {
          inventoryUpdated = inventoryUpdated.map(e =>
            e.id === 'ir_camera' ? { ...e, quantity: e.quantity + 1 } : e
          )
        } else {
          inventoryUpdated.push({ ...EQUIPMENT.find(e => e.id === 'ir_camera')!, quantity: 1, equipped: false })
        }

        const identifiedCount = updatedCodex.filter(e => e.identified).length

        set({
          cameras: camerasUpdated,
          inventory: inventoryUpdated,
          animalCodex: updatedCodex,
          stats: {
            ...state.stats,
            totalPhotosTaken: state.stats.totalPhotosTaken + newPhotos.length,
            speciesIdentified: identifiedCount,
          },
        })
      },

      identifyFootprint: (speciesId) => {
        const state = get()
        const hasBinoculars = state.inventory.find(e => e.id === 'binoculars' && e.equipped)
        const animal = ANIMALS.find(a => a.id === speciesId)
        if (!animal) return false

        const baseChance = 0.5
        const bonus = hasBinoculars ? 0.2 : 0
        const success = Math.random() < baseChance + bonus

        if (success) {
          set({
            animalCodex: state.animalCodex.map(e =>
              e.speciesId === speciesId ? { ...e, identified: true, discoveryDay: state.day } : e
            ),
            stats: {
              ...state.stats,
              speciesIdentified: state.animalCodex.filter(e => e.identified).length + 1,
            },
          })
        }

        return success
      },

      collectSample: (speciesId, type) => {
        const state = get()
        const hasSampleKit = state.inventory.find(e => e.id === 'sample_kit' && e.equipped)
        const baseChance = 0.4
        const bonus = hasSampleKit ? 0.25 : 0

        if (Math.random() < baseChance + bonus) {
          const entry = state.animalCodex.find(e => e.speciesId === speciesId)
          if (entry) {
            set({
              animalCodex: state.animalCodex.map(e =>
                e.speciesId === speciesId ? { ...e, sampleCount: e.sampleCount + 1 } : e
              ),
              stats: { ...state.stats, totalSamplesCollected: state.stats.totalSamplesCollected + 1 },
            })
          }
        }
      },

      startRescue: (speciesId, injuryLevel) => {
        const state = get()
        const rescue: RescueRecord = {
          id: generateId(),
          speciesId,
          injuryType: injuryLevel,
          injuryLevel: injuryLevel as any,
          treatment: '',
          startDay: state.day,
          healthProgress: 10,
          released: false,
        }
        set({ rescues: [...state.rescues, rescue] })
        return rescue.id
      },

      treatRescue: (rescueId, treatment) => {
        const state = get()
        let budgetCost = 0
        let baseChance = 0.5

        if (treatment === 'conservative') { budgetCost = 50; baseChance = 0.5 }
        else if (treatment === 'standard') { budgetCost = 150; baseChance = 0.7 }
        else if (treatment === 'surgery') { budgetCost = 300; baseChance = 0.9 }

        if (state.budget < budgetCost) return false

        const hasFirstAid = state.inventory.find(e => e.id === 'first_aid' && e.equipped)
        const bonus = hasFirstAid ? 0.15 : 0
        const success = Math.random() < Math.min(0.95, baseChance + bonus)

        if (success) {
          set({
            budget: state.budget - budgetCost,
            rescues: state.rescues.map(r =>
              r.id === rescueId ? { ...r, treatment, healthProgress: Math.min(r.healthProgress + 30, 100) } : r
            ),
          })
        } else {
          set({ budget: state.budget - Math.floor(budgetCost / 2) })
        }

        return success
      },

      releaseAnimal: (rescueId, location) => {
        const state = get()
        const rescue = state.rescues.find(r => r.id === rescueId)
        if (!rescue || rescue.healthProgress < 80) return

        set({
          rescues: state.rescues.map(r =>
            r.id === rescueId ? { ...r, released: true, releaseDay: state.day, releaseLocation: location } : r
          ),
          stats: { ...state.stats, animalsRescued: state.stats.animalsRescued + 1 },
          reputation: state.reputation + 5,
        })
        get().checkAchievements()
      },

      discoverTrap: (hexPos) => {
        const state = get()
        const trapTypes = ['snare', 'trap_clamp', 'net', 'pitfall'] as const
        const trap: TrapInstance = {
          id: generateId(),
          type: trapTypes[Math.floor(Math.random() * trapTypes.length)],
          hexPos,
          discovered: true,
          disarmed: false,
        }
        set({ traps: [...state.traps, trap] })
        return trap.id
      },

      disarmTrap: (trapId) => {
        const state = get()
        const hasWireCutter = state.inventory.find(e => e.id === 'wire_cutter' && e.equipped)
        const baseChance = 0.5
        const bonus = hasWireCutter ? 0.2 : 0
        const success = Math.random() < baseChance + bonus

        if (success) {
          const clueId = `clue_${generateId()}`

          const unsolvedCases = state.poacherCases.filter(c => !c.solved)
          let assignedCaseId: string | undefined
          if (unsolvedCases.length > 0) {
            const randomCase = unsolvedCases[Math.floor(Math.random() * unsolvedCases.length)]
            assignedCaseId = randomCase.id
          }

          const clueTypes: Array<'footprint_clue' | 'tool_mark' | 'camp_remnant' | 'witness'> = [
            'tool_mark', 'footprint_clue', 'camp_remnant', 'witness'
          ]
          const clueType = clueTypes[Math.floor(Math.random() * clueTypes.length)]

          const clueDescriptions: Record<string, string> = {
            tool_mark: '从拆除的陷阱上发现了特殊工具痕迹',
            footprint_clue: '陷阱附近发现了可疑的靴印',
            camp_remnant: '附近发现了临时营地的残留痕迹',
            witness: '附近村民反映曾见过陌生面孔出没',
          }

          set({
            traps: state.traps.map(t =>
              t.id === trapId ? { ...t, disarmed: true, disarmMethod: 'tool' } : t
            ),
            clueFragments: [...state.clueFragments, {
              id: clueId,
              type: clueType,
              description: clueDescriptions[clueType] || '一条可疑的线索碎片',
              foundDay: state.day,
              assembled: false,
              poacherCaseId: assignedCaseId,
            }],
            stats: { ...state.stats, trapsRemoved: state.stats.trapsRemoved + 1 },
            reputation: state.reputation + 3,
          })
          get().checkAchievements()
        } else {
          set({
            stamina: Math.max(0, state.stamina - 10),
          })
        }

        return success
      },

      assembleClues: (clueIds) => {
        const state = get()

        const updatedFragments = state.clueFragments.map(c =>
          clueIds.includes(c.id) ? { ...c, assembled: true } : c
        )
        set({ clueFragments: updatedFragments })

        let casesUpdated = [...state.poacherCases]
        let reputationAdded = 0
        let newlySolved = 0

        for (let i = 0; i < casesUpdated.length; i++) {
          const case_ = casesUpdated[i]
          if (!case_.solved) {
            const caseCluesCount = updatedFragments.filter(c => c.poacherCaseId === case_.id).length
            const requiredCount = case_.clueIds.length
            if (caseCluesCount >= requiredCount) {
              casesUpdated[i] = { ...case_, solved: true }
              reputationAdded += 20
              newlySolved++
            }
          }
        }

        if (newlySolved > 0) {
          set({
            poacherCases: casesUpdated,
            reputation: state.reputation + reputationAdded,
          })
        }
      },

      startNegotiation: (eventId) => {
        const state = get()
        set({ currentScreen: 'negotiate', pendingEventId: eventId })
      },

      resolveNegotiation: (eventId, stance) => {
        const state = get()
        let repChange = 0
        let budgetCost = 0
        let outcome = ''

        switch (stance) {
          case 'empathetic':
            repChange = 5
            budgetCost = 100
            outcome = '以共情和耐心化解矛盾，村民纷纷点头认可'
            break
          case 'pragmatic':
            repChange = 3
            budgetCost = 50
            outcome = '各退一步达成务实共识，双方基本满意'
            break
          case 'strict':
            repChange = -2
            budgetCost = 0
            outcome = '坚持原则严格执法，虽有成效但略有微词'
            break
          case 'educational':
            repChange = 8
            budgetCost = 80
            outcome = '深入浅出科普生态价值，村民从抵触转为支持'
            break
        }

        const resultRecord: NegotiationEvent = {
          id: `neg_record_${Date.now()}`,
          eventId,
          title: `第 ${state.day} 天协商记录`,
          stance: stance as any,
          outcome,
          repChange,
          budgetCost,
          day: state.day,
          season: state.season,
        }

        set({
          reputation: Math.max(0, state.reputation + repChange),
          budget: Math.max(0, state.budget - budgetCost),
          negotiations: [...state.negotiations, resultRecord],
          pendingEventId: null,
          stats: { ...state.stats, negotiationsCompleted: state.stats.negotiationsCompleted + 1 },
        })
        get().checkAchievements()

        return { repChange, budgetCost }
      },

      completeMission: (missionId) => {
        const state = get()
        const mission = state.missions.find(m => m.id === missionId)
        if (!mission || mission.completed) return

        let rewardAmount = mission.reward
        if (mission.rewardType === 'budget') {
          set({ budget: state.budget + rewardAmount })
        } else if (mission.rewardType === 'reputation') {
          set({ reputation: state.reputation + rewardAmount })
        }

        set({
          missions: state.missions.map(m =>
            m.id === missionId ? { ...m, completed: true } : m
          ),
        })
      },

      processSeasonEnd: () => {
        const state = get()
        const seasonBudget = 300
        set({ budget: state.budget + seasonBudget })
      },

      processYearEnd: () => {
        const state = get()
        const rating = calculateRatingFromStats(state.stats)
        const repBonus = rating.rank === 'S' ? 30 : rating.rank === 'A' ? 20 : rating.rank === 'B' ? 10 : 0
        set({
          reputation: state.reputation + repBonus,
          budget: state.budget + 500,
          gamePhase: 'year_end',
          currentScreen: 'rating',
        })
      },

      calculateEnding: () => {
        const state = get()
        const { stats } = state

        if (stats.animalsRescued >= 8 && stats.speciesIdentified >= 8) return 'guardian'
        if (stats.negotiationsCompleted >= 5 && state.reputation >= 50) return 'mediator'
        if (stats.trapsRemoved >= 10) return 'detective'
        if (stats.speciesIdentified >= 10) return 'naturalist'
        return 'failure'
      },

      resetGame: () => {
        set({ ...initialState, gamePhase: 'menu' })
      },

      setScreen: (screen) => {
        set({ currentScreen: screen })
      },

      revealHexes: (center, range) => {
        const state = get()
        const newGrid = state.hexGrid.map(row => row.map(cell => ({ ...cell })))

        for (let r = 0; r < state.mapHeight; r++) {
          for (let q = 0; q < state.mapWidth; q++) {
            if (hexDistance({ q, r }, center) <= range) {
              newGrid[r][q] = { ...newGrid[r][q], revealed: true }
            }
          }
        }

        set({ hexGrid: newGrid })
      },

      checkAchievements: () => {
        const state = get()
        const stats = state.stats

        const updated = state.achievements.map(a => {
          let progress = 0
          switch (a.id) {
            case 'first_patrol': progress = stats.totalPatrols; break
            case 'patrol_10': progress = stats.totalPatrols; break
            case 'first_rescue': progress = stats.animalsRescued; break
            case 'rescue_5': progress = stats.animalsRescued; break
            case 'first_trap': progress = stats.trapsRemoved; break
            case 'trap_10': progress = stats.trapsRemoved; break
            case 'species_3': progress = stats.speciesIdentified; break
            case 'species_all': progress = stats.speciesIdentified; break
            case 'negotiate_1': progress = stats.negotiationsCompleted; break
            case 'negotiate_5': progress = stats.negotiationsCompleted; break
            case 'camera_master': progress = stats.totalPhotosTaken; break
            case 'all_seasons': progress = state.year > 1 ? 1 : 0; break
            default: progress = a.progress
          }

          const unlocked = progress >= a.target
          return { ...a, progress, unlocked, unlockedDay: unlocked && !a.unlocked ? state.day : a.unlockedDay }
        })

        set({ achievements: updated })
      },

      updateWeather: () => {
        const state = get()
        const newWeather = generateWeather(state.season)
        const newForecast = generateForecast(state.season, 3)
        set({ weather: newWeather, weatherForecast: newForecast })
      },

      markEventResolved: (eventId) => {
        const state = get()
        if (!state.activePatrol) return
        set({
          activePatrol: {
            ...state.activePatrol,
            events: state.activePatrol.events.map(e =>
              e.id === eventId ? { ...e, resolved: true } : e
            ),
          },
        })
      },

      setPendingEvent: (eventId) => {
        set({ pendingEventId: eventId })
      },
    }),
    {
      name: 'forest-ranger-game',
      partialize: (state) => ({
        initialized: state.initialized,
        day: state.day,
        season: state.season,
        year: state.year,
        budget: state.budget,
        reputation: state.reputation,
        stamina: state.stamina,
        maxStamina: state.maxStamina,
        weather: state.weather,
        hexGrid: state.hexGrid,
        inventory: state.inventory,
        animalCodex: state.animalCodex,
        patrolRecords: state.patrolRecords,
        cameras: state.cameras,
        rescues: state.rescues,
        traps: state.traps,
        clueFragments: state.clueFragments,
        poacherCases: state.poacherCases,
        missions: state.missions,
        achievements: state.achievements,
        stats: state.stats,
        gamePhase: state.gamePhase,
        ending: state.ending,
      }),
    }
  )
)

function calculateRatingFromStats(stats: PlayerStats) {
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
