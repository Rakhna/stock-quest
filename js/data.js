// Stock Quest - Game Data, NFTs Catalog, and On-Chain Base Tracking

const INITIAL_PLAYER = {
  address: "0x7F2a...Base",
  characterName: "Aethelgard",
  title: "Paladin of the Blue Chain",
  level: 1,
  xp: 120,
  maxXP: 500,
  hp: 100,
  maxHP: 100,
  cashUSD: 1450.00, // MP
  initialCapital: 2000.00,
  streak: 3,
  totalGasSavedUSD: 92.10, // Simulated gas saved on Base L2 vs Ethereum L1
  
  // Base Hero Stats (prior to NFT equipment bonuses)
  baseStats: {
    atk: 18,
    def: 24,
    spd: 15,
    int: 20,
    disc: 17,
    lck: 14
  },

  // Active Effective Stats (Base + Equipped NFTs)
  stats: {
    atk: { val: 18, label: "Attack (ATK)", desc: "Alpha capture and raid boss damage output", mod: "+3" },
    def: { val: 24, label: "Defense (DEF)", desc: "Drawdown mitigation and portfolio armor", mod: "+4" },
    spd: { val: 15, label: "Speed (SPD)", desc: "Execution speed and low latency on Base L2", mod: "+2" },
    int: { val: 20, label: "Intellect (INT)", desc: "Tokenomics analysis and sector diversification", mod: "+3" },
    disc: { val: 17, label: "Discipline (DISC)", desc: "Risk control and tactical stop-loss execution", mod: "+2" },
    lck: { val: 14, label: "Luck (LCK)", desc: "Rare NFT drop probability and arbitrage frequency", mod: "+1" }
  },

  // Equipped Equipment Slots
  equipped: {
    weapon: "nft_sword_arbitrage", // Starts equipped with Epic Arbitrageur Blade
    armor: null,
    boots: "nft_boots_l2",         // Starts equipped with Explorer Boots
    relic: null
  },

  // Owned NFT Relics in Armory
  armoryNFTs: [
    "nft_boots_l2",
    "nft_sword_arbitrage",
    "nft_shield_diamond"
  ],

  // Holdings in Tokenized Stocks (RPG Gear)
  holdings: [
    { ticker: "COIN", shares: 2.0, avgBuyPrice: 172.50 },
    { ticker: "AAPL", shares: 1.5, avgBuyPrice: 192.10 },
    { ticker: "NVDA", shares: 0.5, avgBuyPrice: 460.00 }
  ],

  // Boss Raid Participation
  raidStats: {
    damageDealt: 1420,
    attacksCount: 3,
    estimatedUsdcShare: 142.50
  },

  // Adventure Log
  rollHistory: [
    {
      timestamp: "18:24",
      action: "Acquired 2 COIN (GREAT STRIKE! +10% Yield Bonus)",
      result: "Clean entry on Base L2",
      xpGained: 180,
      type: "success"
    },
    {
      timestamp: "18:31",
      action: "Absorbed AAPL -3.2% Dip (SHIELD DEFENSE ACTIVATED)",
      result: "Diamond Hands defense held steady",
      xpGained: 120,
      type: "success"
    }
  ]
};

// Top-Tier Coinbase Tokenized Stocks on Base Catalog with Full On-Chain Tracking
const TOKENIZED_STOCKS = [
  {
    ticker: "COIN",
    name: "Coinbase Global Inc.",
    sector: "Finance & Crypto",
    price: 178.90,
    change24h: 3.71,
    volume24h: "$14.8M",
    high24h: 182.40,
    low24h: 171.80,
    rarity: "legendary",
    description: "The Sacred Relic of Base Network. Boosts discipline and awards passive on-chain yield.",
    rpgStats: { atk: 48, def: 35, spd: 42 },
    contractBase: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    basescanUrl: "https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  },
  {
    ticker: "NVDA",
    name: "Nvidia Corporation",
    sector: "Mega Tech & AI",
    price: 486.20,
    change24h: 4.85,
    volume24h: "$28.4M",
    high24h: 492.10,
    low24h: 470.50,
    rarity: "legendary",
    description: "Forged in GPU compute furnaces. Imbued with lightning elemental power. High critical strike multiplier.",
    rpgStats: { atk: 92, def: 28, spd: 85 },
    contractBase: "0x4200000000000000000000000000000000000006",
    basescanUrl: "https://basescan.org/token/0x4200000000000000000000000000000000000006"
  },
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    sector: "Consumer Tech",
    price: 198.50,
    change24h: 1.25,
    volume24h: "$19.2M",
    high24h: 201.20,
    low24h: 196.00,
    rarity: "epic",
    description: "Titanium armor breastplate. Tremendous defense against macroeconomic downturns.",
    rpgStats: { atk: 65, def: 88, spd: 45 },
    contractBase: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
    basescanUrl: "https://basescan.org/token/0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b"
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    sector: "EV & Clean Energy",
    price: 246.80,
    change24h: -2.15,
    volume24h: "$22.1M",
    high24h: 254.00,
    low24h: 242.30,
    rarity: "epic",
    description: "Wild electric steed. High variance weapon for bold adventurers hunting momentum.",
    rpgStats: { atk: 82, def: 20, spd: 90 },
    contractBase: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    basescanUrl: "https://basescan.org/token/0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    sector: "Mega Tech & Cloud",
    price: 422.30,
    change24h: 0.95,
    volume24h: "$12.6M",
    high24h: 426.80,
    low24h: 419.00,
    rarity: "rare",
    description: "The Ancient Bastion. Steady mana generation and fortress against bear raids.",
    rpgStats: { atk: 58, def: 90, spd: 38 },
    contractBase: "0x2Ae3F1Ec7E123a234149fa8174Ee0f01f010f367",
    basescanUrl: "https://basescan.org/token/0x2Ae3F1Ec7E123a234149fa8174Ee0f01f010f367"
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    sector: "E-Commerce & Cloud",
    price: 186.40,
    change24h: 2.10,
    volume24h: "$11.3M",
    high24h: 188.50,
    low24h: 183.20,
    rarity: "rare",
    description: "Global logistics caravan. Replenishes trading stamina and portfolio reserves.",
    rpgStats: { atk: 62, def: 75, spd: 55 },
    contractBase: "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3",
    basescanUrl: "https://basescan.org/token/0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"
  },
  {
    ticker: "SPY",
    name: "S&P 500 Index Token",
    sector: "Index ETF",
    price: 545.10,
    change24h: 0.65,
    volume24h: "$45.2M",
    high24h: 547.20,
    low24h: 542.90,
    rarity: "rare",
    description: "The Tome of Market Balance. Provides all-around defensive passive shields.",
    rpgStats: { atk: 50, def: 95, spd: 30 },
    contractBase: "0x940181a94A35A4569E4529A3CDfB7496fF7fF967",
    basescanUrl: "https://basescan.org/token/0x940181a94A35A4569E4529A3CDfB7496fF7fF967"
  },
  {
    ticker: "MSTR",
    name: "MicroStrategy Inc.",
    sector: "Bitcoin Treasury",
    price: 1420.00,
    change24h: 6.80,
    volume24h: "$34.1M",
    high24h: 1450.00,
    low24h: 1380.00,
    rarity: "legendary",
    description: "The Berserker's Greatsword. Directly channeled to the Bitcoin Citadel's energy.",
    rpgStats: { atk: 99, def: 12, spd: 78 },
    contractBase: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    basescanUrl: "https://basescan.org/token/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
  }
];

// Comprehensive Catalog of NFTs with Low Drop Percentages (Luck-dependent)
const NFT_CATALOG = [
  // Common (35% drop rate pool)
  {
    id: "nft_boots_l2",
    name: "Botas del Explorador L2",
    slot: "boots",
    rarity: "common",
    dropRatePct: 35.0,
    bonuses: { spd: 3 },
    perk: "5% gas fee rebate on Base network trades.",
    desc: "Lightweight leather boots blessed by Optimism rollups. Fast execution speed."
  },
  {
    id: "nft_gloves_novice",
    name: "Guantes del Trader Novato",
    slot: "weapon",
    rarity: "common",
    dropRatePct: 30.0,
    bonuses: { atk: 3 },
    perk: "+5 XP on every market fill.",
    desc: "Sturdy wool gloves for clutching order tickets in the cold market wind."
  },

  // Rare (15% drop rate pool)
  {
    id: "nft_shield_diamond",
    name: "Escudo de Manos de Diamante",
    slot: "armor",
    rarity: "rare",
    dropRatePct: 15.0,
    bonuses: { def: 6, disc: 3 },
    perk: "-20% health damage on market drawdowns.",
    desc: "Forged from pressurized carbon crystals. Completely impervious to panic selling."
  },
  {
    id: "nft_cloak_mev",
    name: "Capa de Sigilo MEV",
    slot: "armor",
    rarity: "rare",
    dropRatePct: 12.0,
    bonuses: { spd: 5, lck: 3 },
    perk: "Zero slippage protection against sandwich bots.",
    desc: "Woven from dark mempool threads. Hides your transaction intent."
  },

  // Epic (5% drop rate pool)
  {
    id: "nft_sword_arbitrage",
    name: "Espada del Arbitrajista",
    slot: "weapon",
    rarity: "epic",
    dropRatePct: 5.0,
    bonuses: { atk: 10, lck: 4 },
    perk: "2.5x multiplier on NFT loot chest drop chance.",
    desc: "Twin-edged razor blade balancing NYSE quotes with Uniswap pools on Base."
  },
  {
    id: "nft_tome_contracts",
    name: "Tomo de Contratos Base",
    slot: "relic",
    rarity: "epic",
    dropRatePct: 4.0,
    bonuses: { int: 8, disc: 5 },
    perk: "+15% bonus XP on all profitable trade harvests.",
    desc: "Ancient scrolls detailing Coinbase tokenized equity ERC-20 implementations."
  },

  // Legendary (1.5% drop rate pool)
  {
    id: "nft_ring_coinbase",
    name: "Anillo del Oráculo de Coinbase",
    slot: "relic",
    rarity: "legendary",
    dropRatePct: 1.5,
    bonuses: { atk: 8, def: 8, spd: 8, int: 8, disc: 8, lck: 8 },
    perk: "VIP access: 2x damage multiplier in Weekly Boss Raids.",
    desc: "Golden signet ring stamped with the iconic blue disc of Coinbase."
  },
  {
    id: "nft_armor_rollup",
    name: "Armadura de Bloques de Base",
    slot: "armor",
    rarity: "legendary",
    dropRatePct: 1.2,
    bonuses: { def: 18, disc: 10 },
    perk: "+100 Max HP bonus and immunity to flash liquidations.",
    desc: "Plates carved from verified L2 fraud-proof state roots."
  },

  // Mythic / God-Tier (0.5% - 0.8% ultra low drop rate)
  {
    id: "nft_crown_genesis",
    name: "Corona de Satoshi Genesis",
    slot: "relic",
    rarity: "legendary",
    dropRatePct: 0.5,
    bonuses: { atk: 25, lck: 20 },
    perk: "Passive claim of 10% bonus share from the $5,000 USD Weekly Prize Pool.",
    desc: "A celestial diadem inscribed with 'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks'."
  },
  {
    id: "nft_scepter_infinity",
    name: "Cetro del L2 Rollup Infinito",
    slot: "weapon",
    rarity: "legendary",
    dropRatePct: 0.8,
    bonuses: { atk: 30, spd: 18 },
    perk: "Guarantees Critical Strike on your first trade each cycle.",
    desc: "Channels the infinite throughput of decentralized horizontal scaling."
  }
];

// Market Boss Raid State
const BOSS_RAID_DATA = {
  bossName: "The Volatility Dragon",
  title: "Ancient Scourge of the Bear Market",
  totalHP: 100000,
  currentHP: 68450,
  weeklyPrizePoolUSD: 5000.00, // Matching the $5,000 Base Latam Builder Quest prize pool!
  timeLeft: "2 Days, 4 Hours",
  topRaiders: [
    { rank: "01", address: "0xBase...90F1", damage: 14200, poolSharePct: "20.7%", estReward: "$1,035.00" },
    { rank: "02", address: "0xAlpha...42A8", damage: 11800, poolSharePct: "17.2%", estReward: "$860.00" },
    { rank: "03", address: "0xC01n...BEEF", damage: 8900, poolSharePct: "13.0%", estReward: "$650.00" },
    { rank: "04", address: "Aethelgard (You)", damage: 1420, poolSharePct: "2.1%", estReward: "$142.50" },
    { rank: "05", address: "0xWhale...8812", damage: 7600, poolSharePct: "11.1%", estReward: "$555.00" }
  ]
};

// Quests List
const QUESTS_CATALOG = [
  {
    id: "q1",
    title: "Tavern Recruit",
    desc: "Execute your first on-chain trade for any tokenized stock.",
    rewardXP: 100,
    rewardGold: 50,
    status: "completed",
    requirement: "trades_count >= 1"
  },
  {
    id: "q2",
    title: "The Coinbase Guild Crest",
    desc: "Acquire and equip at least 1.0 share of COIN tokenized stock.",
    rewardXP: 250,
    rewardGold: 100,
    status: "completed",
    requirement: "has_coin_stock"
  },
  {
    id: "q3",
    title: "Master of Elements (Diversify)",
    desc: "Hold tokenized stocks across 3 distinct sectors (Finance, Tech, Auto, Index).",
    rewardXP: 300,
    rewardGold: 150,
    status: "claimable",
    requirement: "sectors_count >= 3"
  },
  {
    id: "q4",
    title: "Defensive Parry (Disciplined Stop)",
    desc: "Cut a declining trade before dropping past -5%. Master risk discipline over pride.",
    rewardXP: 200,
    rewardGold: 80,
    status: "in_progress",
    requirement: "disciplined_stop_loss"
  },
  {
    id: "q5",
    title: "Critical Strike Master",
    desc: "Trigger a Critical Strike (top tier roll) during a market order.",
    rewardXP: 400,
    rewardGold: 200,
    status: "in_progress",
    requirement: "natural_20"
  },
  {
    id: "q6",
    title: "Raid Initiator",
    desc: "Attack the Volatility Dragon in the Weekly Boss Raid and claim your pool share.",
    rewardXP: 280,
    rewardGold: 100,
    status: "claimable",
    requirement: "attack_boss"
  },
  {
    id: "q7",
    title: "The Dragon's Vault ($2,500 Portfolio)",
    desc: "Grow your total combined portfolio value past $2,500 USD.",
    rewardXP: 500,
    rewardGold: 300,
    status: "in_progress",
    requirement: "portfolio_val >= 2500"
  },
  {
    id: "q8",
    title: "Relic Master",
    desc: "Equip an Epic or Legendary NFT in your Armory.",
    rewardXP: 350,
    rewardGold: 120,
    status: "completed",
    requirement: "equip_epic_nft"
  }
];

// Leaderboard
const LEADERBOARD_DATA = [
  { rank: "01", name: "0xBase...90F1", class: "Diamond Paladin", lvl: 24, netWorth: 14250.00, winRate: "78%" },
  { rank: "02", name: "0xAlpha...42A8", class: "Shadow Rogue", lvl: 21, netWorth: 11840.50, winRate: "71%" },
  { rank: "03", name: "0xC01n...BEEF", class: "Volatility Sorcerer", lvl: 19, netWorth: 9320.00, winRate: "65%" },
  { rank: "04", name: "Aethelgard (You)", class: "Paladin of the Blue Chain", lvl: 1, netWorth: 2125.75, winRate: "67%" },
  { rank: "05", name: "0xWhale...8812", class: "Archmage Druid", lvl: 18, netWorth: 8540.20, winRate: "82%" },
  { rank: "06", name: "0xGiga...1337", class: "Diamond Paladin", lvl: 16, netWorth: 6710.00, winRate: "59%" },
  { rank: "07", name: "0xSatoshi...0001", class: "Tavern Bard", lvl: 14, netWorth: 5400.00, winRate: "63%" }
];
