"use strict";

const SAVE_KEY = "kitty-mc-miner-save-v1";
const MAX_TICKETS = 3;
const TICKET_MINE_INTERVAL = 12;

const MATERIALS = {
  wood: { name: "木材", value: 3, hp: 1 },
  stone: { name: "石材", value: 5, hp: 2 },
  iron: { name: "铁矿", value: 12, hp: 4 },
  gold: { name: "黄金", value: 24, hp: 5 },
  diamond: { name: "钻石", value: 58, hp: 7 },
};

const TOOLS = [
  { name: "木镐", damage: 1, price: 0, depth: 1 },
  { name: "石镐", damage: 2, price: 70, depth: 2 },
  { name: "铁镐", damage: 4, price: 240, depth: 8 },
  { name: "黄金镐", damage: 6, price: 580, depth: 16 },
  { name: "钻石镐", damage: 10, price: 1380, depth: 27 },
];

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

const BACKPACKS = [
  { name: "布口袋", capacity: 20, price: 0 },
  { name: "皮革背包", capacity: 42, price: 90 },
  { name: "铁扣矿包", capacity: 78, price: 320 },
  { name: "钻石箱包", capacity: 140, price: 880 },
];

const ZONES = [
  { name: "林地浅层", from: 1, to: 7 },
  { name: "青石矿道", from: 8, to: 15 },
  { name: "铁脉深井", from: 16, to: 26 },
  { name: "熔金洞穴", from: 27, to: 39 },
  { name: "钻石地心", from: 40, to: Infinity },
];

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
    unlock: "自由深渊模式",
  },
];

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
    effect: (level) => `探险体力 ${3 + level}`,
  },
  lantern: {
    name: "寻宝矿灯",
    icon: "✧",
    max: 4,
    prices: [130, 290, 540, 940],
    effect: (level) => `宝箱金币 +${level * 15}%`,
  },
};

const ROUTES = [
  {
    id: "old-shaft",
    name: "废弃矿道",
    symbol: "▥",
    color: "#c8df68",
    unlockDepth: 2,
    steps: 4,
    danger: 1,
    clearBonus: 28,
    clearXp: 18,
    description: "旧木架后藏着零散矿脉，适合第一次离开主矿井。",
    materials: ["wood", "stone", "stone", "iron"],
  },
  {
    id: "crystal-cave",
    name: "水晶洞穴",
    symbol: "◇",
    color: "#72d8cf",
    unlockDepth: 12,
    steps: 6,
    danger: 2,
    clearBonus: 85,
    clearXp: 42,
    description: "潮湿洞壁闪着蓝光，珍贵矿石更多，塌方也更加频繁。",
    materials: ["stone", "iron", "iron", "gold", "diamond"],
  },
  {
    id: "lava-ruins",
    name: "熔岩遗迹",
    symbol: "▲",
    color: "#e78548",
    unlockDepth: 26,
    steps: 8,
    danger: 3,
    clearBonus: 190,
    clearXp: 85,
    description: "热浪深处埋着古老矿藏，只有准备充分的矿工能全身而退。",
    materials: ["iron", "gold", "gold", "diamond", "diamond"],
  },
];

const defaultInventory = () => ({
  wood: 0,
  stone: 0,
  iron: 0,
  gold: 0,
  diamond: 0,
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
  saveVersion: 4,
  coins: 0,
  depth: 1,
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
  xp: 0,
  expeditionTickets: MAX_TICKETS,
  ticketMilestone: 0,
  perks: defaultPerks(),
  expedition: null,
  bestExpedition: 0,
  storyChapter: 0,
  village: defaultVillage(),
  defeatedBosses: [],
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
normalizeAbyssState();
normalizeDurabilityLevel();
normalizePickaxeDurability();
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

const dom = {
  coinCount: document.querySelector("#coinCount"),
  depthCount: document.querySelector("#depthCount"),
  minedCount: document.querySelector("#minedCount"),
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
  swordShop: document.querySelector("#swordShop"),
  armorShop: document.querySelector("#armorShop"),
  perkShop: document.querySelector("#perkShop"),
  caveCanvas: document.querySelector("#caveCanvas"),
  caveHealth: document.querySelector("#caveHealth"),
  swordHud: document.querySelector("#swordHud"),
  caveArmor: document.querySelector("#caveArmor"),
  caveDurability: document.querySelector("#caveDurability"),
  repairPickaxe: document.querySelector("#repairPickaxe"),
  repairPickaxeCost: document.querySelector("#repairPickaxeCost"),
  repairPickaxeHint: document.querySelector("#repairPickaxeHint"),
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
  ticketCount: document.querySelector("#ticketCount"),
  adventureModal: document.querySelector("#adventureModal"),
  closeAdventure: document.querySelector("#closeAdventure"),
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
  retreatExpedition: document.querySelector("#retreatExpedition"),
  advanceExpedition: document.querySelector("#advanceExpedition"),
};

function loadGame() {
  const fresh = initialState();
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!saved) return fresh;
    return {
      ...fresh,
      ...saved,
      saveVersion: fresh.saveVersion,
      durabilityLevel: (Number(saved.saveVersion) || 1) < 2
        ? Number(saved.toolIndex) || 0
        : saved.durabilityLevel,
      inventory: { ...fresh.inventory, ...saved.inventory },
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
}

function normalizeAbyssState() {
  state.abyssContractsCompleted = Math.max(0, Number(state.abyssContractsCompleted) || 0);
  state.abyssBossesDefeated = Math.max(0, Number(state.abyssBossesDefeated) || 0);
  state.abyssMarks = Math.max(0, Number(state.abyssMarks) || 0);
  state.beaconResonance = Math.max(0, Math.min(MAX_BEACON_RESONANCE, Number(state.beaconResonance) || 0));
  if (storyCompleted() && !state.abyssContract) state.abyssContract = createAbyssContract();
}

function activeStoryChapter() {
  return STORY_CHAPTERS[state.storyChapter] || null;
}

function storyCompleted() {
  return state.storyChapter >= STORY_CHAPTERS.length;
}

function isVillageBuilt(buildingId) {
  return Boolean(state.village[buildingId]);
}

function accessibleDepth() {
  const chapter = activeStoryChapter();
  return Math.min(state.depth, chapter?.maxDepth ?? state.depth);
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

function addXp(amount) {
  const oldLevel = playerLevel();
  state.xp += amount;
  const newLevel = playerLevel();
  if (newLevel > oldLevel) {
    showToast(`矿工等级提升至 Lv.${newLevel}！`);
    logEvent(`积累的经验有了回报，猫猫矿工升到了 Lv.${newLevel}。`);
    playTone("upgrade");
  }
}

function maxAdventureHealth() {
  return 3 + state.perks.armor;
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
    targetDepth: Math.max(42 + tier * 3, state.depth + randomBetween(2, 4)),
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

function addMiningTicket() {
  const milestone = Math.floor(state.mined / TICKET_MINE_INTERVAL);
  if (milestone <= state.ticketMilestone) return;

  const previousTickets = state.expeditionTickets;
  state.expeditionTickets = Math.min(MAX_TICKETS, state.expeditionTickets + milestone - state.ticketMilestone);
  state.ticketMilestone = milestone;
  if (state.expeditionTickets > previousTickets) {
    showToast("挖矿进度奖励：获得 1 张探险券。");
  }
}

function currentZone() {
  const depth = accessibleDepth();
  return ZONES.find((zone) => depth >= zone.from && depth <= zone.to) || ZONES[0];
}

function renderAll() {
  renderStats();
  renderInventory();
  renderShop();
  renderVillage();
  renderRepairStation();
  renderObjective();
  renderAdventure();
  renderCaveHud();
}

function renderStats() {
  const zone = currentZone();
  const progress =
    zone.to === Infinity ? 100 : ((state.depth - zone.from + 1) / (zone.to - zone.from + 1)) * 100;

  dom.coinCount.textContent = state.coins.toLocaleString("zh-CN");
  dom.depthCount.textContent = accessibleDepth();
  dom.minedCount.textContent = state.mined;
  dom.streakCount.textContent = state.streak;
  dom.zoneName.textContent = zone.name;
  dom.zoneProgress.style.width = `${Math.min(100, progress)}%`;

  const level = playerLevel();
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const xpProgress = ((state.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  dom.levelCount.textContent = level;
  dom.xpMeter.style.width = `${Math.min(100, xpProgress)}%`;
  dom.ticketCount.textContent = state.expeditionTickets;
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
    .map(
      ([type, material]) => `
        <div class="inventory-item">
          <i class="mini-block type-${type}" aria-hidden="true"></i>
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
  dom.caveHealth.textContent = Array.from(
    { length: caveStatus?.maxHp || 5 },
    (_, index) => (index < (caveStatus?.hp ?? 5) ? "♥" : "♡")
  ).join(" ");
  dom.swordHud.textContent = `${sword.name} · ${sword.quality}`;
  dom.swordHud.className = `quality-${sword.qualityClass}`;
  dom.caveArmor.textContent = armorScore();
  dom.caveDurability.textContent = `${state.pickaxeDurability} / ${maxPickaxeDurability()}`;
  dom.caveDurability.classList.toggle("is-empty", state.pickaxeDurability <= 0);
  dom.bossHud.classList.toggle("hidden", !caveStatus?.boss);
  if (caveStatus?.boss) {
    dom.bossName.textContent = caveStatus.boss.name;
    dom.bossMeter.style.width = `${Math.max(0, (caveStatus.boss.hp / caveStatus.boss.maxHp) * 100)}%`;
  }
  if (caveStatus?.hint) dom.caveHint.textContent = caveStatus.hint;
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
      ? `还差 ${cost - state.coins} 金币`
      : "补满耐久并刷新矿层";
}

function renderVillage() {
  const chapter = activeStoryChapter();
  const completed = !chapter;
  dom.storyChapter.textContent = completed ? "主线完成" : `第 ${state.storyChapter + 1} 章 / ${STORY_CHAPTERS.length}`;
  dom.storyTitle.textContent = completed ? "地心矿灯重新亮起" : chapter.title;
  dom.storyDescription.textContent = completed
    ? "猫猫村庄恢复了光亮。自由深渊模式已经开放，可以继续挑战更深的随机矿井。"
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

  if (completed) {
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
    dom.villageAction.innerHTML = `
      <p>${formatRequirement(chapter.building.cost)}</p>
      <button class="buy-button village-button" type="button" data-repair-building="${chapter.building.id}" ${missing ? "disabled" : ""}>
        ${missing ? "材料不足" : `修复${chapter.building.name}`}
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
      const deepEnough = accessibleDepth() >= tool.depth;
      const affordable = state.coins >= tool.price;
      const label = owned ? "已拥有" : next && deepEnough ? `${tool.price} ¢` : `深度 ${tool.depth}m`;
      return `
        <div class="shop-item">
          <span class="shop-item-icon" aria-hidden="true">⛏</span>
          <div class="shop-copy">
            <strong>${tool.name}</strong>
            <small>挖掘力 ${tool.damage}</small>
          </div>
          <button
            class="buy-button"
            type="button"
            data-buy-tool="${index}"
            ${owned || !next || !deepEnough || !affordable ? "disabled" : ""}
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
      >${nextDurabilityUpgrade ? `${nextDurabilityUpgrade.price} ¢` : "已满级"}</button>
    </div>
  `;

  dom.packShop.innerHTML = BACKPACKS.slice(1)
    .map((backpack, offset) => {
      const index = offset + 1;
      const owned = index <= state.backpackIndex;
      const next = index === state.backpackIndex + 1;
      const affordable = state.coins >= backpack.price;
      return `
        <div class="shop-item">
          <span class="shop-item-icon pack-icon" aria-hidden="true">▣</span>
          <div class="shop-copy">
            <strong>${backpack.name}</strong>
            <small>容量 ${backpack.capacity}</small>
          </div>
          <button
            class="buy-button"
            type="button"
            data-buy-pack="${index}"
            ${owned || !next || !affordable ? "disabled" : ""}
          >${owned ? "已拥有" : `${backpack.price} ¢`}</button>
        </div>
      `;
    })
    .join("");

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
      >${nextSword ? `${nextSword.price} ¢` : "已满级"}</button>
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
          >${nextTier ? `${price} ¢` : "已满级"}</button>
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
          >${maxed ? "已满级" : `${price} ¢`}</button>
        </div>
      `;
    })
    .join("");
}

function renderAdventure() {
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
    { length: maxAdventureHealth() },
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
  dom.retreatExpedition.textContent = expedition.completed ? "稍后领取" : "撤离并带走战利品";
  renderExpeditionLoot();
}

function renderRoutes() {
  dom.routeList.innerHTML = ROUTES.map((route) => {
    const unlocked = accessibleDepth() >= route.unlockDepth;
    const hasTicket = state.expeditionTickets > 0;
    const label = unlocked ? (hasTicket ? "开始探险" : "探险券不足") : `${route.unlockDepth}m 解锁`;
    return `
      <article class="route-card ${unlocked ? "" : "locked"}" style="--route-color: ${route.color}">
        <span class="route-symbol" aria-hidden="true">${route.symbol}</span>
        <h3>${route.name}</h3>
        <p>${route.description}</p>
        <div class="route-meta">
          <span>${route.steps} 步路线</span>
          <span>风险 ${"◆".repeat(route.danger)}</span>
        </div>
        <button
          class="buy-button"
          type="button"
          data-start-route="${route.id}"
          ${!unlocked || !hasTicket ? "disabled" : ""}
        >${label}</button>
      </article>
    `;
  }).join("");
}

function renderExpeditionLoot() {
  const expedition = state.expedition;
  if (!expedition) return;

  const materials = Object.entries(expedition.loot)
    .filter(([, amount]) => amount > 0)
    .map(([type, amount]) => `
      <span class="loot-item">
        <i class="mini-block type-${type}" aria-hidden="true"></i>
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

function renderObjective() {
  const chapter = activeStoryChapter();
  const nextTool = TOOLS[state.toolIndex + 1];
  const nextPack = BACKPACKS[state.backpackIndex + 1];

  if (state.pickaxeDurability <= 0) {
    dom.currentObjective.textContent = `镐子耐久耗尽：点击矿洞下方“金币修理”，支付 ${repairPickaxeCost()} 金币补满耐久`;
    return;
  }

  if (chapter && !isVillageBuilt(chapter.building.id)) {
    dom.currentObjective.textContent = `主线：修复${chapter.building.name}，需要 ${formatRequirement(chapter.building.cost)}`;
    return;
  }

  if (chapter) {
    dom.currentObjective.textContent = `主线：召唤并击败${chapter.boss.name}，解锁${chapter.unlock}`;
    return;
  }

  if (storyCompleted()) {
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

  if (nextTool) {
    dom.currentObjective.textContent =
      state.depth < nextTool.depth
        ? `继续深挖：在 ${nextTool.depth}m 解锁${nextTool.name}`
        : `攒够 ${nextTool.price} 金币，购买${nextTool.name}`;
    return;
  }

  if (nextPack) {
    dom.currentObjective.textContent = `把背包升级为${nextPack.name}`;
    return;
  }

  dom.currentObjective.textContent = "继续探索钻石地心，刷新最高深度";
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
  if (!tool || index !== state.toolIndex + 1 || accessibleDepth() < tool.depth) return;
  if (state.coins < tool.price) {
    showToast(`还差 ${tool.price - state.coins} 金币才能购买${tool.name}。`);
    playTone("error");
    return;
  }

  state.coins -= tool.price;
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
  if (state.coins < backpack.price) {
    showToast(`还差 ${backpack.price - state.coins} 金币才能购买${backpack.name}。`);
    playTone("error");
    return;
  }

  state.coins -= backpack.price;
  state.backpackIndex = index;
  showToast(`背包升级为${backpack.name}，容量提升到 ${backpack.capacity}。`);
  logEvent(`新背包到货，可以在矿洞里多待一会儿了。`);
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

function canCollectCaveMaterial() {
  return inventoryTotal() < BACKPACKS[state.backpackIndex].capacity;
}

function collectCaveMaterial({ type }) {
  const backpack = BACKPACKS[state.backpackIndex];
  const luckyDrop = Math.random() < fortuneChance();
  const amount = Math.min(luckyDrop ? 2 : 1, backpack.capacity - inventoryTotal());
  state.inventory[type] += amount;
  state.pickaxeDurability = Math.max(0, state.pickaxeDurability - 1);
  state.mined += 1;
  addXp(2);
  addMiningTicket();
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
    const message = "区域 Boss 仍在矿洞中，先击败它才能继续下潜。";
    showToast(message);
    playTone("error");
    return { advanced: false, message };
  }

  if (chapter && state.depth >= chapter.maxDepth) {
    const message = `已抵达${chapter.zone}最深处 ${chapter.maxDepth}m。修复${chapter.building.name}并击败${chapter.boss.name}，才能继续下潜。`;
    showToast(message);
    playTone("error");
    return { advanced: false, message };
  }

  state.depth += 1;
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
  if (caveGame) {
    caveGame.generateWorld();
    caveGame.resetPosition();
  }
  showToast(`金币修理完成：支付 ${cost} 金币，镐子耐久已补满。`);
  logEvent(`修理站完成第 ${state.shiftsStarted} 次维护，当前矿层也重新整理完毕。`);
  playTone("upgrade");
  renderAll();
  saveGame();
}

function defeatCaveEnemy({ id, isBoss, name, coins, xp, marks = 0 }) {
  state.coins += coins;
  addXp(xp);
  if (isBoss) {
    if (!completeStoryBoss(id)) completeAbyssBoss(id, marks);
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
  if (!nextChapter) ensureAbyssContract();
  showToast(nextChapter
    ? `区域净化完成：${chapter.unlock}已经开放！`
    : "地心矿灯重新亮起，主线完成！自由深渊模式已开放。"
  );
  logEvent(nextChapter
    ? `${chapter.boss.name}倒下了。${chapter.unlock}的道路已经打开，村庄等待下一项修复工程。`
    : "黑暗晶体巨像崩解，地心信标照亮了猫猫村庄。新的深渊挑战仍在地下等待。"
  );
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
  if (!storyCompleted()) return;
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
  if (!storyCompleted()) return;
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
  if (!storyCompleted()) return;
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
  if (!storyCompleted() || state.beaconResonance >= MAX_BEACON_RESONANCE) return;
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

function handleCaveDeath() {
  const lostCoins = Math.min(18, state.coins);
  state.coins -= lostCoins;
  showToast(`小猫回到入口，遗失 ${lostCoins} 金币。`);
  logEvent("矿洞深处并不安全，锻造护甲后再继续推进。");
  playTone("error");
  renderAll();
  saveGame();
  return lostCoins;
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
        swordColor: sword.color,
        swordDamage: sword.damage,
        swordName: sword.name,
        swordQuality: sword.quality,
        repairCost: repairPickaxeCost(),
        toolDamage: TOOLS[state.toolIndex].damage,
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

function startExpedition(routeId) {
  const route = routeById(routeId);
  if (!route || state.expedition || accessibleDepth() < route.unlockDepth) return;
  if (state.expeditionTickets < 1) {
    showToast("探险券不足，每挖 12 个方块可以恢复 1 张。");
    return;
  }

  state.expeditionTickets -= 1;
  state.expedition = {
    routeId,
    step: 0,
    hp: maxAdventureHealth(),
    loot: defaultInventory(),
    coins: 0,
    xp: 0,
    completed: false,
    lastEvent: "小猫握紧矿灯，准备迈出第一步。",
  };
  logEvent(`探险队进入${route.name}，矿灯在黑暗中摇晃。`);
  playTone("upgrade");
  renderAll();
  saveGame();
}

function chooseExpeditionMaterial(route) {
  return route.materials[Math.floor(Math.random() * route.materials.length)];
}

function advanceExpedition() {
  const expedition = state.expedition;
  if (!expedition) return;
  if (expedition.completed) {
    finishExpedition(true);
    return;
  }

  const route = routeById(expedition.routeId);
  const roll = Math.random();
  expedition.step += 1;
  expedition.xp += 4 + route.danger * 2;

  if (roll < 0.43) {
    const type = chooseExpeditionMaterial(route);
    const amount = Math.random() < 0.14 + state.perks.fortune * 0.04 ? 2 : 1;
    expedition.loot[type] += amount;
    expedition.lastEvent = `发现一处隐蔽矿脉，猫猫收进了 ${amount} 块${MATERIALS[type].name}。`;
    playTone(type === "diamond" ? "diamond" : "break");
  } else if (roll < 0.65) {
    const coins = Math.round(randomBetween(9, 18) * route.danger * (1 + state.perks.lantern * 0.15));
    expedition.coins += coins;
    expedition.lastEvent = `矿灯照见旧木箱，里面藏着 ${coins} 枚金币。`;
    playTone("coin");
  } else if (roll < 0.83) {
    const damage = randomBetween(1, route.danger);
    expedition.hp = Math.max(0, expedition.hp - damage);
    expedition.lastEvent = `碎石忽然坠落，猫猫躲闪不及，损失了 ${damage} 点体力。`;
    playTone("error");
  } else if (roll < 0.94) {
    const oldHp = expedition.hp;
    expedition.hp = Math.min(maxAdventureHealth(), expedition.hp + 1);
    expedition.lastEvent = expedition.hp > oldHp
      ? "发现安全的旧营地，猫猫休息片刻，恢复了 1 点体力。"
      : "发现安全的旧营地，不过猫猫精神正好，继续前进。";
    playTone("upgrade");
  } else {
    const type = route.materials[route.materials.length - 1];
    const coins = Math.round(12 * route.danger * (1 + state.perks.lantern * 0.15));
    expedition.loot[type] += 1;
    expedition.coins += coins;
    expedition.lastEvent = `矿灯闪出隐藏记号！猫猫找到 1 块${MATERIALS[type].name}和 ${coins} 枚金币。`;
    playTone("diamond");
  }

  if (expedition.hp <= 0) {
    failExpedition();
    return;
  }

  if (expedition.step >= route.steps) {
    const bonus = Math.round(route.clearBonus * (1 + state.perks.lantern * 0.15));
    expedition.coins += bonus;
    expedition.xp += route.clearXp;
    expedition.completed = true;
    expedition.lastEvent += ` 终点已抵达，额外发现 ${bonus} 枚金币。`;
  }

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

function resetGame() {
  if (!window.confirm("确定要清空金币、背包和升级进度，重新开始吗？")) return;

  state = initialState();
  normalizeDurabilityLevel();
  normalizePickaxeDurability();
  state.tutorialSeen = true;
  if (caveGame) {
    caveGame.generateWorld();
    caveGame.resetPosition();
  }
  syncAudioPlayback();
  renderAudioSettings();
  renderAll();
  saveGame();
  showToast("矿洞已重置，新的旅程开始了。");
  logEvent("猫猫矿工重新整理了装备，回到矿洞入口。");
}

dom.sellAll.addEventListener("click", sellInventory);
dom.repairPickaxe.addEventListener("click", repairPickaxe);
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
  if (button) startExpedition(button.dataset.startRoute);
});
dom.advanceExpedition.addEventListener("click", advanceExpedition);
dom.retreatExpedition.addEventListener("click", retreatExpedition);

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
