"use strict";

(function attachKittyGameData() {
  const MATERIALS = {
    wood: {
      name: "木材",
      value: 3,
      hp: 1,
      minToolIndex: 0,
      origin: "林地矿口",
      description: "旧矿架与树根留下的木材，适合修复村庄设施。",
      colors: ["#a7713e", "#704724", "#d29958"],
    },
    stone: {
      name: "石材",
      value: 5,
      hp: 2,
      minToolIndex: 0,
      origin: "所有区域",
      description: "矿洞里最常见的基础材料，可靠得像村口的石阶。",
      colors: ["#718078", "#4d5b56", "#9aa49f"],
    },
    coal: {
      name: "煤炭",
      value: 8,
      hp: 2,
      minToolIndex: 0,
      origin: "林地矿口",
      description: "能让旧矿灯重新亮起的黑色燃料。",
      colors: ["#4d5854", "#202925", "#77817a"],
    },
    copper: {
      name: "铜矿",
      value: 10,
      hp: 3,
      minToolIndex: 1,
      origin: "林地矿口",
      description: "带着温暖橙光的矿石，常被用来制作矿灯框架。",
      colors: ["#8d6550", "#db8b5f", "#5f4941"],
    },
    iron: {
      name: "铁矿",
      value: 12,
      hp: 4,
      minToolIndex: 2,
      origin: "废弃矿井",
      description: "坚实的深层矿石，是可靠工具和村庄工程的骨架。",
      colors: ["#929b94", "#d5baa0", "#66736e"],
    },
    redstone: {
      name: "红石",
      value: 18,
      hp: 5,
      minToolIndex: 2,
      origin: "废弃矿井",
      description: "敲击时会闪烁微光，可为深层装备提供动力。",
      colors: ["#724742", "#e45d50", "#4d3432"],
    },
    lapis: {
      name: "青金石",
      value: 20,
      hp: 5,
      minToolIndex: 2,
      origin: "水晶洞穴",
      description: "蓝得像地下夜空的矿石，矿工们相信它能引导好运。",
      colors: ["#405c79", "#67a4e2", "#2a3f5c"],
    },
    gold: {
      name: "黄金",
      value: 24,
      hp: 5,
      minToolIndex: 3,
      origin: "岩浆层",
      description: "从热浪里显露的闪亮矿藏，仍是村庄最硬通的货币。",
      colors: ["#77786a", "#ffe06a", "#555f59"],
    },
    emerald: {
      name: "绿宝石",
      value: 42,
      hp: 7,
      minToolIndex: 4,
      origin: "地心晶簇",
      description: "地下商人最珍视的绿色晶体，能校准勘探工具。",
      colors: ["#3f7660", "#67e39d", "#294d43"],
    },
    amethyst: {
      name: "紫水晶",
      value: 46,
      hp: 7,
      minToolIndex: 4,
      origin: "水晶洞穴",
      description: "会发出细微回响的晶体，适合制作共鸣装备。",
      colors: ["#66527b", "#bd8cec", "#443955"],
    },
    diamond: {
      name: "钻石",
      value: 58,
      hp: 8,
      minToolIndex: 4,
      origin: "地心晶簇",
      description: "地心深处的明亮晶体，是顶级装备不可替代的核心。",
      colors: ["#668384", "#70e6dd", "#465e60"],
    },
  };

  const ENVIRONMENTS = [
    {
      id: "woodland-mouth",
      name: "林地矿口",
      from: 1,
      to: 9,
      symbol: "♣",
      color: "#b5d662",
      danger: 1,
      requiredToolIndex: 0,
      requiredLanternLevel: 0,
      rareMaterial: "copper",
      description: "树根穿过浅层矿壁，木材、石材与煤炭随处可见。",
      weights: { wood: 24, stone: 43, coal: 22, copper: 11 },
    },
    {
      id: "abandoned-shaft",
      name: "废弃矿井",
      from: 10,
      to: 19,
      symbol: "▥",
      color: "#d59b63",
      danger: 2,
      requiredToolIndex: 1,
      requiredLanternLevel: 1,
      rareMaterial: "redstone",
      description: "旧支架之间残留着铁轨和矿脉，红色微光偶尔从墙后透出。",
      weights: { stone: 31, coal: 19, copper: 22, iron: 20, redstone: 8 },
    },
    {
      id: "crystal-cavern",
      name: "水晶洞穴",
      from: 20,
      to: 29,
      symbol: "◇",
      color: "#75cfe0",
      danger: 3,
      requiredToolIndex: 2,
      requiredLanternLevel: 2,
      rareMaterial: "amethyst",
      description: "潮湿岩壁映出蓝紫色光点，稀有晶体藏在岔路尽头。",
      weights: { stone: 25, copper: 13, iron: 23, lapis: 20, amethyst: 11, gold: 8 },
    },
    {
      id: "lava-layer",
      name: "岩浆层",
      from: 30,
      to: 39,
      symbol: "▲",
      color: "#ed8a4e",
      danger: 4,
      requiredToolIndex: 3,
      requiredLanternLevel: 3,
      rareMaterial: "gold",
      description: "热浪覆盖古老岩层，红石与黄金在裂隙间持续闪烁。",
      weights: { stone: 19, iron: 22, redstone: 23, gold: 22, lapis: 6, diamond: 8 },
    },
    {
      id: "heart-cluster",
      name: "地心晶簇",
      from: 40,
      to: Infinity,
      symbol: "◆",
      color: "#85ead4",
      danger: 5,
      requiredToolIndex: 4,
      requiredLanternLevel: 4,
      rareMaterial: "emerald",
      description: "地心信标附近的晶体不断共鸣，更深处仍藏着未知矿脉。",
      weights: { stone: 14, iron: 13, redstone: 14, lapis: 13, gold: 15, emerald: 11, amethyst: 10, diamond: 10 },
    },
  ];

  const COLLECTIBLES = {
    fossilPaw: {
      name: "猫爪化石",
      symbol: "♟",
      reward: 36,
      description: "岩层中留下的小小爪印，证明这里曾有远古猫矿工经过。",
    },
    minerBadge: {
      name: "旧矿工徽章",
      symbol: "✦",
      reward: 52,
      description: "磨损严重的铜制徽章，背面还能看见猫猫村庄的旧标记。",
    },
    mysteryCan: {
      name: "神秘猫罐头",
      symbol: "▣",
      reward: 68,
      description: "不知道是谁埋下的罐头。它没有过期，但谁也不敢打开。",
    },
  };

  const TOOLS = [
    { name: "木镐", damage: 1, price: 0, depth: 1 },
    { name: "石镐", damage: 2, price: 70, depth: 2 },
    { name: "铁镐", damage: 4, price: 240, depth: 8 },
    { name: "黄金镐", damage: 6, price: 580, depth: 16 },
    { name: "钻石镐", damage: 10, price: 1380, depth: 27 },
    { name: "红石动力镐", damage: 14, price: 2600, depth: 42, recipe: { redstone: 24, diamond: 8 } },
    { name: "绿宝石勘探镐", damage: 19, price: 5200, depth: 58, recipe: { emerald: 16, redstone: 32, diamond: 12 } },
    { name: "紫水晶共鸣镐", damage: 26, price: 9800, depth: 78, recipe: { amethyst: 24, emerald: 18, diamond: 18 } },
  ];

  const BACKPACKS = [
    { name: "布口袋", capacity: 20, price: 0 },
    { name: "皮革背包", capacity: 42, price: 90 },
    { name: "铁扣矿包", capacity: 78, price: 320 },
    { name: "钻石箱包", capacity: 140, price: 880 },
    { name: "红石压缩矿包", capacity: 220, price: 1800, recipe: { redstone: 18, iron: 16 } },
    { name: "绿宝石远征箱", capacity: 340, price: 3600, recipe: { emerald: 12, diamond: 6 } },
    { name: "紫水晶储藏箱", capacity: 520, price: 6800, recipe: { amethyst: 20, emerald: 12 } },
  ];

  const LANTERNS = [
    { name: "旧矿灯", price: 0, rareBonus: 0, chestBonus: 0 },
    { name: "煤油矿灯", price: 130, rareBonus: 0.015, chestBonus: 0.01, recipe: { coal: 12 } },
    { name: "铜框矿灯", price: 350, rareBonus: 0.03, chestBonus: 0.02, recipe: { copper: 12, coal: 8 } },
    { name: "红石探照灯", price: 850, rareBonus: 0.05, chestBonus: 0.035, recipe: { redstone: 18, copper: 12 } },
    { name: "紫水晶寻宝灯", price: 1700, rareBonus: 0.075, chestBonus: 0.05, recipe: { amethyst: 12, lapis: 16 } },
    { name: "绿宝石罗盘灯", price: 3200, rareBonus: 0.1, chestBonus: 0.07, recipe: { emerald: 14, diamond: 6 } },
  ];

  const DEPTH_GATES = [
    { depth: 50, toolIndex: 5, lanternLevel: 4 },
    { depth: 70, toolIndex: 6, lanternLevel: 5 },
    { depth: 90, toolIndex: 7, lanternLevel: 5 },
  ];

  const EXPEDITION_EVENT_WEIGHTS = {
    vein: 55,
    chest: 20,
    collapse: 15,
    merchant: 10,
  };

  const ROUTES = ENVIRONMENTS.map((environment) => ({
    id: environment.id,
    name: environment.name,
    symbol: environment.symbol,
    color: environment.color,
    unlockDepth: environment.from,
    steps: 10,
    danger: environment.danger,
    clearBonus: 22 + environment.danger * 42,
    clearXp: 12 + environment.danger * 18,
    description: environment.description,
    rareMaterial: environment.rareMaterial,
    requiredToolIndex: environment.requiredToolIndex,
    requiredLanternLevel: environment.requiredLanternLevel,
    materials: Object.keys(environment.weights),
    weights: environment.weights,
  }));

  function environmentForDepth(depth) {
    return ENVIRONMENTS.find((environment) => depth >= environment.from && depth <= environment.to) || ENVIRONMENTS[0];
  }

  function depthGateFor(depth) {
    return DEPTH_GATES.filter((gate) => depth >= gate.depth).at(-1) || null;
  }

  function weightedMaterial(weights, toolIndex = 0) {
    const entries = Object.entries(weights)
      .filter(([type]) => MATERIALS[type] && MATERIALS[type].minToolIndex <= toolIndex);
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = Math.random() * total;
    for (const [type, weight] of entries) {
      roll -= weight;
      if (roll <= 0) return type;
    }
    return entries.at(-1)?.[0] || "stone";
  }

  window.KittyGameData = {
    MATERIALS,
    ENVIRONMENTS,
    COLLECTIBLES,
    TOOLS,
    BACKPACKS,
    LANTERNS,
    DEPTH_GATES,
    EXPEDITION_EVENT_WEIGHTS,
    ROUTES,
    environmentForDepth,
    depthGateFor,
    weightedMaterial,
  };
}());
