// Stock Quest - 16-Bit Retro RPG Trading Engine

class StockQuestEngine {
  constructor() {
    this.player = JSON.parse(JSON.stringify(INITIAL_PLAYER));
    this.stocks = JSON.parse(JSON.stringify(TOKENIZED_STOCKS));
    this.quests = JSON.parse(JSON.stringify(QUESTS_CATALOG));
    this.leaderboard = JSON.parse(JSON.stringify(LEADERBOARD_DATA));
    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this));
  }

  // Calculate total portfolio net worth (Cash + current value of all stock holdings)
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

  // Calculate sector diversification count
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

  // Add XP with automatic Level Up checking
  awardXP(amount, reason = "Adventure Experience") {
    this.player.xp += amount;
    let leveledUp = false;

    while (this.player.xp >= this.player.maxXP) {
      this.player.xp -= this.player.maxXP;
      this.player.level += 1;
      this.player.maxXP = Math.floor(this.player.maxXP * 1.4);
      this.player.maxHP += 20;
      this.player.hp = this.player.maxHP;
      
      // Upgrade RPG Hero Stats
      this.player.stats.atk.val += 2;
      this.player.stats.def.val += 2;
      this.player.stats.disc.val += 1;
      this.player.stats.int.val += 1;
      
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

  // Action / Strike Check (1-20 RNG)
  rollStrike() {
    return Math.floor(Math.random() * 20) + 1;
  }

  // Execute a Buy Order with RPG Action Resolution
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
      // Critical Hit
      resultCategory = "CRITICAL HIT!";
      priceModifier = 0.95; // 5% arbitrage discount
      xpAward = 300;
      logType = "crit-hit";
      message = "Flawless on-chain execution! 5% arbitrage discount and massive XP earned!";
      if (window.retroAudio) window.retroAudio.playCritSuccess();
      this.checkQuestTrigger("natural_20");
    } else if (totalScore >= 16) {
      // Great Strike
      resultCategory = "GREAT STRIKE!";
      priceModifier = 0.98; // 2% discount
      xpAward = 180;
      logType = "trade";
      message = "Optimal entry. Clean routing with zero slippage.";
      if (window.retroAudio) window.retroAudio.playCoin();
    } else if (totalScore >= 10) {
      // Solid Hit
      resultCategory = "SOLID HIT";
      priceModifier = 1.0;
      xpAward = 100;
      logType = "trade";
      message = "Order executed cleanly at market price.";
      if (window.retroAudio) window.retroAudio.playCoin();
    } else if (strikeRoll === 1) {
      // Critical Miss / Volatility Dip
      resultCategory = "CRITICAL MISS (VOLATILITY SPIKE)";
      priceModifier = 1.05; // 5% slippage penalty
      xpAward = 150; // Survival XP
      logType = "crit-fail";
      message = "Flash volatility dip & MEV friction! +150 Survival XP awarded for enduring the battle!";
      if (window.retroAudio) window.retroAudio.playCritFail();
      this.checkQuestTrigger("learn_from_loss");
    } else {
      // Glancing Blow (Slippage)
      resultCategory = "GLANCING BLOW (SLIPPAGE)";
      priceModifier = 1.02;
      xpAward = 80; // Battle experience
      logType = "trade";
      message = "Faced minor market friction. +80 Battle Experience XP gained.";
      if (window.retroAudio) window.retroAudio.playCoin();
      this.checkQuestTrigger("learn_from_loss");
    }

    // Deduct cash and add shares
    const finalPricePerShare = stock.price * priceModifier;
    const finalTotalCost = finalPricePerShare * shares;
    this.player.cashUSD -= finalTotalCost;

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

    // Award XP
    this.awardXP(xpAward, `${resultCategory} on ${ticker}`);

    // Log Action
    this.logAction(
      `Bought ${shares} ${ticker} [${resultCategory}]. +${xpAward} XP`,
      logType
    );

    // Check quests
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
      finalCost: finalTotalCost
    };
  }

  // Execute a Sell Order with RPG Outcome Resolution
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
      // Profitable trade: Harvest bonus
      xpAward = Math.min(400, Math.floor(100 + profitPercent * 15));
      message = `VICTORY HARVEST! +$${profitUSD.toFixed(2)} (+${profitPercent.toFixed(1)}%). +${xpAward} XP!`;
      logType = "xp-gain";
      if (window.retroAudio) window.retroAudio.playCoin();
    } else {
      // Controlled Loss vs Heavy Loss
      if (profitPercent >= -5.0) {
        // Defensive Parry / Disciplined Stop-Loss
        xpAward = 140;
        message = `DEFENSIVE PARRY! Loss contained to ${profitPercent.toFixed(1)}%. +140 Discipline XP!`;
        logType = "trade";
        this.checkQuestTrigger("disciplined_stop_loss");
      } else {
        // Heavy Drawdown
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

  // Claim a completed quest reward
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

  // Evaluate quest statuses
  checkQuestTrigger(triggerType) {
    this.quests.forEach(quest => {
      if (quest.status !== "in_progress") return;

      if (triggerType === "has_coin_stock" && quest.id === "q2") {
        quest.status = "claimable";
      }
      if (triggerType === "sectors_count" && quest.id === "q3") {
        if (this.getSectorsCount() >= 3) quest.status = "claimable";
      }
      if (triggerType === "disciplined_stop_loss" && quest.id === "q4") {
        quest.status = "claimable";
      }
      if (triggerType === "natural_20" && quest.id === "q5") {
        quest.status = "claimable";
      }
      if (triggerType === "learn_from_loss" && quest.id === "q6") {
        quest.status = "claimable";
      }
    });
  }

  // Append a message to the internal history log
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

  // Simulated market price ticks on Base L2
  tickMarket() {
    this.stocks.forEach(stock => {
      const deltaPercent = (Math.random() * 3.6) - 1.7; // -1.7% to +1.9%
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
