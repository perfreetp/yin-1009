import { useState } from 'react'
import { BookOpen, Search, Filter } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { ANIMALS, RARITY_LABELS, RARITY_COLORS, SEASON_LABELS } from '@/data/gameData'
import type { AnimalCategory, Season } from '@/types/game'

const CATEGORY_LABELS: Record<AnimalCategory, string> = {
  mammal: '哺乳类', bird: '鸟类', reptile: '爬行类', amphibian: '两栖类',
}

export default function CodexPage() {
  const [categoryFilter, setCategoryFilter] = useState<AnimalCategory | 'all'>('all')
  const [seasonFilter, setSeasonFilter] = useState<Season | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { animalCodex } = useGameStore()

  const identifiedCount = animalCodex.filter(e => e.identified).length
  const totalCount = ANIMALS.length
  const progress = Math.round((identifiedCount / totalCount) * 100)

  const filteredAnimals = ANIMALS.filter(a => {
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false
    if (seasonFilter !== 'all' && !a.seasons.includes(seasonFilter)) return false
    return true
  })

  return (
    <div className="game-bg min-h-screen p-4 animate-fadeIn">
      <h1 className="font-title text-2xl text-amber-200 mb-2 flex items-center gap-2">
        <BookOpen className="w-6 h-6" /> 动物图鉴
      </h1>

      <div className="wood-card p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-amber-200 text-sm">收集进度</span>
          <span className="text-amber-400 font-bold">{identifiedCount}/{totalCount}</span>
        </div>
        <div className="w-full bg-amber-900/40 rounded-full h-3">
          <div className="h-3 rounded-full bg-green-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="text-amber-200/50 text-xs mt-1 text-right">{progress}%</div>
      </div>

      <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-thin pb-1">
        <button className={`btn-wood text-xs ${categoryFilter === 'all' ? 'primary' : ''}`} onClick={() => setCategoryFilter('all')}>全部</button>
        {(Object.keys(CATEGORY_LABELS) as AnimalCategory[]).map(cat => (
          <button key={cat} className={`btn-wood text-xs ${categoryFilter === cat ? 'primary' : ''}`} onClick={() => setCategoryFilter(cat)}>
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-thin pb-1">
        <button className={`btn-wood text-xs ${seasonFilter === 'all' ? 'primary' : ''}`} onClick={() => setSeasonFilter('all')}>全部季节</button>
        {(Object.keys(SEASON_LABELS) as Season[]).map(s => (
          <button key={s} className={`btn-wood text-xs ${seasonFilter === s ? 'primary' : ''}`} onClick={() => setSeasonFilter(s)}>
            {SEASON_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {filteredAnimals.map(animal => {
          const entry = animalCodex.find(e => e.speciesId === animal.id)
          const identified = entry?.identified ?? false
          const isSelected = selectedId === animal.id

          return (
            <div key={animal.id}>
              <button
                className="wood-card p-2 w-full text-center transition-all hover:ring-2 hover:ring-amber-400"
                onClick={() => setSelectedId(isSelected ? null : animal.id)}
              >
                <div className="text-2xl mb-1">{identified ? animal.icon : '❓'}</div>
                <div className="text-sm text-amber-200 truncate">{identified ? animal.name : '???'}</div>
                <div className="text-xs mt-1" style={{ color: RARITY_COLORS[animal.rarity] }}>
                  {RARITY_LABELS[animal.rarity]}
                </div>
              </button>

              {isSelected && (
                <div className="wood-card p-3 mt-1 animate-fadeIn col-span-3">
                  {identified ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{animal.icon}</span>
                        <span className="font-title text-amber-200">{animal.name}</span>
                        <span className="text-xs px-1 rounded" style={{ color: RARITY_COLORS[animal.rarity], backgroundColor: `${RARITY_COLORS[animal.rarity]}20` }}>
                          {RARITY_LABELS[animal.rarity]}
                        </span>
                      </div>
                      <p className="text-amber-200/80 text-sm mb-2">{animal.description}</p>
                      <div className="text-amber-200/60 text-xs space-y-1">
                        <div>足迹: {animal.footprintDesc}</div>
                        <div>季节: {animal.seasons.map(s => SEASON_LABELS[s]).join('、')}</div>
                        <div>地形: {animal.terrains.join('、')}</div>
                        <div>照片: {entry?.photoCount ?? 0} · 样本: {entry?.sampleCount ?? 0}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-amber-200/50">
                      <div className="text-3xl mb-2 opacity-30">🐾</div>
                      <div>尚未识别</div>
                      <div className="text-xs mt-1">继续巡护以发现更多线索</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
