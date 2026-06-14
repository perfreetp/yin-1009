import { useState } from 'react'
import { Camera, MapPin, Download, Image, Eye, CheckCircle, AlertTriangle, TrendingUp, Clock } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { ANIMALS, TERRAIN_DATA } from '@/data/gameData'

type Tab = 'deploy' | 'retrieve'

const SEASON_LABELS: Record<string, { label: string; color: string }> = {
  spring: { label: '春', color: '#86efac' },
  summer: { label: '夏', color: '#fbbf24' },
  autumn: { label: '秋', color: '#fb923c' },
  winter: { label: '冬', color: '#93c5fd' },
}

export default function CameraPage() {
  const [tab, setTab] = useState<Tab>('deploy')
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

  const {
    hexGrid, cameras, inventory, day, deployCamera, retrieveCamera, stats, animalCodex
  } = useGameStore()

  const cameraItem = inventory.find(e => e.id === 'ir_camera')
  const cameraCount = cameraItem?.quantity ?? 0
  const activeCameras = cameras.filter(c => !c.retrieved)
  const retrievedCameras = cameras.filter(c => c.retrieved)
  const totalPhotos = stats.totalPhotosTaken
  const identifiedSpecies = animalCodex.filter(c => c.identified).length

  const allPhotos = retrievedCameras.flatMap(cam =>
    cam.photos.map(p => ({ ...p, camId: cam.id }))
  )

  const speciesPhotosMap: Record<string, number> = {}
  allPhotos.forEach(p => {
    speciesPhotosMap[p.speciesId] = (speciesPhotosMap[p.speciesId] || 0) + 1
  })
  const speciesInPhotos = Object.keys(speciesPhotosMap).length

  const revealedCells = hexGrid.flat().filter(c => c.revealed && c.terrain !== 'camp')

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleDeploy = (coord: { q: number; r: number }) => {
    if (cameraCount <= 0) {
      showToast('❌ 没有可用的红外相机，请先到营地商店购买', 'error')
      return
    }
    deployCamera(coord)
    const cell = hexGrid[coord.r]?.[coord.q]
    showToast(`📷 相机成功布设于 (${coord.q},${coord.r}) ${cell?.terrain || ''} 区域`, 'success')
  }

  const handleRetrieve = (camId: string) => {
    const cam = cameras.find(c => c.id === camId)
    if (!cam) return
    const daysDeployed = day - cam.deployDay
    if (daysDeployed < 1) {
      showToast('⚠ 相机布设不足 1 天，照片数据尚未积累。建议至少等待 1 天后再回收', 'error')
      return
    }
    const beforePhotos = stats.totalPhotosTaken
    const beforeIdentified = animalCodex.filter(a => a.identified).length
    retrieveCamera(camId)

    setTimeout(() => {
      const state = useGameStore.getState()
      const camAfter = state.cameras.find(c => c.id === camId)
      const newPhotos = camAfter?.photos.length || 0
      const newIdentified = state.animalCodex.filter(a => a.identified).length
      const addedIdentified = newIdentified - beforeIdentified
      if (newPhotos > 0) {
        showToast(
          `🎉 回收成功！获得 ${newPhotos} 张照片${addedIdentified > 0 ? `，发现 ${addedIdentified} 个新物种` : ''}`,
          'success'
        )
      } else {
        showToast('📷 相机已回收，此次没有拍到有效照片，可换地形再次尝试', 'info')
      }
    }, 50)
  }

  return (
    <div className="game-bg min-h-screen p-4 animate-fadeIn">
      <h1 className="font-title text-2xl text-amber-200 mb-4 flex items-center gap-2">
        <Camera className="w-6 h-6 text-cyan-400" /> 红外相机管理中心
      </h1>

      {toast && (
        <div className={`mb-4 px-4 py-3 rounded wood-card flex items-center gap-2 animate-fadeIn
          ${toast.type === 'success' ? 'border-green-700/60 text-green-300' : ''}
          ${toast.type === 'error' ? 'border-red-700/60 text-red-300' : ''}
          ${toast.type === 'info' ? 'border-blue-700/60 text-blue-300' : ''}
        `}>
          {toast.type === 'success' && <CheckCircle size={16} />}
          {toast.type === 'error' && <AlertTriangle size={16} />}
          {toast.text}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="wood-card p-3 flex items-center gap-2">
          <Camera className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-xs text-gray-400">在役相机</div>
            <div className="text-xl text-cyan-300 font-bold">{activeCameras.length}</div>
          </div>
        </div>
        <div className="wood-card p-3 flex items-center gap-2">
          <Image className="w-5 h-5 text-purple-400" />
          <div>
            <div className="text-xs text-gray-400">照片总数</div>
            <div className="text-xl text-purple-300 font-bold">{totalPhotos}</div>
          </div>
        </div>
        <div className="wood-card p-3 flex items-center gap-2">
          <Eye className="w-5 h-5 text-green-400" />
          <div>
            <div className="text-xs text-gray-400">物种出镜</div>
            <div className="text-xl text-green-300 font-bold">{speciesInPhotos}</div>
          </div>
        </div>
        <div className="wood-card p-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-xs text-gray-400">图鉴收录</div>
            <div className="text-xl text-amber-300 font-bold">{identifiedSpecies}/{ANIMALS.length}</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          className={`btn-wood ${tab === 'deploy' ? 'primary' : ''} flex items-center gap-1`}
          onClick={() => setTab('deploy')}
        >
          📡 布设相机 ({cameraCount}台可用)
        </button>
        <button
          className={`btn-wood ${tab === 'retrieve' ? 'primary' : ''} flex items-center gap-1`}
          onClick={() => setTab('retrieve')}
        >
          📦 回收·照片墙 ({allPhotos.length}张)
        </button>
      </div>

      {tab === 'deploy' && (
        <div className="animate-fadeIn">
          <div className="wood-card p-3 mb-3 flex items-center justify-between">
            <span className="text-amber-200 text-sm">
              📦 库存: <span className="text-amber-400 font-bold text-lg">{cameraCount}</span> 台红外相机
            </span>
            <span className="text-xs text-gray-500">💡 优先选择森林、溪流、草甸等动物活动频繁的地形</span>
          </div>

          {revealedCells.length === 0 ? (
            <div className="wood-card p-6 text-center text-amber-200/50">
              <div className="text-4xl mb-2">🗺️</div>
              <p>还没有已探索区域，无法布设相机</p>
              <p className="text-xs mt-1 text-gray-500">请先完成巡护，探索更多区域后再布设</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {revealedCells.map(cell => {
                const hasCam = cameras.some(c => c.hexPos.q === cell.coord.q && c.hexPos.r === cell.coord.r && !c.retrieved)
                const terrainData = TERRAIN_DATA[cell.terrain]
                return (
                  <button
                    key={`${cell.coord.q}-${cell.coord.r}`}
                    className={`wood-card p-2 text-center text-sm transition-all
                      ${hasCam ? 'ring-2 ring-green-500/40 opacity-70' : ''}
                      ${!hasCam && cameraCount > 0 ? 'hover:ring-2 hover:ring-amber-400 hover:-translate-y-0.5 cursor-pointer' : ''}
                      ${!hasCam && cameraCount <= 0 ? 'opacity-30 cursor-not-allowed' : ''}
                    `}
                    disabled={hasCam || cameraCount <= 0}
                    onClick={() => handleDeploy({ q: cell.coord.q, r: cell.coord.r })}
                  >
                    <div className="text-3xl mb-1">{terrainData?.icon || '🏞️'}</div>
                    <div className="text-xs text-gray-500 mb-0.5">({cell.coord.q},{cell.coord.r})</div>
                    <div className="text-amber-200/70 text-xs">
                      {terrainData?.name || cell.terrain}
                    </div>
                    {hasCam ? (
                      <div className="mt-1 text-green-400 text-xs flex items-center justify-center gap-0.5">
                        <CheckCircle size={10} /> 已布设
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-amber-300/40">布设</div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'retrieve' && (
        <div className="animate-fadeIn space-y-4">
          {activeCameras.length > 0 && (
            <div>
              <h3 className="font-title text-lg text-amber-300 mb-2 flex items-center gap-1">
                <Clock size={16} /> 在役相机 ({activeCameras.length}台)
              </h3>
              <div className="space-y-2">
                {activeCameras.map(cam => {
                  const cell = hexGrid[cam.hexPos.r]?.[cam.hexPos.q]
                  const terrainData = cell ? TERRAIN_DATA[cell.terrain] : null
                  const daysDeployed = day - cam.deployDay
                  const canRetrieve = daysDeployed >= 1
                  return (
                    <div key={cam.id} className="wood-card p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="text-2xl">{terrainData?.icon || '📷'}</div>
                          <div>
                            <div className="text-amber-200 text-sm">
                              {terrainData?.name || '未知地形'} · 位置 ({cam.hexPos.q},{cam.hexPos.r})
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-2">
                              <span>第 {cam.deployDay} 天布设 · 已运行 {daysDeployed} 天</span>
                              {!canRetrieve && (
                                <span className="text-red-400 flex items-center gap-0.5">
                                  <AlertTriangle size={10} /> 数据积累中...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          className={`btn-wood ${canRetrieve ? 'primary' : ''} text-sm flex items-center gap-1 ${!canRetrieve ? 'opacity-40' : ''}`}
                          disabled={!canRetrieve}
                          onClick={() => handleRetrieve(cam.id)}
                        >
                          <Download className="w-3 h-3" /> 回收
                        </button>
                      </div>
                      <div className="w-full bg-black/30 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500
                            ${daysDeployed >= 3 ? 'bg-green-400' : daysDeployed >= 1 ? 'bg-yellow-400' : 'bg-red-400/60'}
                          `}
                          style={{ width: `${Math.min(100, daysDeployed * 30)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {daysDeployed === 0 && '至少等待 1 天'}
                        {daysDeployed >= 1 && daysDeployed < 3 && '建议再运行 2 天获得更多照片'}
                        {daysDeployed >= 3 && '✅ 数据充足，可随时回收'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-title text-lg text-amber-300 mb-2 flex items-center gap-1">
              <Image size={18} /> 照片墙 ({allPhotos.length}张)
            </h3>

            {allPhotos.length === 0 ? (
              <div className="wood-card p-6 text-center text-amber-200/50">
                <div className="text-4xl mb-2">📷</div>
                <p>还没有拍摄到任何照片</p>
                <p className="text-xs mt-1 text-gray-500">
                  布设相机后等待 1 天以上再回收，溪流、森林、草甸区域更易拍到动物
                </p>
              </div>
            ) : (
              <div>
                <div className="wood-card p-3 mb-3">
                  <div className="text-xs text-gray-400 mb-2">📊 本次拍摄物种频次：</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(speciesPhotosMap).map(([spId, cnt]) => {
                      const animal = ANIMALS.find(a => a.id === spId)
                      return (
                        <div key={spId} className="px-2 py-1 rounded bg-black/40 text-xs flex items-center gap-1">
                          <span className="text-lg">{animal?.icon || '🐾'}</span>
                          <span className="text-amber-200">{animal?.name || spId}</span>
                          <span className="text-cyan-400 font-bold">×{cnt}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {allPhotos.map((photo, i) => {
                    const animal = ANIMALS.find(a => a.id === photo.speciesId)
                    const seasonInfo = photo.season ? SEASON_LABELS[photo.season] : null
                    const qualityColor = photo.quality >= 0.75 ? '#4ade80' : photo.quality >= 0.5 ? '#fbbf24' : '#f87171'
                    return (
                      <div key={`${photo.camId}-${i}`} className="wood-card p-2 overflow-hidden">
                        <div
                          className="aspect-square rounded mb-2 flex items-center justify-center relative overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, #1a1a1a, ${photo.quality >= 0.75 ? '#064e3b' : photo.quality >= 0.5 ? '#78350f' : '#7f1d1d'})`,
                          }}
                        >
                          <div className="text-6xl opacity-90" style={{ filter: `brightness(${0.6 + photo.quality * 0.5})` }}>
                            {animal?.icon || '🐾'}
                          </div>
                          {seasonInfo && (
                            <div
                              className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                              style={{ backgroundColor: `${seasonInfo.color}20`, color: seasonInfo.color }}
                            >
                              {seasonInfo.label}
                            </div>
                          )}
                          <div
                            className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5"
                            style={{ backgroundColor: `${qualityColor}20`, color: qualityColor }}
                          >
                            {Math.round(photo.quality * 100)}%
                          </div>
                        </div>
                        <div className="text-amber-200 text-sm font-bold flex items-center gap-1">
                          <span>{animal?.icon}</span>
                          {animal?.name || '未知物种'}
                        </div>
                        <div className="text-xs text-gray-500">第 {photo.day} 天拍摄</div>
                      </div>
                    )
                  }).reverse()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
