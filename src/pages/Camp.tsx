import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Backpack, CloudSun, BedDouble, ScrollText, MapPin, CoinsIcon, Heart, Star, ChevronRight } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { EQUIPMENT, WEATHER_DATA, SEASON_LABELS } from '@/data/gameData'
import type { Season, Weather } from '@/types/game'

type TabKey = 'shop' | 'inventory' | 'weather' | 'rest' | 'missions'

const TABS: { key: TabKey; label: string; icon: typeof ShoppingBag }[] = [
  { key: 'shop', label: '商店', icon: ShoppingBag },
  { key: 'inventory', label: '背包', icon: Backpack },
  { key: 'weather', label: '天气', icon: CloudSun },
  { key: 'rest', label: '休息', icon: BedDouble },
  { key: 'missions', label: '任务', icon: ScrollText },
]

export default function Camp() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('shop')
  const {
    budget, stamina, maxStamina, season, day, weather, weatherForecast,
    inventory, missions, buyEquipment, toggleEquip, rest, eat, completeMission, setScreen,
  } = useGameStore()

  const seasonMissions = missions.filter(m => m.season === season)
  const staminaPct = (stamina / maxStamina) * 100

  const handleDepart = () => {
    setScreen('route')
    navigate('/route')
  }

  return (
    <div className="min-h-screen game-bg p-4">
      <header className="wood-border rounded-lg p-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-title text-green-200 text-lg">🏕️ 营地</span>
          <span className="text-sm text-green-400">第{day}天 · {SEASON_LABELS[season]}季</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-yellow-400">💰 {budget}</span>
          <span className="text-green-400">❤️ {stamina}/{maxStamina}</span>
        </div>
      </header>

      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-thin pb-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              activeTab === key
                ? 'bg-green-800/60 text-green-200 wood-border'
                : 'bg-green-900/30 text-green-500 hover:bg-green-800/40'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="animate-fadeIn">
        {activeTab === 'shop' && <ShopTab budget={budget} inventory={inventory} onBuy={buyEquipment} />}
        {activeTab === 'inventory' && <InventoryTab inventory={inventory} onToggle={toggleEquip} />}
        {activeTab === 'weather' && <WeatherTab weather={weather} forecast={weatherForecast} />}
        {activeTab === 'rest' && <RestTab stamina={stamina} maxStamina={maxStamina} budget={budget} onRest={rest} onEat={eat} />}
        {activeTab === 'missions' && <MissionsTab missions={seasonMissions} onComplete={completeMission} />}
      </div>

      <div className="fixed bottom-4 right-4 z-20">
        <button onClick={handleDepart} className="btn-wood primary flex items-center gap-2 px-6 py-3 text-lg shadow-lg">
          <MapPin className="w-5 h-5" />
          出发巡护
        </button>
      </div>
    </div>
  )
}

function ShopTab({ budget, inventory, onBuy }: {
  budget: number; inventory: { id: string; quantity: number }[]; onBuy: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {EQUIPMENT.map(eq => {
        const owned = inventory.find(i => i.id === eq.id)
        const canAfford = budget >= eq.price
        return (
          <div key={eq.id} className="wood-card rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{eq.icon}</span>
              <div className="flex-1">
                <h3 className="font-title text-green-200 text-sm">{eq.name}</h3>
                <p className="text-xs text-green-500">{eq.effect}</p>
              </div>
            </div>
            <p className="text-xs text-green-600 line-clamp-2">{eq.description}</p>
            <div className="flex items-center justify-between mt-auto">
              <span className={`text-sm font-bold ${canAfford ? 'text-yellow-400' : 'text-gray-500'}`}>
                💰 {eq.price}
              </span>
              {owned && <span className="text-xs text-green-500">已有×{owned.quantity}</span>}
              <button
                onClick={() => onBuy(eq.id)}
                disabled={!canAfford}
                className={`px-3 py-1 rounded text-xs ${
                  canAfford ? 'btn-wood primary' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                购买
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function InventoryTab({ inventory, onToggle }: {
  inventory: { id: string; name: string; icon: string; equipped: boolean; quantity: number; effect: string }[]; onToggle: (id: string) => void
}) {
  if (inventory.length === 0) {
    return <div className="text-center text-green-600 py-12">背包空空如也，去商店看看吧</div>
  }
  return (
    <div className="flex flex-col gap-2">
      {inventory.map(item => (
        <div key={item.id} className="wood-card rounded-lg p-3 flex items-center gap-3">
          <span className="text-2xl">{item.icon}</span>
          <div className="flex-1">
            <h3 className="font-title text-green-200 text-sm">{item.name}</h3>
            <p className="text-xs text-green-500">{item.effect}</p>
          </div>
          <span className="text-xs text-green-600">×{item.quantity}</span>
          <button
            onClick={() => onToggle(item.id)}
            className={`px-3 py-1 rounded text-xs ${
              item.equipped
                ? 'bg-green-600 text-white'
                : 'bg-green-900/50 text-green-400 hover:bg-green-800/50'
            }`}
          >
            {item.equipped ? '已装备' : '装备'}
          </button>
        </div>
      ))}
    </div>
  )
}

function WeatherTab({ weather, forecast }: { weather: Weather; forecast: Weather[] }) {
  const current = WEATHER_DATA[weather]
  return (
    <div className="flex flex-col gap-4">
      <div className="wood-card rounded-lg p-6 text-center">
        <div className="text-6xl mb-3">{current?.icon}</div>
        <h2 className="font-title text-2xl text-green-200 mb-1">{current?.name}</h2>
        <p className="text-sm text-green-400">体力消耗 ×{current?.staminaMod} · 事件频率 ×{current?.eventMod}</p>
        {current?.danger && <p className="text-red-400 text-sm mt-2">⚠️ 恶劣天气，请注意安全</p>}
      </div>

      <div>
        <h3 className="font-title text-green-300 mb-2">三日预报</h3>
        <div className="grid grid-cols-3 gap-2">
          {forecast.map((w, i) => {
            const d = WEATHER_DATA[w]
            return (
              <div key={i} className="wood-card rounded-lg p-3 text-center">
                <div className="text-2xl">{d?.icon}</div>
                <div className="text-sm text-green-300 mt-1">{d?.name}</div>
                <div className="text-xs text-green-600">第{i + 1}天</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="wood-card rounded-lg p-3">
        <h3 className="font-title text-green-300 mb-2 text-sm">天气影响说明</h3>
        <div className="text-xs text-green-500 space-y-1">
          <p>☀️ 晴天：正常巡护条件</p>
          <p>☁️ 阴天：事件触发率略高</p>
          <p>🌧️ 雨天：体力消耗增加20%</p>
          <p>❄️ 雪天：体力消耗增加30%</p>
          <p>⛈️ 暴风：危险天气，体力消耗增加50%</p>
        </div>
      </div>
    </div>
  )
}

function RestTab({ stamina, maxStamina, budget, onRest, onEat }: {
  stamina: number; maxStamina: number; budget: number; onRest: () => void; onEat: (a: number) => void
}) {
  const pct = (stamina / maxStamina) * 100
  return (
    <div className="flex flex-col gap-4">
      <div className="wood-card rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-title text-green-200 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" /> 体力
          </span>
          <span className="text-green-400">{stamina}/{maxStamina}</span>
        </div>
        <div className="w-full h-4 bg-green-900/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct > 50 ? '#22c55e' : pct > 25 ? '#eab308' : '#ef4444',
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={onRest} className="wood-card rounded-lg p-4 text-center hover:bg-green-800/30 transition-colors">
          <BedDouble className="w-8 h-8 mx-auto mb-2 text-green-400" />
          <div className="font-title text-green-200 mb-1">休息</div>
          <div className="text-xs text-green-500">恢复40体力，进入下一天</div>
        </button>
        <button
          onClick={() => onEat(30)}
          disabled={budget < 15}
          className={`wood-card rounded-lg p-4 text-center transition-colors ${
            budget >= 15 ? 'hover:bg-green-800/30' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <span className="text-3xl block mb-1">🍜</span>
          <div className="font-title text-green-200 mb-1">进食</div>
          <div className="text-xs text-green-500">花费15💰 恢复30体力</div>
        </button>
      </div>
    </div>
  )
}

function MissionsTab({ missions, onComplete }: {
  missions: { id: string; title: string; description: string; difficulty: number; reward: number; rewardType: string; completed: boolean }[]; onComplete: (id: string) => void
}) {
  if (missions.length === 0) {
    return <div className="text-center text-green-600 py-12">本季暂无任务</div>
  }
  return (
    <div className="flex flex-col gap-3">
      {missions.map(m => (
        <div key={m.id} className={`wood-card rounded-lg p-4 ${m.completed ? 'opacity-50' : ''}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-title text-green-200 flex items-center gap-2">
                {m.title}
                <span className="flex gap-0.5">
                  {Array.from({ length: m.difficulty }, (_, i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  ))}
                </span>
              </h3>
              <p className="text-xs text-green-500 mt-1">{m.description}</p>
              <div className="text-xs text-yellow-400 mt-2">
                奖励: {m.rewardType === 'budget' ? '💰' : '⭐'} {m.reward}
              </div>
            </div>
            <button
              onClick={() => onComplete(m.id)}
              disabled={m.completed}
              className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
                m.completed
                  ? 'bg-gray-700 text-gray-500'
                  : 'btn-wood primary'
              }`}
            >
              {m.completed ? '已完成' : '完成'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
