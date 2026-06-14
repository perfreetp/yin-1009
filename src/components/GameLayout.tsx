import { ReactNode } from 'react'
import { useGameStore } from '@/stores/gameStore'
import StatusBar from '@/components/StatusBar'
import SideNav from '@/components/SideNav'
import SeasonalEffect from '@/components/SeasonalEffect'

interface GameLayoutProps {
  children: ReactNode
}

export default function GameLayout({ children }: GameLayoutProps) {
  const season = useGameStore((s) => s.season)
  const gamePhase = useGameStore((s) => s.gamePhase)

  if (gamePhase === 'menu') {
    return (
      <div className="game-bg min-h-screen flex items-center justify-center">
        {children}
      </div>
    )
  }

  return (
    <div className={`game-bg season-${season} min-h-screen flex flex-col`}>
      <SeasonalEffect season={season} />
      <header className="relative z-10">
        <StatusBar />
      </header>
      <div className="flex flex-1 overflow-hidden relative z-10">
        <SideNav />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6 animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  )
}
