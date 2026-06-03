"use strict";

const SAVE_KEY = "kitty-mc-miner-save-v1";
const MAX_TICKETS = 3;
const TICKET_MINE_INTERVAL = 12;
const MAX_FREE_EXPEDITIONS = 2;
const FREE_EXPEDITION_MINE_INTERVAL = 12;
const CAVE_FATIGUE_INTERVAL = 4;
const {
  MATERIALS,
  ENVIRONMENTS,
  COLLECTIBLES,
  TOOLS,
  BACKPACKS,
  LANTERNS,
  DEPTH_GATES,
  ROUTES,
  EXPEDITION_EVENT_WEIGHTS,
  environmentForDepth,
  depthGateFor,
  weightedMaterial,
} = window.KittyGameData;

const DURABILITY_UPGRADES = [
  { name: "基础维护", bonus: 0, price: 0 },
  { name: "铜制镐箍", bonus: 6, price: 48 },
  { name: "铁木镐柄", bonus: 12, price: 150 },
  { name: "黄金齿轮", bonus: 18, price: 390 },
  { name: "钻石轴承", bonus: 24, price: 860 },
];

const SWORDS = [
  { name: "木剑", quality: "普通", qualityClass: "common", damage: 2, price: 0, color: "#b57a43" },
  { name: "石剑", quality: "优秀", qualityClass: "uncommon", damage: 4, price: 90, color: "#aab4ae" },
  { name: "铁剑", quality: "稀有", qualityClass: "rare", damage: 7, price: 260, color: "#d5ddd5" },
  { name: "黄金剑", quality: "史诗", qualityClass: "epic", damage: 11, price: 640, color: "#ffd05c" },
  { name: "钻石剑", quality: "传说", qualityClass: "legendary", damage: 17, price: 1480, color: "#70e6dd" },
];

const ARMOR_SLOTS = {
  helmet: { name: "头盔", icon: "⌂", multiplier: 0.8 },
  chestplate: { name: "胸甲", icon: "▣", multiplier: 1.6 },
  leggings: { name: "护腿", icon: "Ⅱ", multiplier: 1.25 },
  boots: { name: "靴子", icon: "∪", multiplier: 0.65 },
};

const ARMOR_TIERS = [
  { name: "未装备", quality: "空", qualityClass: "common", defense: 0, price: 0 },
  { name: "皮革", quality: "普通", qualityClass: "common", defense: 1, price: 70 },
  { name: "铁制", quality: "稀有", qualityClass: "rare", defense: 2, price: 220 },
  { name: "钻石", quality: "传说", qualityClass: "legendary", defense: 4, price: 680 },
];

const ZONES = ENVIRONMENTS;

const STORY_CHAPTERS = [
  {
    id: "lamp-tower",
    title: "熄灭的矿灯",
    zone: "林地浅层",
    maxDepth: 7,
    building: {
      id: "lampTower",
      icon: "✹",
      name: "矿灯塔",
      description: "重新点亮村口矿灯，照出通往青石矿道的旧路。",
      effect: "镐耐久 +4",
      cost: { wood: 8, stone: 6, coins: 36 },
    },
    boss: { id: "slime-king", name: "腐化史莱姆王", color: "#a6c94f", hp: 30, damage: 2, reward: 90, xp: 38 },
    unlock: "青石矿道",
  },
  {
    id: "mine-lift",
    title: "失速的升降机",
    zone: "青石矿道",
    maxDepth: 15,
    building: {
      id: "mineLift",
      icon: "↕",
      name: "矿井升降机",
      description: "修好升降机，才能把补给送往更深的铁脉矿层。",
      effect: "补给费 -15%",
      cost: { wood: 12, stone: 18, iron: 6, coins: 120 },
    },
    boss: { id: "spider-queen", name: "岩穴蜘蛛女王", color: "#a56f72", hp: 62, damage: 3, reward: 210, xp: 72 },
    unlock: "铁脉深井",
  },
  {
    id: "forge",
    title: "失踪的铁匠",
    zone: "铁脉深井",
    maxDepth: 26,
    building: {
      id: "forge",
      icon: "⚒",
      name: "村庄铁匠铺",
      description: "救回铁匠留下的工坊图纸，锻造能抵抗热浪的护甲。",
      effect: "总护甲 +2",
      cost: { stone: 20, iron: 18, gold: 4, coins: 260 },
    },
    boss: { id: "zombie-captain", name: "地底僵尸队长", color: "#6f9671", hp: 105, damage: 4, reward: 430, xp: 120 },
    unlock: "熔金洞穴",
  },
  {
    id: "lava-pump",
    title: "熔岩之下",
    zone: "熔金洞穴",
    maxDepth: 39,
    building: {
      id: "lavaPump",
      icon: "▲",
      name: "熔岩冷却泵",
      description: "为深井降温，打开被热浪封住的地心通道。",
      effect: "镐耐久 +6",
      cost: { iron: 20, gold: 16, diamond: 3, coins: 560 },
    },
    boss: { id: "lava-warden", name: "熔岩核心守卫", color: "#d87946", hp: 168, damage: 5, reward: 820, xp: 190 },
    unlock: "钻石地心",
  },
  {
    id: "heart-beacon",
    title: "地心最后的光",
    zone: "钻石地心",
    maxDepth: Infinity,
    building: {
      id: "heartBeacon",
      icon: "◆",
      name: "地心信标",
      description: "将钻石晶体装入信标，唤醒守护村庄的地心矿灯。",
      effect: "幸运掉落 +10%",
      cost: { gold: 24, diamond: 12, coins: 980 },
    },
    boss: { id: "crystal-colossus", name: "黑暗晶体巨像", color: "#62d7d4", hp: 260, damage: 6, reward: 1600, xp: 320 },
    unlock: "终焉祭坛",
  },
];

const FINAL_BOSS = {
  id: "abyss-heart-overlord",
  name: "地心终焉龙",
  color: "#cf5d74",
  hp: 1600,
  damage: 7,
  reward: 8000,
  xp: 1800,
  marks: 10,
  size: 74,
  speedMultiplier: 1.36,
  finalBoss: true,
};

const FINAL_BOSS_REQUIREMENTS = {
  depth: 90,
  toolDamage: 26,
  swordDamage: 17,
  armor: 18,
  durability: 52,
  level: 14,
  lanternLevel: 5,
};

const BUYABLE_SPECIAL_MATERIALS = new Set(["redstone", "lapis", "gold", "emerald", "amethyst", "diamond"]);
const MATERIAL_MARKET_ORDER = ["redstone", "lapis", "gold", "emerald", "amethyst", "diamond"];
const BASE_STAMINA = 5;
const BASE_COMBAT_HEALTH = 5;
const LEVEL_STAMINA_INTERVAL = 3;
const STAMINA_RESTORE_AMOUNT = 2;
const HEALTH_KIT_RESTORE = 2;
const HEALTH_REVIVE_AMOUNT = 3;
const HEALTH_KIT_RECIPE = { wood: 4, coal: 3 };
const HEALTH_DEATH_RESET_MESSAGE = "血量归零，背包资源已清空，剑与护甲等级已重置。";
const HEALTH_DEATH_PRESERVE_MESSAGE = "已到达深度、矿洞等级、镐子升级、矿灯、背包等级和矿工等级都会保留。";

const ABYSS_CONTRACT_MATERIALS = ["iron", "gold", "diamond"];

const ABYSS_BOSSES = [
  { name: "回声史莱姆", color: "#99bc56" },
  { name: "晶刺蜘蛛", color: "#b27483" },
  { name: "熔岩守望者", color: "#d97c47" },
];

const MAX_BEACON_RESONANCE = 12;

const SOUND_EFFECTS = {
  hit: [
    { frequency: 125, duration: 0.08, wave: "square", volume: 0.08, slide: 0.72 },
  ],
  break: [
    { frequency: 210, duration: 0.09, wave: "square", volume: 0.07, slide: 0.62 },
    { frequency: 118, duration: 0.08, wave: "square", volume: 0.045, delay: 0.045, slide: 0.74 },
  ],
  diamond: [
    { frequency: 660, duration: 0.16, wave: "triangle", volume: 0.075, slide: 1.22 },
    { frequency: 990, duration: 0.19, wave: "square", volume: 0.038, delay: 0.07, slide: 1.08 },
  ],
  coin: [
    { frequency: 480, duration: 0.1, wave: "square", volume: 0.055, slide: 1.05 },
    { frequency: 720, duration: 0.13, wave: "triangle", volume: 0.06, delay: 0.065, slide: 1.08 },
  ],
  upgrade: [
    { frequency: 392, duration: 0.13, wave: "square", volume: 0.05 },
    { frequency: 523.25, duration: 0.14, wave: "square", volume: 0.052, delay: 0.075 },
    { frequency: 783.99, duration: 0.2, wave: "triangle", volume: 0.072, delay: 0.16, slide: 1.06 },
  ],
  error: [
    { frequency: 155, duration: 0.14, wave: "sawtooth", volume: 0.06, slide: 0.58 },
    { frequency: 92, duration: 0.17, wave: "square", volume: 0.045, delay: 0.09, slide: 0.74 },
  ],
};

const MUSIC_STEP_MS = 280;

const MUSIC_PATTERN = [
  { bass: 130.81, melody: 523.25 },
  { bass: null, melody: null },
  { bass: 130.81, melody: 659.25 },
  { bass: null, melody: 587.33 },
  { bass: 110, melody: 523.25 },
  { bass: null, melody: null },
  { bass: 110, melody: 440 },
  { bass: null, melody: 493.88 },
  { bass: 98, melody: 392 },
  { bass: null, melody: null },
  { bass: 98, melody: 493.88 },
  { bass: null, melody: 523.25 },
  { bass: 110, melody: 440 },
  { bass: null, melody: null },
  { bass: 110, melody: 392 },
  { bass: null, melody: 329.63 },
  { bass: 130.81, melody: 523.25 },
  { bass: null, melody: null },
  { bass: 130.81, melody: 659.25 },
  { bass: null, melody: 783.99 },
  { bass: 146.83, melody: 698.46 },
  { bass: null, melody: null },
  { bass: 146.83, melody: 587.33 },
  { bass: null, melody: 659.25 },
  { bass: 110, melody: 523.25 },
  { bass: null, melody: null },
  { bass: 110, melody: 440 },
  { bass: null, melody: 493.88 },
  { bass: 98, melody: 392 },
  { bass: null, melody: null },
  { bass: 98, melody: 329.63 },
  { bass: null, melody: null },
];

const PERKS = {
  sharpness: {
    name: "锋利附魔",
    icon: "✦",
    max: 5,
    prices: [80, 170, 300, 480, 760],
    effect: (level) => `暴击 ${level * 6}%`,
  },
  fortune: {
    name: "幸运附魔",
    icon: "◆",
    max: 5,
    prices: [110, 220, 390, 620, 960],
    effect: (level) => `双倍掉落 ${level * 5}%`,
  },
  armor: {
    name: "探险护甲",
    icon: "♥",
    max: 4,
    prices: [100, 230, 460, 820],
    effect: (level) => `探险体力 +${level}`,
  },
};

const defaultInventory = () => Object.fromEntries(
  Object.keys(MATERIALS).map((type) => [type, 0])
);

const defaultCollectibles = () => Object.fromEntries(
  Object.keys(COLLECTIBLES).map((type) => [type, 0])
);

const defaultDiscoveries = () => ({
  materials: Object.fromEntries(Object.keys(MATERIALS).map((type) => [type, ["wood", "stone"].includes(type)])),
  collectibles: Object.fromEntries(Object.keys(COLLECTIBLES).map((type) => [type, false])),
});

const defaultPerks = () => ({
  sharpness: 0,
  fortune: 0,
  armor: 0,
  lantern: 0,
});

const defaultEquipment = () => ({
  helmet: 0,
  chestplate: 0,
  leggings: 0,
  boots: 0,
});

const defaultVillage = () => Object.fromEntries(
  STORY_CHAPTERS.map((chapter) => [chapter.building.id, false])
);

const initialState = () => ({
  saveVersion: 9,
  coins: 0,
  stamina: null,
  depth: 1,
  maxDepthReached: 1,
  mined: 0,
  streak: 0,
  lastMineAt: 0,
  toolIndex: 0,
  durabilityLevel: 0,
  pickaxeDurability: null,
  shiftsStarted: 0,
  backpackIndex: 0,
  swordIndex: 0,
  equipment: defaultEquipment(),
  inventory: defaultInventory(),
  collectibles: defaultCollectibles(),
  discoveries: defaultDiscoveries(),
  lanternLevel: 0,
  xp: 0,
  expeditionTickets: MAX_TICKETS,
  ticketMilestone: 0,
  freeExpeditionStarts: MAX_FREE_EXPEDITIONS,
  freeExpeditionMilestone: 0,
  perks: defaultPerks(),
  expedition: null,
  bestExpedition: 0,
  storyChapter: 0,
  village: defaultVillage(),
  defeatedBosses: [],
  finalBossDefeated: false,
  abyssContract: null,
  abyssContractsCompleted: 0,
  abyssBossesDefeated: 0,
  abyssMarks: 0,
  beaconResonance: 0,
  soundOn: true,
  musicOn: true,
  audioMuted: false,
  soundVolume: 55,
  musicVolume: 25,
  tutorialSeen: false,
});

let state = loadGame();
normalizeStoryState();
normalizeFinalBossState();
normalizeAbyssState();
normalizeDurabilityLevel();
normalizeCollections();
normalizeLanternLevel();
normalizePickaxeDurability();
normalizeStamina();
normalizeExpeditionState();
normalizeAudioState();
let audioContext;
let soundBus;
let musicBus;
let musicTimer;
let musicStep = 0;
let audioUnlocked = false;
let audioPanelOpen = false;
let toastTimer;
let caveGame;
let discoveryQueue = [];

const dom = {
  coinCount: document.querySelector("#coinCount"),
  topHealth: document.querySelector("#topHealth"),
  topStamina: document.querySelector("#topStamina"),
  depthCount: document.querySelector("#depthCount"),
  minedCount: document.querySelector("#minedCount"),
  topMiningPower: document.querySelector("#topMiningPower"),
  levelCount: document.querySelector("#levelCount"),
  xpMeter: document.querySelector("#xpMeter"),
  streakCount: document.querySelector("#streakCount"),
  zoneName: document.querySelector("#zoneName"),
  zoneProgress: document.querySelector("#zoneProgress"),
  packName: document.querySelector("#packName"),
  packUsed: document.querySelector("#packUsed"),
  packCapacity: document.querySelector("#packCapacity"),
  packMeter: document.querySelector("#packMeter"),
  inventoryList: document.querySelector("#inventoryList"),
  sellAll: document.querySelector("#sellAll"),
  sellValue: document.querySelector("#sellValue"),
  currentTool: document.querySelector("#currentTool"),
  toolDamage: document.querySelector("#toolDamage"),
  maxDurability: document.querySelector("#maxDurability"),
  armorScore: document.querySelector("#armorScore"),
  equipmentGrid: document.querySelector("#equipmentGrid"),
  toolShop: document.querySelector("#toolShop"),
  durabilityShop: document.querySelector("#durabilityShop"),
  packShop: document.querySelector("#packShop"),
  lanternShop: document.querySelector("#lanternShop"),
  materialTradeList: document.querySelector("#materialTradeList"),
  swordShop: document.querySelector("#swordShop"),
  armorShop: document.querySelector("#armorShop"),
  perkShop: document.querySelector("#perkShop"),
  mineLevelCount: document.querySelector("#mineLevelCount"),
  mineLevelList: document.querySelector("#mineLevelList"),
  caveCanvas: document.querySelector("#caveCanvas"),
  swordHud: document.querySelector("#swordHud"),
  caveArmor: document.querySelector("#caveArmor"),
  caveHealth: document.querySelector("#caveHealth"),
  caveStamina: document.querySelector("#caveStamina"),
  caveDurability: document.querySelector("#caveDurability"),
  caveMiningPower: document.querySelector("#caveMiningPower"),
  repairPickaxe: document.querySelector("#repairPickaxe"),
  repairPickaxeCost: document.querySelector("#repairPickaxeCost"),
  repairPickaxeHint: document.querySelector("#repairPickaxeHint"),
  backtrackCave: document.querySelector("#backtrackCave"),
  backtrackCaveHint: document.querySelector("#backtrackCaveHint"),
  openCaveShop: document.querySelector("#openCaveShop"),
  caveShopModal: document.querySelector("#caveShopModal"),
  closeCaveShop: document.querySelector("#closeCaveShop"),
  caveSupplyList: document.querySelector("#caveSupplyList"),
  bossHud: document.querySelector("#bossHud"),
  bossName: document.querySelector("#bossName"),
  bossMeter: document.querySelector("#bossMeter"),
  caveHint: document.querySelector("#caveHint"),
  storyChapter: document.querySelector("#storyChapter"),
  storyTitle: document.querySelector("#storyTitle"),
  storyDescription: document.querySelector("#storyDescription"),
  villageStructures: document.querySelector("#villageStructures"),
  villageAction: document.querySelector("#villageAction"),
  currentObjective: document.querySelector("#currentObjective"),
  sideObjective: document.querySelector("#sideObjective"),
  eventLog: document.querySelector("#eventLog"),
  audioSettingsToggle: document.querySelector("#audioSettingsToggle"),
  audioSettings: document.querySelector("#audioSettings"),
  closeAudioSettings: document.querySelector("#closeAudioSettings"),
  audioStatus: document.querySelector("#audioStatus"),
  soundToggle: document.querySelector("#soundToggle"),
  soundVolume: document.querySelector("#soundVolume"),
  soundVolumeLabel: document.querySelector("#soundVolumeLabel"),
  musicToggle: document.querySelector("#musicToggle"),
  musicVolume: document.querySelector("#musicVolume"),
  musicVolumeLabel: document.querySelector("#musicVolumeLabel"),
  resetGame: document.querySelector("#resetGame"),
  toast: document.querySelector("#toast"),
  toastMessage: document.querySelector("#toastMessage"),
  introModal: document.querySelector("#introModal"),
  startGame: document.querySelector("#startGame"),
  openAdventure: document.querySelector("#openAdventure"),
  freeExpeditionCount: document.querySelector("#freeExpeditionCount"),
  ticketCount: document.querySelector("#ticketCount"),
  adventureModal: document.querySelector("#adventureModal"),
  closeAdventure: document.querySelector("#closeAdventure"),
  modalFreeExpeditionCount: document.querySelector("#modalFreeExpeditionCount"),
  modalTicketCount: document.querySelector("#modalTicketCount"),
  routeSelect: document.querySelector("#routeSelect"),
  routeList: document.querySelector("#routeList"),
  expeditionScreen: document.querySelector("#expeditionScreen"),
  expeditionRouteName: document.querySelector("#expeditionRouteName"),
  expeditionHealth: document.querySelector("#expeditionHealth"),
  expeditionPath: document.querySelector("#expeditionPath"),
  expeditionScene: document.querySelector("#expeditionScene"),
  expeditionEvent: document.querySelector("#expeditionEvent"),
  expeditionStep: document.querySelector("#expeditionStep"),
  expeditionLoot: document.querySelector("#expeditionLoot"),
  merchantPanel: document.querySelector("#merchantPanel"),
  retreatExpedition: document.querySelector("#retreatExpedition"),
  advanceExpedition: document.querySelector("#advanceExpedition"),
  openCollection: document.querySelector("#openCollection"),
  closeCollection: document.querySelector("#closeCollection"),
  collectionProgress: document.querySelector("#collectionProgress"),
  collectionModal: document.querySelector("#collectionModal"),
  collectionSummary: document.querySelector("#collectionSummary"),
  collectionGrid: document.querySelector("#collectionGrid"),
  collectibleShelf: document.querySelector("#collectibleShelf"),
  discoveryCard: document.querySelector("#discoveryCard"),
  discoveryName: document.querySelector("#discoveryName"),
  discoveryDescription: document.querySelector("#discoveryDescription"),
  closeDiscovery: document.querySelector("#closeDiscovery"),
};

function loadGame() {
  const fresh = initialState();
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!saved) return fresh;
    const saveVersion = Number(saved.saveVersion) || 1;
    const hadLegacyExpedition = saveVersion < 5 && Boolean(saved.expedition);
    const legacyMaterials = saveVersion < 5
      ? { wood: true, stone: true, iron: true, gold: true, diamond: true }
      : {};
    return {
      ...fresh,
      ...saved,
      saveVersion: fresh.saveVersion,
      durabilityLevel: saveVersion < 2
        ? Number(saved.toolIndex) || 0
        : saved.durabilityLevel,
      lanternLevel: saveVersion < 5
        ? Number(saved.perks?.lantern) || 0
        : saved.lanternLevel,
      expedition: hadLegacyExpedition ? null : saved.expedition,
      expeditionTickets: hadLegacyExpedition
        ? Math.min(MAX_TICKETS, (Number(saved.expeditionTickets) || 0) + 1)
        : saved.expeditionTickets,
      inventory: { ...fresh.inventory, ...saved.inventory },
      collectibles: { ...fresh.collectibles, ...saved.collectibles },
      discoveries: {
        materials: { ...fresh.discoveries.materials, ...legacyMaterials, ...saved.discoveries?.materials },
        collectibles: { ...fresh.discoveries.collectibles, ...saved.discoveries?.collectibles },
      },
      perks: { ...fresh.perks, ...saved.perks },
      equipment: { ...fresh.equipment, ...saved.equipment },
      village: { ...fresh.village, ...saved.village },
    };
  } catch {
    return fresh;
  }
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function inventoryTotal() {
  return Object.values(state.inventory).reduce((sum, amount) => sum + amount, 0);
}

function inventoryValue() {
  return Object.entries(state.inventory).reduce(
    (sum, [type, amount]) => sum + MATERIALS[type].value * amount,
    0
  );
}

function normalizeStoryState() {
  state.storyChapter = Math.max(0, Math.min(STORY_CHAPTERS.length, Number(state.storyChapter) || 0));
  state.village = { ...defaultVillage(), ...state.village };
  state.defeatedBosses = Array.isArray(state.defeatedBosses) ? state.defeatedBosses : [];
  const depth = Math.max(1, Number(state.depth) || 1);
  state.depth = Math.min(depth, activeStoryChapter()?.maxDepth ?? depth);
  const maxDepthReached = Math.max(state.depth, Number(state.maxDepthReached) || state.depth);
  state.maxDepthReached = Math.min(maxDepthReached, activeStoryChapter()?.maxDepth ?? maxDepthReached);
}

function normalizeAbyssState() {
  state.abyssContractsCompleted = Math.max(0, Number(state.abyssContractsCompleted) || 0);
  state.abyssBossesDefeated = Math.max(0, Number(state.abyssBossesDefeated) || 0);
  state.abyssMarks = Math.max(0, Number(state.abyssMarks) || 0);
  state.beaconResonance = Math.max(0, Math.min(MAX_BEACON_RESONANCE, Number(state.beaconResonance) || 0));
  if (finalVictory() && !state.abyssContract) state.abyssContract = createAbyssContract();
}

function normalizeFinalBossState() {
  state.finalBossDefeated = Boolean(state.finalBossDefeated || state.defeatedBosses.includes(FINAL_BOSS.id));
}

function activeStoryChapter() {
  return STORY_CHAPTERS[state.storyChapter] || null;
}

function storyCompleted() {
  return state.storyChapter >= STORY_CHAPTERS.length;
}

function finalVictory() {
  return Boolean(state.finalBossDefeated);
}

function isVillageBuilt(buildingId) {
  return Boolean(state.village[buildingId]);
}

function accessibleDepth() {
  const chapter = activeStoryChapter();
  return Math.min(state.depth, chapter?.maxDepth ?? state.depth);
}

function deepestDepthReached() {
  const chapter = activeStoryChapter();
  return Math.min(state.maxDepthReached, chapter?.maxDepth ?? state.maxDepthReached);
}

function depthAccessIssue(depth) {
  const environment = environmentForDepth(depth);
  const gate = depthGateFor(depth);
  const requiredToolIndex = Math.max(environment.requiredToolIndex, gate?.toolIndex || 0);
  const requiredLanternLevel = Math.max(environment.requiredLanternLevel, gate?.lanternLevel || 0);
  if (state.toolIndex < requiredToolIndex) return `需要先装备${TOOLS[requiredToolIndex].name}`;
  if (state.lanternLevel < requiredLanternLevel) return `需要先安装${LANTERNS[requiredLanternLevel].name}`;
  return "";
}

function zoneDepthLabel(zone) {
  return zone.to === Infinity ? `${zone.from}m+` : `${zone.from}-${zone.to}m`;
}

function zoneRequirementLabel(zone) {
  return zone.requiredToolIndex || zone.requiredLanternLevel
    ? `${TOOLS[zone.requiredToolIndex].name} · ${LANTERNS[zone.requiredLanternLevel].name}`
    : "初始开放";
}

function zoneNewMaterialTypes(zone) {
  const earlierTypes = new Set(
    ZONES
      .filter((candidate) => candidate.from < zone.from)
      .flatMap((candidate) => Object.keys(candidate.weights))
  );
  return Object.keys(zone.weights).filter((type) => !earlierTypes.has(type));
}

function zoneGateSummary(zone) {
  const gates = DEPTH_GATES.filter((gate) => gate.depth >= zone.from && gate.depth <= zone.to);
  if (!gates.length) return "";
  return gates
    .map((gate) => `${gate.depth}m 需${TOOLS[gate.toolIndex].name} · ${LANTERNS[gate.lanternLevel].name}`)
    .join("；");
}

function nextZoneIssueLabel(zone) {
  const chapter = activeStoryChapter();
  if (chapter && zone.from > chapter.maxDepth) {
    return `先修复${chapter.building.name}并击败${chapter.boss.name}`;
  }
  return depthAccessIssue(zone.from) || "门槛已满足";
}

function formatRequirement(cost) {
  return Object.entries(cost)
    .map(([type, amount]) => type === "coins" ? `${amount} 金币` : `${MATERIALS[type].name} × ${amount}`)
    .join(" · ");
}

function missingRequirement(cost) {
  return Object.entries(cost)
    .filter(([type, amount]) => type === "coins" ? state.coins < amount : state.inventory[type] < amount)
    .map(([type, amount]) => type === "coins"
      ? `${amount - state.coins} 金币`
      : `${MATERIALS[type].name} ${amount - state.inventory[type]} 块`
    )
    .join("、");
}

function missingRequirementParts(cost) {
  return Object.entries(cost)
    .filter(([type, amount]) => type === "coins" ? state.coins < amount : state.inventory[type] < amount)
    .map(([type, amount]) => ({
      type,
      amount: type === "coins" ? amount - state.coins : amount - state.inventory[type],
    }));
}

function missingRequirementLabel(cost) {
  const parts = missingRequirementParts(cost);
  if (!parts.length) return "";
  return parts.map(({ type, amount }) => type === "coins"
    ? `缺 ${amount} 金币`
    : `缺${MATERIALS[type].name} × ${amount}`
  ).join("、");
}

function requirementGuidance(cost) {
  const parts = missingRequirementParts(cost);
  if (!parts.length) return "";
  return parts.map(({ type, amount }) => type === "coins"
    ? `缺 ${amount} 金币：出售矿物或击败怪物获得`
    : `缺${MATERIALS[type].name} × ${amount}：${MATERIALS[type].origin}获得`
  ).join("；");
}

function missingCoinsLabel(requiredCoins) {
  return `缺 ${Math.max(0, requiredCoins - state.coins)} 金币`;
}

function itemCost(item) {
  return { coins: item.price, ...(item.recipe || {}) };
}

function consumeRequirement(cost) {
  Object.entries(cost).forEach(([type, amount]) => {
    if (type === "coins") state.coins -= amount;
    else state.inventory[type] -= amount;
  });
}

function normalizeCollections() {
  state.inventory = { ...defaultInventory(), ...state.inventory };
  state.collectibles = { ...defaultCollectibles(), ...state.collectibles };
  state.discoveries = {
    materials: { ...defaultDiscoveries().materials, ...state.discoveries?.materials },
    collectibles: { ...defaultDiscoveries().collectibles, ...state.discoveries?.collectibles },
  };
}

function normalizeLanternLevel() {
  state.lanternLevel = Math.max(0, Math.min(LANTERNS.length - 1, Number(state.lanternLevel) || 0));
}

function queueDiscovery({ name, description }) {
  discoveryQueue.push({ name, description });
  renderDiscoveryCard();
}

function markMaterialDiscovered(type) {
  const material = MATERIALS[type];
  if (!material || state.discoveries.materials[type]) return false;
  state.discoveries.materials[type] = true;
  queueDiscovery({ name: material.name, description: `${material.description} 来源：${material.origin}。` });
  return true;
}

function discoverCollectible(type) {
  const collectible = COLLECTIBLES[type];
  if (!collectible) return;
  const firstDiscovery = !state.discoveries.collectibles[type];
  state.collectibles[type] += 1;
  state.discoveries.collectibles[type] = true;
  if (firstDiscovery) {
    queueDiscovery({ name: collectible.name, description: collectible.description });
    logEvent(`猫窝收藏架新增了${collectible.name}。`);
    return;
  }
  state.coins += collectible.reward;
  showToast(`再次发现${collectible.name}，收藏家奖励 ${collectible.reward} 金币。`);
}

function maxPickaxeDurability() {
  return 18
    + DURABILITY_UPGRADES[state.durabilityLevel].bonus
    + (isVillageBuilt("lampTower") ? 4 : 0)
    + (isVillageBuilt("lavaPump") ? 6 : 0)
    + state.beaconResonance * 2;
}

function repairPickaxeCost() {
  const baseCost = 12 + state.toolIndex * 18;
  return Math.max(1, Math.round(baseCost * (isVillageBuilt("mineLift") ? 0.85 : 1)));
}

function caveSoupCost() {
  return 14 + accessibleDepth() * 2;
}

function levelStaminaBonus(level = playerLevel()) {
  return Math.floor((Math.max(1, level) - 1) / LEVEL_STAMINA_INTERVAL);
}

function levelHealthBonus(level = playerLevel()) {
  return Math.max(1, level) - 1;
}

function maxStamina() {
  return BASE_STAMINA
    + levelStaminaBonus()
    + (isVillageBuilt("heartBeacon") ? 1 : 0);
}

function maxCombatHealth() {
  return BASE_COMBAT_HEALTH + levelHealthBonus();
}

function staminaTopUpCost() {
  return Math.round(42 + accessibleDepth() * 6 + playerLevel() * 10);
}

function normalizeStamina() {
  if (!Number.isFinite(state.stamina)) {
    state.stamina = maxStamina();
    return;
  }
  state.stamina = Math.max(0, Math.min(maxStamina(), state.stamina));
}

function normalizePickaxeDurability() {
  if (!Number.isFinite(state.pickaxeDurability)) {
    state.pickaxeDurability = maxPickaxeDurability();
    return;
  }
  state.pickaxeDurability = Math.max(0, Math.min(maxPickaxeDurability(), state.pickaxeDurability));
}

function normalizeDurabilityLevel() {
  state.durabilityLevel = Math.max(
    0,
    Math.min(DURABILITY_UPGRADES.length - 1, Number(state.durabilityLevel) || 0)
  );
}

function normalizeAudioState() {
  state.soundOn = state.soundOn !== false;
  state.musicOn = state.musicOn !== false;
  state.audioMuted = Boolean(state.audioMuted);
  state.soundVolume = Math.max(0, Math.min(100, Number(state.soundVolume) || 0));
  state.musicVolume = Math.max(0, Math.min(100, Number(state.musicVolume) || 0));
}

function normalizeExpeditionState() {
  state.expeditionTickets = Math.max(0, Math.min(MAX_TICKETS, Number(state.expeditionTickets) || 0));
  state.ticketMilestone = Math.max(0, Number(state.ticketMilestone) || 0);
  state.freeExpeditionStarts = Math.max(
    0,
    Math.min(MAX_FREE_EXPEDITIONS, Number(state.freeExpeditionStarts) || 0)
  );
  state.freeExpeditionMilestone = Math.max(0, Number(state.freeExpeditionMilestone) || 0);
}

function currentSword() {
  return SWORDS[state.swordIndex];
}

function armorScore() {
  const equipmentArmor = Object.entries(state.equipment).reduce((sum, [slotId, tierIndex]) => {
    const tier = ARMOR_TIERS[tierIndex];
    return sum + Math.round(tier.defense * ARMOR_SLOTS[slotId].multiplier);
  }, 0);
  return equipmentArmor + (isVillageBuilt("forge") ? 2 : 0);
}

function fortuneChance() {
  return state.perks.fortune * 0.05 + (isVillageBuilt("heartBeacon") ? 0.1 : 0);
}

function armorPrice(slotId, tierIndex) {
  return Math.round(ARMOR_TIERS[tierIndex].price * ARMOR_SLOTS[slotId].multiplier);
}

function xpForLevel(level) {
  return ((level - 1) * level * 16);
}

function playerLevel() {
  let level = 1;
  while (state.xp >= xpForLevel(level + 1)) level += 1;
  return level;
}

function finalBossRequirements() {
  return [
    {
      id: "depth",
      label: "最深深度",
      current: deepestDepthReached(),
      required: FINAL_BOSS_REQUIREMENTS.depth,
      unit: "m",
      hint: "继续下潜到 90m，抵达真正的终焉祭坛",
    },
    {
      id: "tool",
      label: "镐力",
      current: TOOLS[state.toolIndex].damage,
      required: FINAL_BOSS_REQUIREMENTS.toolDamage,
      unit: "",
      hint: "升级至紫水晶共鸣镐，打开最终矿层",
    },
    {
      id: "sword",
      label: "武器攻击",
      current: currentSword().damage,
      required: FINAL_BOSS_REQUIREMENTS.swordDamage,
      unit: "",
      hint: "剑转换台升级至钻石剑",
    },
    {
      id: "armor",
      label: "总护甲",
      current: armorScore(),
      required: FINAL_BOSS_REQUIREMENTS.armor,
      unit: "",
      hint: "尽量锻造全套钻石护甲，减少最终战失误惩罚",
    },
    {
      id: "durability",
      label: "镐耐久上限",
      current: maxPickaxeDurability(),
      required: FINAL_BOSS_REQUIREMENTS.durability,
      unit: "",
      hint: "完成耐久维护满级，终局前把镐子打磨到极限",
    },
    {
      id: "level",
      label: "矿工等级",
      current: playerLevel(),
      required: FINAL_BOSS_REQUIREMENTS.level,
      unit: "",
      hint: "把矿工等级提升到 Lv.14，给最终战留足成长时间",
    },
    {
      id: "lantern",
      label: "矿灯等级",
      current: state.lanternLevel,
      required: FINAL_BOSS_REQUIREMENTS.lanternLevel,
      unit: "",
      hint: "改装至绿宝石罗盘灯，照亮 90m 终焉入口",
    },
  ].map((requirement) => ({
    ...requirement,
    met: requirement.current >= requirement.required,
    missing: Math.max(0, requirement.required - requirement.current),
  }));
}

function finalBossReady() {
  return storyCompleted() && finalBossRequirements().every((requirement) => requirement.met);
}

function finalBossGateText() {
  const missing = finalBossRequirements().filter((requirement) => !requirement.met);
  if (!missing.length) return "终局门槛已达成";
  return missing
    .map((requirement) => `${requirement.label}还差 ${requirement.missing}${requirement.unit}`)
    .join("；");
}

function addXp(amount) {
  const oldLevel = playerLevel();
  const oldMaxStamina = maxStamina();
  const oldMaxHealth = maxCombatHealth();
  const wasStaminaFull = state.stamina >= oldMaxStamina;
  state.xp += amount;
  const newLevel = playerLevel();
  if (newLevel > oldLevel) {
    const newMaxStamina = maxStamina();
    const newMaxHealth = maxCombatHealth();
    const healthGain = Math.max(0, newMaxHealth - oldMaxHealth);
    const gains = [];
    if (newMaxStamina > oldMaxStamina) gains.push(`体力上限 ${oldMaxStamina}→${newMaxStamina}`);
    if (healthGain > 0) gains.push(`血量上限 ${oldMaxHealth}→${newMaxHealth}，当前血量 +${healthGain}`);
    if (wasStaminaFull) state.stamina = newMaxStamina;
    normalizeStamina();
    if (healthGain > 0) caveGame?.healPlayer?.(healthGain);
    else caveGame?.syncPlayerVitals?.();
    showToast(`矿工等级提升至 Lv.${newLevel}！${gains.length ? gains.join("，") : ""}`);
    logEvent(`积累的经验有了回报，猫猫矿工升到了 Lv.${newLevel}。${gains.length ? gains.join("，") + "。" : ""}`);
    playTone("upgrade");
  }
}

function maxAdventureHealth(supplied = state.expedition?.supplied) {
  return 8 + levelStaminaBonus() + state.perks.armor + (supplied ? 2 : 0);
}

function routeById(routeId) {
  return ROUTES.find((route) => route.id === routeId);
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createAbyssContract() {
  const tier = state.abyssContractsCompleted + 1;
  const material = ABYSS_CONTRACT_MATERIALS[Math.floor(Math.random() * ABYSS_CONTRACT_MATERIALS.length)];
  const baseAmounts = { iron: 12, gold: 9, diamond: 5 };
  return {
    id: `abyss-contract-${tier}-${Date.now()}`,
    tier,
    material,
    amount: baseAmounts[material] + Math.floor((tier - 1) * 1.5),
    targetDepth: Math.max(42 + tier * 3, deepestDepthReached() + randomBetween(2, 4)),
    rewardCoins: 180 + tier * 70,
    rewardXp: 48 + tier * 16,
    rewardMarks: 1 + Math.floor((tier - 1) / 3),
  };
}

function ensureAbyssContract() {
  state.abyssContract ||= createAbyssContract();
  return state.abyssContract;
}

function abyssContractRerollCost() {
  return 60 + state.abyssContractsCompleted * 15;
}

function abyssBossForLevel(level = state.abyssBossesDefeated + 1) {
  const template = ABYSS_BOSSES[(level - 1) % ABYSS_BOSSES.length];
  return {
    id: `abyss-boss-${level}`,
    name: `${template.name} Lv.${level}`,
    color: template.color,
    hp: 210 + level * 58,
    damage: Math.min(13, 5 + Math.floor(level / 2)),
    reward: 180 + level * 95,
    xp: 56 + level * 24,
    marks: 1 + Math.floor((level - 1) / 4),
  };
}

function beaconResonanceCost() {
  return 2 + state.beaconResonance;
}

function addMiningExpeditionRewards() {
  const ticketMilestone = Math.floor(state.mined / TICKET_MINE_INTERVAL);
  const freeExpeditionMilestone = Math.floor(state.mined / FREE_EXPEDITION_MINE_INTERVAL);
  const previousTickets = state.expeditionTickets;
  const previousFreeExpeditions = state.freeExpeditionStarts;

  if (ticketMilestone > state.ticketMilestone) {
    state.expeditionTickets = Math.min(
      MAX_TICKETS,
      state.expeditionTickets + ticketMilestone - state.ticketMilestone
    );
    state.ticketMilestone = ticketMilestone;
  }

  if (freeExpeditionMilestone > state.freeExpeditionMilestone) {
    state.freeExpeditionStarts = Math.min(
      MAX_FREE_EXPEDITIONS,
      state.freeExpeditionStarts + freeExpeditionMilestone - state.freeExpeditionMilestone
    );
    state.freeExpeditionMilestone = freeExpeditionMilestone;
  }

  const ticketGain = state.expeditionTickets - previousTickets;
  const freeExpeditionGain = state.freeExpeditionStarts - previousFreeExpeditions;
  const rewards = [
    ticketGain > 0 ? `${ticketGain} 张探险券` : "",
    freeExpeditionGain > 0 ? `${freeExpeditionGain} 次免费探险` : "",
  ].filter(Boolean);
  if (rewards.length) showToast(`挖矿进度奖励：恢复 ${rewards.join("、")}。`);
}

function currentZone() {
  const depth = accessibleDepth();
  return ZONES.find((zone) => depth >= zone.from && depth <= zone.to) || ZONES[0];
}

function renderAll() {
  renderStats();
  renderInventory();
  renderMineLevels();
  renderMaterialMarket();
  renderShop();
  renderVillage();
  renderRepairStation();
  renderMineActions();
  renderCaveShop();
  renderObjective();
  renderSideObjective();
  renderAdventure();
  renderCollection();
  renderDiscoveryCard();
  renderCaveHud();
}

function renderStats() {
  const zone = currentZone();
  const progress =
    zone.to === Infinity ? 100 : ((state.depth - zone.from + 1) / (zone.to - zone.from + 1)) * 100;

  dom.coinCount.textContent = state.coins.toLocaleString("zh-CN");
  dom.depthCount.textContent = accessibleDepth();
  dom.minedCount.textContent = state.mined;
  dom.topMiningPower.textContent = TOOLS[state.toolIndex].damage;
  dom.streakCount.textContent = state.streak;
  dom.zoneName.textContent = zone.name;
  dom.zoneProgress.style.width = `${Math.min(100, progress)}%`;

  const level = playerLevel();
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const xpProgress = ((state.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  dom.levelCount.textContent = level;
  dom.xpMeter.style.width = `${Math.min(100, xpProgress)}%`;
  dom.freeExpeditionCount.textContent = state.freeExpeditionStarts;
  dom.ticketCount.textContent = state.expeditionTickets;
  renderTopHealth();
  renderTopStamina();
}

function renderInventory() {
  const backpack = BACKPACKS[state.backpackIndex];
  const used = inventoryTotal();
  const percent = (used / backpack.capacity) * 100;

  dom.packName.textContent = backpack.name;
  dom.packUsed.textContent = used;
  dom.packCapacity.textContent = backpack.capacity;
  dom.packMeter.style.width = `${Math.min(100, percent)}%`;
  dom.packMeter.parentElement.classList.toggle("near-full", percent >= 80);
  const totalValue = inventoryValue();
  dom.sellValue.textContent = `+ ${totalValue.toLocaleString("zh-CN")} ¢`;
  dom.sellAll.disabled = totalValue <= 0;

  dom.inventoryList.innerHTML = Object.entries(MATERIALS)
    .filter(([type]) => state.discoveries.materials[type])
    .map(
      ([type, material]) => `
        <div class="inventory-item">
          <i class="mini-block" style="${miniBlockStyle(type)}" aria-hidden="true"></i>
          <span>${material.name}</span>
          <strong>${state.inventory[type]}</strong>
          <button
            class="sell-one-button"
            type="button"
            data-sell-material="${type}"
            ${state.inventory[type] <= 0 ? "disabled" : ""}
          >卖出 1 个 · +${material.value}¢</button>
        </div>
      `
    )
    .join("");

  const tool = TOOLS[state.toolIndex];
  dom.currentTool.textContent = tool.name;
  dom.toolDamage.textContent = tool.damage;
  dom.maxDurability.textContent = maxPickaxeDurability();
  renderEquipment();
}

function miniBlockStyle(type) {
  const colors = MATERIALS[type]?.colors || MATERIALS.stone.colors;
  return `--block-base:${colors[0]};--block-spark:${colors[1]};--block-shadow:${colors[2]}`;
}

function renderEquipment() {
  dom.armorScore.textContent = armorScore();
  dom.equipmentGrid.innerHTML = Object.entries(ARMOR_SLOTS)
    .map(([slotId, slot]) => {
      const tier = ARMOR_TIERS[state.equipment[slotId]];
      return `
        <div class="equipment-slot">
          <small>${slot.icon} ${slot.name}</small>
          <strong class="quality-${tier.qualityClass}">${tier.name}</strong>
          <em>${tier.quality} · 护甲 ${Math.round(tier.defense * slot.multiplier)}</em>
        </div>
      `;
    })
    .join("");
}

function renderCaveHud(status) {
  const sword = currentSword();
  const caveStatus = status || caveGame?.getStatus();
  renderTopHealth(caveStatus);
  dom.swordHud.textContent = `${sword.name} · ${sword.quality}`;
  dom.swordHud.className = `quality-${sword.qualityClass}`;
  dom.caveArmor.textContent = armorScore();
  dom.caveHealth.textContent = `${caveStatus?.hp ?? 5} / ${caveStatus?.maxHp ?? 5}`;
  dom.caveStamina.textContent = `${state.stamina} / ${maxStamina()}`;
  dom.caveDurability.textContent = `${state.pickaxeDurability} / ${maxPickaxeDurability()}`;
  dom.caveMiningPower.textContent = TOOLS[state.toolIndex].damage;
  dom.caveDurability.classList.toggle("is-empty", state.pickaxeDurability <= 0);
  dom.bossHud.classList.toggle("hidden", !caveStatus?.boss);
  if (caveStatus?.boss) {
    dom.bossName.textContent = caveStatus.boss.name;
    dom.bossMeter.style.width = `${Math.max(0, (caveStatus.boss.hp / caveStatus.boss.maxHp) * 100)}%`;
  }
  if (caveStatus?.hint) dom.caveHint.textContent = caveStatus.hint;
}

function renderTopHealth(status = caveGame?.getStatus()) {
  const hp = status?.hp ?? maxCombatHealth();
  const maxHp = status?.maxHp ?? maxCombatHealth();
  dom.topHealth.textContent = `♥ ${hp} / ${maxHp}`;
}

function renderTopStamina() {
  dom.topStamina.textContent = `${state.stamina} / ${maxStamina()}`;
}

function renderRepairStation() {
  const cost = repairPickaxeCost();
  const full = state.pickaxeDurability >= maxPickaxeDurability();
  dom.repairPickaxeCost.textContent = cost;
  dom.repairPickaxe.disabled = full;
  dom.repairPickaxe.classList.toggle("needs-repair", !full);
  dom.repairPickaxeHint.textContent = full
    ? "镐子状态良好"
    : state.coins < cost
      ? missingCoinsLabel(cost)
      : "原地补满耐久";
}

function renderMineActions() {
  dom.backtrackCave.disabled = accessibleDepth() <= 1;
  dom.backtrackCaveHint.textContent = accessibleDepth() <= 1
    ? "当前已在入口"
    : `${accessibleDepth()}m → ${accessibleDepth() - 1}m`;
}

function renderCaveShop() {
  const soupCost = caveSoupCost();
  const repairCost = repairPickaxeCost();
  const sellValue = inventoryValue();
  const caveStatus = caveGame?.getStatus();
  const staminaFull = state.stamina >= maxStamina();
  const healthFull = !caveStatus || caveStatus.hp >= caveStatus.maxHp;
  const healthKitMissing = missingRequirementLabel(HEALTH_KIT_RECIPE);
  const durabilityFull = state.pickaxeDurability >= maxPickaxeDurability();

  dom.caveSupplyList.innerHTML = `
    <article class="cave-supply-item">
      <span class="cave-supply-icon" aria-hidden="true">⚡</span>
      <div class="cave-supply-copy">
        <strong>矿工热汤</strong>
        <small>恢复 ${STAMINA_RESTORE_AMOUNT} 点体力，当前上限 ${maxStamina()}；等级每 ${LEVEL_STAMINA_INTERVAL} 级 +1。</small>
      </div>
      <button class="buy-button" type="button" data-buy-cave-supply="soup" ${staminaFull || state.coins < soupCost ? "disabled" : ""}>
        ${staminaFull ? "体力已满" : state.coins < soupCost ? missingCoinsLabel(soupCost) : `${soupCost} ¢`}
      </button>
    </article>
    <article class="cave-supply-item">
      <span class="cave-supply-icon" aria-hidden="true">♥</span>
      <div class="cave-supply-copy">
        <strong>战斗绷带</strong>
        <small>消耗 ${formatRequirement(HEALTH_KIT_RECIPE)}，恢复 ${HEALTH_KIT_RESTORE} 点血量，当前上限 ${caveStatus?.maxHp ?? maxCombatHealth()}；矿工每升 1 级 +1。</small>
      </div>
      <button class="buy-button" type="button" data-buy-cave-supply="bandage" ${healthFull || Boolean(healthKitMissing) ? "disabled" : ""}>
        ${healthFull ? "血量已满" : healthKitMissing || "制作回血"}
      </button>
    </article>
    <article class="cave-supply-item">
      <span class="cave-supply-icon" aria-hidden="true">⚒</span>
      <div class="cave-supply-copy">
        <strong>镐具维护</strong>
        <small>原地补满镐子耐久，保留位置和已挖开的通道。</small>
      </div>
      <button class="buy-button" type="button" data-buy-cave-supply="repair" ${durabilityFull || state.coins < repairCost ? "disabled" : ""}>
        ${durabilityFull ? "耐久已满" : state.coins < repairCost ? missingCoinsLabel(repairCost) : `${repairCost} ¢`}
      </button>
    </article>
    <article class="cave-supply-item">
      <span class="cave-supply-icon" aria-hidden="true">¢</span>
      <div class="cave-supply-copy">
        <strong>矿物快速售卖</strong>
        <small>将背包中的全部矿物送回村庄结算。</small>
      </div>
      <button class="buy-button" type="button" data-buy-cave-supply="sell" ${sellValue <= 0 ? "disabled" : ""}>
        ${sellValue > 0 ? `+ ${sellValue.toLocaleString("zh-CN")} ¢` : "背包为空"}
      </button>
    </article>
  `;
}

function renderMaterialMarket() {
  const backpackFull = inventoryTotal() >= BACKPACKS[state.backpackIndex].capacity;
  dom.materialTradeList.innerHTML = MATERIAL_MARKET_ORDER
    .filter((type) => MATERIALS[type] && (state.discoveries.materials[type] || BUYABLE_SPECIAL_MATERIALS.has(type)))
    .map((type) => {
      const material = MATERIALS[type];
      const buyable = BUYABLE_SPECIAL_MATERIALS.has(type);
      const discovered = state.discoveries.materials[type];
      const buyPrice = material.value * 3;
      const canBuy = buyable && discovered && !backpackFull && state.coins >= buyPrice;
      const buyLabel = !buyable
        ? "挖矿获取"
        : !discovered
          ? "待发现"
          : backpackFull
            ? "背包已满"
            : state.coins < buyPrice
              ? missingCoinsLabel(buyPrice)
              : `买入 ${buyPrice}¢`;
      return `
        <article class="material-market-item ${buyable ? "enchant-material" : ""} ${discovered ? "" : "undiscovered"}">
          <i class="mini-block" style="${miniBlockStyle(type)}" aria-hidden="true"></i>
          <div class="shop-copy">
            <strong>${material.name} <em>${buyable ? "附魔材料" : "基础材料"}</em></strong>
            <small>${discovered ? `来源：${material.origin}` : `未发现 · ${material.origin}`} · 卖出 ${material.value}¢</small>
          </div>
          <div class="trade-actions">
            ${buyable ? `
              <button class="buy-button" type="button" data-buy-shop-material="${type}" ${canBuy ? "" : "disabled"}>
                ${buyLabel}
              </button>
            ` : `<span class="trade-note">挖矿获取</span>`}
            <button class="buy-button sell-trade-button" type="button" data-sell-shop-material="${type}" ${state.inventory[type] <= 0 ? "disabled" : ""}>
              卖出 ${material.value}¢
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderMineLevels() {
  dom.mineLevelCount.textContent = ZONES.length;
  const deepest = deepestDepthReached();
  const nextZone = ZONES.find((zone) => deepest < zone.from);
  const nextIssue = nextZone ? nextZoneIssueLabel(nextZone) : "";
  const nextNewMaterials = nextZone ? zoneNewMaterialTypes(nextZone) : [];
  const nextCard = nextZone
    ? `
      <article class="mine-atlas-next" style="--zone-color:${nextZone.color}">
        <span class="mine-atlas-symbol">${nextZone.symbol}</span>
        <div>
          <strong>下一矿层：${nextZone.name}</strong>
          <small>${nextZone.from}m 开始 · 还差 ${Math.max(0, nextZone.from - deepest)}m · ${nextIssue || "门槛已满足"}</small>
          <em>新增资源：${nextNewMaterials.length
            ? nextNewMaterials.map((type) => MATERIALS[type].name).join("、")
            : MATERIALS[nextZone.rareMaterial].name}</em>
        </div>
      </article>
    `
    : `
      <article class="mine-atlas-next complete" style="--zone-color:${currentZone().color}">
        <span class="mine-atlas-symbol">◆</span>
        <div>
          <strong>已进入最后矿区：${currentZone().name}</strong>
          <small>${zoneDepthLabel(currentZone())} · 继续下潜会遇到 50m、70m、90m 深层门槛</small>
          <em>后续重点资源：绿宝石、紫水晶、钻石</em>
        </div>
      </article>
    `;
  const zoneCards = ZONES.map((zone, index) => {
    const active = currentZone().id === zone.id;
    const unlocked = deepestDepthReached() >= zone.from;
    const totalWeight = Object.values(zone.weights).reduce((sum, weight) => sum + weight, 0);
    const newMaterials = zoneNewMaterialTypes(zone);
    const gateSummary = zoneGateSummary(zone);
    const resourceChips = Object.entries(zone.weights)
      .sort(([, left], [, right]) => right - left)
      .map(([type, weight]) => {
        const material = MATERIALS[type];
        const chance = Math.round((weight / totalWeight) * 100);
        const currentLocked = state.toolIndex < material.minToolIndex;
        const entryLocked = zone.requiredToolIndex < material.minToolIndex;
        const lockLabel = currentLocked
          ? `需${TOOLS[material.minToolIndex].name}`
          : entryLocked
            ? `${TOOLS[material.minToolIndex].name}后稳定`
            : "当前可挖";
        return `
          <span class="mine-resource-chip ${currentLocked ? "locked" : ""}">
            <i class="mini-block" style="${miniBlockStyle(type)}" aria-hidden="true"></i>
            <b>${material.name}</b>
            <small>约${chance}% · ${lockLabel}</small>
          </span>
        `;
      })
      .join("");
    return `
      <div class="mine-level-item ${active ? "active" : ""} ${unlocked ? "unlocked" : ""}">
        <div class="mine-level-main">
          <span class="mine-level-index">${String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>${zone.name}</strong>
            <small>${zoneDepthLabel(zone)} · ${zoneRequirementLabel(zone)}</small>
          </div>
          <em>${active ? "当前" : unlocked ? "已开放" : "未开放"}</em>
        </div>
        <p>${zone.description}</p>
        <div class="mine-resource-list">${resourceChips}</div>
        <footer>
          <span>新增：${newMaterials.length ? newMaterials.map((type) => MATERIALS[type].name).join("、") : "延续上一矿层资源"}</span>
          ${gateSummary ? `<span>深层门槛：${gateSummary}</span>` : ""}
        </footer>
      </div>
    `;
  }).join("");
  dom.mineLevelList.innerHTML = `
    ${nextCard}
    <div class="mine-atlas-note">掉落比例按普通挖矿权重估算；幸运附魔、矿灯宝箱和短局探险会带来额外收益。</div>
    <details class="mine-atlas-all">
      <summary>
        <span>展开全部矿层资源表</span>
        <small>${ZONES.length} 层区域 · 含深层门槛</small>
      </summary>
      <div class="mine-atlas-grid">${zoneCards}</div>
    </details>
  `;
}

function renderVillage() {
  const chapter = activeStoryChapter();
  const completed = !chapter;
  const victory = finalVictory();
  dom.storyChapter.textContent = completed
    ? victory ? "最终胜利" : "终局决战"
    : `第 ${state.storyChapter + 1} 章 / ${STORY_CHAPTERS.length}`;
  dom.storyTitle.textContent = completed
    ? victory ? "地心矿灯彻底复燃" : "地心终焉龙苏醒"
    : chapter.title;
  dom.storyDescription.textContent = completed
    ? victory
      ? "终极 Boss 已经倒下。猫猫村庄恢复了完整光亮，自由深渊模式已经开放。"
      : "前五章打开了通往终焉祭坛的路。继续强化装备、武器和矿灯，准备击败真正让矿灯熄灭的源头。"
    : chapter.building.description;

  dom.villageStructures.innerHTML = STORY_CHAPTERS.map((story, index) => {
    const built = isVillageBuilt(story.building.id);
    const defeated = state.defeatedBosses.includes(story.boss.id);
    const active = index === state.storyChapter;
    const status = defeated ? "已净化" : built ? "待挑战" : active ? "待修复" : "未开放";
    return `
      <div class="village-structure ${built ? "built" : ""} ${active ? "active" : ""}">
        <span aria-hidden="true">${story.building.icon}</span>
        <div>
          <strong>${story.building.name}</strong>
          <small>${story.building.effect}</small>
        </div>
        <em>${status}</em>
      </div>
    `;
  }).join("");

  if (completed && !victory) {
    const requirements = finalBossRequirements();
    const ready = requirements.every((requirement) => requirement.met);
    const metCount = requirements.filter((requirement) => requirement.met).length;
    const bossActive = caveGame?.hasActiveBoss();
    dom.villageAction.innerHTML = `
      <article class="final-boss-card">
        <small>FINAL BOSS · TRUE ENDING</small>
        <strong>${FINAL_BOSS.name}</strong>
        <p>所有村庄工程、矿层推进、镐子、剑与护甲升级，最终都是为了击败它。生命 ${FINAL_BOSS.hp} · 攻击 ${FINAL_BOSS.damage} · 门槛很高，但战斗仍允许撤退、补给和反复挑战。</p>
        <div class="final-gate-list">
          ${requirements.map((requirement) => `
            <div class="final-gate-item ${requirement.met ? "done" : "missing"}">
              <span>${requirement.met ? "✓" : "!"}</span>
              <div>
                <strong>${requirement.label}</strong>
                <small>当前 ${requirement.current}${requirement.unit} / 门槛 ${requirement.required}${requirement.unit}</small>
                <em>${requirement.met ? "已达标" : requirement.hint}</em>
              </div>
            </div>
          `).join("")}
        </div>
        <button class="buy-button final-boss-button" type="button" data-summon-final-boss="${FINAL_BOSS.id}" ${!ready || bossActive ? "disabled" : ""}>
          ${bossActive ? "终极 Boss 已进入矿洞" : ready ? `挑战${FINAL_BOSS.name}` : `门槛不足 ${metCount} / ${requirements.length}`}
        </button>
      </article>
    `;
    return;
  }

  if (completed && victory) {
    const contract = ensureAbyssContract();
    const material = MATERIALS[contract.material];
    const depthReady = state.depth >= contract.targetDepth;
    const materialReady = state.inventory[contract.material] >= contract.amount;
    const rerollCost = abyssContractRerollCost();
    const boss = abyssBossForLevel();
    const bossActive = caveGame?.hasActiveBoss();
    const resonanceCost = beaconResonanceCost();
    const resonanceMaxed = state.beaconResonance >= MAX_BEACON_RESONANCE;
    dom.villageAction.innerHTML = `
      <div class="victory-banner">
        <span>★ VICTORY ★</span>
        <strong>胜利！${FINAL_BOSS.name}已被击败</strong>
        <small>终极 Boss 倒下后，地心矿灯彻底复燃，自由深渊模式正式开放。</small>
      </div>
      <div class="abyss-summary">
        <strong>深渊记录</strong>
        <span>委托 ${state.abyssContractsCompleted}</span>
        <span>首领 ${state.abyssBossesDefeated}</span>
        <span>徽记 ${state.abyssMarks}</span>
      </div>
      <article class="abyss-card">
        <small>ABYSS ORDER · TIER ${contract.tier}</small>
        <strong>深渊物资委托</strong>
        <p class="${depthReady ? "done" : ""}">下潜至 ${contract.targetDepth}m ${depthReady ? "✓" : `· 当前 ${state.depth}m`}</p>
        <p class="${materialReady ? "done" : ""}">交付${material.name} × ${contract.amount} ${materialReady ? "✓" : `· 当前 ${state.inventory[contract.material]}`}</p>
        <em>奖励 ${contract.rewardCoins} 金币 · ${contract.rewardXp} 经验 · ${contract.rewardMarks} 徽记 · 1 探险券</em>
        <div class="abyss-actions">
          <button class="buy-button" type="button" data-complete-abyss-contract ${!depthReady || !materialReady ? "disabled" : ""}>提交委托</button>
          <button class="buy-button reroll-button" type="button" data-reroll-abyss-contract>换一批 · ${rerollCost}¢</button>
        </div>
      </article>
      <article class="abyss-card boss-contract">
        <small>ENDLESS BOSS · NEXT ${state.abyssBossesDefeated + 1}</small>
        <strong>${boss.name}</strong>
        <p>生命 ${boss.hp} · 攻击 ${boss.damage} · 击败后获得 ${boss.marks} 徽记</p>
        <button class="buy-button boss-button" type="button" data-summon-abyss-boss="${boss.id}" ${bossActive ? "disabled" : ""}>
          ${bossActive ? "Boss 已进入矿洞" : "召唤深渊首领"}
        </button>
      </article>
      <article class="abyss-card resonance-card">
        <small>BEACON RESONANCE</small>
        <strong>信标共鸣 Lv.${state.beaconResonance}</strong>
        <p>永久耐久 +${state.beaconResonance * 2}${resonanceMaxed ? " · 已达顶级" : ` → +${(state.beaconResonance + 1) * 2}`}</p>
        <button class="buy-button" type="button" data-upgrade-beacon ${resonanceMaxed || state.abyssMarks < resonanceCost ? "disabled" : ""}>
          ${resonanceMaxed ? "已满级" : `${resonanceCost} 徽记`}
        </button>
      </article>
    `;
    return;
  }

  const built = isVillageBuilt(chapter.building.id);
  if (!built) {
    const missing = missingRequirement(chapter.building.cost);
    const guidance = requirementGuidance(chapter.building.cost);
    dom.villageAction.innerHTML = `
      <p>${formatRequirement(chapter.building.cost)}</p>
      ${guidance ? `<small class="requirement-guidance">${guidance}</small>` : ""}
      <button class="buy-button village-button" type="button" data-repair-building="${chapter.building.id}" ${missing ? "disabled" : ""}>
        ${missing ? missingRequirementLabel(chapter.building.cost) : `修复${chapter.building.name}`}
      </button>
    `;
    return;
  }

  const bossActive = caveGame?.hasActiveBoss();
  dom.villageAction.innerHTML = `
    <p>工程完成。击败${chapter.boss.name}，解锁${chapter.unlock}。</p>
    <button class="buy-button village-button boss-button" type="button" data-summon-boss="${chapter.boss.id}" ${bossActive ? "disabled" : ""}>
      ${bossActive ? "Boss 已进入矿洞" : `召唤${chapter.boss.name}`}
    </button>
  `;
}

function renderShop() {
  dom.toolShop.innerHTML = TOOLS.slice(1)
    .map((tool, offset) => {
      const index = offset + 1;
      const owned = index <= state.toolIndex;
      const next = index === state.toolIndex + 1;
      const deepEnough = deepestDepthReached() >= tool.depth;
      const missing = missingRequirement(itemCost(tool));
      const guidance = !owned && next && deepEnough ? requirementGuidance(itemCost(tool)) : "";
      const label = owned ? "已拥有" : !deepEnough ? `深度 ${tool.depth}m` : missing ? missingRequirementLabel(itemCost(tool)) : `${tool.price} ¢`;
      return `
        <div class="shop-item">
          <span class="shop-item-icon" aria-hidden="true">⛏</span>
          <div class="shop-copy">
            <strong>${tool.name}</strong>
            <small>挖掘力 ${tool.damage}${tool.recipe ? ` · ${formatRequirement(tool.recipe)}` : ""}</small>
            ${guidance ? `<i class="requirement-guidance">${guidance}</i>` : ""}
          </div>
          <button
            class="buy-button"
            type="button"
            data-buy-tool="${index}"
            ${owned || !next || !deepEnough || missing ? "disabled" : ""}
          >${label}</button>
        </div>
      `;
    })
    .join("");

  const durabilityUpgrade = DURABILITY_UPGRADES[state.durabilityLevel];
  const nextDurabilityUpgrade = DURABILITY_UPGRADES[state.durabilityLevel + 1];
  const durabilityAffordable = nextDurabilityUpgrade && state.coins >= nextDurabilityUpgrade.price;
  dom.durabilityShop.innerHTML = `
    <div class="shop-item">
      <span class="shop-item-icon durability-icon" aria-hidden="true">↟</span>
      <div class="shop-copy">
        <strong>${durabilityUpgrade.name} <i>Lv.${state.durabilityLevel}</i></strong>
        <small>耐久上限 ${maxPickaxeDurability()}${nextDurabilityUpgrade ? ` → ${maxPickaxeDurability() + nextDurabilityUpgrade.bonus - durabilityUpgrade.bonus}` : " · 已达顶级"}</small>
      </div>
      <button
        class="buy-button"
        type="button"
        data-buy-durability="${state.durabilityLevel + 1}"
        ${!nextDurabilityUpgrade || !durabilityAffordable ? "disabled" : ""}
      >${nextDurabilityUpgrade ? durabilityAffordable ? `${nextDurabilityUpgrade.price} ¢` : missingCoinsLabel(nextDurabilityUpgrade.price) : "已满级"}</button>
    </div>
  `;

  dom.packShop.innerHTML = BACKPACKS.slice(1)
    .map((backpack, offset) => {
      const index = offset + 1;
      const owned = index <= state.backpackIndex;
      const next = index === state.backpackIndex + 1;
      const missing = missingRequirement(itemCost(backpack));
      const guidance = !owned && next ? requirementGuidance(itemCost(backpack)) : "";
      return `
        <div class="shop-item">
          <span class="shop-item-icon pack-icon" aria-hidden="true">▣</span>
          <div class="shop-copy">
            <strong>${backpack.name}</strong>
            <small>容量 ${backpack.capacity}${backpack.recipe ? ` · ${formatRequirement(backpack.recipe)}` : ""}</small>
            ${guidance ? `<i class="requirement-guidance">${guidance}</i>` : ""}
          </div>
          <button
            class="buy-button"
            type="button"
            data-buy-pack="${index}"
            ${owned || !next || missing ? "disabled" : ""}
          >${owned ? "已拥有" : missing ? missingRequirementLabel(itemCost(backpack)) : `${backpack.price} ¢`}</button>
        </div>
      `;
    })
    .join("");

  const lantern = LANTERNS[state.lanternLevel];
  const nextLantern = LANTERNS[state.lanternLevel + 1];
  const lanternMissing = nextLantern ? missingRequirement(itemCost(nextLantern)) : "";
  dom.lanternShop.innerHTML = `
    <div class="shop-item">
      <span class="shop-item-icon perk-icon" aria-hidden="true">✧</span>
      <div class="shop-copy">
        <strong>${lantern.name} <i>Lv.${state.lanternLevel}</i></strong>
        <small>收藏概率 +${Math.round(lantern.rareBonus * 100)}%${nextLantern?.recipe ? ` · 下级需要 ${formatRequirement(nextLantern.recipe)}` : " · 已达顶级"}</small>
        ${nextLantern && lanternMissing ? `<i class="requirement-guidance">${requirementGuidance(itemCost(nextLantern))}</i>` : ""}
      </div>
      <button
        class="buy-button"
        type="button"
        data-buy-lantern="${state.lanternLevel + 1}"
        ${!nextLantern || lanternMissing ? "disabled" : ""}
      >${nextLantern ? lanternMissing ? missingRequirementLabel(itemCost(nextLantern)) : `${nextLantern.price} ¢` : "已满级"}</button>
    </div>
  `;

  const sword = currentSword();
  const nextSword = SWORDS[state.swordIndex + 1];
  const swordAffordable = nextSword && state.coins >= nextSword.price;
  dom.swordShop.innerHTML = `
    <div class="shop-item">
      <span class="shop-item-icon perk-icon" aria-hidden="true">⚔</span>
      <div class="shop-copy">
        <strong class="quality-${sword.qualityClass}">${sword.name} · ${sword.quality}</strong>
        <small>攻击 ${sword.damage}${nextSword ? ` → ${nextSword.name} · ${nextSword.quality}` : " · 已达顶级"}</small>
      </div>
      <button
        class="buy-button"
        type="button"
        data-convert-sword="${state.swordIndex + 1}"
        ${!nextSword || !swordAffordable ? "disabled" : ""}
      >${nextSword ? swordAffordable ? `${nextSword.price} ¢` : missingCoinsLabel(nextSword.price) : "已满级"}</button>
    </div>
  `;

  dom.armorShop.innerHTML = Object.entries(ARMOR_SLOTS)
    .map(([slotId, slot]) => {
      const currentIndex = state.equipment[slotId];
      const currentTier = ARMOR_TIERS[currentIndex];
      const nextTier = ARMOR_TIERS[currentIndex + 1];
      const price = nextTier ? armorPrice(slotId, currentIndex + 1) : null;
      return `
        <div class="shop-item">
          <span class="shop-item-icon pack-icon" aria-hidden="true">${slot.icon}</span>
          <div class="shop-copy">
            <strong>${slot.name} · <i class="quality-${currentTier.qualityClass}">${currentTier.name}</i></strong>
            <small>护甲 ${Math.round(currentTier.defense * slot.multiplier)}${nextTier ? ` → ${nextTier.name}` : " · 已达顶级"}</small>
          </div>
          <button
            class="buy-button"
            type="button"
            data-craft-armor="${slotId}"
            ${!nextTier || state.coins < price ? "disabled" : ""}
          >${nextTier ? state.coins < price ? missingCoinsLabel(price) : `${price} ¢` : "已满级"}</button>
        </div>
      `;
    })
    .join("");

  dom.perkShop.innerHTML = Object.entries(PERKS)
    .map(([perkId, perk]) => {
      const level = state.perks[perkId];
      const maxed = level >= perk.max;
      const price = maxed ? null : perk.prices[level];
      return `
        <div class="shop-item">
          <span class="shop-item-icon perk-icon" aria-hidden="true">${perk.icon}</span>
          <div class="shop-copy">
            <strong>${perk.name} <i>Lv.${level}</i></strong>
            <small>${perk.effect(level)}</small>
          </div>
          <button
            class="buy-button"
            type="button"
            data-buy-perk="${perkId}"
            ${maxed || state.coins < price ? "disabled" : ""}
          >${maxed ? "已满级" : state.coins < price ? missingCoinsLabel(price) : `${price} ¢`}</button>
        </div>
      `;
    })
    .join("");
}

function renderAdventure() {
  dom.modalFreeExpeditionCount.textContent = state.freeExpeditionStarts;
  dom.modalTicketCount.textContent = state.expeditionTickets;
  if (!state.expedition) {
    dom.routeSelect.classList.remove("hidden");
    dom.expeditionScreen.classList.add("hidden");
    renderRoutes();
    return;
  }

  const expedition = state.expedition;
  const route = routeById(expedition.routeId);
  dom.routeSelect.classList.add("hidden");
  dom.expeditionScreen.classList.remove("hidden");
  dom.expeditionRouteName.textContent = route.name;
  dom.expeditionHealth.textContent = Array.from(
    { length: maxAdventureHealth(expedition.supplied) },
    (_, index) => (index < expedition.hp ? "♥" : "♡")
  ).join(" ");
  dom.expeditionPath.style.setProperty("--path-steps", route.steps);
  dom.expeditionPath.innerHTML = Array.from({ length: route.steps }, (_, index) => {
    const className = index < expedition.step ? "done" : index === expedition.step ? "current" : "";
    return `<i class="path-step ${className}"></i>`;
  }).join("");
  dom.expeditionScene.style.setProperty("--scene-color", route.color);
  dom.expeditionEvent.textContent = expedition.lastEvent;
  dom.expeditionStep.textContent = `${expedition.step} / ${route.steps} 步`;
  dom.advanceExpedition.textContent = expedition.completed ? "领取终点奖励" : "向前探索";
  dom.advanceExpedition.disabled = Boolean(expedition.pendingMerchant);
  dom.retreatExpedition.textContent = expedition.completed ? "稍后领取" : "撤离并带走战利品";
  renderMerchant();
  renderExpeditionLoot();
}

function renderRoutes() {
  dom.routeList.innerHTML = ROUTES.map((route) => {
    const lockReason = routeLockReason(route);
    const unlocked = !lockReason;
    const hasFreeExpedition = state.freeExpeditionStarts > 0;
    const hasTicket = state.expeditionTickets > 0;
    return `
      <article class="route-card ${unlocked ? "" : "locked"}" style="--route-color: ${route.color}">
        <span class="route-symbol" aria-hidden="true">${route.symbol}</span>
        <h3>${route.name}</h3>
        <p>${route.description}</p>
        <div class="route-meta">
          <span>${route.steps} 步路线</span>
          <span>风险 ${"◆".repeat(route.danger)}</span>
        </div>
        <div class="route-actions">
          <button class="buy-button" type="button" data-start-route="${route.id}" ${!unlocked || !hasFreeExpedition ? "disabled" : ""}>
            ${unlocked ? (hasFreeExpedition ? "免费出发" : "免费次数耗尽") : lockReason}
          </button>
          <button class="secondary-button ticket-button" type="button" data-start-route="${route.id}" data-use-ticket="true" ${!unlocked || !hasTicket ? "disabled" : ""}>
            ${hasTicket ? "探险券补给 · 体力 +2" : "探险券不足"}
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function routeLockReason(route) {
  if (deepestDepthReached() < route.unlockDepth) return `${route.unlockDepth}m 解锁`;
  if (state.toolIndex < route.requiredToolIndex) return `需要${TOOLS[route.requiredToolIndex].name}`;
  if (state.lanternLevel < route.requiredLanternLevel) return `需要${LANTERNS[route.requiredLanternLevel].name}`;
  return "";
}

function renderMerchant() {
  const merchant = state.expedition?.pendingMerchant;
  dom.merchantPanel.classList.toggle("hidden", !merchant);
  if (!merchant) {
    dom.merchantPanel.innerHTML = "";
    return;
  }

  dom.merchantPanel.innerHTML = `
    <div>
      <p class="eyebrow">UNDERGROUND MERCHANT</p>
      <h3>地下商人的临时摊位</h3>
      <small>金币会立即支付，购买的矿物会放入本局战利品袋。</small>
    </div>
    <div class="merchant-actions">
      <button class="buy-button" type="button" data-merchant-action="rest" ${state.coins < merchant.restCost ? "disabled" : ""}>
        热汤休息 · ${state.coins < merchant.restCost ? missingCoinsLabel(merchant.restCost) : `${merchant.restCost} ¢`} · 体力 +2
      </button>
      <button class="buy-button" type="button" data-merchant-action="buy" ${state.coins < merchant.materialCost ? "disabled" : ""}>
        购买${MATERIALS[merchant.material].name} · ${state.coins < merchant.materialCost ? missingCoinsLabel(merchant.materialCost) : `${merchant.materialCost} ¢`}
      </button>
      <button class="secondary-button" type="button" data-merchant-action="skip">礼貌离开</button>
    </div>
  `;
}

function renderExpeditionLoot() {
  const expedition = state.expedition;
  if (!expedition) return;

  const materials = Object.entries(expedition.loot)
    .filter(([, amount]) => amount > 0)
    .map(([type, amount]) => `
      <span class="loot-item">
        <i class="mini-block" style="${miniBlockStyle(type)}" aria-hidden="true"></i>
        ${MATERIALS[type].name} × ${amount}
      </span>
    `);

  if (expedition.coins > 0) {
    materials.push(`<span class="loot-item loot-coins">¢ 金币 × ${expedition.coins}</span>`);
  }

  dom.expeditionLoot.innerHTML = materials.length
    ? materials.join("")
    : '<span class="loot-item">矿灯旁还是空的，继续向前探索。</span>';
}

function discoveryProgress() {
  const materialDiscoveries = Object.values(state.discoveries.materials).filter(Boolean).length;
  const collectibleDiscoveries = Object.values(state.discoveries.collectibles).filter(Boolean).length;
  return {
    completed: materialDiscoveries + collectibleDiscoveries,
    total: Object.keys(MATERIALS).length + Object.keys(COLLECTIBLES).length,
  };
}

function renderCollection() {
  const progress = discoveryProgress();
  dom.collectionProgress.textContent = progress.completed;
  dom.collectionSummary.innerHTML = `
    <strong>${progress.completed} / ${progress.total}</strong>
    <span>项矿洞发现已收入图鉴</span>
    <small>新矿物会补充图鉴，稀有收藏品会陈列在猫窝里。</small>
  `;
  dom.collectionGrid.innerHTML = Object.entries(MATERIALS).map(([type, material]) => {
    const discovered = state.discoveries.materials[type];
    return `
      <article class="collection-entry ${discovered ? "" : "unknown"}">
        <i class="mini-block" style="${miniBlockStyle(type)}" aria-hidden="true"></i>
        <div>
          <strong>${discovered ? material.name : "未发现矿物"}</strong>
          <small>${discovered ? `${material.origin} · ${material.description}` : "继续深入矿洞，留意新的方块颜色。"}</small>
        </div>
      </article>
    `;
  }).join("");
  dom.collectibleShelf.innerHTML = Object.entries(COLLECTIBLES).map(([type, collectible]) => {
    const discovered = state.discoveries.collectibles[type];
    return `
      <article class="shelf-slot ${discovered ? "" : "unknown"}">
        <span aria-hidden="true">${discovered ? collectible.symbol : "?"}</span>
        <strong>${discovered ? collectible.name : "空置展位"}</strong>
        <small>${discovered ? `收藏数量 × ${state.collectibles[type]}` : "宝箱中可能藏着惊喜"}</small>
      </article>
    `;
  }).join("");
}

function renderDiscoveryCard() {
  if (!discoveryQueue.length) {
    dom.discoveryCard.classList.add("hidden");
    return;
  }
  const discovery = discoveryQueue[0];
  dom.discoveryName.textContent = discovery.name;
  dom.discoveryDescription.textContent = discovery.description;
  dom.discoveryCard.classList.remove("hidden");
}

function renderObjective() {
  const chapter = activeStoryChapter();

  if (chapter && !isVillageBuilt(chapter.building.id)) {
    dom.currentObjective.textContent = `主线：修复${chapter.building.name}，需要 ${formatRequirement(chapter.building.cost)}`;
    return;
  }

  if (chapter) {
    dom.currentObjective.textContent = `主线：召唤并击败${chapter.boss.name}，解锁${chapter.unlock}`;
    return;
  }

  if (storyCompleted() && !finalVictory()) {
    dom.currentObjective.textContent = finalBossReady()
      ? `终局：挑战${FINAL_BOSS.name}，赢下真正通关`
      : `终局备战：${finalBossGateText()}`;
    return;
  }

  if (finalVictory()) {
    const contract = ensureAbyssContract();
    const material = MATERIALS[contract.material];
    if (state.depth < contract.targetDepth) {
      dom.currentObjective.textContent = `深渊委托 Tier ${contract.tier}：继续下潜至 ${contract.targetDepth}m`;
      return;
    }
    if (state.inventory[contract.material] < contract.amount) {
      dom.currentObjective.textContent = `深渊委托 Tier ${contract.tier}：收集${material.name} ${state.inventory[contract.material]} / ${contract.amount}`;
      return;
    }
    dom.currentObjective.textContent = `深渊委托 Tier ${contract.tier} 已完成：返回猫猫村庄提交物资`;
    return;
  }

  dom.currentObjective.textContent = "最终胜利：地心矿灯已经彻底重新亮起";
}

function renderSideObjective() {
  const expedition = state.expedition;
  if (state.pickaxeDurability <= 0) {
    dom.sideObjective.textContent = `支线：镐子耐久耗尽，支付 ${repairPickaxeCost()} 金币完成修理`;
    return;
  }

  if (expedition) {
    const route = routeById(expedition.routeId);
    if (expedition.pendingMerchant) {
      dom.sideObjective.textContent = `支线：在${route.name}与地下商人交易或离开，再继续探索`;
      return;
    }
    if (expedition.completed) {
      dom.sideObjective.textContent = `支线：领取${route.name}终点奖励，将战利品带回村庄`;
      return;
    }
    dom.sideObjective.textContent = `支线：完成${route.name}短局探险 ${expedition.step} / ${route.steps} 步 · 体力 ${expedition.hp} / ${maxAdventureHealth(expedition.supplied)}`;
    return;
  }

  if (storyCompleted() && !finalVictory()) {
    dom.sideObjective.textContent = finalBossReady()
      ? `支线：终局门槛已达成，前往村庄召唤${FINAL_BOSS.name}`
      : `支线：终极 Boss 门槛 - ${finalBossGateText()}`;
    return;
  }

  const nextLantern = LANTERNS[state.lanternLevel + 1];
  if (nextLantern) {
    dom.sideObjective.textContent = `支线：改装${nextLantern.name}，需要 ${formatRequirement(itemCost(nextLantern))}`;
    return;
  }

  const discovered = discoveryProgress();
  if (discovered.completed < discovered.total) {
    dom.sideObjective.textContent = `支线：进入短局探险，补全矿物图鉴与猫窝收藏 ${discovered.completed} / ${discovered.total}`;
    return;
  }

  const nextTool = TOOLS[state.toolIndex + 1];
  if (nextTool) {
    dom.sideObjective.textContent = `支线：将镐子升级为${nextTool.name}，继续探索更深矿层`;
    return;
  }

  const nextPack = BACKPACKS[state.backpackIndex + 1];
  if (nextPack) {
    dom.sideObjective.textContent = `支线：将背包升级为${nextPack.name}，带回更多战利品`;
    return;
  }

  dom.sideObjective.textContent = "支线：挑战短局探险并继续补充猫窝收藏";
}

function sellInventory() {
  const value = inventoryValue();
  if (!value) {
    showToast("背包还是空的，先去敲几块方块吧。");
    return;
  }

  state.coins += value;
  state.inventory = defaultInventory();
  showToast(`出售成功，获得 ${value} 金币。`);
  logEvent(`矿物打包售出，入账 ${value} 金币。`);
  playTone("coin");
  renderAll();
  saveGame();
}

function sellMaterial(type) {
  const material = MATERIALS[type];
  if (!material || state.inventory[type] <= 0) return;

  state.inventory[type] -= 1;
  state.coins += material.value;
  showToast(`卖出 1 个${material.name}，获得 ${material.value} 金币。`);
  logEvent(`${material.name}单独售出，背包为主线材料留出了空间。`);
  playTone("coin");
  renderAll();
  saveGame();
}

function buyTool(index) {
  const tool = TOOLS[index];
  if (!tool || index !== state.toolIndex + 1 || deepestDepthReached() < tool.depth) return;
  const cost = itemCost(tool);
  const missing = missingRequirement(cost);
  if (missing) {
    showToast(`购买${tool.name}还缺：${missing}。`);
    playTone("error");
    return;
  }

  consumeRequirement(cost);
  state.toolIndex = index;
  showToast(`装备成功：${tool.name}，挖掘力提升到 ${tool.damage}。当前耐久保持不变。`);
  logEvent(`商店送来了${tool.name}，坚硬矿层也能轻松处理。`);
  playTone("upgrade");
  renderAll();
  saveGame();
}

function buyDurabilityUpgrade(index) {
  const upgrade = DURABILITY_UPGRADES[index];
  if (!upgrade || index !== state.durabilityLevel + 1) return;
  if (state.coins < upgrade.price) {
    showToast(`还差 ${upgrade.price - state.coins} 金币才能安装${upgrade.name}。`);
    playTone("error");
    return;
  }

  state.coins -= upgrade.price;
  state.durabilityLevel = index;
  showToast(`${upgrade.name}安装完成：耐久上限提升至 ${maxPickaxeDurability()}，当前耐久保持不变。`);
  logEvent("耐久强化完成。下次使用金币修理时，镐子会恢复至新的耐久上限。");
  playTone("upgrade");
  renderAll();
  saveGame();
}

function buyBackpack(index) {
  const backpack = BACKPACKS[index];
  if (!backpack || index !== state.backpackIndex + 1) return;
  const cost = itemCost(backpack);
  const missing = missingRequirement(cost);
  if (missing) {
    showToast(`购买${backpack.name}还缺：${missing}。`);
    playTone("error");
    return;
  }

  consumeRequirement(cost);
  state.backpackIndex = index;
  showToast(`背包升级为${backpack.name}，容量提升到 ${backpack.capacity}。`);
  logEvent(`新背包到货，可以在矿洞里多待一会儿了。`);
  playTone("upgrade");
  renderAll();
  saveGame();
}

function buyLantern(index) {
  const lantern = LANTERNS[index];
  if (!lantern || index !== state.lanternLevel + 1) return;
  const cost = itemCost(lantern);
  const missing = missingRequirement(cost);
  if (missing) {
    showToast(`安装${lantern.name}还缺：${missing}。`);
    playTone("error");
    return;
  }

  consumeRequirement(cost);
  state.lanternLevel = index;
  state.perks.lantern = index;
  showToast(`${lantern.name}安装完成，更深区域和稀有发现已经开放。`);
  logEvent(`矿灯改装完成：${lantern.name}正在照亮新的岔路。`);
  playTone("upgrade");
  renderAll();
  saveGame();
}

function convertSword(index) {
  const sword = SWORDS[index];
  if (!sword || index !== state.swordIndex + 1) return;
  if (state.coins < sword.price) {
    showToast(`还差 ${sword.price - state.coins} 金币才能转换${sword.name}。`);
    playTone("error");
    return;
  }

  state.coins -= sword.price;
  state.swordIndex = index;
  showToast(`剑转换完成：${sword.name} · ${sword.quality}。`);
  logEvent(`剑转换台亮起，猫猫装备了${sword.quality}品质的${sword.name}。`);
  playTone("upgrade");
  renderAll();
  saveGame();
}

function craftArmor(slotId) {
  const slot = ARMOR_SLOTS[slotId];
  const nextIndex = state.equipment[slotId] + 1;
  const tier = ARMOR_TIERS[nextIndex];
  if (!slot || !tier) return;

  const price = armorPrice(slotId, nextIndex);
  if (state.coins < price) {
    showToast(`还差 ${price - state.coins} 金币才能锻造${tier.name}${slot.name}。`);
    playTone("error");
    return;
  }

  state.coins -= price;
  state.equipment[slotId] = nextIndex;
  showToast(`已装备${tier.name}${slot.name}，总护甲提升至 ${armorScore()}。`);
  logEvent(`护甲锻造完成：${tier.name}${slot.name}已放入装备栏。`);
  playTone("upgrade");
  renderAll();
  saveGame();
}

function buyFullStamina({ prompt = true } = {}) {
  const cost = staminaTopUpCost();
  if (state.stamina >= maxStamina()) {
    showToast("体力已经是满的。");
    return false;
  }
  if (state.coins < cost) {
    showToast(`体力不足，购买满体力需要 ${cost} 金币，还差 ${cost - state.coins} 金币。`);
    playTone("error");
    return false;
  }
  if (prompt && !window.confirm(`体力不足！支付 ${cost} 金币购买满体力？`)) {
    showToast("体力不足，补给站热汤可以恢复体力。");
    return false;
  }
  state.coins -= cost;
  state.stamina = maxStamina();
  showToast(`已支付 ${cost} 金币，体力恢复至 ${state.stamina} / ${maxStamina()}。`);
  logEvent("小猫在补给站购买体力，重新握紧镐子继续挖矿。");
  playTone("upgrade");
  renderAll();
  saveGame();
  return true;
}

function spendStamina(amount = 1) {
  if (state.stamina <= 0) return false;
  state.stamina = Math.max(0, state.stamina - Math.max(0, amount));
  if (state.stamina <= 0) {
    showToast("体力耗尽，不会重置游戏；可以用金币购买体力后继续挖矿。");
    logEvent("体力已经耗尽。小猫需要热汤或金币补给，但不会因此失去进度。");
  }
  return true;
}

function canCollectCaveMaterial() {
  if (inventoryTotal() >= BACKPACKS[state.backpackIndex].capacity) {
    return { message: "背包已满，按 S 出售或升级背包。" };
  }
  if (state.stamina <= 0) {
    const bought = buyFullStamina();
    return bought || { message: "体力不足，购买热汤或支付金币补满体力后才能继续挖矿。" };
  }
  return true;
}

function collectCaveMaterial({ type }) {
  const backpack = BACKPACKS[state.backpackIndex];
  const luckyDrop = Math.random() < fortuneChance();
  const amount = Math.min(luckyDrop ? 2 : 1, backpack.capacity - inventoryTotal());
  state.inventory[type] += amount;
  markMaterialDiscovered(type);
  state.pickaxeDurability = Math.max(0, state.pickaxeDurability - 1);
  state.mined += 1;
  if (state.mined % CAVE_FATIGUE_INTERVAL === 0) {
    spendStamina(1);
    logEvent(`连续挖掘消耗了 1 点体力，当前体力 ${state.stamina} / ${maxStamina()}。`);
  }
  addXp(2);
  addMiningExpeditionRewards();
  logEvent(luckyDrop && amount > 1
    ? `幸运附魔生效，小猫挖到了双倍${MATERIALS[type].name}。`
    : `小猫在矿洞中挖到了${MATERIALS[type].name}。`);
  playTone(type === "diamond" ? "diamond" : "break");
  renderAll();
  saveGame();
  return { amount, durability: state.pickaxeDurability, name: MATERIALS[type].name };
}

function descendCaveLayer() {
  const chapter = activeStoryChapter();
  if (caveGame?.hasActiveBoss()) {
    const message = "无法进入下一层：区域 Boss 仍在矿洞中，先击败它才能继续下潜。";
    showToast(message);
    logEvent(message);
    playTone("error");
    return { advanced: false, message };
  }

  if (chapter && state.depth >= chapter.maxDepth) {
    const message = `无法进入下一层：已抵达${chapter.zone}最深处 ${chapter.maxDepth}m。修复${chapter.building.name}并击败${chapter.boss.name}，才能继续下潜。`;
    showToast(message);
    logEvent(message);
    playTone("error");
    return { advanced: false, message };
  }

  const targetDepth = state.depth + 1;
  const accessIssue = depthAccessIssue(targetDepth);
  if (accessIssue) {
    const message = `无法进入下一层：${targetDepth}m 的矿层过于危险，${accessIssue}。`;
    showToast(message);
    logEvent(message);
    playTone("error");
    return { advanced: false, message };
  }

  state.depth = targetDepth;
  state.maxDepthReached = Math.max(state.maxDepthReached, state.depth);
  addXp(4);
  const zone = currentZone();
  showToast(`下潜成功：抵达 ${state.depth}m ${zone.name}。`);
  logEvent(`小猫凿穿矿井底部，进入 ${state.depth}m ${zone.name}。新的矿层与怪物已经出现。`);
  playTone("upgrade");
  renderAll();
  saveGame();
  return { advanced: true, depth: state.depth, zone: zone.name };
}

function repairPickaxe() {
  const cost = repairPickaxeCost();
  if (state.pickaxeDurability >= maxPickaxeDurability()) {
    showToast("镐子耐久已经是满的。");
    return;
  }

  if (state.coins < cost) {
    showToast(`修理需要 ${cost} 金币，还差 ${cost - state.coins} 金币。先出售背包里的矿物。`);
    logEvent("修理站暂未开工：先出售采集的矿物，再补满镐子耐久。");
    playTone("error");
    return;
  }

  state.coins -= cost;
  state.pickaxeDurability = maxPickaxeDurability();
  state.shiftsStarted += 1;
  showToast(`金币修理完成：支付 ${cost} 金币，镐子耐久已补满。`);
  logEvent(`修理站完成第 ${state.shiftsStarted} 次维护。小猫保留当前位置，继续向前挖掘。`);
  playTone("upgrade");
  renderAll();
  saveGame();
}

function ascendCaveLayer() {
  if (accessibleDepth() <= 1) {
    showToast("当前已经在矿洞入口。");
    return;
  }

  state.depth -= 1;
  const zone = currentZone();
  if (caveGame) {
    caveGame.generateWorld();
    caveGame.resetPosition();
  }
  showToast(`已返回上层：${state.depth}m ${zone.name}。`);
  logEvent(`小猫沿着安全绳返回 ${state.depth}m ${zone.name}，历史最深进度仍保留在 ${deepestDepthReached()}m。`);
  playTone("upgrade");
  renderAll();
  saveGame();
}

function openCaveShop() {
  dom.caveShopModal.classList.remove("hidden");
  renderCaveShop();
}

function closeCaveShop() {
  dom.caveShopModal.classList.add("hidden");
}

function buyCaveSupply(supplyId) {
  if (supplyId === "soup") {
    const cost = caveSoupCost();
    if (state.coins < cost) {
      showToast(`购买矿工热汤还缺 ${cost - state.coins} 金币。`);
      return;
    }
    const previousStamina = state.stamina;
    state.stamina = Math.min(maxStamina(), state.stamina + STAMINA_RESTORE_AMOUNT);
    const restored = state.stamina - previousStamina;
    if (restored <= 0) {
      showToast("体力已经是满的。");
      return;
    }
    state.coins -= cost;
    showToast(`矿工热汤恢复 ${restored} 点体力。`);
    logEvent("补给站的热汤让小猫恢复体力，可以继续挖矿。");
    playTone("upgrade");
    renderAll();
    saveGame();
    return;
  }

  if (supplyId === "bandage") {
    const caveStatus = caveGame?.getStatus();
    if (!caveStatus || caveStatus.hp >= caveStatus.maxHp) {
      showToast("血量已经是满的。");
      return;
    }
    const missing = missingRequirementLabel(HEALTH_KIT_RECIPE);
    if (missing) {
      showToast(`回血材料不足：${missing}。`);
      playTone("error");
      return;
    }
    consumeRequirement(HEALTH_KIT_RECIPE);
    const restored = caveGame?.healPlayer(HEALTH_KIT_RESTORE) || 0;
    showToast(`战斗绷带恢复 ${restored} 点血量。`);
    logEvent(`小猫用${formatRequirement(HEALTH_KIT_RECIPE)}制作战斗绷带，恢复了血量。`);
    playTone("upgrade");
    renderAll();
    saveGame();
    return;
  }

  if (supplyId === "repair") {
    repairPickaxe();
    return;
  }

  if (supplyId === "sell") sellInventory();
}

function buyCaveMaterial(type) {
  const material = MATERIALS[type];
  if (!material || !state.discoveries.materials[type]) return;
  if (!BUYABLE_SPECIAL_MATERIALS.has(type)) {
    showToast(`${material.name}是普通材料，只能通过挖矿获得。`);
    playTone("error");
    return;
  }
  const price = material.value * 3;
  if (inventoryTotal() >= BACKPACKS[state.backpackIndex].capacity) {
    showToast("背包已满，先出售材料或升级背包。");
    return;
  }
  if (state.coins < price) {
    showToast(`购买${material.name}还缺 ${price - state.coins} 金币。`);
    playTone("error");
    return;
  }
  state.coins -= price;
  state.inventory[type] += 1;
  showToast(`购买 1 块${material.name}，支付 ${price} 金币。`);
  logEvent(`矿洞商店补齐了 1 块${material.name}。`);
  playTone("coin");
  renderAll();
  saveGame();
}

function defeatCaveEnemy({ id, isBoss, name, coins, xp, marks = 0 }) {
  state.coins += coins;
  addXp(xp);
  if (isBoss) {
    if (!completeFinalBoss(id, marks) && !completeStoryBoss(id)) completeAbyssBoss(id, marks);
  } else {
    showToast(`击败${name}，获得 ${coins} 金币。`);
    logEvent(`${name}被击败，剑的品质正在改变矿洞里的生存方式。`);
  }
  playTone("coin");
  renderAll();
  saveGame();
}

function repairVillageBuilding(buildingId) {
  const chapter = activeStoryChapter();
  if (!chapter || chapter.building.id !== buildingId || isVillageBuilt(buildingId)) return;

  const missing = missingRequirement(chapter.building.cost);
  if (missing) {
    showToast(`修复材料不足：还缺 ${missing}。`);
    logEvent(`${chapter.building.name}仍在等待材料，先回矿洞继续采集。`);
    playTone("error");
    return;
  }

  Object.entries(chapter.building.cost).forEach(([type, amount]) => {
    if (type === "coins") {
      state.coins -= amount;
      return;
    }
    state.inventory[type] -= amount;
  });
  state.village[buildingId] = true;
  normalizePickaxeDurability();
  normalizeStamina();
  showToast(`${chapter.building.name}修复完成！${chapter.building.effect}。`);
  logEvent(`${chapter.building.name}重新亮起。现在可以召唤${chapter.boss.name}，夺回通往${chapter.unlock}的道路。`);
  playTone("upgrade");
  renderAll();
  saveGame();
}

function summonStoryBoss(bossId) {
  const chapter = activeStoryChapter();
  if (!chapter || chapter.boss.id !== bossId || !isVillageBuilt(chapter.building.id)) return;
  if (!caveGame || caveGame.hasActiveBoss()) {
    showToast("区域 Boss 已经进入矿洞。");
    return;
  }

  caveGame.spawnBoss(chapter.boss);
  showToast(`${chapter.boss.name}被矿灯吸引到了矿洞！`);
  logEvent(`警报：${chapter.boss.name}出现。准备好剑与护甲，按 F 迎战。`);
  playTone("error");
  renderAll();
}

function completeStoryBoss(bossId) {
  const chapter = activeStoryChapter();
  if (!chapter || chapter.boss.id !== bossId) return false;

  state.defeatedBosses.push(bossId);
  state.storyChapter += 1;
  const nextChapter = activeStoryChapter();
  showToast(nextChapter
    ? `区域净化完成：${chapter.unlock}已经开放！`
    : `终局开启：${FINAL_BOSS.name}已经苏醒，继续提升战力后再挑战它。`
  );
  logEvent(nextChapter
    ? `${chapter.boss.name}倒下了。${chapter.unlock}的道路已经打开，村庄等待下一项修复工程。`
    : `${chapter.boss.name}倒下了，但熄灭矿灯的真正源头仍在终焉祭坛。所有升级目标都指向最终战。`
  );
  return true;
}

function summonFinalBoss(bossId) {
  if (!storyCompleted() || finalVictory() || bossId !== FINAL_BOSS.id) return;
  if (!caveGame || caveGame.hasActiveBoss()) {
    showToast("已有 Boss 进入矿洞。");
    return;
  }
  if (!finalBossReady()) {
    showToast(`终极 Boss 门槛不足：${finalBossGateText()}。`);
    logEvent("终局祭坛拒绝开启：继续提升深度、武器、护甲、矿灯和等级。");
    playTone("error");
    return;
  }

  caveGame.spawnBoss(FINAL_BOSS);
  showToast(`${FINAL_BOSS.name}降临矿洞！这是最终通关战。`);
  logEvent(`终局警报：${FINAL_BOSS.name}出现。保持距离，使用最强武器反复攻击。`);
  playTone("error");
  renderAll();
}

function completeFinalBoss(bossId, marks) {
  if (bossId !== FINAL_BOSS.id || finalVictory()) return false;

  state.finalBossDefeated = true;
  state.defeatedBosses.push(bossId);
  state.abyssMarks += marks;
  ensureAbyssContract();
  showToast(`最终胜利！${FINAL_BOSS.name}倒下，地心矿灯彻底复燃。`);
  logEvent(`${FINAL_BOSS.name}被击败。猫猫村庄真正获救，自由深渊模式现在开放。`);
  return true;
}

function completeAbyssBoss(bossId, marks) {
  const boss = abyssBossForLevel();
  if (boss.id !== bossId) return false;

  state.abyssBossesDefeated += 1;
  state.abyssMarks += marks;
  showToast(`击败${boss.name}：获得 ${boss.reward} 金币和 ${marks} 枚深渊徽记。`);
  logEvent(`${boss.name}已经净化。信标记录了新的首领层级，下一只深渊首领会更强。`);
  return true;
}

function completeAbyssContract() {
  if (!finalVictory()) return;
  const contract = ensureAbyssContract();
  if (state.depth < contract.targetDepth) {
    showToast(`还需要继续下潜至 ${contract.targetDepth}m。`);
    playTone("error");
    return;
  }
  if (state.inventory[contract.material] < contract.amount) {
    showToast(`还缺 ${contract.amount - state.inventory[contract.material]} 块${MATERIALS[contract.material].name}。`);
    playTone("error");
    return;
  }

  state.inventory[contract.material] -= contract.amount;
  state.coins += contract.rewardCoins;
  state.abyssMarks += contract.rewardMarks;
  state.expeditionTickets = Math.min(MAX_TICKETS, state.expeditionTickets + 1);
  addXp(contract.rewardXp);
  state.abyssContractsCompleted += 1;
  state.abyssContract = createAbyssContract();
  showToast(`委托完成：获得 ${contract.rewardCoins} 金币和 ${contract.rewardMarks} 枚深渊徽记。`);
  logEvent(`深渊委托 Tier ${contract.tier} 已交付。新的物资单已经送到信标旁。`);
  playTone("upgrade");
  renderAll();
  saveGame();
}

function rerollAbyssContract() {
  if (!finalVictory()) return;
  const cost = abyssContractRerollCost();
  if (state.coins < cost) {
    showToast(`更换委托需要 ${cost} 金币，还差 ${cost - state.coins} 金币。`);
    playTone("error");
    return;
  }

  state.coins -= cost;
  state.abyssContract = createAbyssContract();
  showToast(`已支付 ${cost} 金币，信标换来了一批新的深渊物资单。`);
  logEvent("深渊委托已经刷新，新的下潜目标和交付材料已写入记录。");
  playTone("coin");
  renderAll();
  saveGame();
}

function summonAbyssBoss(bossId) {
  if (!finalVictory()) return;
  const boss = abyssBossForLevel();
  if (boss.id !== bossId) return;
  if (!caveGame || caveGame.hasActiveBoss()) {
    showToast("已有 Boss 进入矿洞。");
    return;
  }

  caveGame.spawnBoss(boss);
  showToast(`${boss.name}回应信标，进入矿洞！`);
  logEvent(`深渊警报：${boss.name}出现。击败它可以获得信标共鸣需要的徽记。`);
  playTone("error");
  renderAll();
}

function upgradeBeaconResonance() {
  if (!finalVictory() || state.beaconResonance >= MAX_BEACON_RESONANCE) return;
  const cost = beaconResonanceCost();
  if (state.abyssMarks < cost) {
    showToast(`还差 ${cost - state.abyssMarks} 枚深渊徽记。`);
    playTone("error");
    return;
  }

  state.abyssMarks -= cost;
  state.beaconResonance += 1;
  showToast(`信标共鸣提升至 Lv.${state.beaconResonance}，镐耐久上限永久 +2。`);
  logEvent("地心信标吸收了深渊徽记，修理站现在能维护更耐用的镐子。");
  playTone("upgrade");
  renderAll();
  saveGame();
}

function resetEquipmentAfterHealthDeath(reason = HEALTH_DEATH_RESET_MESSAGE) {
  state.inventory = defaultInventory();
  state.swordIndex = 0;
  state.equipment = defaultEquipment();
  if (caveGame) {
    caveGame.generateWorld();
    caveGame.resetPosition(true);
  }
  showToast(reason);
  logEvent("战斗失败后，小猫保留已到达深度、矿洞等级、镐子升级、矿灯、背包等级、金币和村庄进度；背包资源清空，剑与护甲等级归零。");
  playTone("error");
  renderAll();
  saveGame();
}

function handleCaveDeath({ maxHp = 5 } = {}) {
  const missing = missingRequirementLabel(HEALTH_KIT_RECIPE);
  const canHeal = !missing;
  const wantsHeal = canHeal && window.confirm(
    `血量归零！消耗 ${formatRequirement(HEALTH_KIT_RECIPE)} 立即回血并退回安全点？\n选择“取消”将清空背包资源并重置剑与护甲。${HEALTH_DEATH_PRESERVE_MESSAGE}`
  );

  if (wantsHeal) {
    consumeRequirement(HEALTH_KIT_RECIPE);
    showToast(`战斗绷带生效，血量恢复 ${Math.min(maxHp, HEALTH_REVIVE_AMOUNT)} 点。`);
    logEvent("小猫用随身材料制作战斗绷带，从怪物攻击中缓过来了。");
    playTone("upgrade");
    renderAll();
    saveGame();
    return {
      revived: true,
      hp: Math.min(maxHp, HEALTH_REVIVE_AMOUNT),
      message: "战斗绷带生效：血量已恢复，已退回最近安全点。",
    };
  }

  if (!canHeal) {
    window.alert(`血量归零，回血需要 ${formatRequirement(HEALTH_KIT_RECIPE)}；当前还缺 ${missing}。将清空背包资源并重置剑与护甲。${HEALTH_DEATH_PRESERVE_MESSAGE}`);
  } else {
    window.alert(`你选择不使用材料回血，将清空背包资源并重置剑与护甲。${HEALTH_DEATH_PRESERVE_MESSAGE}`);
  }

  resetEquipmentAfterHealthDeath();
  return {
    reset: true,
    message: HEALTH_DEATH_RESET_MESSAGE,
  };
}

function updateCaveStatus(status) {
  renderCaveHud(status);
}

function createCaveGame() {
  caveGame = new window.CaveGame(dom.caveCanvas, {
    canCollect: canCollectCaveMaterial,
    getConfig: () => {
      const sword = currentSword();
      return {
        armor: armorScore(),
        criticalChance: state.perks.sharpness * 0.06,
        depth: accessibleDepth(),
        durability: state.pickaxeDurability,
        fortuneChance: fortuneChance(),
        materialNames: Object.fromEntries(Object.entries(MATERIALS).map(([type, material]) => [type, material.name])),
        maxHp: maxCombatHealth(),
        swordColor: sword.color,
        swordDamage: sword.damage,
        swordName: sword.name,
        swordQuality: sword.quality,
        repairCost: repairPickaxeCost(),
        toolDamage: TOOLS[state.toolIndex].damage,
        toolIndex: state.toolIndex,
      };
    },
    onDescend: descendCaveLayer,
    onEnemyDefeated: defeatCaveEnemy,
    onHint: (message) => {
      dom.caveHint.textContent = message;
    },
    onMine: collectCaveMaterial,
    onPlayerDeath: handleCaveDeath,
    onStatus: updateCaveStatus,
  });
  window.caveGame = caveGame;
}

function buyPerk(perkId) {
  const perk = PERKS[perkId];
  const level = state.perks[perkId];
  if (!perk || level >= perk.max) return;

  const price = perk.prices[level];
  if (state.coins < price) {
    showToast(`还差 ${price - state.coins} 金币才能强化${perk.name}。`);
    playTone("error");
    return;
  }

  state.coins -= price;
  state.perks[perkId] += 1;
  showToast(`${perk.name}强化至 Lv.${state.perks[perkId]}。`);
  logEvent(`工坊升级完成：${perk.name}，${perk.effect(state.perks[perkId])}。`);
  playTone("upgrade");
  renderAll();
  saveGame();
}

function openAdventure() {
  dom.adventureModal.classList.remove("hidden");
  renderAdventure();
}

function closeAdventure() {
  dom.adventureModal.classList.add("hidden");
}

function openCollection() {
  dom.collectionModal.classList.remove("hidden");
  renderCollection();
}

function closeCollection() {
  dom.collectionModal.classList.add("hidden");
}

function closeDiscovery() {
  discoveryQueue.shift();
  dom.discoveryCard.classList.add("hidden");
  renderDiscoveryCard();
}

function startExpedition(routeId, supplied = false) {
  const route = routeById(routeId);
  if (!route || state.expedition || routeLockReason(route)) return;
  if (supplied && state.expeditionTickets < 1) {
    showToast("探险券不足，每挖 12 个方块可以恢复 1 张。");
    return;
  }
  if (!supplied && state.freeExpeditionStarts < 1) {
    showToast("免费出发次数已用完，再挖 12 个方块可恢复 1 次；也可以使用探险券补给出发。");
    return;
  }

  if (supplied) state.expeditionTickets -= 1;
  else state.freeExpeditionStarts -= 1;
  state.expedition = {
    routeId,
    step: 0,
    hp: maxAdventureHealth(supplied),
    supplied,
    loot: defaultInventory(),
    coins: 0,
    xp: 0,
    completed: false,
    pendingMerchant: null,
    lastEvent: supplied
      ? "探险券换来了额外补给。小猫握紧矿灯，准备迈出第一步。"
      : "小猫轻装出发，握紧矿灯准备迈出第一步。",
  };
  logEvent(`探险队进入${route.name}，矿灯在黑暗中摇晃。`);
  playTone("upgrade");
  renderAll();
  saveGame();
}

function chooseExpeditionMaterial(route) {
  return weightedMaterial(route.weights, state.toolIndex);
}

function advanceExpedition() {
  const expedition = state.expedition;
  if (!expedition) return;
  if (expedition.pendingMerchant) return;
  if (expedition.completed) {
    finishExpedition(true);
    return;
  }

  const route = routeById(expedition.routeId);
  const roll = Math.random();
  const lantern = LANTERNS[state.lanternLevel];
  expedition.step += 1;
  expedition.hp = Math.max(0, expedition.hp - 1);
  expedition.xp += 4 + route.danger * 2;

  const veinThreshold = EXPEDITION_EVENT_WEIGHTS.vein / 100;
  const chestThreshold = veinThreshold + EXPEDITION_EVENT_WEIGHTS.chest / 100 + lantern.chestBonus;
  const collapseThreshold = chestThreshold + EXPEDITION_EVENT_WEIGHTS.collapse / 100;

  if (roll < veinThreshold) {
    const type = chooseExpeditionMaterial(route);
    const amount = Math.random() < 0.14 + state.perks.fortune * 0.04 ? 2 : 1;
    expedition.loot[type] += amount;
    markMaterialDiscovered(type);
    expedition.lastEvent = `发现一处隐蔽矿脉，猫猫收进了 ${amount} 块${MATERIALS[type].name}。`;
    playTone(type === "diamond" ? "diamond" : "break");
  } else if (roll < chestThreshold) {
    const type = chooseExpeditionMaterial(route);
    const amount = Math.random() < 0.36 ? 2 : 1;
    const coins = Math.round(randomBetween(12, 22) * route.danger * (1 + lantern.chestBonus));
    expedition.loot[type] += amount;
    expedition.coins += coins;
    markMaterialDiscovered(type);
    expedition.lastEvent = `矿灯照见旧木箱，里面藏着 ${amount} 块${MATERIALS[type].name}和 ${coins} 枚金币。`;
    if (Math.random() < 0.08 + lantern.rareBonus) {
      const collectibleType = Object.keys(COLLECTIBLES)[Math.floor(Math.random() * Object.keys(COLLECTIBLES).length)];
      discoverCollectible(collectibleType);
      expedition.lastEvent += ` 还发现了${COLLECTIBLES[collectibleType].name}！`;
    }
    playTone("coin");
  } else if (roll < collapseThreshold) {
    expedition.hp = Math.max(0, expedition.hp - 1);
    expedition.lastEvent = "碎石忽然坠落，除了前进消耗外又损失了 1 点体力。";
    playTone("error");
  } else {
    const material = route.rareMaterial;
    expedition.pendingMerchant = {
      restCost: 14 + route.danger * 12,
      material,
      materialCost: MATERIALS[material].value * 3,
    };
    expedition.lastEvent = "岔路尽头亮起一盏小灯。地下商人摆出了热汤和稀有矿物，等待你的选择。";
    playTone("upgrade");
  }

  if (expedition.hp <= 0) {
    failExpedition();
    return;
  }

  if (expedition.step >= route.steps) {
    const bonus = Math.round(route.clearBonus * (1 + lantern.chestBonus));
    expedition.coins += bonus;
    expedition.xp += route.clearXp;
    expedition.completed = true;
    expedition.lastEvent += ` 终点已抵达，额外发现 ${bonus} 枚金币。`;
  }

  renderAll();
  saveGame();
}

function resolveMerchant(action) {
  const expedition = state.expedition;
  const merchant = expedition?.pendingMerchant;
  if (!expedition || !merchant) return;
  if (action === "rest") {
    if (state.coins < merchant.restCost) return;
    state.coins -= merchant.restCost;
    expedition.hp = Math.min(maxAdventureHealth(expedition.supplied), expedition.hp + 2);
    expedition.lastEvent = `地下商人的热汤恢复了 2 点体力，猫猫重新握紧了矿灯。`;
  } else if (action === "buy") {
    if (state.coins < merchant.materialCost) return;
    state.coins -= merchant.materialCost;
    expedition.loot[merchant.material] += 1;
    markMaterialDiscovered(merchant.material);
    expedition.lastEvent = `地下商人收下金币，把 1 块${MATERIALS[merchant.material].name}放进了战利品袋。`;
  } else {
    expedition.lastEvent = "猫猫向地下商人挥挥手，把金币留给了更重要的升级。";
  }
  expedition.pendingMerchant = null;
  renderAll();
  saveGame();
}

function finishExpedition(completed) {
  const expedition = state.expedition;
  if (!expedition) return;

  const route = routeById(expedition.routeId);
  let overflowCoins = 0;
  let stored = 0;

  Object.entries(expedition.loot).forEach(([type, amount]) => {
    const room = Math.max(0, BACKPACKS[state.backpackIndex].capacity - inventoryTotal());
    const kept = Math.min(room, amount);
    const overflow = amount - kept;
    state.inventory[type] += kept;
    if (kept > 0) markMaterialDiscovered(type);
    stored += kept;
    overflowCoins += overflow * MATERIALS[type].value;
  });

  const earnedCoins = expedition.coins + overflowCoins;
  state.coins += earnedCoins;
  addXp(expedition.xp);
  state.bestExpedition = Math.max(state.bestExpedition, expedition.step);
  state.expedition = null;
  showToast(`${completed ? "探险完成" : "安全撤离"}：带回 ${stored} 块材料和 ${earnedCoins} 金币。`);
  logEvent(overflowCoins > 0
    ? `${route.name}战利品已结算，背包装不下的部分自动售出 ${overflowCoins} 金币。`
    : `${route.name}战利品已安全带回主矿洞。`);
  playTone(completed ? "upgrade" : "coin");
  renderAll();
  saveGame();
}

function failExpedition() {
  const expedition = state.expedition;
  const route = routeById(expedition.routeId);
  addXp(Math.floor(expedition.xp / 2));
  state.expedition = null;
  showToast("体力归零，本轮临时战利品遗失。");
  logEvent(`${route.name}发生险情，猫猫安全返回，但没能带回临时战利品。`);
  playTone("error");
  renderAll();
  saveGame();
}

function retreatExpedition() {
  if (!state.expedition) return;
  if (state.expedition.completed) {
    closeAdventure();
    return;
  }
  finishExpedition(false);
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  dom.toastMessage.textContent = message;
  dom.toast.classList.add("show");
  toastTimer = window.setTimeout(() => dom.toast.classList.remove("show"), 3600);
}

function logEvent(message) {
  dom.eventLog.textContent = message;
}

function ensureAudioContext() {
  if (audioContext) return audioContext;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) throw new Error("Web Audio API is unavailable");
  audioContext = new AudioContextClass();
  soundBus = audioContext.createGain();
  musicBus = audioContext.createGain();
  soundBus.connect(audioContext.destination);
  musicBus.connect(audioContext.destination);
  updateAudioLevels();
  return audioContext;
}

function updateAudioLevels() {
  if (!audioContext) return;
  const now = audioContext.currentTime;
  const soundLevel = state.audioMuted || !state.soundOn ? 0 : state.soundVolume / 100;
  const musicLevel = state.audioMuted || !state.musicOn ? 0 : state.musicVolume / 100;
  soundBus.gain.setTargetAtTime(soundLevel, now, 0.025);
  musicBus.gain.setTargetAtTime(musicLevel, now, 0.08);
}

function scheduleSynthNote(note, destination) {
  if (!note.frequency || !audioContext) return;
  const startAt = audioContext.currentTime + (note.delay || 0);
  const stopAt = startAt + note.duration;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = note.wave || "square";
  oscillator.frequency.setValueAtTime(note.frequency, startAt);
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(45, note.frequency * (note.slide || 1)),
    stopAt
  );
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(note.volume, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(startAt);
  oscillator.stop(stopAt + 0.025);
}

function playMusicStep() {
  if (!audioContext || state.audioMuted || !state.musicOn) return;
  const note = MUSIC_PATTERN[musicStep % MUSIC_PATTERN.length];
  musicStep += 1;
  scheduleSynthNote({
    frequency: note.bass,
    duration: 0.42,
    wave: "triangle",
    volume: 0.11,
    slide: 0.998,
  }, musicBus);
  scheduleSynthNote({
    frequency: note.melody,
    duration: 0.19,
    wave: "square",
    volume: 0.055,
    slide: 1.002,
  }, musicBus);
}

function startBackgroundMusic() {
  if (!audioUnlocked || musicTimer || state.audioMuted || !state.musicOn) return;
  ensureAudioContext();
  playMusicStep();
  musicTimer = window.setInterval(playMusicStep, MUSIC_STEP_MS);
}

function stopBackgroundMusic() {
  if (!musicTimer) return;
  window.clearInterval(musicTimer);
  musicTimer = null;
}

function syncAudioPlayback() {
  updateAudioLevels();
  if (state.musicOn && !state.audioMuted) {
    startBackgroundMusic();
    return;
  }
  stopBackgroundMusic();
}

function renderAudioSettings() {
  dom.audioSettings.hidden = !audioPanelOpen;
  dom.audioSettingsToggle.setAttribute("aria-expanded", String(audioPanelOpen));
  dom.audioSettingsToggle.classList.toggle("muted", state.audioMuted);
  dom.audioSettingsToggle.textContent = state.audioMuted ? "♪" : "♫";
  dom.audioStatus.textContent = state.audioMuted
    ? "全部音频已静音"
    : !audioUnlocked
      ? "首次操作后开始播放"
      : state.musicOn
        ? "背景音乐播放中"
        : "背景音乐已关闭";
  dom.soundToggle.textContent = state.soundOn ? "开启" : "关闭";
  dom.soundToggle.classList.toggle("active", state.soundOn);
  dom.soundToggle.setAttribute("aria-pressed", String(state.soundOn));
  dom.soundVolume.value = state.soundVolume;
  dom.soundVolumeLabel.textContent = `${state.soundVolume}%`;
  dom.musicToggle.textContent = state.musicOn ? "开启" : "关闭";
  dom.musicToggle.classList.toggle("active", state.musicOn);
  dom.musicToggle.setAttribute("aria-pressed", String(state.musicOn));
  dom.musicVolume.value = state.musicVolume;
  dom.musicVolumeLabel.textContent = `${state.musicVolume}%`;
}

function disableAudio() {
  state.soundOn = false;
  state.musicOn = false;
  state.audioMuted = true;
  stopBackgroundMusic();
  renderAudioSettings();
  saveGame();
}

function unlockAudio() {
  try {
    audioUnlocked = true;
    const context = ensureAudioContext();
    if (context.state === "suspended") context.resume();
    syncAudioPlayback();
    renderAudioSettings();
  } catch {
    disableAudio();
  }
}

function playTone(type) {
  if (!state.soundOn || state.audioMuted) return;

  try {
    unlockAudio();
    (SOUND_EFFECTS[type] || SOUND_EFFECTS.hit).forEach((note) => scheduleSynthNote(note, soundBus));
  } catch {
    disableAudio();
  }
}

function toggleAudioSettings() {
  audioPanelOpen = !audioPanelOpen;
  renderAudioSettings();
}

function closeAudioSettings() {
  audioPanelOpen = false;
  renderAudioSettings();
}

function toggleSound() {
  state.soundOn = !state.soundOn;
  unlockAudio();
  syncAudioPlayback();
  renderAudioSettings();
  showToast(state.soundOn ? "挖矿音效已开启。" : "挖矿音效已关闭。");
  saveGame();
}

function toggleMusic() {
  state.musicOn = !state.musicOn;
  unlockAudio();
  syncAudioPlayback();
  renderAudioSettings();
  showToast(state.musicOn ? "背景音乐已开启。" : "背景音乐已关闭。");
  saveGame();
}

function toggleAudioMute() {
  state.audioMuted = !state.audioMuted;
  if (!state.audioMuted) unlockAudio();
  syncAudioPlayback();
  renderAudioSettings();
  showToast(state.audioMuted ? "全部音频已静音。" : "音频已恢复。");
  saveGame();
}

function updateSoundVolume(event) {
  state.soundVolume = Number(event.target.value);
  unlockAudio();
  updateAudioLevels();
  renderAudioSettings();
  saveGame();
}

function updateMusicVolume(event) {
  state.musicVolume = Number(event.target.value);
  unlockAudio();
  syncAudioPlayback();
  renderAudioSettings();
  saveGame();
}

function resetGame(options = {}) {
  const skipConfirm = options.skipConfirm === true;
  if (!skipConfirm && !window.confirm("确定要清空金币、背包和升级进度，重新开始吗？")) return;

  state = initialState();
  normalizeDurabilityLevel();
  normalizeCollections();
  normalizeLanternLevel();
  normalizePickaxeDurability();
  normalizeStamina();
  normalizeExpeditionState();
  discoveryQueue = [];
  state.tutorialSeen = true;
  if (caveGame) {
    caveGame.generateWorld();
    caveGame.resetPosition(true);
  }
  syncAudioPlayback();
  renderAudioSettings();
  renderAll();
  saveGame();
  showToast(options.reason || "矿洞已重置，新的旅程开始了。");
  logEvent(options.reason || "猫猫矿工重新整理了装备，回到矿洞入口。");
}

dom.sellAll.addEventListener("click", sellInventory);
dom.repairPickaxe.addEventListener("click", repairPickaxe);
dom.backtrackCave.addEventListener("click", ascendCaveLayer);
dom.openCaveShop.addEventListener("click", openCaveShop);
dom.closeCaveShop.addEventListener("click", closeCaveShop);
dom.caveSupplyList.addEventListener("click", (event) => {
  const supplyButton = event.target.closest("[data-buy-cave-supply]");
  if (supplyButton) buyCaveSupply(supplyButton.dataset.buyCaveSupply);
});
dom.materialTradeList.addEventListener("click", (event) => {
  const buyMaterialButton = event.target.closest("[data-buy-shop-material]");
  if (buyMaterialButton) buyCaveMaterial(buyMaterialButton.dataset.buyShopMaterial);
  const sellMaterialButton = event.target.closest("[data-sell-shop-material]");
  if (sellMaterialButton) sellMaterial(sellMaterialButton.dataset.sellShopMaterial);
});
dom.inventoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-sell-material]");
  if (button) sellMaterial(button.dataset.sellMaterial);
});
dom.audioSettingsToggle.addEventListener("click", toggleAudioSettings);
dom.closeAudioSettings.addEventListener("click", closeAudioSettings);
dom.soundToggle.addEventListener("click", toggleSound);
dom.musicToggle.addEventListener("click", toggleMusic);
dom.soundVolume.addEventListener("input", updateSoundVolume);
dom.soundVolume.addEventListener("change", () => playTone("coin"));
dom.musicVolume.addEventListener("input", updateMusicVolume);
dom.resetGame.addEventListener("click", resetGame);

dom.toolShop.addEventListener("click", (event) => {
  const button = event.target.closest("[data-buy-tool]");
  if (button) buyTool(Number(button.dataset.buyTool));
});

dom.durabilityShop.addEventListener("click", (event) => {
  const button = event.target.closest("[data-buy-durability]");
  if (button) buyDurabilityUpgrade(Number(button.dataset.buyDurability));
});

dom.packShop.addEventListener("click", (event) => {
  const button = event.target.closest("[data-buy-pack]");
  if (button) buyBackpack(Number(button.dataset.buyPack));
});

dom.lanternShop.addEventListener("click", (event) => {
  const button = event.target.closest("[data-buy-lantern]");
  if (button) buyLantern(Number(button.dataset.buyLantern));
});

dom.swordShop.addEventListener("click", (event) => {
  const button = event.target.closest("[data-convert-sword]");
  if (button) convertSword(Number(button.dataset.convertSword));
});

dom.armorShop.addEventListener("click", (event) => {
  const button = event.target.closest("[data-craft-armor]");
  if (button) craftArmor(button.dataset.craftArmor);
});

dom.perkShop.addEventListener("click", (event) => {
  const button = event.target.closest("[data-buy-perk]");
  if (button) buyPerk(button.dataset.buyPerk);
});

dom.villageAction.addEventListener("click", (event) => {
  const repairButton = event.target.closest("[data-repair-building]");
  if (repairButton) repairVillageBuilding(repairButton.dataset.repairBuilding);
  const bossButton = event.target.closest("[data-summon-boss]");
  if (bossButton) summonStoryBoss(bossButton.dataset.summonBoss);
  const finalBossButton = event.target.closest("[data-summon-final-boss]");
  if (finalBossButton) summonFinalBoss(finalBossButton.dataset.summonFinalBoss);
  const contractButton = event.target.closest("[data-complete-abyss-contract]");
  if (contractButton) completeAbyssContract();
  const rerollButton = event.target.closest("[data-reroll-abyss-contract]");
  if (rerollButton) rerollAbyssContract();
  const abyssBossButton = event.target.closest("[data-summon-abyss-boss]");
  if (abyssBossButton) summonAbyssBoss(abyssBossButton.dataset.summonAbyssBoss);
  const beaconButton = event.target.closest("[data-upgrade-beacon]");
  if (beaconButton) upgradeBeaconResonance();
});

dom.openAdventure.addEventListener("click", openAdventure);
dom.closeAdventure.addEventListener("click", closeAdventure);
dom.routeList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-start-route]");
  if (button) startExpedition(button.dataset.startRoute, button.dataset.useTicket === "true");
});
dom.merchantPanel.addEventListener("click", (event) => {
  const button = event.target.closest("[data-merchant-action]");
  if (button) resolveMerchant(button.dataset.merchantAction);
});
dom.advanceExpedition.addEventListener("click", advanceExpedition);
dom.retreatExpedition.addEventListener("click", retreatExpedition);
dom.openCollection.addEventListener("click", openCollection);
dom.closeCollection.addEventListener("click", closeCollection);
dom.closeDiscovery.addEventListener("click", closeDiscovery);

dom.startGame.addEventListener("click", () => {
  state.tutorialSeen = true;
  dom.introModal.classList.add("hidden");
  saveGame();
  playTone("upgrade");
});

document.addEventListener("keydown", (event) => {
  if (!dom.introModal.classList.contains("hidden")) return;
  if (event.key.toLowerCase() === "s") sellInventory();
  if (event.key.toLowerCase() === "m") toggleAudioMute();
  if (event.key === "Escape" && audioPanelOpen) closeAudioSettings();
  if (event.key === "Escape") closeCaveShop();
  if (event.key === "Escape") closeCollection();
});

document.addEventListener("click", (event) => {
  if (audioPanelOpen && event.target instanceof Element && !event.target.closest(".audio-control")) {
    closeAudioSettings();
  }
});
document.addEventListener("pointerdown", unlockAudio, { capture: true, once: true });
document.addEventListener("keydown", unlockAudio, { capture: true, once: true });

dom.introModal.classList.toggle("hidden", state.tutorialSeen);
renderAudioSettings();
renderAll();
createCaveGame();
saveGame();
