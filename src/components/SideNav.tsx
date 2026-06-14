import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Tent, Route, Footprints, Camera, HeartPulse, ShieldAlert,
  Handshake, Trophy, BookOpen, ScrollText, Medal, Menu, X,
} from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { SEASON_COLORS } from '@/data/gameData'
import type { Season } from '@/types/game'

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { path: '/camp', label: '营地', icon: <Tent size={18} /> },
  { path: '/route', label: '路线', icon: <Route size={18} /> },
  { path: '/patrol', label: '巡护', icon: <Footprints size={18} /> },
  { path: '/camera', label: '相机', icon: <Camera size={18} /> },
  { path: '/rescue', label: '救助', icon: <HeartPulse size={18} /> },
  { path: '/poacher', label: '盗猎', icon: <ShieldAlert size={18} /> },
  { path: '/negotiate', label: '协商', icon: <Handshake size={18} /> },
  { path: '/rating', label: '评级', icon: <Trophy size={18} /> },
  { path: '/codex', label: '图鉴', icon: <BookOpen size={18} /> },
  { path: '/journal', label: '日志', icon: <ScrollText size={18} /> },
  { path: '/achievements', label: '成就', icon: <Medal size={18} /> },
]

export default function SideNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const season = useGameStore((s) => s.season)
  const setScreen = useGameStore((s) => s.setScreen)
  const [mobileOpen, setMobileOpen] = useState(false)

  const accent = SEASON_COLORS[season as Season].accent

  return (
    <>
      <button
        className="md:hidden fixed top-2 left-2 z-50 btn-wood p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <nav
        className={`
          wood-border flex flex-col gap-1 p-2 overflow-y-auto scrollbar-thin
          md:w-28 md:relative md:translate-x-0
          fixed top-0 left-0 h-full z-40 w-52 transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ background: 'rgba(13, 26, 8, 0.95)' }}
      >
        <div className="hidden md:block font-title text-center text-sm glow-text py-2 mb-1">
          🌲 护林站
        </div>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path)
                setScreen(item.path.slice(1))
                setMobileOpen(false)
              }}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200
                md:flex-col md:gap-0.5 md:py-1.5
                ${active
                  ? 'font-bold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }
              `}
              style={active ? { color: accent, background: `${accent}15` } : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
