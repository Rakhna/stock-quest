// Stock Quest - 16-Bit Retro RPG Engine with NFTs & Boss Raid Mechanics

class StockQuestEngine {
  constructor() {
    this.player = JSON.parse(JSON.stringify(INITIAL_PLAYER));
    this.stocks = JSON.parse(JSON.stringify(TOKENIZED_STOCKS));
    this.quests = JSON.parse(JSON.stringify(QUESTS_CATALOG));
    this.leaderboard = JSON.parse(JSON.stringify(LEADERBOARD_DATA));
    this.nfts = JSON.parse(JSON.stringify(NFT_CATALOG));
    this.bossRaid = JSON.parse(JSON.stringify(BOSS_RAID_DATA));
    this.listeners = [];

    // Compute effective stats based on initial equipped NFTs
    this.recalculateStats();
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this));
  }

  // Recalculate effective stats = baseStats + equipped NFT bonuses
  recalculateStats() {
    const p = this.player;
    const totals = { ...p.baseStats };

    Object.keys(p.equipped).forEach(slot => {
      const nftId = p.equipped[slot];
      if (nftId) {
        const nft = this.nfts.find(n => n.id === nftId);
        if (nft && nft.bonuses) {
          Object.keys(nft.bonuses).forEach(stat => {
            if (totals[stat] !== undefined) {
              totals[stat] += nft.bonuses[stat];
            }
          });
        }
      }
    });

    // Update effective stats and modifiers
    Object.keys(totals).forEach(stat => {
      if (p.stats[stat]) {
        p.stats[stat].val = totals[stat];
        const modNum = Math.floor((totals[stat] - 10) / 2);
        p.stats[stat].mod = modNum >= 0 ? `+${modNum}` : `${modNum}`;
      }
    });
  }

  // Equip an NFT from Armory
  equipNFT(nftId) {
    const nft = this.nfts.find(n => n.id === nftId);
    if (!nft) return false;

    // Equip into slot
    this.player.equipped[nft.slot] = nftId;
    this.recalculateStats();

    if (window.retroAudio) window.retroAudio.playLevelUp();
    this.logAction(`Equipped ${nft.name} in [${nft.slot.toUpperCase()}]. Stats updated!`, "crit-hit");
    
    if (nft.rarity === "epic" || nft.rarity === "legendary") {
      this.checkQuestTrigger("equip_epic_nft");
    }

    this.notify();
    return true;
  }

  // Unequip an NFT slot
  unequipNFT(slot) {
    if (!this.player.equipped[slot]) return false;
    const prevId = this.player.equipped[slot];
    const prevNft = this.nfts.find(n => n.id === prevId);

    this.player.equipped[slot] = null;
    this.recalculateStats();

    if (window.retroAudio) window.retroAudio.playBlip();
    this.logAction(`Unequipped ${prevNft ? prevNft.name : slot}.`, "trade");
    this.notify();
    return true;
  }

  // Check and trigger Luck-based NFT Loot Drop on Trade Execution
  rollLootDrop() {
    // Drop chance scaled by player's LCK stat
    // e.g. Base rate + (LCK / 10)%
    const lckVal = this.player.stats.lck.val;
    const roll = Math.random() * 100;

    // Check if player has Arbitrage blade (2.5x loot drop multiplier)
    const hasDropMultiplier = this.player.equipped.weapon === "nft_sword_arbitrage" ? 2.5 : 1.0;

    // Calculate weighted rarity drop
    let eligiblePool = [];

    // Mythic / God-tier check (0.5% * multiplier)
    if (roll < (0.8 * hasDropMultiplier)) {
      eligiblePool = this.nfts.filter(n => n.dropRatePct <= 1.0);
    } 
    // Legendary check (1.5% * multiplier)
    else if (roll < (3.5 * hasDropMultiplier)) {
      eligiblePool = this.nfts.filter(n => n.dropRatePct > 1.0 && n.dropRatePct <= 2.0);
    } 
    // Epic check (5% * multiplier)
    else if (roll < (9.0 * hasDropMultiplier)) {
      eligiblePool = this.nfts.filter(n => n.dropRatePct > 2.0 && n.dropRatePct <= 6.0);
    } 
    // Rare check (15% * multiplier)
    else if (roll < (22.0 * hasDropMultiplier)) {
      eligiblePool = this.nfts.filter(n => n.dropRatePct > 6.0 && n.dropRatePct <= 15.0);
    } 
    // Common check (35% * multiplier)
    else if (roll < (45.0 * hasDropMultiplier)) {
      eligiblePool = this.nfts.filter(n => n.dropRatePct > 15.0);
    }

    if (eligiblePool.length > 0) {
      const droppedNFT = eligiblePool[Math.floor(Math.random() * eligiblePool.length)];
      if (!this.player.armoryNFTs.includes(droppedNFT.id)) {
        this.player.armoryNFTs.push(droppedNFT.id);
      }
      return droppedNFT;
    }

    return null;
  }

  // Attack the Market Boss Dragon using Hero ATK + Trading Activity
  attackBoss() {
    const atkVal = this.player.stats.atk.val;
    const baseDamage = atkVal * 18;
    const variance = Math.floor(Math.random() * 120) - 40;
    const finalDamage = Math.max(100, baseDamage + variance);

    this.bossRaid.currentHP = Math.max(0, this.bossRaid.currentHP - finalDamage);
    this.player.raidStats.damageDealt += finalDamage;
    this.player.raidStats.attacksCount += 1;

    // Recalculate estimated share of the $5,000 USD Prize Pool
    const totalDealtSoFar = 50000 + this.player.raidStats.damageDealt;
    const shareRatio = this.player.raidStats.damageDealt / totalDealtSoFar;
    this.player.raidStats.estimatedUsdcShare = +(this.bossRaid.weeklyPrizePoolUSD * shareRatio).toFixed(2);

    const xpGained = Math.floor(finalDamage / 4);
    this.awardXP(xpGained, "Boss Raid Strike");

    if (window.retroAudio) window.retroAudio.playCritSuccess();
    this.logAction(
      `RAID STRIKE: Dealt ${finalDamage} DMG to Volatility Dragon! +${xpGained} XP! Est. Prize Share: $${this.player.raidStats.estimatedUsdcShare} USD`,
      "crit-hit"
    );

    this.checkQuestTrigger("attack_boss");
    this.notify();

    return {
      damage: finalDamage,
      newBossHP: this.bossRaid.currentHP,
      totalDamage: this.player.raidStats.damageDealt,
      estimatedShareUSD: this.player.raidStats.estimatedUsdcShare,
      xpGained
    };
  }

  // Calculate total portfolio net worth
  getPortfolioValue() {
    let stockValue = 0;
    this.player.holdings.forEach(holding => {
      const stock = this.stocks.find(s => s.ticker === holding.ticker);
      if (stock) {
        stockValue += holding.shares * stock.price;
      }
    });
    return this.player.cashUSD + stockValue;
  }

  // Sector allocation percentages for high-level portfolio tracking
  getSectorAllocations() {
    const sectorValues = {};
    let totalStockVal = 0;

    this.player.holdings.forEach(holding => {
      const stock = this.stocks.find(s => s.ticker === holding.ticker);
      if (stock && holding.shares > 0) {
        const val = holding.shares * stock.price;
        sectorValues[stock.sector] = (sectorValues[stock.sector] || 0) + val;
        totalStockVal += val;
      }
    });

    const result = [];
    Object.keys(sectorValues).forEach(sec => {
      result.push({
        sector: sec,
        valueUSD: sectorValues[sec],
        percentage: totalStockVal > 0 ? +((sectorValues[sec] / totalStockVal) * 100).toFixed(1) : 0
      });
    });

    return result;
  }

  getSectorsCount() {
    const sectors = new Set();
    this.player.holdings.forEach(holding => {
      const stock = this.stocks.find(s => s.ticker === holding.ticker);
      if (stock && holding.shares > 0) {
        sectors.add(stock.sector);
      }
    });
    return sectors.size;
  }

  awardXP(amount, reason = "Adventure Experience") {
    this.player.xp += amount;
    let leveledUp = false;

    while (this.player.xp >= this.player.maxXP) {
      this.player.xp -= this.player.maxXP;
      this.player.level += 1;
      this.player.maxXP = Math.floor(this.player.maxXP * 1.4);
      this.player.maxHP += 20;
      this.player.hp = this.player.maxHP;
      
      // Upgrade base stats
      this.player.baseStats.atk += 2;
      this.player.baseStats.def += 2;
      this.player.baseStats.disc += 1;
      this.player.baseStats.int += 1;
      
      this.recalculateStats();
      leveledUp = true;
    }

    if (leveledUp) {
      if (window.retroAudio) window.retroAudio.playLevelUp();
      this.logAction(
        `LEVEL UP! You reached Level ${this.player.level}! Hero stats increased!`,
        "crit-hit"
      );
    }

    this.notify();
    return { leveledUp, newLevel: this.player.level, xpAdded: amount, reason };
  }

  rollStrike() {
    return Math.floor(Math.random() * 20) + 1;
  }

  // Execute a Buy Order on Base
  executeBuy(ticker, shares, customRoll = null) {
    const stock = this.stocks.find(s => s.ticker === ticker);
    if (!stock) return { success: false, msg: "Stock not found" };

    const totalCost = stock.price * shares;
    if (this.player.cashUSD < totalCost) {
      return { success: false, msg: "Insufficient USD Cash!" };
    }

    const strikeRoll = customRoll !== null ? customRoll : this.rollStrike();
    const luckMod = parseInt(this.player.stats.lck.mod, 10) || 0;
    const totalScore = strikeRoll + luckMod;

    let resultCategory = "";
    let xpAward = 0;
    let priceModifier = 1.0;
    let logType = "trade";
    let message = "";

    if (strikeRoll === 20) {
      resultCategory = "CRITICAL HIT!";
      priceModifier = 0.95;
      xpAward = 300;
      logType = "crit-hit";
      message = "Flawless on-chain execution! 5% arbitrage discount and massive XP earned!";
      if (window.retroAudio) window.retroAudio.playCritSuccess();
      this.checkQuestTrigger("natural_20");
    } else if (totalScore >= 16) {
      resultCategory = "GREAT STRIKE!";
      priceModifier = 0.98;
      xpAward = 180;
      logType = "trade";
      message = "Optimal entry. Clean routing with zero slippage.";
      if (window.retroAudio) window.retroAudio.playCoin();
    } else if (totalScore >= 10) {
      resultCategory = "SOLID HIT";
      priceModifier = 1.0;
      xpAward = 100;
      logType = "trade";
      message = "Order executed cleanly at market price.";
      if (window.retroAudio) window.retroAudio.playCoin();
    } else if (strikeRoll === 1) {
      resultCategory = "CRITICAL MISS (VOLATILITY SPIKE)";
      priceModifier = 1.05;
      xpAward = 150;
      logType = "crit-fail";
      message = "Flash volatility dip & MEV friction! +150 Survival XP awarded for enduring the battle!";
      if (window.retroAudio) window.retroAudio.playCritFail();
      this.checkQuestTrigger("learn_from_loss");
    } else {
      resultCategory = "GLANCING BLOW (SLIPPAGE)";
      priceModifier = 1.02;
      xpAward = 80;
      logType = "trade";
      message = "Faced minor market friction. +80 Battle Experience XP gained.";
      if (window.retroAudio) window.retroAudio.playCoin();
      this.checkQuestTrigger("learn_from_loss");
    }

    const finalPricePerShare = stock.price * priceModifier;
    const finalTotalCost = finalPricePerShare * shares;
    this.player.cashUSD -= finalTotalCost;

    // Simulate Gas Saved on Base L2 vs Ethereum mainnet (~$18.40 saved per trade)
    this.player.totalGasSavedUSD += 18.40;

    const existingHolding = this.player.holdings.find(h => h.ticker === ticker);
    if (existingHolding) {
      const totalShares = existingHolding.shares + shares;
      existingHolding.avgBuyPrice = 
        ((existingHolding.shares * existingHolding.avgBuyPrice) + finalTotalCost) / totalShares;
      existingHolding.shares = totalShares;
    } else {
      this.player.holdings.push({
        ticker: ticker,
        shares: shares,
        avgBuyPrice: finalPricePerShare
      });
    }

    this.awardXP(xpAward, `${resultCategory} on ${ticker}`);

    // Check Loot Drop!
    const droppedNFT = this.rollLootDrop();

    this.logAction(
      `Bought ${shares} ${ticker} [${resultCategory}]. +${xpAward} XP. Saved $18.40 in Base L2 gas.`,
      logType
    );

    this.checkQuestTrigger("trades_count");
    if (ticker === "COIN") this.checkQuestTrigger("has_coin_stock");
    if (this.getSectorsCount() >= 3) this.checkQuestTrigger("sectors_count");

    this.notify();

    return {
      success: true,
      strikeRoll,
      resultCategory,
      xpAward,
      priceModifier,
      message,
      finalCost: finalTotalCost,
      droppedNFT
    };
  }

  executeSell(ticker, sharesToSell) {
    const holdingIndex = this.player.holdings.findIndex(h => h.ticker === ticker);
    if (holdingIndex === -1) return { success: false, msg: "Stock not held" };

    const holding = this.player.holdings[holdingIndex];
    if (holding.shares < sharesToSell) return { success: false, msg: "Not enough shares" };

    const stock = this.stocks.find(s => s.ticker === ticker);
    const saleRevenue = stock.price * sharesToSell;
    const costBasis = holding.avgBuyPrice * sharesToSell;
    const profitUSD = saleRevenue - costBasis;
    const profitPercent = ((saleRevenue - costBasis) / costBasis) * 100;

    let xpAward = 0;
    let logType = "trade";
    let message = "";

    if (profitUSD > 0) {
      xpAward = Math.min(400, Math.floor(100 + profitPercent * 15));
      message = `VICTORY HARVEST! +$${profitUSD.toFixed(2)} (+${profitPercent.toFixed(1)}%). +${xpAward} XP!`;
      logType = "xp-gain";
      if (window.retroAudio) window.retroAudio.playCoin();
    } else {
      if (profitPercent >= -5.0) {
        xpAward = 140;
        message = `DEFENSIVE PARRY! Loss contained to ${profitPercent.toFixed(1)}%. +140 Discipline XP!`;
        logType = "trade";
        this.checkQuestTrigger("disciplined_stop_loss");
      } else {
        xpAward = 75;
        message = `SURVIVED DRAWDOWN (${profitPercent.toFixed(1)}%). +75 Battle Experience XP.`;
        logType = "crit-fail";
        this.checkQuestTrigger("learn_from_loss");
      }
    }

    this.player.cashUSD += saleRevenue;
    holding.shares -= sharesToSell;

    if (holding.shares <= 0.001) {
      this.player.holdings.splice(holdingIndex, 1);
    }

    this.awardXP(xpAward, `Sold ${ticker}`);
    this.logAction(
      `Sold ${sharesToSell} ${ticker}. ${message}`,
      logType
    );

    this.notify();

    return {
      success: true,
      profitUSD,
      profitPercent,
      xpAward,
      message
    };
  }

  claimQuest(questId) {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest || quest.status !== "claimable") return false;

    quest.status = "completed";
    this.player.cashUSD += quest.rewardGold;
    this.awardXP(quest.rewardXP, `Completed Quest: ${quest.title}`);
    
    if (window.retroAudio) window.retroAudio.playCoin();
    this.logAction(
      `QUEST COMPLETED: ${quest.title}! +${quest.rewardXP} XP, +$${quest.rewardGold} USD`,
      "crit-hit"
    );

    this.notify();
    return true;
  }

  checkQuestTrigger(triggerType) {
    this.quests.forEach(quest => {
      if (quest.status !== "in_progress") return;

      if (triggerType === "has_coin_stock" && quest.id === "q2") quest.status = "claimable";
      if (triggerType === "sectors_count" && quest.id === "q3" && this.getSectorsCount() >= 3) quest.status = "claimable";
      if (triggerType === "disciplined_stop_loss" && quest.id === "q4") quest.status = "claimable";
      if (triggerType === "natural_20" && quest.id === "q5") quest.status = "claimable";
      if (triggerType === "attack_boss" && quest.id === "q6") quest.status = "claimable";
      if (triggerType === "equip_epic_nft" && quest.id === "q8") quest.status = "claimable";
    });
  }

  logAction(text, type = "trade") {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.player.rollHistory.unshift({
      timestamp: time,
      action: text,
      type: type
    });
    if (this.player.rollHistory.length > 25) {
      this.player.rollHistory.pop();
    }
  }

  tickMarket() {
    this.stocks.forEach(stock => {
      const deltaPercent = (Math.random() * 3.6) - 1.7;
      stock.price = Math.max(1, +(stock.price * (1 + deltaPercent / 100)).toFixed(2));
      stock.change24h = +(stock.change24h + (deltaPercent * 0.2)).toFixed(2);
    });

    if (this.getPortfolioValue() >= 2500) {
      const q7 = this.quests.find(q => q.id === "q7");
      if (q7 && q7.status === "in_progress") {
        q7.status = "claimable";
      }
    }

    this.notify();
  }
}

window.stockQuestEngine = new StockQuestEngine();
