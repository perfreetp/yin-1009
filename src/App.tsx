import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useGameStore } from "@/stores/gameStore"
import GameLayout from "@/components/GameLayout"
import MainMenu from "@/pages/MainMenu"
import Camp from "@/pages/Camp"
import RouteSelect from "@/pages/RouteSelect"
import Patrol from "@/pages/Patrol"
import Camera from "@/pages/Camera"
import Rescue from "@/pages/Rescue"
import Poacher from "@/pages/Poacher"
import Negotiate from "@/pages/Negotiate"
import Rating from "@/pages/Rating"
import Codex from "@/pages/Codex"
import Journal from "@/pages/Journal"
import Achievements from "@/pages/Achievements"

function GameRoutes() {
  const gamePhase = useGameStore(s => s.gamePhase)

  if (gamePhase === 'menu') {
    return <MainMenu />
  }

  return (
    <GameLayout>
      <Routes>
        <Route path="/" element={<Camp />} />
        <Route path="/camp" element={<Camp />} />
        <Route path="/route" element={<RouteSelect />} />
        <Route path="/patrol" element={<Patrol />} />
        <Route path="/camera" element={<Camera />} />
        <Route path="/rescue" element={<Rescue />} />
        <Route path="/poacher" element={<Poacher />} />
        <Route path="/negotiate" element={<Negotiate />} />
        <Route path="/rating" element={<Rating />} />
        <Route path="/codex" element={<Codex />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </GameLayout>
  )
}

export default function App() {
  return (
    <Router>
      <div className="game-bg w-full h-full">
        <GameRoutes />
      </div>
    </Router>
  )
}
