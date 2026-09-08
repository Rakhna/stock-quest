// Stock Quest - App Controller with Armory, Boss Raids, Loot Drops & On-Chain Tracking

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
    armory: document.getElementById("screen-armory"),
    bossraid: document.getElementById("screen-bossraid"),
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
        <div style="font-size:11px;opacity:0.9;">${desc}</div>
      </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // --- Render Top Nav ---
  function renderNavStats() {
    const cashEl = document.getElementById("nav-cash-val");
    const lvlEl = document.getElementById("nav-lvl-val");
    if (cashEl) cashEl.textContent = `$${engine.player.cashUSD.toFixed(2)}`;
    if (lvlEl) lvlEl.textContent = `LVL ${engine.player.level}`;
  }

  // --- Render Screen 2: Hero Character Sheet ---
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

    // Gas Saved Highlight
    const gasEl = document.getElementById("overview-gas-saved");
    if (gasEl) gasEl.textContent = `$${p.totalGasSavedUSD.toFixed(2)}`;

    // RPG Hero Attributes
    const statsGrid = document.getElementById("dnd-stats-container");
    if (statsGrid) {
      statsGrid.innerHTML = Object.keys(p.stats).map(key => {
        const s = p.stats[key];
        return `
          <div class="dnd-stat-box">
            <div class="dnd-stat-name">${s.label}</div>
            <div class="dnd-stat-value">${s.val}</div>
            <div class="dnd-stat-mod">BONUS: ${s.mod}</div>
            <div class="dnd-stat-desc">${s.desc}</div>
          </div>
        `;
      }).join("");
    }
  }

  // --- Render Screen 3: Inventory with Top-Tier Base Tracking ---
  function renderInventory() {
    const container = document.getElementById("inventory-grid");
    const gasBanner = document.getElementById("inventory-gas-banner");
    const sectorBar = document.getElementById("inventory-sector-bar");
    if (!container) return;

    if (gasBanner) {
      gasBanner.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <span style="color:var(--text-gold); font-weight:bold;">BASE L2 ADVANTAGE:</span>
            <span>You have saved <b>$${engine.player.totalGasSavedUSD.toFixed(2)} USD</b> in gas fees vs Ethereum L1!</span>
          </div>
          <span class="badge-rarity rare">Sub-cent Base L2 Txns</span>
        </div>
      `;
    }

    // Sector allocation breakdown
    if (sectorBar) {
      const sectors = engine.getSectorAllocations();
      sectorBar.innerHTML = sectors.map(sec => `
        <div style="margin-bottom:8px;">
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; font-family:var(--font-dialogue);">
            <span style="font-size:18px;">${sec.sector}</span>
            <span style="font-size:18px; color:var(--text-cyan); font-weight:bold;">${sec.percentage}% ($${sec.valueUSD.toFixed(2)})</span>
          </div>
          <div style="height:8px; background:#070a1a; border-radius:2px; overflow:hidden; border:1px solid #334155;">
            <div style="height:100%; width:${sec.percentage}%; background:linear-gradient(90deg, #3b82f6, #10b981);"></div>
          </div>
        </div>
      `).join("");
    }

    if (engine.player.holdings.length === 0) {
      container.innerHTML = `
        <div class="rpg-frame dark" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <p style="color: var(--text-dim); margin-bottom: 16px; font-size:18px;">Your equipment inventory is empty! Visit the Tavern Merchant to acquire tokenized stocks.</p>
          <button class="pixel-btn btn-blue" onclick="document.querySelector('[data-screen=market]').click()">Visit Tavern Merchant</button>
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

          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
            <span class="badge-rarity ${stock.rarity}">${stock.rarity}</span>
            <span style="font-size:16px; color:var(--text-dim); font-family:var(--font-dialogue);">${stock.sector}</span>
          </div>

          <div class="stock-rpg-stat-row">
            <span>EQUIPPED: <b>${h.shares.toFixed(2)} Shares</b></span>
            <span>CURRENT VALUE: <b>$${currentVal.toFixed(2)}</b></span>
          </div>

          <div class="stock-rpg-stat-row" style="border-left-color: ${isProfit ? 'var(--text-cyan)' : 'var(--text-danger)'}">
            <span>P&L: <b style="color:${isProfit ? 'var(--text-cyan)' : 'var(--text-danger)'}">${isProfit ? '+' : ''}$${profitUSD.toFixed(2)}</b></span>
            <span>ROI: <b style="color:${isProfit ? 'var(--text-cyan)' : 'var(--text-danger)'}">${isProfit ? '+' : ''}${profitPct.toFixed(1)}%</b></span>
          </div>

          <!-- On-Chain Base Tracking Details -->
          <div style="background:rgba(0,0,0,0.3); padding:8px 10px; border-radius:3px; font-size:16px; font-family:var(--font-dialogue); color:var(--text-dim);">
            <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
              <span>24h Vol: <b style="color:#fff;">${stock.volume24h}</b></span>
              <span>24h Range: <b style="color:#fff;">$${stock.low24h} - $${stock.high24h}</b></span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
              <span style="font-size:14px; color:#94a3b8;">Base: ${stock.contractBase.substring(0, 8)}...${stock.contractBase.substring(36)}</span>
              <a href="${stock.basescanUrl}" target="_blank" style="color:var(--text-blue); text-decoration:underline; font-size:14px;">View on BaseScan</a>
            </div>
          </div>

          <div style="margin-top:auto; padding-top:8px;">
            <button class="pixel-btn btn-danger sm btn-sell-action" data-ticker="${stock.ticker}" data-shares="${h.shares}" style="width:100%;">
              SELL / UNEQUIP (HARVEST / PARRY)
            </button>
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".btn-sell-action").forEach(btn => {
      btn.addEventListener("click", () => {
        const ticker = btn.dataset.ticker;
        const shares = parseFloat(btn.dataset.shares);
        handleSellAction(ticker, shares);
      });
    });
  }

  function handleSellAction(ticker, shares) {
    audio.playDiceRoll();
    const result = engine.executeSell(ticker, shares);
    if (result.success) {
      showToast(
        `Order Settled: ${ticker}!`,
        `${result.message} (Earned +${result.xpAward} XP)`,
        result.profitUSD >= 0 ? "xp" : "fail"
      );
    }
  }

  // --- Render Screen 4: Market / Shop ---
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
            <span style="font-size:16px; color:var(--text-dim); font-family:var(--font-dialogue);">${stock.sector}</span>
          </div>

          <p style="font-size:17px; font-family:var(--font-dialogue); color:#cbd5e1; line-height:1.4;">${stock.description}</p>

          <div class="stock-rpg-stat-row">
            <span>ATK +${stock.rpgStats.atk}</span>
            <span>DEF +${stock.rpgStats.def}</span>
            <span>SPD +${stock.rpgStats.spd}</span>
          </div>

          <div style="font-size:14px; font-family:var(--font-dialogue); color:#94a3b8; display:flex; justify-content:space-between;">
            <span>24h Vol: ${stock.volume24h}</span>
            <a href="${stock.basescanUrl}" target="_blank" style="color:var(--text-blue);">BaseScan ↗</a>
          </div>

          <div style="margin-top:auto; padding-top:8px;">
            <button class="pixel-btn btn-green sm btn-open-buy-modal" data-ticker="${stock.ticker}" style="width:100%;">
              BUY (EXECUTE ORDER)
            </button>
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".btn-open-buy-modal").forEach(btn => {
      btn.addEventListener("click", () => {
        openBuyModal(btn.dataset.ticker);
      });
    });
  }

  document.querySelectorAll(".market-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".market-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.dataset.filter;
      audio.playBlip();
      renderMarket();
    });
  });

  // --- Render Screen 7: Armory & NFTs ---
  function renderArmory() {
    const slotsContainer = document.getElementById("armory-slots-grid");
    const vaultContainer = document.getElementById("armory-vault-grid");
    if (!slotsContainer || !vaultContainer) return;

    // Render the 4 equipped slots
    const slots = ["weapon", "armor", "boots", "relic"];
    slotsContainer.innerHTML = slots.map(slot => {
      const equippedId = engine.player.equipped[slot];
      const nft = equippedId ? engine.nfts.find(n => n.id === equippedId) : null;

      return `
        <div class="rpg-frame dark" style="text-align:center; padding:14px;">
          <div style="font-family:var(--font-pixel); font-size:10px; color:var(--text-dim); margin-bottom:6px; text-transform:uppercase;">
            SLOT: [${slot}]
          </div>
          ${nft ? `
            <div class="badge-rarity ${nft.rarity}" style="margin-bottom:6px;">${nft.rarity}</div>
            <div style="font-family:var(--font-title); font-size:11px; color:var(--text-gold); margin-bottom:6px;">
              ${nft.name}
            </div>
            <div style="font-family:var(--font-dialogue); font-size:16px; color:var(--text-cyan); margin-bottom:8px;">
              ${Object.keys(nft.bonuses).map(k => `+${nft.bonuses[k]} ${k.toUpperCase()}`).join(', ')}
            </div>
            <button class="pixel-btn btn-danger sm btn-unequip-slot" data-slot="${slot}">UNEQUIP</button>
          ` : `
            <div style="font-family:var(--font-dialogue); font-size:18px; color:#64748b; margin:16px 0;">[EMPTY SLOT]</div>
            <div style="font-size:12px; color:#475569;">Equip an NFT from Vault below</div>
          `}
        </div>
      `;
    }).join("");

    // Bind unequip
    slotsContainer.querySelectorAll(".btn-unequip-slot").forEach(btn => {
      btn.addEventListener("click", () => {
        engine.unequipNFT(btn.dataset.slot);
      });
    });

    // Render Armory Vault (All owned NFTs)
    vaultContainer.innerHTML = engine.player.armoryNFTs.map(nftId => {
      const nft = engine.nfts.find(n => n.id === nftId);
      if (!nft) return "";

      const isEquipped = engine.player.equipped[nft.slot] === nft.id;

      return `
        <div class="rpg-frame" style="${isEquipped ? 'border-color:var(--text-cyan);' : ''}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <div>
              <span class="badge-rarity ${nft.rarity}">${nft.rarity}</span>
              <span style="font-family:var(--font-dialogue); font-size:16px; color:var(--text-dim); margin-left:6px;">[${nft.slot.toUpperCase()}]</span>
            </div>
            <span style="font-family:var(--font-dialogue); font-size:16px; color:var(--text-gold);">Drop: ${nft.dropRatePct}%</span>
          </div>

          <div style="font-family:var(--font-title); font-size:12px; color:var(--text-gold); margin-bottom:6px;">
            ${nft.name}
          </div>

          <p style="font-family:var(--font-dialogue); font-size:17px; color:#cbd5e1; margin-bottom:8px; line-height:1.3;">
            ${nft.desc}
          </p>

          <div style="background:rgba(0,0,0,0.4); padding:6px 10px; border-left:3px solid var(--text-cyan); margin-bottom:10px; font-family:var(--font-dialogue); font-size:17px;">
            <span style="color:var(--text-cyan); font-weight:bold;">Perk:</span> ${nft.perk}
          </div>

          <div style="margin-top:auto;">
            ${isEquipped ? `
              <button class="pixel-btn btn-dark sm" style="width:100%;" disabled>EQUIPPED</button>
            ` : `
              <button class="pixel-btn btn-green sm btn-equip-nft" data-id="${nft.id}" style="width:100%;">
                EQUIP ITEM
              </button>
            `}
          </div>
        </div>
      `;
    }).join("");

    vaultContainer.querySelectorAll(".btn-equip-nft").forEach(btn => {
      btn.addEventListener("click", () => {
        engine.equipNFT(btn.dataset.id);
      });
    });
  }

  // --- Render Screen 8: Boss Raid Arena ---
  function renderBossRaid() {
    const raid = engine.bossRaid;
    const hpText = document.getElementById("boss-hp-text");
    const hpFill = document.getElementById("boss-hp-fill");
    const dmgText = document.getElementById("raid-my-damage");
    const shareText = document.getElementById("raid-my-share");
    const raidersTable = document.getElementById("boss-raiders-tbody");

    if (hpText) hpText.textContent = `${raid.currentHP.toLocaleString()} / ${raid.totalHP.toLocaleString()} HP`;
    if (hpFill) hpFill.style.width = `${(raid.currentHP / raid.totalHP) * 100}%`;

    if (dmgText) dmgText.textContent = `${engine.player.raidStats.damageDealt.toLocaleString()} DMG`;
    if (shareText) shareText.textContent = `$${engine.player.raidStats.estimatedUsdcShare.toFixed(2)} USD`;

    if (raidersTable) {
      raidersTable.innerHTML = raid.topRaiders.map(r => `
        <tr style="${r.address.includes('You') ? 'background:rgba(251, 191, 36, 0.2); font-weight:bold;' : ''}">
          <td style="color:var(--text-gold);">${r.rank}</td>
          <td>${r.address}</td>
          <td style="color:var(--text-danger); font-family:var(--font-dialogue); font-size:22px;">${r.damage.toLocaleString()}</td>
          <td style="color:var(--text-cyan);">${r.poolSharePct}</td>
          <td style="text-align:right; font-family:var(--font-dialogue); font-size:22px; color:var(--text-gold);">${r.estReward}</td>
        </tr>
      `).join("");
    }
  }

  // Attack Boss button action
  const btnAttackBoss = document.getElementById("btn-attack-boss");
  if (btnAttackBoss) {
    btnAttackBoss.addEventListener("click", () => {
      audio.playDiceRoll();
      const res = engine.attackBoss();
      showToast(
        "RAID ATTACK LANDED!",
        `Dealt ${res.damage} DMG to Volatility Dragon! +${res.xpGained} XP! Est. Share: $${res.estimatedShareUSD}`,
        "crit"
      );
    });
  }

  // --- Buy Modal Logic & Loot Drop Modal ---
  let selectedBuyTicker = null;
  const buyModal = document.getElementById("buy-modal");
  const d20DiceWrapper = document.getElementById("modal-d20-dice");
  const modalRollResult = document.getElementById("modal-roll-result");
  const modalRollText = document.getElementById("modal-roll-text");
  const btnExecuteBuy = document.getElementById("modal-btn-execute");
  const btnCancelBuy = document.getElementById("modal-btn-cancel");
  const buyQuantityInput = document.getElementById("buy-shares-qty");

  // Loot drop chest modal
  const lootModal = document.getElementById("loot-modal");
  const lootItemContainer = document.getElementById("loot-item-details");
  const btnCloseLoot = document.getElementById("btn-close-loot");

  if (btnCloseLoot && lootModal) {
    btnCloseLoot.addEventListener("click", () => {
      lootModal.classList.add("hidden");
      audio.playBlip();
    });
  }

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
    btnExecuteBuy.textContent = "EXECUTE ORDER ON BASE";
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

      d20DiceWrapper.classList.add("d20-shake");

      setTimeout(() => {
        d20DiceWrapper.classList.remove("d20-shake");
        const rollResult = engine.executeBuy(selectedBuyTicker, qty);

        modalRollResult.style.display = "block";
        modalRollResult.className = `rpg-frame dark ${rollResult.strikeRoll === 20 ? 'glow-gold' : ''}`;
        
        modalRollText.innerHTML = `
          <div style="font-family:var(--font-title); font-size:13px; color:var(--text-gold); margin-bottom:8px;">
            ${rollResult.resultCategory}
          </div>
          <div style="font-family:var(--font-dialogue); font-size:18px; color:#e2e8f0; line-height:1.5;">${rollResult.message}</div>
          <div style="font-family:var(--font-dialogue); font-size:20px; color:var(--text-cyan); margin-top:8px; font-weight:bold;">
            EARNED: +${rollResult.xpAward} XP • SAVED $18.40 GAS ON BASE L2
          </div>
        `;

        showToast(
          `${rollResult.resultCategory}!`,
          `+${rollResult.xpAward} XP gained on ${selectedBuyTicker}`,
          rollResult.strikeRoll === 20 ? 'crit' : rollResult.strikeRoll === 1 ? 'fail' : 'xp'
        );

        btnExecuteBuy.textContent = "DONE (RETURN TO MARKET)";
        btnExecuteBuy.disabled = false;
        btnExecuteBuy.onclick = () => {
          buyModal.classList.add("hidden");
          btnExecuteBuy.onclick = null;

          // Check if a Loot Drop was won!
          if (rollResult.droppedNFT && lootModal && lootItemContainer) {
            audio.playLevelUp();
            lootItemContainer.innerHTML = `
              <div class="badge-rarity ${rollResult.droppedNFT.rarity}" style="margin-bottom:8px;">${rollResult.droppedNFT.rarity}</div>
              <div style="font-family:var(--font-title); font-size:14px; color:var(--text-gold); margin-bottom:6px;">
                ${rollResult.droppedNFT.name}
              </div>
              <p style="font-family:var(--font-dialogue); font-size:18px; color:#e2e8f0; margin-bottom:8px;">
                ${rollResult.droppedNFT.desc}
              </p>
              <div style="color:var(--text-cyan); font-family:var(--font-dialogue); font-size:18px; font-weight:bold;">
                Drop Chance: ${rollResult.droppedNFT.dropRatePct}% • Perk: ${rollResult.droppedNFT.perk}
              </div>
            `;
            lootModal.classList.remove("hidden");
          }
        };
      }, 700);
    });
  }

  // --- Screen 5: Quests ---
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
              <div style="color:var(--text-cyan); font-family:var(--font-pixel); font-size:10px; text-transform:uppercase;">
                COMPLETED
              </div>
            ` : isClaimable ? `
              <button class="pixel-btn btn-green sm btn-claim-quest" data-id="${quest.id}" style="width:100%;">
                CLAIM REWARD (+${quest.rewardXP} XP)
              </button>
            ` : `
              <div style="color:var(--text-dim); font-family:var(--font-pixel); font-size:10px; text-transform:uppercase;">
                IN PROGRESS
              </div>
            `}
          </div>
        </div>
      `;
    }).join("");

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

  // --- Screen 6: Leaderboard ---
  function renderLeaderboard() {
    const tbody = document.getElementById("leaderboard-tbody");
    if (!tbody) return;

    tbody.innerHTML = engine.leaderboard.map(entry => {
      const isPlayer = entry.name.includes("You");
      return `
        <tr style="${isPlayer ? 'background: rgba(251, 191, 36, 0.2); font-weight: bold;' : ''}">
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

  // --- Adventure Log ---
  function renderLog() {
    const logEl = document.getElementById("combat-log-content");
    if (!logEl) return;

    logEl.innerHTML = engine.player.rollHistory.map(entry => {
      return `
        <div class="log-entry ${entry.type}">
          <span style="color:#60a5fa;">[${entry.timestamp}]</span>
          <span>${entry.action}</span>
        </div>
      `;
    }).join("");
  }

  // Quick Action in Character Screen: Test Luck & Market Insight
  const btnDiceSolo = document.getElementById("btn-roll-solo-dice");
  if (btnDiceSolo) {
    btnDiceSolo.addEventListener("click", () => {
      audio.playDiceRoll();
      const roll = engine.rollStrike();
      let xp = 0;
      let msg = "";

      if (roll === 20) {
        xp = 150;
        msg = "CRITICAL INSIGHT! Discovered arbitrage opportunity on Base L2! +150 XP";
        audio.playCritSuccess();
      } else if (roll === 1) {
        xp = 50;
        msg = "VOLATILITY SPIKE! Tested risk resilience! +50 Survival XP!";
        audio.playCritFail();
      } else {
        xp = roll * 5;
        msg = `MARKET READING: Honed trading skills! +${xp} XP`;
        audio.playCoin();
      }

      engine.awardXP(xp, "Market Insight");
      engine.logAction(msg, roll === 20 ? 'crit-hit' : roll === 1 ? 'crit-fail' : 'xp-gain');
      showToast("Market Action", msg, roll === 20 ? 'crit' : roll === 1 ? 'fail' : 'xp');
    });
  }

  // Full re-render on state change
  function fullRender() {
    renderNavStats();
    renderCharacterSheet();
    renderInventory();
    renderMarket();
    renderArmory();
    renderBossRaid();
    renderQuests();
    renderLeaderboard();
    renderLog();
  }

  engine.subscribe(fullRender);

  // Initial render
  fullRender();

  // Periodic market tick every 10 seconds
  setInterval(() => {
    engine.tickMarket();
  }, 10000);
});
