// Stock Quest - App Controller & UI Orchestrator

document.addEventListener("DOMContentLoaded", () => {
  const engine = window.stockQuestEngine;
  const audio = window.retroAudio;

  // Sound & CRT Toggles
  const btnSound = document.getElementById("toggle-sound");
  const btnCrt = document.getElementById("toggle-crt");
  const scanlinesEl = document.querySelector(".scanlines");

  if (btnSound) {
    btnSound.addEventListener("click", () => {
      const muted = audio.toggleMute();
      btnSound.textContent = muted ? "AUDIO: OFF" : "AUDIO: ON";
      if (!muted) audio.playBlip();
    });
  }

  if (btnCrt && scanlinesEl) {
    btnCrt.addEventListener("click", () => {
      scanlinesEl.style.display = scanlinesEl.style.display === "none" ? "block" : "none";
      btnCrt.textContent = scanlinesEl.style.display === "none" ? "CRT: OFF" : "CRT: ON";
      audio.playBlip();
    });
  }

  // --- Screen Navigation ---
  const screens = {
    title: document.getElementById("screen-title"),
    character: document.getElementById("screen-character"),
    inventory: document.getElementById("screen-inventory"),
    market: document.getElementById("screen-market"),
    quests: document.getElementById("screen-quests"),
    leaderboard: document.getElementById("screen-leaderboard")
  };

  const navButtons = document.querySelectorAll(".nav-btn[data-screen]");

  function switchScreen(screenName) {
    audio.playBlip();
    Object.keys(screens).forEach(key => {
      if (screens[key]) {
        screens[key].classList.remove("active");
      }
    });

    if (screens[screenName]) {
      screens[screenName].classList.add("active");
    }

    navButtons.forEach(btn => {
      if (btn.dataset.screen === screenName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      switchScreen(btn.dataset.screen);
    });
  });

  const btnStart = document.getElementById("btn-press-start");
  if (btnStart) {
    btnStart.addEventListener("click", () => {
      audio.playLevelUp();
      switchScreen("character");
    });
  }

  // --- Toast Notifications ---
  function showToast(title, desc, type = "normal") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div>
        <div style="font-weight:bold;margin-bottom:2px;">${title}</div>
        <div style="font-size:8px;opacity:0.85;">${desc}</div>
      </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- Render Functions ---

  // Top Nav Stats & Overview
  function renderNavStats() {
    const cashEl = document.getElementById("nav-cash-val");
    const lvlEl = document.getElementById("nav-lvl-val");
    if (cashEl) cashEl.textContent = `$${engine.player.cashUSD.toFixed(2)}`;
    if (lvlEl) lvlEl.textContent = `LVL ${engine.player.level}`;
  }

  // Screen 2: Character Sheet
  function renderCharacterSheet() {
    const p = engine.player;
    const netWorth = engine.getPortfolioValue();

    document.getElementById("char-name").textContent = p.characterName;
    document.getElementById("char-class").textContent = p.title;
    document.getElementById("char-level-badge").textContent = `LEVEL ${p.level}`;

    // Meters
    document.getElementById("char-hp-text").textContent = `${p.hp} / ${p.maxHP}`;
    document.getElementById("char-hp-fill").style.width = `${(p.hp / p.maxHP) * 100}%`;

    document.getElementById("char-mp-text").textContent = `$${p.cashUSD.toFixed(2)} USD`;
    document.getElementById("char-mp-fill").style.width = `${Math.min(100, (p.cashUSD / 3000) * 100)}%`;

    document.getElementById("char-xp-text").textContent = `${p.xp} / ${p.maxXP} XP`;
    document.getElementById("char-xp-fill").style.width = `${(p.xp / p.maxXP) * 100}%`;

    // Overview numbers
    document.getElementById("overview-networth").textContent = `$${netWorth.toFixed(2)}`;
    document.getElementById("overview-holdings-count").textContent = `${p.holdings.length} Assets`;
    document.getElementById("overview-sectors-count").textContent = `${engine.getSectorsCount()} Sectors`;

    // D&D Ability Scores
    const statsGrid = document.getElementById("dnd-stats-container");
    if (statsGrid) {
      statsGrid.innerHTML = Object.keys(p.stats).map(key => {
        const s = p.stats[key];
        return `
          <div class="dnd-stat-box">
            <div class="dnd-stat-name">${s.label} (${key})</div>
            <div class="dnd-stat-value">${s.val}</div>
            <div class="dnd-stat-mod">MOD: ${s.mod}</div>
            <div class="dnd-stat-desc">${s.desc}</div>
          </div>
        `;
      }).join("");
    }
  }

  // Screen 3: Inventory
  function renderInventory() {
    const container = document.getElementById("inventory-grid");
    if (!container) return;

    if (engine.player.holdings.length === 0) {
      container.innerHTML = `
        <div class="rpg-frame dark" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <p style="color: var(--text-muted); margin-bottom: 16px;">Your inventory is empty! Visit the Market to acquire tokenized stocks.</p>
          <button class="pixel-btn btn-blue" onclick="document.querySelector('[data-screen=market]').click()">Visit Shopkeeper</button>
        </div>
      `;
      return;
    }

    container.innerHTML = engine.player.holdings.map(h => {
      const stock = engine.stocks.find(s => s.ticker === h.ticker);
      if (!stock) return "";

      const currentVal = h.shares * stock.price;
      const costBasis = h.shares * h.avgBuyPrice;
      const profitUSD = currentVal - costBasis;
      const profitPct = ((currentVal - costBasis) / costBasis) * 100;
      const isProfit = profitUSD >= 0;

      return `
        <div class="stock-card rpg-frame">
          <div class="stock-card-top">
            <div>
              <div class="stock-ticker">${stock.ticker}</div>
              <div class="stock-name">${stock.name}</div>
            </div>
            <div>
              <div class="stock-price-val">$${stock.price.toFixed(2)}</div>
              <div class="stock-change ${stock.change24h >= 0 ? 'positive' : 'negative'}">
                ${stock.change24h >= 0 ? '+' : ''}${stock.change24h}%
              </div>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="badge-rarity ${stock.rarity}">${stock.rarity}</span>
            <span style="font-size:8px; color:var(--text-muted);">${stock.sector}</span>
          </div>

          <div class="stock-rpg-stat-row">
            <span>SHARES: <b>${h.shares.toFixed(2)}</b></span>
            <span>VALUE: <b>$${currentVal.toFixed(2)}</b></span>
          </div>

          <div class="stock-rpg-stat-row" style="border-left-color: ${isProfit ? 'var(--text-cyan)' : 'var(--text-danger)'}">
            <span>P&L: <b style="color:${isProfit ? 'var(--text-cyan)' : 'var(--text-danger)'}">${isProfit ? '+' : ''}$${profitUSD.toFixed(2)}</b></span>
            <span>ROI: <b style="color:${isProfit ? 'var(--text-cyan)' : 'var(--text-danger)'}">${isProfit ? '+' : ''}${profitPct.toFixed(1)}%</b></span>
          </div>

          <div style="margin-top:auto; padding-top:10px; display:flex; gap:8px;">
            <button class="pixel-btn btn-danger sm btn-sell-action" data-ticker="${stock.ticker}" data-shares="${h.shares}" style="flex:1;">
              SELL (D20 RESOLUTION)
            </button>
          </div>
        </div>
      `;
    }).join("");

    // Bind sell buttons
    container.querySelectorAll(".btn-sell-action").forEach(btn => {
      btn.addEventListener("click", () => {
        const ticker = btn.dataset.ticker;
        const shares = parseFloat(btn.dataset.shares);
        handleSellAction(ticker, shares);
      });
    });
  }

  // Handle Sell Action
  function handleSellAction(ticker, shares) {
    audio.playDiceRoll();
    const result = engine.executeSell(ticker, shares);
    if (result.success) {
      showToast(
        `Sold ${ticker}!`,
        `${result.message} (Earned +${result.xpAward} XP)`,
        result.profitUSD >= 0 ? "xp" : "fail"
      );
    }
  }

  // Screen 4: Market / Shop
  let currentFilter = "all";

  function renderMarket() {
    const container = document.getElementById("market-grid");
    if (!container) return;

    const filtered = engine.stocks.filter(s => {
      if (currentFilter === "all") return true;
      if (currentFilter === "tech") return s.sector.includes("Tech");
      if (currentFilter === "finance") return s.sector.includes("Finance") || s.sector.includes("Treasury");
      if (currentFilter === "index") return s.sector.includes("Index");
      return true;
    });

    container.innerHTML = filtered.map(stock => {
      return `
        <div class="stock-card rpg-frame">
          <div class="stock-card-top">
            <div>
              <div class="stock-ticker">${stock.ticker}</div>
              <div class="stock-name">${stock.name}</div>
            </div>
            <div>
              <div class="stock-price-val">$${stock.price.toFixed(2)}</div>
              <div class="stock-change ${stock.change24h >= 0 ? 'positive' : 'negative'}">
                ${stock.change24h >= 0 ? '+' : ''}${stock.change24h}%
              </div>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="badge-rarity ${stock.rarity}">${stock.rarity}</span>
            <span style="font-size:8px; color:var(--text-muted);">${stock.sector}</span>
          </div>

          <p style="font-size:8px; color:#94a3b8; line-height:1.5;">${stock.description}</p>

          <div class="stock-rpg-stat-row">
            <span>ATK ${stock.rpgStats.atk}</span>
            <span>DEF ${stock.rpgStats.def}</span>
            <span>SPD ${stock.rpgStats.spd}</span>
          </div>

          <div style="margin-top:auto; padding-top:8px;">
            <button class="pixel-btn btn-green sm btn-open-buy-modal" data-ticker="${stock.ticker}" style="width:100%;">
              BUY (ROLL D20)
            </button>
          </div>
        </div>
      `;
    }).join("");

    // Bind buy modal triggers
    container.querySelectorAll(".btn-open-buy-modal").forEach(btn => {
      btn.addEventListener("click", () => {
        openBuyModal(btn.dataset.ticker);
      });
    });
  }

  // Filter tab buttons
  document.querySelectorAll(".market-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".market-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.dataset.filter;
      audio.playBlip();
      renderMarket();
    });
  });

  // --- D20 Trading Modal Logic ---
  let selectedBuyTicker = null;
  const buyModal = document.getElementById("buy-modal");
  const d20DiceWrapper = document.getElementById("modal-d20-dice");
  const modalRollResult = document.getElementById("modal-roll-result");
  const modalRollText = document.getElementById("modal-roll-text");
  const btnExecuteBuy = document.getElementById("modal-btn-execute");
  const btnCancelBuy = document.getElementById("modal-btn-cancel");
  const buyQuantityInput = document.getElementById("buy-shares-qty");

  function openBuyModal(ticker) {
    selectedBuyTicker = ticker;
    const stock = engine.stocks.find(s => s.ticker === ticker);
    if (!stock) return;

    audio.playBlip();
    document.getElementById("modal-stock-ticker").textContent = `${stock.ticker} (${stock.name})`;
    document.getElementById("modal-stock-price").textContent = `$${stock.price.toFixed(2)}`;
    buyQuantityInput.value = "1.0";
    updateModalTotal();

    modalRollResult.style.display = "none";
    btnExecuteBuy.textContent = "ROLL D20 & EXECUTE";
    btnExecuteBuy.disabled = false;

    buyModal.classList.remove("hidden");
  }

  function updateModalTotal() {
    const stock = engine.stocks.find(s => s.ticker === selectedBuyTicker);
    if (!stock) return;
    const qty = parseFloat(buyQuantityInput.value) || 1;
    const total = stock.price * qty;
    document.getElementById("modal-stock-total").textContent = `$${total.toFixed(2)} USD`;
  }

  if (buyQuantityInput) {
    buyQuantityInput.addEventListener("input", updateModalTotal);
  }

  if (btnCancelBuy) {
    btnCancelBuy.addEventListener("click", () => {
      buyModal.classList.add("hidden");
      audio.playBlip();
    });
  }

  if (btnExecuteBuy) {
    btnExecuteBuy.addEventListener("click", () => {
      const qty = parseFloat(buyQuantityInput.value) || 1;
      const stock = engine.stocks.find(s => s.ticker === selectedBuyTicker);
      if (!stock) return;

      if (engine.player.cashUSD < stock.price * qty) {
        alert("Insufficient USD cash balance in your wallet!");
        return;
      }

      btnExecuteBuy.disabled = true;
      audio.playDiceRoll();

      // Shake animation on D20
      d20DiceWrapper.classList.add("d20-shake");

      setTimeout(() => {
        d20DiceWrapper.classList.remove("d20-shake");
        const rollResult = engine.executeBuy(selectedBuyTicker, qty);

        modalRollResult.style.display = "block";
        modalRollResult.className = `rpg-frame dark ${rollResult.naturalRoll === 20 ? 'glow-gold' : ''}`;
        
        modalRollText.innerHTML = `
          <div style="font-size:14px; color:var(--text-gold); margin-bottom:8px;">
            ${rollResult.naturalRoll === 20 ? 'NATURAL 20! CRITICAL HIT!' : 
              rollResult.naturalRoll === 1 ? 'NATURAL 1! CRITICAL FUMBLE!' : 
              'D20 ROLL: ' + rollResult.naturalRoll}
          </div>
          <div style="font-size:9px; color:#e2e8f0; line-height:1.6;">${rollResult.message}</div>
          <div style="font-size:10px; color:var(--text-cyan); margin-top:8px; font-weight:bold;">
            EARNED: +${rollResult.xpAward} XP
          </div>
        `;

        showToast(
          `${rollResult.resultCategory}!`,
          `+${rollResult.xpAward} XP gained on ${selectedBuyTicker}`,
          rollResult.naturalRoll === 20 ? 'crit' : rollResult.naturalRoll === 1 ? 'fail' : 'xp'
        );

        btnExecuteBuy.textContent = "DONE (RETURN TO MARKET)";
        btnExecuteBuy.disabled = false;
        btnExecuteBuy.onclick = () => {
          buyModal.classList.add("hidden");
          btnExecuteBuy.onclick = null;
        };
      }, 700);
    });
  }

  // Screen 5: Quests
  function renderQuests() {
    const container = document.getElementById("quests-grid");
    if (!container) return;

    container.innerHTML = engine.quests.map(quest => {
      const isCompleted = quest.status === "completed";
      const isClaimable = quest.status === "claimable";

      return `
        <div class="quest-card rpg-frame ${isCompleted ? 'completed' : ''}">
          <div class="quest-title-row">
            <div class="quest-title">${quest.title}</div>
            <span class="quest-reward-tag">+${quest.rewardXP} XP / +$${quest.rewardGold}</span>
          </div>

          <p class="quest-desc">${quest.desc}</p>

          <div style="margin-top:auto; padding-top:8px;">
            ${isCompleted ? `
              <div style="color:var(--text-cyan); font-size:8px; text-transform:uppercase;">
                COMPLETED
              </div>
            ` : isClaimable ? `
              <button class="pixel-btn btn-green sm btn-claim-quest" data-id="${quest.id}" style="width:100%;">
                CLAIM REWARD (+${quest.rewardXP} XP)
              </button>
            ` : `
              <div style="color:var(--text-muted); font-size:8px; text-transform:uppercase;">
                IN PROGRESS
              </div>
            `}
          </div>
        </div>
      `;
    }).join("");

    // Bind claim buttons
    container.querySelectorAll(".btn-claim-quest").forEach(btn => {
      btn.addEventListener("click", () => {
        const qId = btn.dataset.id;
        const ok = engine.claimQuest(qId);
        if (ok) {
          showToast("Quest Claimed!", "XP & Gold added to character", "xp");
        }
      });
    });
  }

  // Screen 6: Leaderboard
  function renderLeaderboard() {
    const tbody = document.getElementById("leaderboard-tbody");
    if (!tbody) return;

    tbody.innerHTML = engine.leaderboard.map(entry => {
      const isPlayer = entry.name.includes("You");
      return `
        <tr style="${isPlayer ? 'background: rgba(244, 180, 27, 0.2); font-weight: bold;' : ''}">
          <td style="color:var(--text-gold);">${entry.rank}</td>
          <td>${entry.name}</td>
          <td>${entry.class}</td>
          <td style="color:var(--text-cyan);">LVL ${entry.lvl}</td>
          <td style="text-align:right;">$${entry.netWorth.toFixed(2)}</td>
          <td style="text-align:right;">${entry.winRate}</td>
        </tr>
      `;
    }).join("");
  }

  // Combat / Roll Log Terminal
  function renderLog() {
    const logEl = document.getElementById("combat-log-content");
    if (!logEl) return;

    logEl.innerHTML = engine.player.rollHistory.map(entry => {
      return `
        <div class="log-entry ${entry.type}">
          <span style="color:#565f89;">[${entry.timestamp}]</span>
          <span>${entry.action}</span>
        </div>
      `;
    }).join("");
  }

  // Quick Roll D20 Button in Character Screen for fun
  const btnDiceSolo = document.getElementById("btn-roll-solo-dice");
  if (btnDiceSolo) {
    btnDiceSolo.addEventListener("click", () => {
      audio.playDiceRoll();
      const roll = engine.rollD20();
      let xp = 0;
      let msg = "";

      if (roll === 20) {
        xp = 150;
        msg = "Natural 20! Critical Insight into Base L2 liquidity pools! +150 XP";
        audio.playCritSuccess();
      } else if (roll === 1) {
        xp = 50;
        msg = "Natural 1! Fumbled chart analysis! +50 Survival Experience!";
        audio.playCritFail();
      } else {
        xp = roll * 5;
        msg = `Rolled ${roll}! Practiced market reading: +${xp} XP`;
        audio.playCoin();
      }

      engine.awardXP(xp, "D20 Divination");
      engine.logAction(msg, roll, roll === 20 ? 'crit-hit' : roll === 1 ? 'crit-fail' : 'xp-gain');
      showToast(`D20 Divination: ${roll}`, msg, roll === 20 ? 'crit' : roll === 1 ? 'fail' : 'xp');
    });
  }

  // Full re-render on state change
  function fullRender() {
    renderNavStats();
    renderCharacterSheet();
    renderInventory();
    renderMarket();
    renderQuests();
    renderLeaderboard();
    renderLog();
  }

  engine.subscribe(fullRender);

  // Initial render
  fullRender();

  // Periodic simulated market tick every 10 seconds
  setInterval(() => {
    engine.tickMarket();
  }, 10000);
});
