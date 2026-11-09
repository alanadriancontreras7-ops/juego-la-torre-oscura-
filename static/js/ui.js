/**
 * GESTOR DE INTERFAZ DE USUARIO (UI / HUD / MODALES / TIENDA / HERRERO / MENÚ CONTEXTUAL)
 */

class UIManager {
    constructor() {
        this.selectedClass = 'warrior';
        this.selectedInventorySlot = null;
        this.tooltip = document.getElementById('item-tooltip');
    }

    init() {
        this.bindEvents();
        this.createShopModalDOM();
        this.createBlacksmithModalDOM();
        this.createContextMenuDOM();
    }

    bindEvents() {
        document.querySelectorAll('.close-modal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.game-modal');
                if (modal) modal.style.display = 'none';
                if (window.game) window.game.resumeFromModal();
            });
        });

        document.querySelectorAll('.class-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedClass = card.getAttribute('data-class');
            });
        });

        document.getElementById('confirm-class-btn').addEventListener('click', () => {
            document.getElementById('class-select-modal').style.display = 'none';
            if (window.game) window.game.startNewGame(this.selectedClass);
        });

        document.getElementById('btn-hud-inv').addEventListener('click', () => this.toggleInventory());
        document.getElementById('btn-hud-stats').addEventListener('click', () => this.toggleStats());
        document.getElementById('btn-hud-save').addEventListener('click', () => this.showSavesModal());

        const muteBtn = document.getElementById('btn-toggle-mute');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.toggleMute();
            });
        }

        // Cerrar menú contextual si haces clic en cualquier otro lado
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.item-context-menu')) {
                this.hideContextMenu();
            }
        });

        document.getElementById('quick-pot-hp').addEventListener('click', () => {
            if (window.game && window.game.player) window.game.usePotion('potion_health');
        });
        document.getElementById('quick-pot-mp').addEventListener('click', () => {
            if (window.game && window.game.player) window.game.usePotion('potion_mana');
        });

        document.getElementById('btn-restart-game').addEventListener('click', () => {
            document.getElementById('game-over-screen').style.display = 'none';
            if (window.game) window.game.returnToTitle();
        });
        document.getElementById('btn-victory-restart').addEventListener('click', () => {
            document.getElementById('victory-screen').style.display = 'none';
            if (window.game) window.game.returnToTitle();
        });
    }

    createContextMenuDOM() {
        if (document.getElementById('item-context-menu')) return;
        const menu = document.createElement('div');
        menu.id = 'item-context-menu';
        menu.className = 'item-context-menu';
        menu.style.display = 'none';
        menu.style.position = 'absolute';
        menu.style.zIndex = '1000';
        document.body.appendChild(menu);
    }

    // =========================================================================
    // MODAL DE KAELEN (TIENDA CON ICONOS: COMPRA Y VENTA)
    // =========================================================================
    createShopModalDOM() {
        if (document.getElementById('shop-modal')) return;
        const shopDiv = document.createElement('div');
        shopDiv.id = 'shop-modal';
        shopDiv.className = 'game-modal';
        shopDiv.style.display = 'none';
        shopDiv.innerHTML = `
            <div class="modal-content" style="max-width:520px;background:#15111d;border:2px solid #f1c40f;padding:16px;color:#fff;border-radius:6px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <h3 style="font-family:'Press Start 2P';font-size:11px;color:#f1c40f;">🛒 KAELEN EL RENEGADO</h3>
                    <span id="shop-player-gold" style="font-family:'Press Start 2P';font-size:10px;color:#f1c40f;">0 G</span>
                </div>
                <div style="display:flex;gap:8px;margin-bottom:12px;">
                    <button id="shop-tab-buy" class="pixel-btn" style="font-size:9px;padding:6px 14px;">COMPRAR</button>
                    <button id="shop-tab-sell" class="pixel-btn btn-gold" style="font-size:9px;padding:6px 14px;">VENDER</button>
                </div>
                <div id="shop-body-content" style="max-height:260px;overflow-y:auto;padding-right:4px;margin-bottom:12px;"></div>
                <button class="pixel-btn close-modal-btn" style="font-size:9px;padding:6px 12px;">CERRAR (ESC)</button>
            </div>
        `;
        document.body.appendChild(shopDiv);
    }

    showShopModal() {
        this.createShopModalDOM();
        const modal = document.getElementById('shop-modal');
        if (!modal) return;
        modal.style.display = 'flex';
        if (window.game) window.game.pauseForModal();
        this.renderShopTab('buy');

        document.getElementById('shop-tab-buy').onclick = () => this.renderShopTab('buy');
        document.getElementById('shop-tab-sell').onclick = () => this.renderShopTab('sell');
        modal.querySelector('.close-modal-btn').onclick = () => this.closeShopModal();
    }

    closeShopModal() {
        const modal = document.getElementById('shop-modal');
        if (modal) modal.style.display = 'none';
        if (window.game) window.game.resumeFromModal();
    }

    renderShopTab(tab) {
        const container = document.getElementById('shop-body-content');
        const player = window.game ? window.game.player : null;
        if (!container || !player) return;
        container.innerHTML = '';
        document.getElementById('shop-player-gold').innerText = `${player.gold} G`;

        if (tab === 'buy') {
            const stock = [
                { id: 'potion_health', price: 20 },
                { id: 'potion_mana', price: 18 },
                { id: 'potion_elixir', price: 65 },
                { id: 'mat_bone', price: 25 },
                { id: 'mat_pelt', price: 45 }
            ];

            stock.forEach(itemInfo => {
                const item = window.ITEM_DATABASE[itemInfo.id];
                if (!item) return;

                const row = document.createElement('div');
                row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:#241d30;padding:8px;margin-bottom:6px;border-radius:4px;border:1px solid #3d324d;';

                const leftDiv = document.createElement('div');
                leftDiv.style.cssText = 'display:flex;align-items:center;gap:10px;';

                const cvs = document.createElement('canvas');
                cvs.width = 24; cvs.height = 24;
                window.spriteManager.drawIcon(cvs.getContext('2d'), item.icon || 0, 0, 0, 24);

                const infoDiv = document.createElement('div');
                infoDiv.innerHTML = `
                    <div style="font-size:12px;font-weight:bold;color:#f5f6fa;">${item.name}</div>
                    <div style="font-size:10px;color:#a4b0be;">${item.desc || ''}</div>
                `;

                leftDiv.appendChild(cvs);
                leftDiv.appendChild(infoDiv);

                const buyBtn = document.createElement('button');
                buyBtn.className = 'pixel-btn btn-gold';
                buyBtn.style.cssText = 'font-size:9px;padding:6px 10px;white-space:nowrap;';
                buyBtn.innerText = `COMPRAR (${itemInfo.price} G)`;

                buyBtn.onclick = () => {
                    if (player.gold >= itemInfo.price) {
                        const emptyIdx = player.inventory.findIndex(s => s === null);
                        if (emptyIdx !== -1) {
                            player.gold -= itemInfo.price;
                            player.inventory[emptyIdx] = { ...item, qty: 1 };
                            window.soundEngine.playItemPickup();
                            this.renderShopTab('buy');
                        } else {
                            window.game.floatingTexts.push(new FloatingText(player.x, player.y - 25, '¡Inventario lleno!', '#ff4444'));
                        }
                    }
                };

                row.appendChild(leftDiv);
                row.appendChild(buyBtn);
                container.appendChild(row);
            });
        } else if (tab === 'sell') {
            let hasItems = false;
            player.inventory.forEach((item, idx) => {
                if (!item) return;
                hasItems = true;
                const sellValue = Math.max(2, Math.floor((item.value || 10) * 0.6));

                const row = document.createElement('div');
                row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:#241d30;padding:8px;margin-bottom:6px;border-radius:4px;border:1px solid #3d324d;';

                const leftDiv = document.createElement('div');
                leftDiv.style.cssText = 'display:flex;align-items:center;gap:10px;';

                const cvs = document.createElement('canvas');
                cvs.width = 24; cvs.height = 24;
                window.spriteManager.drawIcon(cvs.getContext('2d'), item.icon || 0, 0, 0, 24);

                const countStr = (item.qty && item.qty > 1) ? ` (x${item.qty})` : '';
                leftDiv.innerHTML = `
                    <div style="font-size:12px;font-weight:bold;color:#f5f6fa;">${item.name}${countStr}</div>
                `;
                leftDiv.prepend(cvs);

                const sellBtn = document.createElement('button');
                sellBtn.className = 'pixel-btn';
                sellBtn.style.cssText = 'font-size:9px;padding:6px 10px;white-space:nowrap;background:#27ae60;border-color:#2ecc71;';
                sellBtn.innerText = `VENDER (+${sellValue} G)`;

                sellBtn.onclick = () => {
                    player.gold += sellValue;
                    if (item.qty && item.qty > 1) {
                        item.qty--;
                    } else {
                        player.inventory[idx] = null;
                    }
                    window.soundEngine.playItemPickup();
                    this.renderShopTab('sell');
                };

                row.appendChild(leftDiv);
                row.appendChild(sellBtn);
                container.appendChild(row);
            });

            if (!hasItems) {
                container.innerHTML = '<div style="color:#888;text-align:center;padding:20px;font-size:12px;">Tu inventario está vacío.</div>';
            }
        }
    }

    // =========================================================================
    // MODAL DE GUNNAR EL HERRERO (FORJA DE EQUIPO Y MEJORAS)
    // =========================================================================
    createBlacksmithModalDOM() {
        if (document.getElementById('blacksmith-modal')) return;
        const bDiv = document.createElement('div');
        bDiv.id = 'blacksmith-modal';
        bDiv.className = 'game-modal';
        bDiv.style.display = 'none';
        bDiv.innerHTML = `
            <div class="modal-content" style="max-width:540px;background:#181316;border:2px solid #e67e22;padding:16px;color:#fff;border-radius:6px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <h3 style="font-family:'Press Start 2P';font-size:11px;color:#e67e22;">🔨 FORJA DE GUNNAR</h3>
                    <span id="forge-player-gold" style="font-family:'Press Start 2P';font-size:10px;color:#f1c40f;">0 G</span>
                </div>
                <div style="display:flex;gap:8px;margin-bottom:12px;">
                    <button id="forge-tab-craft" class="pixel-btn btn-gold" style="font-size:9px;padding:6px 14px;">FORJAR EQUIPO</button>
                    <button id="forge-tab-upgrade" class="pixel-btn" style="font-size:9px;padding:6px 14px;">REFORZAR (+1)</button>
                </div>
                <div id="forge-body-content" style="max-height:260px;overflow-y:auto;padding-right:4px;margin-bottom:12px;"></div>
                <button class="pixel-btn close-modal-btn" style="font-size:9px;padding:6px 12px;">CERRAR (ESC)</button>
            </div>
        `;
        document.body.appendChild(bDiv);
    }

    showBlacksmithModal() {
        this.createBlacksmithModalDOM();
        const modal = document.getElementById('blacksmith-modal');
        if (!modal) return;
        modal.style.display = 'flex';
        if (window.game) window.game.pauseForModal();
        this.renderForgeTab('craft');

        document.getElementById('forge-tab-craft').onclick = () => this.renderForgeTab('craft');
        document.getElementById('forge-tab-upgrade').onclick = () => this.renderForgeTab('upgrade');
        modal.querySelector('.close-modal-btn').onclick = () => this.closeBlacksmithModal();
    }

    closeBlacksmithModal() {
        const modal = document.getElementById('blacksmith-modal');
        if (modal) modal.style.display = 'none';
        if (window.game) window.game.resumeFromModal();
    }

    renderForgeTab(tab) {
        const container = document.getElementById('forge-body-content');
        const player = window.game ? window.game.player : null;
        if (!container || !player) return;
        container.innerHTML = '';
        document.getElementById('forge-player-gold').innerText = `${player.gold} G`;

        if (tab === 'craft') {
            const recipes = window.BLACKSMITH_RECIPES || [];
            const pClass = player.characterClass;

            recipes.forEach(recipe => {
                const targetId = recipe.resultId[pClass];
                const item = window.ITEM_DATABASE[targetId];
                if (!item) return;

                let canCraft = (player.gold >= recipe.costGold);
                const matReqStrings = [];

                recipe.materials.forEach(req => {
                    let count = 0;
                    player.inventory.forEach(invItem => {
                        if (invItem && invItem.id === req.id) count += (invItem.qty || 1);
                    });
                    if (count < req.qty) canCraft = false;
                    const matDef = window.ITEM_DATABASE[req.id];
                    matReqStrings.push(`${count}/${req.qty} ${matDef ? matDef.name : req.id}`);
                });

                const row = document.createElement('div');
                row.style.cssText = 'background:#261e22;padding:10px;margin-bottom:8px;border-radius:4px;border:1px solid #4a343b;display:flex;justify-content:space-between;align-items:center;';

                const leftDiv = document.createElement('div');
                leftDiv.style.cssText = 'display:flex;align-items:center;gap:10px;';

                const cvs = document.createElement('canvas');
                cvs.width = 24; cvs.height = 24;
                window.spriteManager.drawIcon(cvs.getContext('2d'), item.icon || 0, 0, 0, 24);

                leftDiv.innerHTML = `
                    <div>
                        <div style="font-size:12px;font-weight:bold;color:#f39c12;">${item.name}</div>
                        <div style="font-size:10px;color:#aaa;margin-top:2px;">Materiales: ${matReqStrings.join(', ')}</div>
                    </div>
                `;
                leftDiv.prepend(cvs);

                const craftBtn = document.createElement('button');
                craftBtn.className = canCraft ? 'pixel-btn btn-gold' : 'pixel-btn';
                craftBtn.style.cssText = `font-size:9px;padding:6px 10px;white-space:nowrap;${canCraft ? '' : 'opacity:0.5;cursor:not-allowed;'}`;
                craftBtn.innerText = `FORJAR (${recipe.costGold} G)`;

                craftBtn.onclick = () => {
                    if (canCraft) {
                        const emptyIdx = player.inventory.findIndex(s => s === null);
                        if (emptyIdx === -1) {
                            window.game.floatingTexts.push(new FloatingText(player.x, player.y - 25, '¡Inventario lleno!', '#ff4444'));
                            return;
                        }

                        player.gold -= recipe.costGold;
                        recipe.materials.forEach(req => {
                            let needed = req.qty;
                            player.inventory.forEach((invItem, i) => {
                                if (invItem && invItem.id === req.id && needed > 0) {
                                    if ((invItem.qty || 1) <= needed) {
                                        needed -= (invItem.qty || 1);
                                        player.inventory[i] = null;
                                    } else {
                                        invItem.qty -= needed;
                                        needed = 0;
                                    }
                                }
                            });
                        });

                        player.inventory[emptyIdx] = { ...item, qty: 1 };
                        window.soundEngine.playLevelUp();
                        window.game.floatingTexts.push(new FloatingText(player.x, player.y - 30, `¡${item.name} FORJADA!`, '#f1c40f', true));
                        this.renderForgeTab('craft');
                    }
                };

                row.appendChild(leftDiv);
                row.appendChild(craftBtn);
                container.appendChild(row);
            });
        } else if (tab === 'upgrade') {
            ['weapon', 'armor'].forEach(slot => {
                const item = player.equipment[slot];
                if (!item) return;

                const cost = ((item.upgradeLevel || 0) + 1) * 70;
                const row = document.createElement('div');
                row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:#261e22;padding:10px;margin-bottom:8px;border-radius:4px;border:1px solid #4a343b;';

                const leftDiv = document.createElement('div');
                leftDiv.style.cssText = 'display:flex;align-items:center;gap:10px;';

                const cvs = document.createElement('canvas');
                cvs.width = 24; cvs.height = 24;
                window.spriteManager.drawIcon(cvs.getContext('2d'), item.icon || 0, 0, 0, 24);

                leftDiv.innerHTML = `
                    <div>
                        <div style="font-size:12px;font-weight:bold;color:#f1c40f;">${item.name}</div>
                        <div style="font-size:10px;color:#aaa;">Incrementa +4 de Estadística básica</div>
                    </div>
                `;
                leftDiv.prepend(cvs);

                const upBtn = document.createElement('button');
                upBtn.className = 'pixel-btn btn-gold';
                upBtn.style.cssText = 'font-size:9px;padding:6px 10px;white-space:nowrap;';
                upBtn.innerText = `REFORZAR (${cost} G)`;

                upBtn.onclick = () => {
                    if (player.gold >= cost) {
                        player.gold -= cost;
                        item.upgradeLevel = (item.upgradeLevel || 0) + 1;
                        item.name = `${item.name.replace(/\s\+\d+$/, '')} +${item.upgradeLevel}`;
                        if (slot === 'weapon') item.atk = (item.atk || 0) + 4;
                        else item.def = (item.def || 0) + 3;

                        window.soundEngine.playItemPickup();
                        this.renderForgeTab('upgrade');
                    }
                };

                row.appendChild(leftDiv);
                row.appendChild(upBtn);
                container.appendChild(row);
            });
        }
    }

    updateHUD(player, world) {
        if (!player) return;
        const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
        document.getElementById('hud-hp-fill').style.width = `${hpPct}%`;
        document.getElementById('hud-hp-text').innerText = `${Math.ceil(player.hp)} / ${player.maxHp}`;

        const mpPct = Math.max(0, (player.mp / player.maxMp) * 100);
        document.getElementById('hud-mp-fill').style.width = `${mpPct}%`;
        document.getElementById('hud-mp-text').innerText = `${Math.ceil(player.mp)} / ${player.maxMp}`;

        const expPct = Math.min(100, (player.exp / player.nextExp) * 100);
        document.getElementById('hud-exp-fill').style.width = `${expPct}%`;
        document.getElementById('hud-exp-text').innerText = `EXP: ${player.exp} / ${player.nextExp}`;

        document.getElementById('hud-player-name').innerText = `${player.name} (Nv. ${player.level})`;
        document.getElementById('hud-floor-num').innerText = `PISO ${world.floor} / 10`;

        let hpPots = 0; let mpPots = 0;
        player.inventory.forEach(item => {
            if (item && item.id === 'potion_health') hpPots += (item.qty || 1);
            if (item && item.id === 'potion_mana') mpPots += (item.qty || 1);
        });
        document.getElementById('hp-pot-count').innerText = hpPots;
        document.getElementById('mp-pot-count').innerText = mpPots;

        const bossCard = document.getElementById('boss-health-card');
        if (window.game && window.game.activeBoss) {
            const boss = window.game.activeBoss;
            bossCard.style.display = 'block';
            document.getElementById('boss-name-label').innerText = boss.name.toUpperCase();
            const bossHpPct = Math.max(0, (boss.hp / boss.maxHp) * 100);
            document.getElementById('boss-hp-fill').style.width = `${bossHpPct}%`;
        } else {
            bossCard.style.display = 'none';
        }
    }

    renderMinimap(player, world) {
        const canvas = document.getElementById('minimapCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const scaleX = canvas.width / world.cols;
        const scaleY = canvas.height / world.rows;

        for (let r = 0; r < world.rows; r++) {
            for (let c = 0; c < world.cols; c++) {
                if (world.grid[r][c] === 0) {
                    ctx.fillStyle = '#2d243a';
                    ctx.fillRect(c * scaleX, r * scaleY, scaleX, scaleY);
                }
            }
        }

        if (world.stairs) {
            ctx.fillStyle = world.stairsUnlocked ? '#38ef7d' : '#888888';
            ctx.fillRect((world.stairs.x / world.tileSize) * scaleX, (world.stairs.y / world.tileSize) * scaleY, scaleX * 1.5, scaleY * 1.5);
        }

        if (world.merchant) {
            ctx.fillStyle = '#9b59b6';
            ctx.fillRect((world.merchant.x / world.tileSize) * scaleX, (world.merchant.y / world.tileSize) * scaleY, scaleX * 1.5, scaleY * 1.5);
        }

        if (world.blacksmith) {
            ctx.fillStyle = '#e67e22';
            ctx.fillRect((world.blacksmith.x / world.tileSize) * scaleX, (world.blacksmith.y / world.tileSize) * scaleY, scaleX * 1.5, scaleY * 1.5);
        }

        if (world.shrine) {
            ctx.fillStyle = world.shrine.type === 'blood' ? '#e74c3c' : '#2ecc71';
            ctx.fillRect((world.shrine.x / world.tileSize) * scaleX, (world.shrine.y / world.tileSize) * scaleY, scaleX * 1.5, scaleY * 1.5);
        }

        ctx.fillStyle = '#00d2d3';
        ctx.fillRect((player.x / world.tileSize) * scaleX - 1, (player.y / world.tileSize) * scaleY - 1, scaleX * 2, scaleY * 2);
    }

    toggleInventory() {
        const modal = document.getElementById('inventory-modal');
        this.hideContextMenu();
        this.hideTooltip();
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
            if (window.game) window.game.resumeFromModal();
        } else {
            modal.style.display = 'flex';
            this.renderInventory();
            if (window.game) window.game.pauseForModal();
        }
    }

    renderInventory() {
        const player = window.game.player;
        if (!player) return;
        const grid = document.getElementById('inventory-grid-container');
        grid.innerHTML = '';

        player.inventory.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.className = 'item-slot';

            if (item) {
                const rarityInfo = window.ITEM_RARITIES[item.rarity] || window.ITEM_RARITIES.COMMON;
                slot.classList.add(rarityInfo.class);

                const cvs = document.createElement('canvas');
                cvs.width = 24; cvs.height = 24;
                window.spriteManager.drawIcon(cvs.getContext('2d'), item.icon || 0, 0, 0, 24);
                slot.appendChild(cvs);

                if (item.qty && item.qty > 1) {
                    const qtyLabel = document.createElement('span');
                    qtyLabel.className = 'item-qty';
                    qtyLabel.innerText = item.qty;
                    slot.appendChild(qtyLabel);
                }

                slot.addEventListener('mouseenter', (e) => this.showTooltip(item, e));
                slot.addEventListener('mousemove', (e) => this.updateTooltipPos(e));
                slot.addEventListener('mouseleave', () => this.hideTooltip());

                slot.addEventListener('click', () => {
                    this.hideContextMenu();
                    this.handleSlotClick(index);
                });

                slot.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showContextMenu(item, index, e);
                });
            }
            grid.appendChild(slot);
        });

        this.renderEquipSlot('equip-slot-weapon', player.equipment.weapon, 'weapon');
        this.renderEquipSlot('equip-slot-armor', player.equipment.armor, 'armor');
        this.renderEquipSlot('equip-slot-acc', player.equipment.accessory, 'accessory');
        document.getElementById('inv-gold-count').innerText = `${player.gold} G`;
        this.renderPaperdoll(player);
    }

    renderEquipSlot(elementId, item, slotType) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.innerHTML = '';

        if (item) {
            const cvs = document.createElement('canvas');
            cvs.width = 24; cvs.height = 24;
            window.spriteManager.drawIcon(cvs.getContext('2d'), item.icon || 0, 0, 0, 24);
            el.appendChild(cvs);

            el.onclick = () => {
                const player = window.game.player;
                const emptyIdx = player.inventory.findIndex(s => s === null);
                if (emptyIdx !== -1) {
                    player.inventory[emptyIdx] = item;
                    player.equipment[slotType] = null;
                    window.soundEngine.playItemPickup();
                    this.renderInventory();
                }
            };
            el.onmouseenter = (e) => this.showTooltip(item, e);
            el.onmousemove = (e) => this.updateTooltipPos(e);
            el.onmouseleave = () => this.hideTooltip();
        } else {
            el.innerHTML = '<span style="color:#555;font-size:10px;">Vacío</span>';
            el.onclick = null;
        }
    }

    showContextMenu(item, index, event) {
        this.hideTooltip();
        let menu = document.getElementById('item-context-menu');
        if (!menu) return;

        const actionText = (item.type === 'consumable') ? '👉 Usar' : '⚔️ Equipar';
        menu.innerHTML = `
            <div style="font-family:'Press Start 2P'; font-size:8px; color:#f1c40f; padding:6px 8px; border-bottom:1px dashed #3a2a4c; margin-bottom:4px;">
                ${item.name}
            </div>
            <button class="item-context-btn" id="ctx-action-btn" style="background:#241d30;border:1px solid #5a4270;color:#fff;font-family:'Press Start 2P';font-size:8px;padding:6px;width:100%;text-align:left;cursor:pointer;margin-bottom:3px;">
                <span>${actionText}</span>
            </button>
            <button class="item-context-btn danger" id="ctx-discard-btn" style="background:#4a151b;border:1px solid #e74c3c;color:#ff7675;font-family:'Press Start 2P';font-size:8px;padding:6px;width:100%;text-align:left;cursor:pointer;">
                <span>🗑️ Destruir / Eliminar</span>
            </button>
        `;

        document.getElementById('ctx-action-btn').onclick = (e) => {
            e.stopPropagation();
            this.handleSlotClick(index);
            this.hideContextMenu();
        };

        document.getElementById('ctx-discard-btn').onclick = (e) => {
            e.stopPropagation();
            this.discardItem(index);
        };

        menu.style.display = 'flex';
        menu.style.flexDirection = 'column';
        menu.style.background = '#15111d';
        menu.style.border = '2px solid #5a4270';
        menu.style.padding = '4px';
        menu.style.borderRadius = '4px';

        const container = document.getElementById('game-container') || document.body;
        const rect = container.getBoundingClientRect();
        let x = event.clientX - rect.left + 5;
        let y = event.clientY - rect.top + 5;

        const menuW = 160;
        const menuH = 100;
        if (x + menuW > rect.width) x = rect.width - menuW - 10;
        if (y + menuH > rect.height) y = rect.height - menuH - 10;

        menu.style.left = `${Math.max(10, x)}px`;
        menu.style.top = `${Math.max(10, y)}px`;
    }

    hideContextMenu() {
        const menu = document.getElementById('item-context-menu');
        if (menu) menu.style.display = 'none';
    }

    discardItem(index) {
        const player = window.game.player;
        if (!player || !player.inventory[index]) return;
        const item = player.inventory[index];
        const itemName = item.name;

        if (item.qty && item.qty > 1) {
            item.qty--;
            if (item.qty <= 0) player.inventory[index] = null;
        } else {
            player.inventory[index] = null;
        }

        if (window.soundEngine) {
            window.soundEngine.playTone(130, 'square', 0.15, 0.2);
        }

        if (window.game && window.game.floatingTexts) {
            window.game.floatingTexts.push(new FloatingText(player.x, player.y - 20, `-${itemName}`, '#a4b0be'));
        }

        if (window.game && window.game.particles) {
            for (let i = 0; i < 6; i++) {
                window.game.particles.push(new Particle(
                    player.x, player.y,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    '#747d8c', 3, 15
                ));
            }
        }

        this.hideContextMenu();
        this.hideTooltip();
        this.renderInventory();
    }

    handleSlotClick(index) {
        const player = window.game.player;
        const item = player.inventory[index];
        if (!item) return;

        if (item.type === 'consumable') {
            if (item.heal_hp) player.hp = Math.min(player.maxHp, player.hp + item.heal_hp);
            if (item.heal_mp) player.mp = Math.min(player.maxMp, player.mp + item.heal_mp);
            window.soundEngine.playPotion();
            item.qty = (item.qty || 1) - 1;
            if (item.qty <= 0) player.inventory[index] = null;
            this.hideTooltip();
            this.renderInventory();
            return;
        }

        if (item.type === 'weapon' || item.type === 'armor') {
            if (item.classReq && item.classReq !== player.characterClass) return;

            const targetSlot = item.type;
            const currentEquipped = player.equipment[targetSlot];
            player.equipment[targetSlot] = item;
            player.inventory[index] = currentEquipped;

            window.soundEngine.playItemPickup();
            this.hideTooltip();
            this.renderInventory();
        }
    }

    renderPaperdoll(player) {
        const canvas = document.getElementById('dollCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        window.spriteManager.draw(ctx, player.getSpriteKey(), 0, 0, 48, 48, 0, 0, 96, 96);
    }

    showTooltip(item, event) {
        const tt = this.tooltip;
        if (!tt) return;
        const rarity = window.ITEM_RARITIES[item.rarity] || window.ITEM_RARITIES.COMMON;
        const player = window.game ? window.game.player : null;

        let compHtml = '';
        if (player && (item.type === 'weapon' || item.type === 'armor')) {
            const equipped = player.equipment[item.type];
            if (equipped && equipped.id !== item.id) {
                const diffAtk = (item.atk || 0) - (equipped.atk || 0);
                const diffDef = (item.def || 0) - (equipped.def || 0);
                compHtml = `
                    <div style="margin-top:6px;padding-top:4px;border-top:1px dashed #555;font-size:10px;">
                        <div style="color:#aaa;margin-bottom:2px;">vs Equipado actualmente:</div>
                        ${diffAtk !== 0 ? `<div style="color:${diffAtk > 0 ? '#2ecc71' : '#e74c3c'};">${diffAtk > 0 ? '+' : ''}${diffAtk} Ataque</div>` : ''}
                        ${diffDef !== 0 ? `<div style="color:${diffDef > 0 ? '#2ecc71' : '#e74c3c'};">${diffDef > 0 ? '+' : ''}${diffDef} Defensa</div>` : ''}
                    </div>
                `;
            }
        }

        tt.innerHTML = `
            <div class="tooltip-title" style="color:${rarity.color}">${item.name}</div>
            <div class="tooltip-type">${rarity.name} - ${item.type.toUpperCase()}</div>
            <div class="tooltip-stats">
                ${item.atk ? `<div>+${item.atk} Daño de Ataque</div>` : ''}
                ${item.def ? `<div>+${item.def} Defensa Física</div>` : ''}
                ${item.str ? `<div>+${item.str} Fuerza</div>` : ''}
                ${item.dex ? `<div>+${item.dex} Destreza</div>` : ''}
                ${item.mag ? `<div>+${item.mag} Magia</div>` : ''}
                ${item.con ? `<div>+${item.con} Constitución</div>` : ''}
            </div>
            ${compHtml}
            <div class="tooltip-lore">${item.desc || ''}</div>
            <div style="font-size:12px;color:#f1c40f;margin-top:6px;display:flex;justify-content:space-between;">
                <span>Valor: ${item.value || 0} G</span>
                <span style="font-size:9px;color:#aaa;">[Clic Der: Opciones]</span>
            </div>
        `;
        tt.style.display = 'block';
        this.updateTooltipPos(event);
    }

    updateTooltipPos(event) {
        const tt = this.tooltip;
        if (!tt || tt.style.display === 'none') return;
        const container = document.getElementById('game-container') || document.body;
        const rect = container.getBoundingClientRect();
        let posX = event.clientX - rect.left + 16;
        let posY = event.clientY - rect.top + 16;
        if (posX + 250 > rect.width - 10) posX = event.clientX - rect.left - 260;
        tt.style.left = `${Math.max(10, posX)}px`;
        tt.style.top = `${Math.max(10, posY)}px`;
    }

    hideTooltip() {
        if (this.tooltip) this.tooltip.style.display = 'none';
    }

    toggleStats() {
        const modal = document.getElementById('stats-modal');
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
            if (window.game) window.game.resumeFromModal();
        } else {
            modal.style.display = 'flex';
            this.renderStatsModal();
            if (window.game) window.game.pauseForModal();
        }
    }

    renderStatsModal() {
        const player = window.game.player;
        if (!player) return;
        const total = player.getTotalStats();

        document.getElementById('stat-level-val').innerText = player.level;
        document.getElementById('stat-pts-val').innerText = player.attributePoints;
        document.getElementById('stat-str-val').innerText = `${player.strength} (Total: ${total.str})`;
        document.getElementById('stat-dex-val').innerText = `${player.dexterity} (Total: ${total.dex})`;
        document.getElementById('stat-mag-val').innerText = `${player.magic} (Total: ${total.mag})`;
        document.getElementById('stat-con-val').innerText = `${player.constitution} (Total: ${total.con})`;
        document.getElementById('stat-atk-total').innerText = total.atk;
        document.getElementById('stat-def-total').innerText = total.def;
        document.getElementById('stat-crit-total').innerText = `${total.critChance}%`;

        let setEl = document.getElementById('set-bonus-indicator');
        if (!setEl) {
            setEl = document.createElement('div');
            setEl.id = 'set-bonus-indicator';
            setEl.style.cssText = 'color:#f1c40f;font-size:10px;margin-top:8px;font-family:"Press Start 2P";';
            document.getElementById('stats-modal').querySelector('.modal-content').appendChild(setEl);
        }
        setEl.innerText = total.setBonus || 'Sin bono de conjunto';

        const hasPoints = player.attributePoints > 0;
        ['str', 'dex', 'mag', 'con'].forEach(attr => {
            const btn = document.getElementById(`btn-add-${attr}`);
            if (btn) {
                btn.style.display = hasPoints ? 'inline-block' : 'none';
                btn.onclick = () => {
                    if (player.attributePoints > 0) {
                        if (attr === 'str') player.strength++;
                        if (attr === 'dex') player.dexterity++;
                        if (attr === 'mag') { player.magic++; player.maxMp += 5; }
                        if (attr === 'con') { player.constitution++; player.maxHp += 10; player.hp += 10; }
                        player.attributePoints--;
                        this.renderStatsModal();
                    }
                };
            }
        });
    }

    showLoreModal(loreData) {
        const modal = document.getElementById('lore-modal');
        document.getElementById('parchment-title').innerText = loreData.title;
        document.getElementById('parchment-author').innerText = `- ${loreData.author}`;
        document.getElementById('parchment-content').innerText = loreData.content;
        document.getElementById('parchment-tip').innerText = loreData.combat_tip;
        modal.style.display = 'flex';
    }

    closeLoreModal() {
        document.getElementById('lore-modal').style.display = 'none';
        if (window.game) window.game.resumeFromModal();
    }

    async showHallOfFame() {
        const modal = document.getElementById('hall-of-fame-modal');
        modal.style.display = 'flex';
        try {
            const res = await fetch('/api/hall_of_fame');
            const data = await res.json();
            const tbody = document.getElementById('hof-table-body');
            tbody.innerHTML = '';
            data.forEach((r, idx) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#${idx + 1}</td>
                    <td>${r.player_name}</td>
                    <td>${r.character_class.toUpperCase()}</td>
                    <td>Piso ${r.floor_reached}</td>
                    <td>${r.enemies_killed}</td>
                    <td>${r.gold} G</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (e) { }
    }

    async showSavesModal() {
        const modal = document.getElementById('saves-modal');
        modal.style.display = 'flex';
        if (window.game) window.game.pauseForModal();
        try {
            const res = await fetch('/api/saves');
            const saves = await res.json();
            const container = document.getElementById('saves-slots-container');
            container.innerHTML = '';
            [1, 2, 3].forEach(slotNum => {
                const save = saves.find(s => s.slot === slotNum);
                const slotDiv = document.createElement('div');
                slotDiv.style.cssText = 'background:#1a1324;border:2px solid #5a4270;border-radius:4px;padding:12px;display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;';
                slotDiv.innerHTML = save ? `
                    <div>
                        <div style="font-family:'Press Start 2P';font-size:11px;color:#f1c40f;">SLOT ${slotNum}: ${save.player_name}</div>
                        <div style="font-size:13px;color:#aaa;">Piso: ${save.floor_reached} / 10 | Nivel: ${save.level}</div>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="pixel-btn" id="load-slot-${slotNum}">CARGAR</button>
                        <button class="pixel-btn btn-gold" id="save-slot-${slotNum}">GUARDAR</button>
                    </div>
                ` : `
                    <div style="color:#888;">SLOT ${slotNum}: [VACÍO]</div>
                    <button class="pixel-btn btn-gold" id="save-slot-${slotNum}">GUARDAR</button>
                `;
                container.appendChild(slotDiv);

                const saveBtn = document.getElementById(`save-slot-${slotNum}`);
                if (saveBtn) saveBtn.onclick = () => window.game && window.game.saveGame(slotNum);
                const loadBtn = document.getElementById(`load-slot-${slotNum}`);
                if (loadBtn) loadBtn.onclick = () => window.game && window.game.loadGame(slotNum);
            });
        } catch (e) { }
    }
}
// =============================================================================
// LIBRO DE CRÓNICAS ILUSTRADO (SOLO TRAS LA VICTORIA)
// =============================================================================

const LORE_CHAPTERS = [
    {
        num: 1,
        titleLeft: "VI. La Guerra de los Mil Años",
        image: "/static/assets/lore/Batalla.png",
        textLeft: "<p>Durante <b>mil años</b>, las distintas razas del mundo lucharon contra el <b>Señor Oscuro</b> y sus legiones de oscuridad. Humanos, elfos, enanos,  y magos dejaron de lado sus diferencias para formar una alianza y enfrentar una amenaza que parecía imposible de derrotar. Reinos fueron destruidos, bosques consumidos y montañas reducidas a cenizas. y finalmente, los Dioses decidieron bajar y derroatar al señor oscuro pero no pudieron elimanarlo asi que construyeron una <b>Torre</b> sobre el abismo y sellaron en sus profundidades la esencia del Señor Oscuro. La guerra terminó, pero el mal jamás fue destruido.</p>",
        titleRight: "La Guerra de los Mil Años",
        textRight: "<i>«Mil años de sangre para una victoria que nunca fue completa. El Señor Oscuro no murió... solo fue sellado.»</i>",
    },
    {
        num: 2,
        titleLeft: "II. La Gran Alianza",
        image: "/static/assets/lore/Alianza.jpg",
        textLeft: "<p>Cuando la humanidad desfallecía, tres campeones bendecidos con reliquias divinas encabezaron el asedio final:</p><p>El <b>Paladín Solar</b> de coraza dorada alada, la <b>Arquera Silvana del Ocaso</b> y la <b>Archimaga Celeste</b>. Juntos doblegaron las legiones del abismo y sellaron al Señor Oscuro.</p>",
        titleRight: "Los Tres Héroes",
        textRight: "<i>«Aquellos que sacrificaron su propia luz para aprisionar la oscuridad.»</i>",

    },
    {
        num: 3,
        titleLeft: "III. La Caída de Lucian",
        image: "/static/assets/lore/lucian.png",
        textLeft: "<p>En el <b>Piso 5</b> aguarda <b>Lucian</b>. Antaño fue el paladín más leal de la vanguardia, encomendado a custodiar las puertas intermedias.</p><p>Envenenado por los susurros de la torre, sucumbió a la maldición de la luna ártica, convirtiéndose en el <b>Primer Hombre Lobo</b>.</p>",
        titleRight: "Sub-Jefe Lucian (Piso 5)",
        textRight: "<i>«La bestia feral que desgarra con zarpazos de escarcha a los intrusos.»</i>",

    },
    {
        num: 4,
        titleLeft: "IV. Los Dioses Primordiales",
        image: "/static/assets/lore/Guardianes.png",
        textLeft: "<p>En la era del caos, cuatro Seres Supremos descendieron del firmamento sagrado: <b>kataida</b> (tormenta), <b>Valeria</b> (Vida Astral), <b>Aethelgard</b> (Tierra Inmutable) y <b>Kaelen</b> (Marea Ancestral).</p><p>Al ver que los dioses menores caían ante el avance del Señor Oscuro, unieron sus elementos divinos para doblegarlo, despojarlo de su forma física y encadenar su esencia en el abismo de La Torre Oscura.</p>",
        titleRight: "Los Cuatro Arcontes Supremos",
        textRight: "<i>«Los pilares divinos que erigieron la prisión eterna y sellaron a la oscuridad .»</i>"
    },
    {
        num: 5,
        titleLeft: "V. El Señor Oscuro",
        image: "/static/assets/lore/señor oscuro.png",
        textLeft: "<p>Antes de que la <b>Torre</b> fuera erigida, existía un ente engendrado en el corazón de las <b>llamas sombrías</b>: el <b>Señor Oscuro</b>.</p><p>No es un simple demonio, sino una fuerza primordial de <b>fuego negro y penumbra absoluta</b>. Tan inmenso es su poder que incluso los <b>Dioses del Panteón</b> libraron guerras contra él y fracasaron en destruirlo, logrando únicamente sellar su esencia en las profundidades de este abismo.</p>",
        titleRight: "El Señor Oscuro",
        textRight: "<i>«Una fuerza primordial nacida de las llamas sombrías. Ni siquiera los Dioses pudieron destruirlo; solo pudieron sellarlo.»</i>",
    },
    {
        num: 6,
        titleLeft: "VI. El Campeón Coronado",
        image: "/static/assets/lore/simarion.png",
        textLeft: "<p>Hong ha caído. El Ojo Carmesí se apaga en cenizas y los muros de la torre se desmoronan bajo la luz del nuevo amanecer.</p><p>Tu nombre ha sido inscrito con letras de oro en las Crónicas Eternas. ¡El reino está a salvo gracias a ti, héroe!</p>",
        titleRight: "Victoria Eterna",
        textRight: "<i>«Has vencido a la Torre Oscura. Eres leyenda.»</i>",

    },
    {
        num: 7,
        titleLeft: "VII. los antes de la caida",
        image: "/static/assets/lore/Asamblea.png",
        textLeft: "<p>Hong ha caído. El Ojo Carmesí se apaga en cenizas y los muros de la torre se desmoronan bajo la luz del nuevo amanecer.</p><p>Tu nombre ha sido inscrito con letras de oro en las Crónicas Eternas. ¡El reino está a salvo gracias a ti, héroe!</p>",
        titleRight: "Victoria Eterna",
        textRight: "<i>«Has vencido a la Torre Oscura. Eres leyenda.»</i>",

    }
];

UIManager.prototype.currentLorePage = 0;

UIManager.prototype.updateBookUnlockStatus = function () {
    const isCleared = localStorage.getItem('dark_tower_game_cleared') === 'true';
    const bookWidget = document.getElementById('btn-lore-book');
    if (bookWidget) {
        bookWidget.style.display = isCleared ? 'flex' : 'none';
    }
};

UIManager.prototype.showLoreBook = function () {
    const modal = document.getElementById('lore-book-modal');
    if (!modal) return;
    this.currentLorePage = 0;
    this.renderLoreBookPage();
    modal.style.display = 'flex';
    if (window.soundEngine) window.soundEngine.playTone(320, 'sine', 0.2, 0.25);
};

UIManager.prototype.renderLoreBookPage = function () {
    const chap = LORE_CHAPTERS[this.currentLorePage];
    if (!chap) return;

    document.getElementById('book-chap-title-left').innerText = chap.titleLeft;
    document.getElementById('book-text-left').innerHTML = chap.textLeft;
    document.getElementById('book-page-num-left').innerText = (this.currentLorePage * 2 + 1);

    document.getElementById('book-chap-title-right').innerText = chap.titleRight;

    // Subtítulo debajo de la foto:
    const captionEl = document.getElementById('book-text-right');
    if (captionEl) captionEl.innerHTML = chap.textRight;

    document.getElementById('book-page-num-right').innerText = (this.currentLorePage * 2 + 2);
    document.getElementById('book-progress-label').innerText = `${chap.num} / ${LORE_CHAPTERS.length}`;

    // Cargar la imagen del capítulo:
    const imgEl = document.getElementById('book-illu-img');
    if (imgEl && chap.image) {
        imgEl.src = chap.image;
    }

    document.getElementById('btn-prev-page').style.opacity = this.currentLorePage === 0 ? "0.4" : "1";
    document.getElementById('btn-prev-page').disabled = this.currentLorePage === 0;

    const isLast = this.currentLorePage === LORE_CHAPTERS.length - 1;
    document.getElementById('btn-next-page').style.opacity = isLast ? "0.4" : "1";
    document.getElementById('btn-next-page').disabled = isLast;
};

UIManager.prototype.nextLorePage = function () {
    if (this.currentLorePage < LORE_CHAPTERS.length - 1) {
        this.currentLorePage++;
        this.renderLoreBookPage();
        if (window.soundEngine) window.soundEngine.playTone(280, 'sine', 0.12, 0.2);
    }
};

UIManager.prototype.prevLorePage = function () {
    if (this.currentLorePage > 0) {
        this.currentLorePage--;
        this.renderLoreBookPage();
        if (window.soundEngine) window.soundEngine.playTone(240, 'sine', 0.12, 0.2);
    }
};

window.uiManager = new UIManager();