import type { AnimalSpecies, Equipment, Achievement, Season, TerrainType, Mission, PoacherCase } from '@/types/game'

export const ANIMALS: AnimalSpecies[] = [
  { id: 'giant_panda', name: '大熊猫', category: 'mammal', rarity: 'rare', seasons: ['spring', 'summer', 'autumn'], terrains: ['forest', 'mountain'], footprintDesc: '圆形5趾，爪痕明显', description: '国宝级物种，以竹子为主食，是廊道保护的旗舰物种', icon: '🐼' },
  { id: 'golden_monkey', name: '川金丝猴', category: 'mammal', rarity: 'rare', seasons: ['spring', 'summer'], terrains: ['forest'], footprintDesc: '细长指痕，拇指分离', description: '群居灵长类，金色毛发闪耀如阳光，是高山森林的精灵', icon: '🐵' },
  { id: 'red_panda', name: '小熊猫', category: 'mammal', rarity: 'uncommon', seasons: ['spring', 'summer', 'autumn'], terrains: ['forest', 'mountain'], footprintDesc: '小型5趾，爪痕弯曲', description: '外形可爱的攀爬高手，红棕色皮毛在林间格外醒目', icon: '🦝' },
  { id: 'takin', name: '羚牛', category: 'mammal', rarity: 'uncommon', seasons: ['spring', 'summer', 'autumn', 'winter'], terrains: ['mountain', 'meadow'], footprintDesc: '大型偶蹄，双趾印记', description: '体型壮硕的山地巨兽，被称为"六不像"', icon: '🐃' },
  { id: 'golden_pheasant', name: '红腹锦鸡', category: 'bird', rarity: 'common', seasons: ['spring', 'summer'], terrains: ['meadow', 'forest'], footprintDesc: '三趾前行，细长爪痕', description: '羽色华丽的雉类，雄鸟展翅如火焰', icon: '🐔' },
  { id: 'giant_salamander', name: '大鲵', category: 'amphibian', rarity: 'uncommon', seasons: ['spring', 'summer'], terrains: ['stream'], footprintDesc: '蹼状四趾，拖尾痕迹', description: '世界最大的两栖动物，被称为"活化石"', icon: '🦎' },
  { id: 'leopard', name: '金钱豹', category: 'mammal', rarity: 'rare', seasons: ['spring', 'summer', 'autumn', 'winter'], terrains: ['forest', 'mountain'], footprintDesc: '大型猫科，无爪痕，梅花掌印', description: '森林之王的影子，孤独的顶级捕食者', icon: '🐆' },
  { id: 'serow', name: '鬣羚', category: 'mammal', rarity: 'uncommon', seasons: ['spring', 'autumn', 'winter'], terrains: ['mountain', 'forest'], footprintDesc: '中型偶蹄，蹄痕深且窄', description: '悬崖峭壁上的独行侠，被称为"四不像"', icon: '🐐' },
  { id: 'temmincks_tragopan', name: '红腹角雉', category: 'bird', rarity: 'uncommon', seasons: ['spring', 'summer'], terrains: ['forest', 'mountain'], footprintDesc: '三趾后留，爪痕深', description: '面部长着肉角的奇特雉类', icon: '🦃' },
  { id: 'macaque', name: '猕猴', category: 'mammal', rarity: 'common', seasons: ['spring', 'summer', 'autumn', 'winter'], terrains: ['forest', 'meadow'], footprintDesc: '灵长指痕，五趾分明', description: '山林中最常见灵长类，群体活动', icon: '🐒' },
  { id: 'civet', name: '大灵猫', category: 'mammal', rarity: 'uncommon', seasons: ['spring', 'summer', 'autumn'], terrains: ['forest', 'stream'], footprintDesc: '小型5趾，爪痕半缩', description: '夜行性灵猫科动物，分泌珍贵灵猫香', icon: '🐱' },
  { id: 'king_cobra', name: '眼镜王蛇', category: 'reptile', rarity: 'rare', seasons: ['summer'], terrains: ['forest', 'stream'], footprintDesc: 'S形滑行痕迹，无足印', description: '世界最长毒蛇，森林食物链顶端', icon: '🐍' },
]

export const EQUIPMENT: Equipment[] = [
  { id: 'binoculars', name: '望远镜', price: 200, weight: 1, effect: '足迹识别成功率+20%', effectValue: 20, effectType: 'identify', description: '专业观鸟望远镜，远距离观察动物', icon: '🔭' },
  { id: 'first_aid', name: '急救包', price: 150, weight: 1, effect: '治疗成功率+15%', effectValue: 15, effectType: 'treat', description: '包含绷带、消毒液等基础急救用品', icon: '🩹' },
  { id: 'gps', name: 'GPS定位仪', price: 300, weight: 1, effect: '迷雾揭示范围+1', effectValue: 1, effectType: 'explore', description: '卫星定位系统，扩大探索视野', icon: '📡' },
  { id: 'sample_kit', name: '采样工具套装', price: 250, weight: 2, effect: '样本采集成功率+25%', effectValue: 25, effectType: 'sample', description: '采样袋、镊子、标签等专业采样工具', icon: '🧪' },
  { id: 'ir_camera', name: '红外相机', price: 500, weight: 2, effect: '可布设红外相机', effectValue: 1, effectType: 'camera', description: '红外触发相机，自动拍摄经过的动物', icon: '📷' },
  { id: 'storm_gear', name: '防护服', price: 400, weight: 2, effect: '暴风雪伤害-50%', effectValue: 50, effectType: 'storm', description: '防水防寒的专业巡护防护装备', icon: '🧥' },
  { id: 'wire_cutter', name: '铁剪', price: 180, weight: 1, effect: '陷阱拆除成功率+20%', effectValue: 20, effectType: 'trap', description: '强力铁丝剪，快速拆除钢丝套', icon: '✂️' },
  { id: 'radio', name: '对讲机', price: 350, weight: 1, effect: '村民协商选项+1', effectValue: 1, effectType: 'negotiate', description: '远程通讯设备，方便协调各方', icon: '📟' },
]

export const RARITY_LABELS: Record<string, string> = {
  common: '常见',
  uncommon: '较稀有',
  rare: '稀有',
  legendary: '传说',
}

export const RARITY_COLORS: Record<string, string> = {
  common: '#9CA3AF',
  uncommon: '#34D399',
  rare: '#F59E0B',
  legendary: '#EF4444',
}

export const SEASON_LABELS: Record<Season, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
}

export const SEASON_COLORS: Record<Season, { bg: string; text: string; accent: string }> = {
  spring: { bg: '#1a3a1a', text: '#7dc97d', accent: '#4ade80' },
  summer: { bg: '#1a2a0a', text: '#a3d977', accent: '#84cc16' },
  autumn: { bg: '#2a1a0a', text: '#d4a357', accent: '#f59e0b' },
  winter: { bg: '#0a1a2a', text: '#93c5fd', accent: '#60a5fa' },
}

export const TERRAIN_DATA: Record<TerrainType, { name: string; staminaCost: number; eventRate: number; color: string; icon: string }> = {
  forest: { name: '密林', staminaCost: 2, eventRate: 0.7, color: '#1a4a1a', icon: '🌲' },
  mountain: { name: '山地', staminaCost: 3, eventRate: 0.5, color: '#6b5b3a', icon: '⛰️' },
  stream: { name: '溪流', staminaCost: 2, eventRate: 0.5, color: '#3a6a8a', icon: '🏞️' },
  meadow: { name: '草甸', staminaCost: 1, eventRate: 0.6, color: '#4a7a2a', icon: '🌿' },
  village: { name: '村落', staminaCost: 1, eventRate: 0.3, color: '#8a7a5a', icon: '🏘️' },
  camp: { name: '营地', staminaCost: 0, eventRate: 0, color: '#5a4a2a', icon: '⛺' },
}

export const WEATHER_DATA: Record<string, { name: string; icon: string; staminaMod: number; eventMod: number; danger: boolean }> = {
  sunny: { name: '晴', icon: '☀️', staminaMod: 1.0, eventMod: 1.0, danger: false },
  cloudy: { name: '阴', icon: '☁️', staminaMod: 1.0, eventMod: 1.1, danger: false },
  rainy: { name: '雨', icon: '🌧️', staminaMod: 1.2, eventMod: 0.9, danger: false },
  snowy: { name: '雪', icon: '❄️', staminaMod: 1.3, eventMod: 0.7, danger: false },
  storm: { name: '暴风', icon: '⛈️', staminaMod: 1.5, eventMod: 0.5, danger: true },
}

export const SEASON_WEATHER: Record<Season, { weather: string; weight: number }[]> = {
  spring: [
    { weather: 'sunny', weight: 40 },
    { weather: 'cloudy', weight: 30 },
    { weather: 'rainy', weight: 25 },
    { weather: 'storm', weight: 5 },
  ],
  summer: [
    { weather: 'sunny', weight: 50 },
    { weather: 'cloudy', weight: 20 },
    { weather: 'rainy', weight: 20 },
    { weather: 'storm', weight: 10 },
  ],
  autumn: [
    { weather: 'sunny', weight: 35 },
    { weather: 'cloudy', weight: 30 },
    { weather: 'rainy', weight: 25 },
    { weather: 'storm', weight: 10 },
  ],
  winter: [
    { weather: 'sunny', weight: 20 },
    { weather: 'cloudy', weight: 25 },
    { weather: 'snowy', weight: 35 },
    { weather: 'storm', weight: 20 },
  ],
}

export const MISSIONS: Mission[] = [
  { id: 'spring_survey', title: '春季物种调查', description: '在密林中调查至少3种动物的足迹', season: 'spring', type: 'patrol', difficulty: 1, reward: 300, rewardType: 'budget', completed: false, requiredTerrain: 'forest' },
  { id: 'spring_camera', title: '廊道监测部署', description: '在廊道关键区域布设2台红外相机', season: 'spring', type: 'camera', difficulty: 2, reward: 200, rewardType: 'budget', completed: false },
  { id: 'summer_rescue', title: '夏季幼崽救助', description: '救助一只受伤的野生动物幼崽', season: 'summer', type: 'rescue', difficulty: 2, reward: 400, rewardType: 'reputation', completed: false },
  { id: 'summer_anti_poach', title: '盗猎排查行动', description: '发现并拆除至少3个盗猎陷阱', season: 'summer', type: 'investigate', difficulty: 3, reward: 500, rewardType: 'budget', completed: false },
  { id: 'autumn_migration', title: '秋季迁徙监测', description: '记录5种动物秋季迁徙数据', season: 'autumn', type: 'patrol', difficulty: 2, reward: 350, rewardType: 'reputation', completed: false },
  { id: 'autumn_negotiate', title: '秋收冲突调解', description: '调解村民与野生动物的秋收冲突', season: 'autumn', type: 'negotiate', difficulty: 2, reward: 300, rewardType: 'reputation', completed: false, requiredTerrain: 'village' },
  { id: 'winter_survival', title: '冬季生存调查', description: '在恶劣天气中完成一次完整巡护', season: 'winter', type: 'patrol', difficulty: 3, reward: 600, rewardType: 'budget', completed: false },
  { id: 'winter_rescue', title: '雪地救援', description: '在雪地中发现并救助被困动物', season: 'winter', type: 'rescue', difficulty: 3, reward: 500, rewardType: 'reputation', completed: false },
]

export const POACHER_CASES: PoacherCase[] = [
  { id: 'poacher_1', name: '竹林盗猎团伙', clueIds: ['clue_1a', 'clue_1b', 'clue_1c', 'clue_1d'], solved: false, description: '有人在保护区竹林深处布设大量钢丝套捕猎大熊猫' },
  { id: 'poacher_2', name: '溪流偷猎者', clueIds: ['clue_2a', 'clue_2b', 'clue_2c'], solved: false, description: '溪流下游发现非法捕猎工具，疑似针对水生动物' },
]

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_patrol', name: '初出茅庐', description: '完成第一次巡护', icon: '🥾', category: 'patrol', condition: 'totalPatrols >= 1', unlocked: false, progress: 0, target: 1 },
  { id: 'patrol_10', name: '巡山老手', description: '完成10次巡护', icon: '🗺️', category: 'patrol', condition: 'totalPatrols >= 10', unlocked: false, progress: 0, target: 10 },
  { id: 'first_rescue', name: '仁心初现', description: '救助第一只动物', icon: '💝', category: 'rescue', condition: 'animalsRescued >= 1', unlocked: false, progress: 0, target: 1 },
  { id: 'rescue_5', name: '生命守护者', description: '救助5只动物', icon: '🌟', category: 'rescue', condition: 'animalsRescued >= 5', unlocked: false, progress: 0, target: 5 },
  { id: 'first_trap', name: '拆弹专家', description: '拆除第一个陷阱', icon: '🔧', category: 'anti_poaching', condition: 'trapsRemoved >= 1', unlocked: false, progress: 0, target: 1 },
  { id: 'trap_10', name: '扫雷英雄', description: '拆除10个陷阱', icon: '🛡️', category: 'anti_poaching', condition: 'trapsRemoved >= 10', unlocked: false, progress: 0, target: 10 },
  { id: 'species_3', name: '博物学徒', description: '识别3种动物', icon: '📖', category: 'animal', condition: 'speciesIdentified >= 3', unlocked: false, progress: 0, target: 3 },
  { id: 'species_all', name: '图鉴大师', description: '识别所有动物', icon: '🏆', category: 'animal', condition: 'speciesIdentified >= 12', unlocked: false, progress: 0, target: 12 },
  { id: 'negotiate_1', name: '沟通桥梁', description: '完成第一次村民协商', icon: '🤝', category: 'diplomacy', condition: 'negotiationsCompleted >= 1', unlocked: false, progress: 0, target: 1 },
  { id: 'negotiate_5', name: '外交大使', description: '完成5次村民协商', icon: '🕊️', category: 'diplomacy', condition: 'negotiationsCompleted >= 5', unlocked: false, progress: 0, target: 5 },
  { id: 'camera_master', name: '生态摄影师', description: '拍摄50张动物照片', icon: '📸', category: 'collection', condition: 'totalPhotosTaken >= 50', unlocked: false, progress: 0, target: 50 },
  { id: 'all_seasons', name: '四季轮转', description: '经历完整的一年四季', icon: '🔄', category: 'patrol', condition: 'completedYear >= 1', unlocked: false, progress: 0, target: 1 },
]

export const NEGOTIATION_EVENTS = [
  {
    id: 'neg_crop',
    title: '庄稼受损',
    description: '野猪群夜间闯入农田，糟蹋了大片玉米地，村民们损失惨重，要求赔偿并捕杀野猪。',
    villagerName: '王大叔',
    conflictType: 'crop_damage' as const,
    stanceOptions: ['empathetic' as const, 'pragmatic' as const, 'educational' as const],
  },
  {
    id: 'neg_livestock',
    title: '牲畜遇袭',
    description: '疑似金钱豹咬死了村民家的山羊，村民要求猎杀肇事动物并赔偿损失。',
    villagerName: '李婶',
    conflictType: 'livestock' as const,
    stanceOptions: ['empathetic' as const, 'pragmatic' as const, 'strict' as const],
  },
  {
    id: 'neg_encroach',
    title: '林地侵占',
    description: '村民在保护区边缘开垦种地，蚕食野生动物栖息地，巡护员需要制止并调解。',
    villagerName: '赵哥',
    conflictType: 'encroachment' as const,
    stanceOptions: ['strict' as const, 'educational' as const, 'pragmatic' as const],
  },
  {
    id: 'neg_tradition',
    title: '传统习俗',
    description: '村民计划在保护区内举行传统狩猎节日，认为这是祖辈传下的习俗不应禁止。',
    villagerName: '张村长',
    conflictType: 'tradition' as const,
    stanceOptions: ['empathetic' as const, 'educational' as const, 'negotiate' as const],
  },
]
