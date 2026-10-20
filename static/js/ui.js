

/**
 * GESTOR DE INTERFAZ DE USUARIO (UI / HUD / MODALES)
 * Controla el HUD, el inventario de 30 casillas, visualización del personaje,
 * el pergamino antiguo de lore y el salón de la fama.
 */

class UIManager {
    constructor() {
        this.selectedClass = 'warrior';
        this.selectedInventorySlot = null;
        this.tooltip = document.getElementById('item-tooltip');
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Cierre de modales con botones de cerrar
        document.querySelectorAll('.close-modal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.game-modal');
                if (modal) modal.style.display = 'none';
                if (window.game) window.game.resumeFromModal();
            });
        });

        // Selección de clase en modal
        document.querySelectorAll('.class-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedClass = card.getAttribute('data-class');
            });
        });

        document.getElementById('confirm-class-btn').addEventListener('click', () => {
            document.getElementById('class-select-modal').style.display = 'none';
            if (window.game) {
                window.game.startNewGame(this.selectedClass);
            }
        });

        // Botones HUD
        document.getElementById('btn-hud-inv').addEventListener('click', () => this.toggleInventory());
        document.getElementById('btn-hud-stats').addEventListener('click', () => this.toggleStats());
        document.getElementById('btn-hud-save').addEventListener('click', () => this.showSavesModal());

        // Botón Silenciar / Desactivar Música en HUD
        const muteBtn = document.getElementById('btn-toggle-mute');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                if (window.soundEngine) {
                    window.soundEngine.toggleMute();
                }
            });
            // Inicializar estado visual según preferencia guardada
            if (window.soundEngine) {
                window.soundEngine.updateMuteButtonUI();
            }
        }

        // Cerrar menú contextual al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.item-context-menu')) {
                this.hideContextMenu();
            }
        });

        // Atajos rápidos de pociones en HUD
        document.getElementById('quick-pot-hp').addEventListener('click', () => {
            if (window.game && window.game.player) window.game.usePotion('potion_health');
        });
        document.getElementById('quick-pot-mp').addEventListener('click', () => {
            if (window.game && window.game.player) window.game.usePotion('potion_mana');
        });

        // Botones en Pantallas Finales
        document.getElementById('btn-restart-game').addEventListener('click', () => {
            document.getElementById('game-over-screen').style.display = 'none';
            if (window.game) window.game.returnToTitle();
        });
        document.getElementById('btn-victory-restart').addEventListener('click', () => {
            document.getElementById('victory-screen').style.display = 'none';
            if (window.game) window.game.returnToTitle();
        });
    }

    updateHUD(player, world) {
        if (!player) return;

        // Barras de Salud, Maná y EXP
        const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
        document.getElementById('hud-hp-fill').style.width = `${hpPct}%`;
        document.getElementById('hud-hp-text').innerText = `${Math.ceil(player.hp)} / ${player.maxHp}`;

        const mpPct = Math.max(0, (player.mp / player.maxMp) * 100);
        document.getElementById('hud-mp-fill').style.width = `${mpPct}%`;
        document.getElementById('hud-mp-text').innerText = `${Math.ceil(player.mp)} / ${player.maxMp}`;

        const expPct = Math.min(100, (player.exp / player.nextExp) * 100);
        document.getElementById('hud-exp-fill').style.width = `${expPct}%`;
        document.getElementById('hud-exp-text').innerText = `EXP: ${player.exp} / ${player.nextExp}`;

        // Nombre y Nivel
        document.getElementById('hud-player-name').innerText = `${player.name} (Nv. ${player.level})`;

        // Indicador de Piso y Bioma
        document.getElementById('hud-floor-num').innerText = `PISO ${world.floor} / 10`;
        const floorNames = [
            "El Umbral Olvidado", "Catacumbas del Despertar", "El Sepulcro de las Mil Telas",
            "La Guardia Profanada", "Las Fauces de Azufre", "Altar de los Condenados",
            "La Antesala Demoniaca", "Rotonda Virulenta: Abracadabra", "La Cúspide del Abismo",
            "Trono de Hong Devorador de Hombres"
        ];
        document.getElementById('hud-floor-name').innerText = floorNames[world.floor - 1] || "Torre Oscura";

        // Contador de Pociones en Quickbar
        let hpPots = 0;
        let mpPots = 0;
        player.inventory.forEach(item => {
            if (item && item.id === 'potion_health') hpPots += (item.qty || 1);
            if (item && item.id === 'potion_mana') mpPots += (item.qty || 1);
        });
        document.getElementById('hp-pot-count').innerText = hpPots;
        document.getElementById('mp-pot-count').innerText = mpPots;

        // Barra de Jefe si está activo
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

        // Dibujar muros y suelo
        for (let r = 0; r < world.rows; r++) {
            for (let c = 0; c < world.cols; c++) {
                if (world.grid[r][c] === 0) {
                    ctx.fillStyle = '#2d243a';
                    ctx.fillRect(c * scaleX, r * scaleY, scaleX, scaleY);
                }
            }
        }

        // Escaleras
        if (world.stairs) {
            ctx.fillStyle = world.stairsUnlocked ? '#38ef7d' : '#888888';
            ctx.fillRect((world.stairs.x / world.tileSize) * scaleX, (world.stairs.y / world.tileSize) * scaleY, scaleX * 1.5, scaleY * 1.5);
        }

        // Pergamino de Lore
        if (world.loreScroll) {
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect((world.loreScroll.x / world.tileSize) * scaleX, (world.loreScroll.y / world.tileSize) * scaleY, scaleX, scaleY);
        }

        // Enemigos
        if (window.game && window.game.enemies) {
            ctx.fillStyle = '#e74c3c';
            window.game.enemies.forEach(e => {
                ctx.fillRect((e.x / world.tileSize) * scaleX, (e.y / world.tileSize) * scaleY, scaleX, scaleY);
            });
        }

        // Jefe
        if (window.game && window.game.activeBoss) {
            ctx.fillStyle = '#ff0055';
            const b = window.game.activeBoss;
            ctx.fillRect((b.x / world.tileSize) * scaleX - 1, (b.y / world.tileSize) * scaleY - 1, scaleX * 2, scaleY * 2);
        }

        // Jugador
        ctx.fillStyle = '#00d2d3';
        ctx.fillRect((player.x / world.tileSize) * scaleX - 1, (player.y / world.tileSize) * scaleY - 1, scaleX * 2, scaleY * 2);
    }

    // =========================================================================
    // MODAL DE INVENTARIO (30 CASILLAS)
    // =========================================================================
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

        // Renderizar Cuadrícula de 30 espacios
        const grid = document.getElementById('inventory-grid-container');
        grid.innerHTML = '';

        player.inventory.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.className = 'item-slot';

            if (item) {
                const rarityInfo = window.ITEM_RARITIES[item.rarity] || window.ITEM_RARITIES.COMMON;
                slot.classList.add(rarityInfo.class);

                // Dibujar canvas de icono 24x24
                const cvs = document.createElement('canvas');
                cvs.width = 24;
                cvs.height = 24;
                const ctx = cvs.getContext('2d');
                window.spriteManager.drawIcon(ctx, item.icon || 0, 0, 0, 24);
                slot.appendChild(cvs);

                if (item.qty && item.qty > 1) {
                    const qtyLabel = document.createElement('span');
                    qtyLabel.className = 'item-qty';
                    qtyLabel.innerText = item.qty;
                    slot.appendChild(qtyLabel);
                }

                // Eventos de Tooltip, Clic Izquierdo y Clic Derecho (Menú Contextual)
                slot.addEventListener('mouseenter', (e) => this.showTooltip(item, e));
                slot.addEventListener('mousemove', (e) => this.updateTooltipPos(e));
                slot.addEventListener('mouseleave', () => this.hideTooltip());
                slot.addEventListener('click', (e) => {
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

        // Renderizar Equipamiento
        this.renderEquipSlot('equip-slot-weapon', player.equipment.weapon, 'weapon');
        this.renderEquipSlot('equip-slot-armor', player.equipment.armor, 'armor');
        this.renderEquipSlot('equip-slot-acc', player.equipment.accessory, 'accessory');

        // Oro
        document.getElementById('inv-gold-count').innerText = `${player.gold} G`;

        // Vista previa del personaje
        this.renderPaperdoll(player);
    }

    renderEquipSlot(elementId, item, slotType) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.innerHTML = '';

        if (item) {
            const cvs = document.createElement('canvas');
            cvs.width = 24;
            cvs.height = 24;
            const ctx = cvs.getContext('2d');
            window.spriteManager.drawIcon(ctx, item.icon || 0, 0, 0, 24);
            el.appendChild(cvs);

            el.onclick = () => {
                // Desequipar
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

    renderPaperdoll(player) {
        const canvas = document.getElementById('dollCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibuja el sprite del jugador a tamaño 2x en el vestidor
        window.spriteManager.draw(
            ctx,
            player.characterClass,
            0, 0,
            48, 48,
            0, 0, 96, 96
        );
    }

    handleSlotClick(index) {
        const player = window.game.player;
        const item = player.inventory[index];
        if (!item) return;

        if (item.type === 'consumable') {
            // Usar consumible
            if (item.heal_hp) player.hp = Math.min(player.maxHp, player.hp + item.heal_hp);
            if (item.heal_mp) player.mp = Math.min(player.maxMp, player.mp + item.heal_mp);
            window.soundEngine.playPotion();

            item.qty = (item.qty || 1) - 1;
            if (item.qty <= 0) player.inventory[index] = null;
            this.hideTooltip();
            this.renderInventory();
        } else if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
            // Equipar ítem
            const currentEquipped = player.equipment[item.type];
            player.equipment[item.type] = item;
            player.inventory[index] = currentEquipped;
            window.soundEngine.playItemPickup();
            this.hideTooltip();
            this.renderInventory();
        }
    }

    discardItem(index) {
        const player = window.game.player;
        if (!player || !player.inventory[index]) return;
        const item = player.inventory[index];

        if (item.qty && item.qty > 1) {
            item.qty--;
            if (item.qty <= 0) player.inventory[index] = null;
        } else {
            player.inventory[index] = null;
        }

        window.soundEngine.playTone(180, 'square', 0.15, 0.2);
        this.hideContextMenu();
        this.hideTooltip();
        this.renderInventory();
    }

    showContextMenu(item, index, event) {
        this.hideTooltip();
        let menu = document.getElementById('item-context-menu');
        if (!menu) return;

        const actionText = (item.type === 'consumable') ? '👉 Usar' : '⚔️ Equipar';
        menu.innerHTML = `
            <div style="font-family:'Press Start 2P'; font-size:8px; color:var(--text-gold); padding:6px 8px; border-bottom:1px dashed #3a2a4c; margin-bottom:4px;">
                ${item.name}
            </div>
            <button class="item-context-btn" id="ctx-action-btn">
                <span>${actionText}</span>
            </button>
            <button class="item-context-btn danger" id="ctx-discard-btn">
                <span>🗑️ Tirar / Descartar</span>
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

        // Ajuste de coordenadas dentro del contenedor
        const container = document.getElementById('game-container') || document.body;
        const rect = container.getBoundingClientRect();
        let x = event.clientX - rect.left + 5;
        let y = event.clientY - rect.top + 5;

        // Evitar desborde derecho e inferior
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

    showTooltip(item, event) {
        const tt = this.tooltip;
        if (!tt) return;
        const rarity = window.ITEM_RARITIES[item.rarity] || window.ITEM_RARITIES.COMMON;

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
                ${item.heal_hp ? `<div>Restaura ${item.heal_hp} PV</div>` : ''}
                ${item.heal_mp ? `<div>Restaura ${item.heal_mp} PM</div>` : ''}
            </div>
            <div class="tooltip-lore">${item.desc || ''}</div>
            <div style="font-size:13px;color:#f1c40f;margin-top:6px;display:flex;justify-content:space-between;">
                <span>Valor: ${item.value || 0} G</span>
                <span style="font-size:10px;color:#ff7675;">[Clic Der: Opciones]</span>
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
        const ttWidth = 250;
        const ttHeight = tt.offsetHeight || 180;

        let posX = event.clientX - rect.left + 16;
        let posY = event.clientY - rect.top + 16;

        // Si se sale por la derecha, voltear hacia la izquierda del cursor
        if (posX + ttWidth > rect.width - 10) {
            posX = event.clientX - rect.left - ttWidth - 12;
        }

        // Si se sale por abajo, voltear hacia arriba del cursor
        if (posY + ttHeight > rect.height - 10) {
            posY = event.clientY - rect.top - ttHeight - 12;
        }

        tt.style.left = `${Math.max(10, posX)}px`;
        tt.style.top = `${Math.max(10, posY)}px`;
    }

    hideTooltip() {
        if (this.tooltip) this.tooltip.style.display = 'none';
    }

    // =========================================================================
    // MODAL DE ATRIBUTOS Y PROGRESIÓN (ESTADÍSTICAS)
    // =========================================================================
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

        // Habilitar o deshabilitar botones '+'
        const hasPoints = player.attributePoints > 0;
        ['str', 'dex', 'mag', 'con'].forEach(attr => {
            const btn = document.getElementById(`btn-add-${attr}`);
            if (btn) {
                btn.style.display = hasPoints ? 'inline-block' : 'none';
                btn.onclick = () => {
                    if (player.attributePoints > 0) {
                        if (attr === 'str') player.strength++;
                        if (attr === 'dex') player.dexterity++;
                        if (attr === 'mag') {
                            player.magic++;
                            player.maxMp += 5;
                        }
                        if (attr === 'con') {
                            player.constitution++;
                            player.maxHp += 10;
                            player.hp = Math.min(player.maxHp, player.hp + 10);
                        }
                        player.attributePoints--;
                        window.soundEngine.playItemPickup();
                        this.renderStatsModal();
                    }
                };
            }
        });
    }

    // =========================================================================
    // MODAL DE LORE EN PERGAMINO ANTIGUO (Pausa la acción)
    // =========================================================================
    showLoreModal(loreData) {
        const modal = document.getElementById('lore-modal');
        document.getElementById('parchment-title').innerText = loreData.title;
        document.getElementById('parchment-author').innerText = `- ${loreData.author}`;
        document.getElementById('parchment-content').innerText = loreData.content;
        document.getElementById('parchment-tip').innerText = loreData.combat_tip;

        modal.style.display = 'flex';
        window.soundEngine.playTone(400, 'sine', 0.2, 0.2);
    }

    closeLoreModal() {
        document.getElementById('lore-modal').style.display = 'none';
        if (window.game) window.game.resumeFromModal();
    }

    // =========================================================================
    // MODAL DEL SALÓN DE LA FAMA
    // =========================================================================
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
                const badgeClass = r.outcome === 'VICTORY' ? 'outcome-victory' : 'outcome-defeat';
                tr.innerHTML = `
                    <td>#${idx + 1}</td>
                    <td>${r.player_name}</td>
                    <td>${r.character_class.toUpperCase()} (Nv. ${r.level})</td>
                    <td>Piso ${r.floor_reached}</td>
                    <td>${r.enemies_killed}</td>
                    <td>${r.gold} G</td>
                    <td><span class="outcome-badge ${badgeClass}">${r.outcome}</span></td>
                `;
                tbody.appendChild(tr);
            });
        } catch (e) {
            console.error(e);
        }
    }

    // =========================================================================
    // MODAL DE GUARDADO Y CARGA
    // =========================================================================
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
                slotDiv.className = 'save-slot-card';
                slotDiv.style.cssText = 'background:#1a1324;border:2px solid #5a4270;border-radius:4px;padding:12px;display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;';

                if (save) {
                    slotDiv.innerHTML = `
                        <div>
                            <div style="font-family:'Press Start 2P';font-size:11px;color:#f1c40f;">SLOT ${slotNum}: ${save.player_name}</div>
                            <div style="font-size:15px;color:#aaa;margin-top:4px;">Clase: ${save.character_class.toUpperCase()} | Nivel: ${save.level} | Piso: ${save.floor_reached} / 10</div>
                            <div style="font-size:12px;color:#666;">Guardado: ${save.updated_at || ''}</div>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <button class="pixel-btn" id="load-slot-${slotNum}" style="font-size:10px;padding:6px 10px;">CARGAR</button>
                            <button class="pixel-btn btn-gold" id="save-slot-${slotNum}" style="font-size:10px;padding:6px 10px;">GUARDAR</button>
                        </div>
                    `;
                } else {
                    slotDiv.innerHTML = `
                        <div>
                            <div style="font-family:'Press Start 2P';font-size:11px;color:#888;">SLOT ${slotNum}: [VACÍO]</div>
                            <div style="font-size:15px;color:#555;">Sin datos de partida</div>
                        </div>
                        <button class="pixel-btn btn-gold" id="save-slot-${slotNum}" style="font-size:10px;padding:6px 10px;">GUARDAR AQUÍ</button>
                    `;
                }

                container.appendChild(slotDiv);

                const saveBtn = document.getElementById(`save-slot-${slotNum}`);
                if (saveBtn) {
                    saveBtn.onclick = () => {
                        if (window.game) window.game.saveGame(slotNum);
                    };
                }

                const loadBtn = document.getElementById(`load-slot-${slotNum}`);
                if (loadBtn) {
                    loadBtn.onclick = () => {
                        if (window.game) window.game.loadGame(slotNum);
                    };
                }
            });
        } catch (e) {
            console.error(e);
        }
    }
}

window.uiManager = new UIManager();
