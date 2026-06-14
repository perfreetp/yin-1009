import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TreePine, Play, RotateCcw, Leaf } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'

interface LeafParticle {
  id: number
  x: number
  delay: number
  duration: number
  size: number
  sway: number
}

export default function MainMenu() {
  const navigate = useNavigate()
  const { initialized, startNewGame, setScreen } = useGameStore()
  const [particles, setParticles] = useState<LeafParticle[]>([])
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const leaves: LeafParticle[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
      size: 8 + Math.random() * 12,
      sway: 20 + Math.random() * 40,
    }))
    setParticles(leaves)
    setTimeout(() => setShowContent(true), 300)
  }, [])

  const handleNewGame = () => {
    startNewGame()
    navigate('/camp')
  }

  const handleContinue = () => {
    setScreen('camp')
    navigate('/camp')
  }

  return (
    <div className="relative min-h-screen overflow-hidden game-bg flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1a0a] via-[#0d2818] to-[#051005]" />

      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(ellipse 2px 2px at 20% 30%, rgba(74,222,128,0.4), transparent), radial-gradient(ellipse 2px 2px at 60% 20%, rgba(74,222,128,0.3), transparent), radial-gradient(ellipse 3px 3px at 80% 60%, rgba(74,222,128,0.2), transparent), radial-gradient(ellipse 2px 2px at 40% 70%, rgba(74,222,128,0.3), transparent)',
          }}
        />
      </div>

      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute text-green-600/40 pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            animation: `leafFall ${p.duration}s ${p.delay}s linear infinite`,
            fontSize: `${p.size}px`,
            ['--sway' as string]: `${p.sway}px`,
          }}
        >
          🍃
        </div>
      ))}

      <div className="absolute bottom-0 left-0 right-0 h-40 opacity-30">
        <svg viewBox="0 0 1440 200" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,200 L0,120 Q60,40 120,100 Q160,50 200,90 Q240,30 280,80 Q320,50 360,100 Q400,40 440,90 Q480,60 520,110 Q560,30 600,80 Q640,50 680,100 Q720,20 760,70 Q800,40 840,90 Q880,30 920,80 Q960,50 1000,100 Q1040,40 1080,90 Q1120,60 1160,110 Q1200,30 1240,80 Q1280,50 1320,100 Q1360,40 1400,90 L1440,80 L1440,200 Z"
            fill="#0a2a0a" />
          <path d="M0,200 L0,140 Q80,80 160,130 Q240,70 320,120 Q400,80 480,130 Q560,60 640,110 Q720,80 800,130 Q880,70 960,120 Q1040,80 1120,130 Q1200,60 1280,110 Q1360,80 1440,120 L1440,200 Z"
            fill="#061a06" />
        </svg>
      </div>

      <div className="absolute top-8 left-8 text-4xl opacity-20 animate-pulse select-none">🐼</div>
      <div className="absolute top-20 right-12 text-3xl opacity-15 animate-pulse select-none" style={{ animationDelay: '1s' }}>🐵</div>
      <div className="absolute bottom-32 left-16 text-4xl opacity-15 animate-pulse select-none" style={{ animationDelay: '2s' }}>🐆</div>
      <div className="absolute bottom-48 right-20 text-2xl opacity-10 animate-pulse select-none" style={{ animationDelay: '0.5s' }}>🦝</div>
      <div className="absolute top-40 left-1/4 text-2xl opacity-10 animate-pulse select-none" style={{ animationDelay: '1.5s' }}>🐍</div>

      <div className={`relative z-10 text-center px-4 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="mb-6">
          <TreePine className="mx-auto w-16 h-16 text-green-500/60" />
        </div>

        <h1 className="text-6xl md:text-7xl font-serif font-bold glow-text text-green-100 mb-4 tracking-wider">
          森林巡护员
        </h1>

        <p className="text-xl md:text-2xl text-green-300/70 font-title mb-8 tracking-widest">
          守护野生动物廊道
        </p>

        <div className="max-w-md mx-auto mb-10">
          <p className="text-sm text-green-400/50 leading-relaxed">
            在秦岭深处的保护区，你将作为一名巡护员，穿越密林山野，追踪珍稀动物的足迹，拆除盗猎者的陷阱，调解人兽冲突，守护这条生命连接的廊道
          </p>
        </div>

        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={handleNewGame}
            className="btn-wood primary flex items-center gap-3 px-8 py-3 text-lg w-56 justify-center"
          >
            <Play className="w-5 h-5" />
            开始巡护
          </button>

          {initialized && (
            <button
              onClick={handleContinue}
              className="btn-wood flex items-center gap-3 px-8 py-3 text-lg w-56 justify-center animate-fadeIn"
            >
              <RotateCcw className="w-5 h-5" />
              继续巡护
            </button>
          )}
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-green-600/30 text-xs">
          <Leaf className="w-3 h-3" />
          <span>每一次巡护，都是对生命的守护</span>
          <Leaf className="w-3 h-3" />
        </div>
      </div>

      <style>{`
        @keyframes leafFall {
          0% {
            transform: translateY(-20px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(100vh) translateX(var(--sway)) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
