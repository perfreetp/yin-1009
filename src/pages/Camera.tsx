import { useState } from 'react'
import { Camera, MapPin, Download, Image, Eye } from 'lucide-react'
import { useGameStore } from '@/stores/gameStore'
import { ANIMALS } from '@/data/gameData'

type Tab = 'deploy' | 'retrieve'

export default function CameraPage() {
  const [tab, setTab] = useState<Tab>('deploy')
  const { hexGrid, cameras, inventory, day, deployCamera, retrieveCamera, stats } = useGameStore()
  const cameraItem = inventory.find(e => e.id === 'ir_camera')
  const cameraCount = cameraItem?.quantity ?? 0
  const activeCameras = cameras.filter(c => !c.retrieved)
  const retrievedCameras = cameras.filter(c => c.retrieved)
  const totalPhotos = stats.totalPhotosTaken
  const speciesDetected = new Set(cameras.flatMap(c => c.photos.map(p => p.speciesId))).size

  const revealedCells = hexGrid.flat().filter(c => c.revealed && c.terrain !== 'camp')

  return (
    <div className="game-bg min-h-screen p-4 animate-fadeIn">
      <h1 className="font-title text-2xl text-amber-200 mb-4 flex items-center gap-2">
        <Camera className="w-6 h-6" /> 红外相机管理
      </h1>

      <div className="flex gap-2 mb-4">
        <button
          className={`btn-wood ${tab === 'deploy' ? 'primary' : ''}`}
          onClick={() => setTab('deploy')}
        >
          布设
        </button>
        <button
          className={`btn-wood ${tab === 'retrieve' ? 'primary' : ''}`}
          onClick={() => setTab('retrieve')}
        >
          回收
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="wood-card p-3 text-center">
          <div className="text-amber-400 text-xl font-bold">{cameras.length}</div>
          <div className="text-amber-200/60 text-sm">总相机</div>
        </div>
        <div className="wood-card p-3 text-center">
          <div className="text-amber-400 text-xl font-bold">{totalPhotos}</div>
          <div className="text-amber-200/60 text-sm">总照片</div>
        </div>
        <div className="wood-card p-3 text-center">
          <div className="text-amber-400 text-xl font-bold">{speciesDetected}</div>
          <div className="text-amber-200/60 text-sm">发现物种</div>
        </div>
      </div>

      {tab === 'deploy' && (
        <div className="animate-fadeIn">
          <div className="wood-card p-3 mb-3 flex items-center justify-between">
            <span className="text-amber-200">库存相机: <span className="text-amber-400 font-bold">{cameraCount}</span></span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {revealedCells.map(cell => {
              const hasCam = cameras.some(c => c.hexPos.q === cell.coord.q && c.hexPos.r === cell.coord.r && !c.retrieved)
              return (
                <button
                  key={`${cell.coord.q}-${cell.coord.r}`}
                  className={`wood-card p-2 text-center text-sm transition-all ${
                    hasCam ? 'opacity-50' : cameraCount > 0 ? 'hover:ring-2 hover:ring-amber-400 cursor-pointer' : 'opacity-30'
                  }`}
                  disabled={hasCam || cameraCount <= 0}
                  onClick={() => deployCamera({ q: cell.coord.q, r: cell.coord.r })}
                >
                  <MapPin className="w-4 h-4 mx-auto mb-1 text-amber-300" />
                  <div className="text-amber-200/80">{cell.terrain === 'forest' ? '林' : cell.terrain === 'mountain' ? '山' : cell.terrain === 'stream' ? '溪' : cell.terrain === 'meadow' ? '草' : '村'}</div>
                  <div className="text-amber-200/50 text-xs">({cell.coord.q},{cell.coord.r})</div>
                  {hasCam && <div className="text-green-400 text-xs mt-1">已布设</div>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'retrieve' && (
        <div className="animate-fadeIn space-y-3">
          {activeCameras.length === 0 && (
            <div className="wood-card p-4 text-center text-amber-200/50">没有已布设的相机</div>
          )}
          {activeCameras.map(cam => {
            const cell = hexGrid[cam.hexPos.r]?.[cam.hexPos.q]
            return (
              <div key={cam.id} className="wood-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-200">
                      位置 ({cam.hexPos.q},{cam.hexPos.r}) · {cell?.terrain ?? '未知'}
                    </span>
                  </div>
                  <button className="btn-wood primary text-sm" onClick={() => retrieveCamera(cam.id)}>
                    <Download className="w-3 h-3 inline mr-1" /> 回收
                  </button>
                </div>
                <div className="text-amber-200/60 text-sm">
                  布设天数: {day - cam.deployDay} · 已拍照片: {cam.photos.length}
                </div>
              </div>
            )
          })}

          {retrievedCameras.length > 0 && (
            <div className="mt-4">
              <h3 className="font-title text-lg text-amber-300 mb-2">已回收照片</h3>
              <div className="space-y-2">
                {retrievedCameras.flatMap(cam =>
                  cam.photos.map((photo, i) => {
                    const animal = ANIMALS.find(a => a.id === photo.speciesId)
                    return (
                      <div key={`${cam.id}-${i}`} className="wood-card p-2 flex items-center gap-2">
                        <Image className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-200 flex-1">{animal?.name ?? photo.speciesId}</span>
                        <span className="text-amber-200/50 text-xs">品质 {Math.round(photo.quality * 100)}%</span>
                        <Eye className="w-3 h-3 text-amber-300" />
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
