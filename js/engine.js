// Stock Quest - D&D Game & Trading Engine

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
      this.player.maxHP += 15;
      this.player.hp = this.player.maxHP;
      
      // Upgrade D&D stats
      this.player.stats.str.val += 1;
      this.player.stats.wis.val += 1;
      this.player.stats.con.val += 1;
      
      leveledUp = true;
    }

    if (leveledUp) {
      if (window.retroAudio) window.retroAudio.playLevelUp();
      this.logAction(
        `LEVEL UP! You reached Level ${this.player.level}! Stats increased!`,
        20,
        "crit-hit"
      );
    }

    this.notify();
    return { leveledUp, newLevel: this.player.level, xpAdded: amount, reason };
  }

  // D&D d20 Dice Roll Mechanism for Trading
  rollD20() {
    return Math.floor(Math.random() * 20) + 1;
  }

  // Execute a Buy Order with D&D outcome resolution
  executeBuy(ticker, shares, customRoll = null) {
    const stock = this.stocks.find(s => s.ticker === ticker);
    if (!stock) return { success: false, msg: "Stock not found" };

    const totalCost = stock.price * shares;
    if (this.player.cashUSD < totalCost) {
      return { success: false, msg: "Insufficient USD Cash!" };
    }

    // Roll d20 (or use provided roll for interactive modal)
    const naturalRoll = customRoll !== null ? customRoll : this.rollD20();
    const wisMod = parseInt(this.player.stats.wis.mod, 10) || 0;
    const totalRoll = naturalRoll + wisMod;

    let resultCategory = "";
    let xpAward = 0;
    let priceModifier = 1.0;
    let logType = "trade";
    let message = "";

    if (naturalRoll === 20) {
      // Natural 20 - Critical Strike
      resultCategory = "CRITICAL SUCCESS (NAT 20)";
      priceModifier = 0.95; // 5% arbitrage discount
      xpAward = 300;
      logType = "crit-hit";
      message = "Flawless on-chain routing! 5% arbitrage discount and massive XP earned!";
      if (window.retroAudio) window.retroAudio.playCritSuccess();
      this.checkQuestTrigger("natural_20");
    } else if (totalRoll >= 16) {
      // Great Success
      resultCategory = "BULLISH BREAKOUT (16-19)";
      priceModifier = 0.98; // 2% discount
      xpAward = 180;
      logType = "trade";
      message = "Great timing. Clean entry with zero slippage.";
      if (window.retroAudio) window.retroAudio.playCoin();
    } else if (totalRoll >= 10) {
      // Standard Success
      resultCategory = "STEADY ORDER EXECUTION (10-15)";
      priceModifier = 1.0;
      xpAward = 100;
      logType = "trade";
      message = "Filled at standard market quote.";
      if (window.retroAudio) window.retroAudio.playCoin();
    } else if (naturalRoll === 1) {
      // Natural 1 - Critical Fumble
      resultCategory = "CRITICAL FUMBLE (NAT 1)";
      priceModifier = 1.05; // 5% slippage penalty
      xpAward = 150; // Hard Knocks Survival XP: learning from failure awards XP!
      logType = "crit-fail";
      message = "Flash dip & MEV sandwich! Paid 5% slippage, BUT gained +150 Survival XP from the ordeal!";
      if (window.retroAudio) window.retroAudio.playCritFail();
      this.checkQuestTrigger("learn_from_loss");
    } else {
      // Bad Roll (2-9)
      resultCategory = "SLIPPAGE & DRAWDOWN (2-9)";
      priceModifier = 1.02;
      xpAward = 80; // Battle Scar XP: learning risk management
      logType = "trade";
      message = "Sub-optimal entry. +80 Battle Scar XP awarded for facing adversity.";
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
      `Bought ${shares} ${ticker} (d20: ${naturalRoll} ${wisMod >= 0 ? '+' + wisMod : wisMod}). ${resultCategory}. +${xpAward} XP`,
      naturalRoll,
      logType
    );

    // Check quests
    this.checkQuestTrigger("trades_count");
    if (ticker === "COIN") this.checkQuestTrigger("has_coin_stock");
    if (this.getSectorsCount() >= 3) this.checkQuestTrigger("sectors_count");

    this.notify();

    return {
      success: true,
      naturalRoll,
      totalRoll,
      resultCategory,
      xpAward,
      priceModifier,
      message,
      finalCost: finalTotalCost
    };
  }

  // Execute a Sell Order with D&D Outcome Resolution
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

    // Roll d20 for Exit Execution
    const roll = this.rollD20();
    let xpAward = 0;
    let logType = "trade";
    let message = "";

    if (profitUSD > 0) {
      // Profitable trade: XP scaled by profit percentage
      xpAward = Math.min(400, Math.floor(100 + profitPercent * 15));
      message = `Profitable Harvest! +$${profitUSD.toFixed(2)} (${profitPercent.toFixed(1)}%). +${xpAward} XP!`;
      logType = "xp-gain";
      if (window.retroAudio) window.retroAudio.playCoin();
    } else {
      // Loss: Test of Wisdom and Stop-Loss Discipline
      if (profitPercent >= -5.0) {
        // Cut loss quickly (Wisdom Save successful!)
        xpAward = 140;
        message = `Tactical Retreat! Loss restricted to ${profitPercent.toFixed(1)}%. +140 Wisdom Save XP!`;
        logType = "trade";
        this.checkQuestTrigger("disciplined_stop_loss");
      } else {
        // Heavy loss: Battle Scar survival XP
        xpAward = 75;
        message = `Tough Lesson in Volatility (${profitPercent.toFixed(1)}%). +75 Survival XP.`;
        logType = "crit-fail";
        this.checkQuestTrigger("learn_from_loss");
      }
    }

    this.player.cashUSD += saleRevenue;
    holding.shares -= sharesToSell;

    if (holding.shares <= 0.001) {
      this.player.holdings.splice(holdingIndex, 1);
    }

    this.awardXP(xpAward, `Exit trade ${ticker}`);
    this.logAction(
      `Sold ${sharesToSell} ${ticker} (d20: ${roll}). ${message}`,
      roll,
      logType
    );

    this.notify();

    return {
      success: true,
      roll,
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
      20,
      "crit-hit"
    );

    this.notify();
    return true;
  }

  // Evaluate and update quest statuses
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
  logAction(text, roll = null, type = "trade") {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.player.rollHistory.unshift({
      timestamp: time,
      action: text,
      roll: roll,
      type: type
    });
    if (this.player.rollHistory.length > 25) {
      this.player.rollHistory.pop();
    }
  }

  // Random Market Fluctuations (Simulating on-chain block price changes)
  tickMarket() {
    this.stocks.forEach(stock => {
      const deltaPercent = (Math.random() * 3.6) - 1.7; // between -1.7% and +1.9%
      stock.price = Math.max(1, +(stock.price * (1 + deltaPercent / 100)).toFixed(2));
      stock.change24h = +(stock.change24h + (deltaPercent * 0.2)).toFixed(2);
    });

    // Check portfolio value quest
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
