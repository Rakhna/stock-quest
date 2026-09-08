// Stock Quest - Game Data & Tokenized Stocks Catalog

const INITIAL_PLAYER = {
  address: "0x7F2a...Base",
  characterName: "Aethelgard",
  title: "Paladin of the Blue Chain",
  level: 1,
  xp: 120,
  maxXP: 500,
  hp: 100,
  maxHP: 100,
  cashUSD: 1450.00, // Available Liquid Capital (MP)
  initialCapital: 2000.00,
  streak: 3,
  
  // D&D 6 Core Ability Scores
  stats: {
    str: { val: 14, label: "Strength", desc: "Alpha Generation & Trading Conviction", mod: "+2" },
    dex: { val: 12, label: "Dexterity", desc: "Execution Speed & Slippage Mitigation", mod: "+1" },
    con: { val: 16, label: "Constitution", desc: "Drawdown Resilience & Diamond Hands", mod: "+3" },
    int: { val: 15, label: "Intelligence", desc: "Tokenomics Research & Sector Diversity", mod: "+2" },
    wis: { val: 13, label: "Wisdom", desc: "Risk Management & Stop-Loss Discipline", mod: "+1" },
    cha: { val: 11, label: "Charisma", desc: "Social Lore & On-Chain Guild Influence", mod: "+0" }
  },

  // Holdings in Tokenized Stocks
  holdings: [
    { ticker: "COIN", shares: 2.0, avgBuyPrice: 172.50 },
    { ticker: "AAPL", shares: 1.5, avgBuyPrice: 192.10 },
    { ticker: "NVDA", shares: 0.5, avgBuyPrice: 460.00 }
  ],

  // History of D20 Rolls & Trades
  rollHistory: [
    {
      timestamp: "18:24",
      action: "Bought 2 COIN",
      roll: 18,
      result: "Great Hit! +10% Yield Bonus",
      xpGained: 180,
      type: "success"
    },
    {
      timestamp: "18:31",
      action: "Held AAPL through -3.2% Dip",
      roll: 15,
      result: "Fortitude Check Passed (Diamond Hands)",
      xpGained: 120,
      type: "success"
    }
  ]
};

// Coinbase Tokenized Stocks on Base Network Catalog
const TOKENIZED_STOCKS = [
  {
    ticker: "COIN",
    name: "Coinbase Global Inc.",
    sector: "Finance & Crypto",
    price: 178.90,
    change24h: 3.71,
    rarity: "legendary",
    description: "The Holy Relic of Base Network. Grants +3 to Wisdom and passive yield to on-chain settlers.",
    rpgStats: { atk: 48, def: 35, spd: 42 },
    contractBase: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
  },
  {
    ticker: "NVDA",
    name: "Nvidia Corporation",
    sector: "Mega Tech & AI",
    price: 486.20,
    change24h: 4.85,
    rarity: "legendary",
    description: "Forged in the fires of AI compute. Infused with lightning magic. Critical strikes strike twice.",
    rpgStats: { atk: 92, def: 28, spd: 85 },
    contractBase: "0x4200000000000000000000000000000000000006"
  },
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    sector: "Consumer Tech",
    price: 198.50,
    change24h: 1.25,
    rarity: "epic",
    description: "Titanium armor plate. Tremendous defense against macroeconomic downturns.",
    rpgStats: { atk: 65, def: 88, spd: 45 },
    contractBase: "0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b"
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    sector: "EV & Clean Energy",
    price: 246.80,
    change24h: -2.15,
    rarity: "epic",
    description: "Wild volatile lightning stallion. High variance weapon, rewarding reckless risk-takers.",
    rpgStats: { atk: 82, def: 20, spd: 90 },
    contractBase: "0x50c5725949a6f0c72e6c4a641f24049a917db0cb"
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    sector: "Mega Tech & Cloud",
    price: 422.30,
    change24h: 0.95,
    rarity: "rare",
    description: "The Ancient Citadel. Steady mana flow and reliable fortress against bear raids.",
    rpgStats: { atk: 58, def: 90, spd: 38 },
    contractBase: "0x2ae3f1ec7e123a234149fa8174ee0f01f010f367"
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    sector: "E-Commerce & Cloud",
    price: 186.40,
    change24h: 2.10,
    rarity: "rare",
    description: "Merchant caravan of infinite logistics. Expands trading stamina and gold reserves.",
    rpgStats: { atk: 62, def: 75, spd: 55 },
    contractBase: "0x4c9edd5852cd905f086c759e8383e09bff1e68b3"
  },
  {
    ticker: "SPY",
    name: "S&P 500 Index Token",
    sector: "Index ETF",
    price: 545.10,
    change24h: 0.65,
    rarity: "rare",
    description: "The Tome of Collective Wisdom. Balanced enchantments granting all-around stat protection.",
    rpgStats: { atk: 50, def: 95, spd: 30 },
    contractBase: "0x940181a94a35a4569e4529a3cdfb7496ff7ff967"
  },
  {
    ticker: "MSTR",
    name: "MicroStrategy Inc.",
    sector: "Bitcoin Treasury",
    price: 1420.00,
    change24h: 6.80,
    rarity: "legendary",
    description: "The Berserker's Greatsword. Leveraged direct connection to the Orange King's power.",
    rpgStats: { atk: 99, def: 12, spd: 78 },
    contractBase: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"
  }
];

// Quests List (Gamified D&D Trading Objectives)
const QUESTS_CATALOG = [
  {
    id: "q1",
    title: "Initiation at Base Tavern",
    desc: "Execute your first on-chain trade for any tokenized stock.",
    rewardXP: 100,
    rewardGold: 50,
    status: "completed",
    requirement: "trades_count >= 1"
  },
  {
    id: "q2",
    title: "The Coinbase Guild Seal",
    desc: "Acquire and hold at least 1.0 share of COIN tokenized stock in your inventory.",
    rewardXP: 250,
    rewardGold: 100,
    status: "completed",
    requirement: "has_coin_stock"
  },
  {
    id: "q3",
    title: "The Four Rings of Diversification",
    desc: "Hold tokenized stocks spanning at least 3 distinct sectors (Finance, Tech, Auto, Index).",
    rewardXP: 300,
    rewardGold: 150,
    status: "claimable",
    requirement: "sectors_count >= 3"
  },
  {
    id: "q4",
    title: "Tactical Retreat (Wisdom Save)",
    desc: "Cut a losing trade before it drops past -5%. Master the art of risk management over pride.",
    rewardXP: 200,
    rewardGold: 80,
    status: "in_progress",
    requirement: "disciplined_stop_loss"
  },
  {
    id: "q5",
    title: "The D20 Critical Surge",
    desc: "Roll a Natural 20 during any stock purchase roll in the market.",
    rewardXP: 400,
    rewardGold: 200,
    status: "in_progress",
    requirement: "natural_20"
  },
  {
    id: "q6",
    title: "Battle Scar Resilience",
    desc: "Experience a drawdown or roll under 8, yet keep trading without tilting.",
    rewardXP: 180,
    rewardGold: 50,
    status: "in_progress",
    requirement: "learn_from_loss"
  },
  {
    id: "q7",
    title: "The Dragon's Hoard ($2,500 Portfolio)",
    desc: "Grow your total combined portfolio value (Cash + Stocks) past $2,500 USD.",
    rewardXP: 500,
    rewardGold: 300,
    status: "in_progress",
    requirement: "portfolio_val >= 2500"
  },
  {
    id: "q8",
    title: "Diamond Hands Fortitude",
    desc: "Maintain your stock holdings throughout 5 consecutive market tick cycles.",
    rewardXP: 350,
    rewardGold: 120,
    status: "in_progress",
    requirement: "hold_ticks >= 5"
  }
];

// Hall of Fame / Leaderboard
const LEADERBOARD_DATA = [
  { rank: "01", name: "0xBase...90F1", class: "Diamond Paladin", lvl: 24, netWorth: 14250.00, winRate: "78%" },
  { rank: "02", name: "0xAlpha...42A8", class: "Arbitrage Rogue", lvl: 21, netWorth: 11840.50, winRate: "71%" },
  { rank: "03", name: "0xC01n...BEEF", class: "Volatility Mage", lvl: 19, netWorth: 9320.00, winRate: "65%" },
  { rank: "04", name: "Aethelgard (You)", class: "Paladin of the Blue Chain", lvl: 1, netWorth: 2125.75, winRate: "67%" },
  { rank: "05", name: "0xWhale...8812", class: "Index Druid", lvl: 18, netWorth: 8540.20, winRate: "82%" },
  { rank: "06", name: "0xGiga...1337", class: "Diamond Paladin", lvl: 16, netWorth: 6710.00, winRate: "59%" },
  { rank: "07", name: "0xSatoshi...0001", class: "Tavern Bard", lvl: 14, netWorth: 5400.00, winRate: "63%" }
];
