/**
 * MOTOR PRINCIPAL DEL VIDEOJUEGO 'LA TORRE OSCURA'
 */

class DarkTowerGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        if (this.ctx) this.ctx.imageSmoothingEnabled = false;

        this.titleEyeCanvas = document.getElementById('titleEyeCanvas');
        this.titleEyeCtx = this.titleEyeCanvas ? this.titleEyeCanvas.getContext('2d') : null;

        this.STATE_TITLE = 'TITLE';
        this.STATE_PLAYING = 'PLAYING';
        this.STATE_PAUSED = 'PAUSED';
        this.STATE_GAMEOVER = 'GAMEOVER';
        this.STATE_VICTORY = 'VICTORY';
        this.state = this.STATE_TITLE;

        this.player = null;
        this.world = null;
        this.enemies = [];
        this.activeBoss = null;
        this.projectiles = [];
        this.particles = [];
        this.floatingTexts = [];
        this.lootDrops = [];

        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.camera = { x: 0, y: 0, width: 1024, height: 720 };
        this.eyePulse = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = e.clientX - rect.left + this.camera.x;
            this.mousePos.y = e.clientY - rect.top + this.camera.y;
        });
        // Abrir el libro de crónicas
        const loreBookBtn = document.getElementById('btn-lore-book');
        if (loreBookBtn) {
            loreBookBtn.addEventListener('click', () => {
                window.soundEngine.init();
                window.uiManager.showLoreBook();
            });
        }

        // Botones de pasar página dentro del libro
        const nextBtn = document.getElementById('btn-next-page');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => window.uiManager.nextLorePage());
        }

        const prevBtn = document.getElementById('btn-prev-page');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => window.uiManager.prevLorePage());
        }


        this.canvas.addEventListener('mousedown', (e) => {
            if (this.state === this.STATE_PLAYING && this.player && e.button === 0) {
                this.player.attack(this.mousePos.x, this.mousePos.y, this.projectiles, this.particles);
            }
        });

        document.getElementById('btn-new-game').addEventListener('click', () => {
            window.soundEngine.init();
            document.getElementById('class-select-modal').style.display = 'flex';
        });

        document.getElementById('btn-load-game').addEventListener('click', () => {
            window.soundEngine.init();
            window.uiManager.showSavesModal();
        });

        document.getElementById('btn-hall-of-fame').addEventListener('click', () => {
            window.soundEngine.init();
            window.uiManager.showHallOfFame();
        });

        document.getElementById('btn-how-to-play').addEventListener('click', () => {
            window.soundEngine.init();
            document.getElementById('how-to-play-modal').style.display = 'flex';
        });


        window.spriteManager.loadAll(() => {
            window.uiManager.init();

            // Comprobar si el jugador ya completó el juego antes:
            if (window.uiManager.updateBookUnlockStatus) {
                window.uiManager.updateBookUnlockStatus();
            }

            this.lastTime = performance.now();
            requestAnimationFrame((time) => this.loop(time));
        })
    }

    resize() {
        const container = document.getElementById('game-container');
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            if (this.ctx) this.ctx.imageSmoothingEnabled = false;
            this.camera.width = this.canvas.width;
            this.camera.height = this.canvas.height;
        }
    }

    handleKeyDown(e) {
        this.keys[e.key] = true;

        if (this.state === this.STATE_PLAYING) {
            if (e.key === 'i' || e.key === 'I') window.uiManager.toggleInventory();
            else if (e.key === 'c' || e.key === 'C') window.uiManager.toggleStats();
            else if (e.key === '1') this.usePotion('potion_health');
            else if (e.key === '2') this.usePotion('potion_mana');
            else if (e.key === 'e' || e.key === 'E' || e.key === ' ') this.checkInteractions();
            else if (e.key === 'f' || e.key === 'F') {
                if (this.player) this.player.useSpecialAbility(this.mousePos.x, this.mousePos.y, this.world, this.enemies, this.activeBoss, this.projectiles, this.particles, this.floatingTexts);
            } else if (e.key === 'm' || e.key === 'M') window.soundEngine.toggleMute();
        } else if (this.state === this.STATE_PAUSED) {
            if (e.key === 'e' || e.key === 'E' || e.key === 'Escape') {
                window.uiManager.closeLoreModal();
                window.uiManager.closeShopModal();
            }
        }
    }

    handleKeyUp(e) {
        this.keys[e.key] = false;
    }

    startNewGame(characterClass) {
        document.getElementById('title-screen').style.display = 'none';
        document.getElementById('game-hud').style.display = 'block';
        this.player = new Player(characterClass, 'Héroe');
        this.loadFloor(1);
        this.state = this.STATE_PLAYING;
        window.soundEngine.startBgm(false);
    }

    loadFloor(floorNumber) {
        this.world = new World(floorNumber);
        this.enemies = [];
        this.activeBoss = null;
        this.projectiles = [];
        this.particles = [];
        this.floatingTexts = [];
        this.lootDrops = [];

        const spawnPos = this.world.getStartingPosition();
        this.player.spawnPlayer(spawnPos.x, spawnPos.y);

        this.camera.x = Math.max(0, Math.min(this.world.cols * this.world.tileSize - this.camera.width, this.player.x - this.camera.width / 2));
        this.camera.y = Math.max(0, Math.min(this.world.rows * this.world.tileSize - this.camera.height, this.player.y - (this.camera.height / 2 + 35)));

        const cx = Math.floor(this.world.cols / 2) * this.world.tileSize;

        if (floorNumber === 5) {
            this.activeBoss = new BossLucian(cx, 11 * this.world.tileSize);
            this.spawnAnteRoomEnemies(5);
        } else if (floorNumber === 8) {
            this.activeBoss = new BossAbracadabra(cx, 13 * this.world.tileSize);
            this.spawnAnteRoomEnemies(8);
        } else if (floorNumber === 10) {
            this.activeBoss = new BossHong(cx, 11 * this.world.tileSize);
            this.spawnAnteRoomEnemies(10);
        } else {
            this.spawnFloorEnemies(floorNumber);
        }

        window.soundEngine.startBgm(floorNumber === 5 || floorNumber === 8 || floorNumber === 10);
        this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, `PISO ${floorNumber}`, '#ffcc00', true));
    }

    spawnFloorEnemies(floor) {
        const count = 8 + floor * 2;
        const types = [];

        if (floor <= 2) types.push('bandit', 'skeleton', 'rat');
        else if (floor <= 4) types.push('bandit', 'skeleton', 'spider', 'rat');
        else if (floor <= 6) types.push('spider', 'werewolf', 'rat');
        else if (floor <= 7) types.push('werewolf', 'demon');
        else if (floor === 9) types.push('demon', 'werewolf');

        for (let i = 0; i < count; i++) {
            let placed = false;
            let tries = 0;
            while (!placed && tries < 60) {
                tries++;
                const r = Math.floor(Math.random() * (this.world.rows - 6)) + 3;
                const c = Math.floor(Math.random() * (this.world.cols - 6)) + 3;

                if (this.world.libRoom) {
                    const lr = this.world.libRoom;
                    if (c >= lr.x && c < lr.x + lr.w && r >= lr.y && r < lr.y + lr.h) continue;
                }

                if (this.world.grid[r][c] === 0) {
                    const ex = c * this.world.tileSize + 16;
                    const ey = r * this.world.tileSize + 16;
                    if (Math.hypot(ex - this.player.x, ey - this.player.y) > 180) {
                        const randomType = types[Math.floor(Math.random() * types.length)];
                        const en = new Enemy(randomType, ex, ey, floor);
                        if (i === 0 && this.world.lockedDoor) en.hasKey = true;
                        this.enemies.push(en);
                        placed = true;
                    }
                }
            }
        }
    }

    spawnAnteRoomEnemies(floor) {
        const types = floor === 5 ? ['werewolf', 'skeleton'] : ['demon', 'werewolf'];
        const cx = Math.floor(this.world.cols / 2);
        for (let i = 0; i < 4; i++) {
            const ex = (cx - 4 + i * 2) * this.world.tileSize + 16;
            const ey = 35 * this.world.tileSize + 16;
            this.enemies.push(new Enemy(types[i % types.length], ex, ey, floor));
        }
    }

    checkInteractions() {
        const p = this.player;
        const w = this.world;

        // 1. PNJ Comerciante / Herrero Kaelen
        if (w.merchant && Math.hypot(p.x - w.merchant.x, p.y - w.merchant.y) < 56) {
            window.uiManager.showShopModal();
            return;
        }

        // 2. Altar de Sangre o Bendición
        if (w.shrine && !w.shrine.used && Math.hypot(p.x - w.shrine.x, p.y - w.shrine.y) < 48) {
            w.shrine.used = true;
            window.soundEngine.playLevelUp();
            if (w.shrine.type === 'blood') {
                p.hp = Math.max(10, Math.floor(p.hp * 0.7));
                p.strength += 3;
                this.floatingTexts.push(new FloatingText(p.x, p.y - 30, '¡PACTO DE SANGRE (+3 FUERZA)!', '#e74c3c', true));
            } else {
                p.hp = p.maxHp;
                p.mp = p.maxMp;
                this.floatingTexts.push(new FloatingText(p.x, p.y - 30, '¡BENDICIÓN DIVINA (SALUD TOTAL)!', '#2ecc71', true));
            }
            return;
        }

        // 3. Puerta de Sala del Tesoro cerrada con Llave
        if (w.lockedDoor && !w.lockedDoor.opened && Math.hypot(p.x - (w.lockedDoor.x + 16), p.y - (w.lockedDoor.y + 16)) < 48) {
            const keyIdx = p.inventory.findIndex(it => it && it.id === 'dungeon_key');
            if (keyIdx !== -1) {
                p.inventory[keyIdx] = null;
                w.lockedDoor.opened = true;
                window.soundEngine.playItemPickup();
                this.floatingTexts.push(new FloatingText(w.lockedDoor.x, w.lockedDoor.y - 15, '¡PUERTA DESBLOQUEADA!', '#f1c40f', true));
            } else {
                this.floatingTexts.push(new FloatingText(p.x, p.y - 25, '¡Necesitas la Llave!', '#ff4444'));
            }
            return;
        }

        // 4. Pergamino de Lore
        if (w.loreScroll && !w.loreScroll.collected && Math.hypot(p.x - (w.loreScroll.x + 16), p.y - (w.loreScroll.y + 16)) < 56) {
            w.loreScroll.collected = true;
            this.fetchAndShowLore(w.floor);
            return;
        }

        // 5. Escaleras o Portal de Victoria
        if (w.stairs && w.stairsUnlocked && Math.hypot(p.x - (w.stairs.x + 16), p.y - (w.stairs.y + 16)) < 48) {
            if (w.floor < 10) {
                this.loadFloor(w.floor + 1);
                this.saveGame(1, true);
            } else {
                this.triggerVictory();
            }
            return;
        }
        // Interacción con el Herrero Gunnar
        if (w.blacksmith && Math.hypot(p.x - w.blacksmith.x, p.y - w.blacksmith.y) < 56) {
            window.uiManager.showBlacksmithModal();
            return;
        }

        // 6. Abrir cofres
        w.chests.forEach(chest => {
            if (!chest.opened && Math.hypot(p.x - (chest.x + 16), p.y - (chest.y + 16)) < 48) {
                chest.opened = true;
                window.soundEngine.playItemPickup();
                this.dropLoot('chest', chest.x + 16, chest.y + 16);
            }
        });
    }

    async fetchAndShowLore(floor) {
        this.pauseForModal();
        try {
            const res = await fetch(`/api/lore/${floor}`);
            const data = await res.json();
            window.uiManager.showLoreModal(data);
            if (!this.player.loreUnlocked.includes(floor)) this.player.loreUnlocked.push(floor);
        } catch (e) {
            this.resumeFromModal();
        }
    }

    pauseForModal() {
        if (this.state === this.STATE_PLAYING) this.state = this.STATE_PAUSED;
    }

    resumeFromModal() {
        if (this.state === this.STATE_PAUSED) this.state = this.STATE_PLAYING;
    }

    usePotion(potionId) {
        const itemIdx = this.player.inventory.findIndex(i => i && i.id === potionId);
        if (itemIdx !== -1) window.uiManager.handleSlotClick(itemIdx);
    }

    // =========================================================================
    // BOTÍN INTELIGENTE (SMART LOOT): ADAPTADO AL HÉROE ACTUAL Y RAREZAS
    // =========================================================================
    dropLoot(sourceType, x, y) {
        const floor = (this.world && this.world.floor) ? this.world.floor : 1;
        const isBoss = (sourceType === 'lucian' || sourceType === 'abracadabra' || sourceType === 'hong');
        const playerClass = (this.player && this.player.characterClass) ? this.player.characterClass : 'warrior';

        // Barriles: 40% de soltar algo
        if (sourceType === 'barrel' && Math.random() > 0.40) return;

        // Enemigos comunes: 50% de las veces solo dan oro para no saturar
        if (!isBoss && sourceType !== 'chest' && sourceType !== 'barrel') {
            if (Math.random() > 0.50) {
                this.lootDrops.push(new GroundItem(x, y, null, true, Math.floor(Math.random() * 8) + 4));
                return;
            }
        }

        let tableKey = sourceType;
        if (sourceType === 'chest') {
            tableKey = floor <= 3 ? 'chest_early' : (floor <= 7 ? 'chest_mid' : 'chest_late');
        }

        const table = window.DROP_TABLES[tableKey] || window.DROP_TABLES[sourceType];
        if (!table) return;

        let equipmentDropped = 0;
        const maxEquipment = isBoss ? 2 : 1;

        // Matriz de conversión automática: Si cae un ítem de otra clase, se transforma al de tu héroe
        const EQUIVALENTS = {
            weapon: {
                0: { warrior: 'sword_short', archer: 'bow_short', mage: 'staff_apprentice' },
                1: { warrior: 'blade_demonic', archer: 'bow_dark', mage: 'staff_dark' },
                2: { warrior: 'sword_legend', archer: 'bow_legend', mage: 'staff_legend' }
            },
            armor: {
                0: { warrior: 'armor_plate', archer: 'armor_leather', mage: 'armor_robe' },
                1: { warrior: 'armor_plate_dark', archer: 'armor_leather_dark', mage: 'armor_robe_dark' },
                2: { warrior: 'armor_plate_legend', archer: 'armor_leather_legend', mage: 'armor_robe_legend' }
            }
        };

        table.forEach(entry => {
            if (entry.goldMin !== undefined) {
                const goldAmt = Math.floor(Math.random() * (entry.goldMax - entry.goldMin + 1)) + entry.goldMin;
                if (goldAmt > 0) this.lootDrops.push(new GroundItem(x, y, null, true, goldAmt));
                return;
            }

            let itemData = window.ITEM_DATABASE[entry.id];
            if (!itemData) return;

            const isEquipment = (itemData.type === 'weapon' || itemData.type === 'armor');

            // Máximo 1 pieza de equipo por baja para enemigos normales
            if (isEquipment && equipmentDropped >= maxEquipment) return;

            // Pisos 1-3: Prohibido soltar Épicas o Legendarias
            if (floor <= 3 && (itemData.rarity === 'EPIC' || itemData.rarity === 'LEGENDARY')) return;

            // Pisos 4-6: Prohibido soltar Legendarias de enemigos comunes
            if (floor <= 6 && !isBoss && itemData.rarity === 'LEGENDARY') return;

            // =================================================================
            // TRANSFORMACIÓN INTELIGENTE DE BOTÍN
            // =================================================================
            if (isEquipment) {
                const itemType = itemData.type; // 'weapon' o 'armor'
                const lookTier = (itemData.look !== undefined) ? itemData.look : 0;

                // Si el ítem no es de tu clase, transfórmalo al equivalente que SÍ puedes usar
                if (itemData.classReq && itemData.classReq !== playerClass) {
                    if (EQUIVALENTS[itemType] && EQUIVALENTS[itemType][lookTier]) {
                        const targetId = EQUIVALENTS[itemType][lookTier][playerClass];
                        if (targetId && window.ITEM_DATABASE[targetId]) {
                            itemData = window.ITEM_DATABASE[targetId];
                        }
                    }
                }
            } else if (itemData.type === 'consumable') {
                // Adaptación de pociones: Magos reciben más maná, Guerreros más vida
                if (playerClass === 'mage' && itemData.id === 'potion_health' && Math.random() < 0.6) {
                    itemData = window.ITEM_DATABASE['potion_mana'];
                } else if (playerClass === 'warrior' && itemData.id === 'potion_mana' && Math.random() < 0.6) {
                    itemData = window.ITEM_DATABASE['potion_health'];
                }
            }

            // Probabilidades: Épicas 10%, Legendarias 1%, Jefes 60%
            let chance = entry.chance;
            if (!isBoss) {
                if (itemData.rarity === 'EPIC') chance = 0.10;
                if (itemData.rarity === 'LEGENDARY') chance = 0.01;
            } else {
                if (isEquipment) chance = 0.60;
            }

            if (Math.random() <= chance) {
                const modifiedItem = window.applyRandomAffix ? window.applyRandomAffix(itemData) : itemData;
                this.lootDrops.push(new GroundItem(x, y, { ...modifiedItem, qty: entry.qty || 1 }));

                if (isEquipment) {
                    equipmentDropped++;
                }
            }
        });
    }
    triggerGameOver() {
        this.state = this.STATE_GAMEOVER;
        window.soundEngine.stopBgm();
        document.getElementById('game-hud').style.display = 'none';
        document.getElementById('game-over-screen').style.display = 'flex';
    }

    triggerVictory() {
        this.state = this.STATE_VICTORY;
        window.soundEngine.stopBgm();
        window.soundEngine.playLevelUp();

        // Enviar al backend los datos exactos del héroe vencedor para guardarlo en la cuenta
        fetch('/api/record_victory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                character_class: this.player.characterClass,
                level: this.player.level,
                hp: this.player.hp,
                max_hp: this.player.maxHp,
                mp: this.player.mp,
                max_mp: this.player.maxMp,
                strength: this.player.strength,
                dexterity: this.player.dexterity,
                magic: this.player.magic,
                constitution: this.player.constitution,
                gold: this.player.gold,
                equipment: this.player.equipment,
                inventory: this.player.inventory
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success && window.uiManager.currentUser) {
                    window.uiManager.currentUser.cleared_heroes = data.cleared_heroes;
                    window.uiManager.updateAuthUI(true, window.uiManager.currentUser.username);
                }
            });

        // Desbloquear Libro de Crónicas
        localStorage.setItem('dark_tower_game_cleared', 'true');
        if (window.uiManager) window.uiManager.updateBookUnlockStatus();

        document.getElementById('game-hud').style.display = 'none';
        document.getElementById('victory-screen').style.display = 'flex';
    }
    startCustomFloorRun(characterClass, floorNumber) {
        document.getElementById('title-screen').style.display = 'none';
        document.getElementById('game-hud').style.display = 'block';

        const currentUser = window.uiManager.currentUser;
        const cleared = (currentUser && currentUser.cleared_heroes) || {};
        const savedHero = cleared[characterClass];

        // 1. Crear el jugador
        this.player = new Player(characterClass, currentUser ? currentUser.username : 'Héroe');

        // 2. Comprobar si esta clase específica ya completó el juego
        if (savedHero) {
            // ¡CARGAR SU INVENTARIO Y EQUIPO DE VICTORIA!
            this.player.level = savedHero.level;
            this.player.hp = savedHero.max_hp;
            this.player.maxHp = savedHero.max_hp;
            this.player.mp = savedHero.max_mp;
            this.player.maxMp = savedHero.max_mp;
            this.player.strength = savedHero.strength;
            this.player.dexterity = savedHero.dexterity;
            this.player.magic = savedHero.magic;
            this.player.constitution = savedHero.constitution;
            this.player.gold = savedHero.gold;

            const refresh = window.refreshItem || (it => it);
            this.player.inventory = (savedHero.inventory || []).map(refresh);
            this.player.equipment = Object.fromEntries(
                Object.entries(savedHero.equipment || {}).map(([s, it]) => [s, refresh(it)])
            );

            this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 50, '¡HÉROE VENCEDOR CARGADO!', '#f1c40f', true));
        } else {
            // No ha ganado con esta clase: empieza limpio con equipo básico
            this.player.giveInitialEquipment();
            this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 50, 'NUEVO HÉROE (EQUIPO BÁSICO)', '#a4b0be', true));
        }

        // 3. Cargar el piso elegido
        this.loadFloor(floorNumber);
        this.state = this.STATE_PLAYING;
    }

    returnToTitle() {
        this.state = this.STATE_TITLE;
        document.getElementById('title-screen').style.display = 'flex';
        document.getElementById('game-hud').style.display = 'none';
        document.getElementById('game-over-screen').style.display = 'none';
        document.getElementById('victory-screen').style.display = 'none';
        window.soundEngine.stopBgm();
    }

    async saveGame(slot = 1, silent = false) {
        if (!this.player || !this.world) return;
        const payload = {
            slot,
            player_name: this.player.name,
            character_class: this.player.characterClass,
            level: this.player.level,
            exp: this.player.exp,
            next_exp: this.player.nextExp,
            hp: this.player.hp,
            max_hp: this.player.maxHp,
            mp: this.player.mp,
            max_mp: this.player.maxMp,
            strength: this.player.strength,
            dexterity: this.player.dexterity,
            magic: this.player.magic,
            constitution: this.player.constitution,
            attribute_points: this.player.attributePoints,
            floor_reached: this.world.floor,
            gold: this.player.gold,
            inventory: this.player.inventory,
            equipment: this.player.equipment,
            lore_unlocked: this.player.loreUnlocked,
            enemies_killed: this.player.enemiesKilled,
            playtime_seconds: this.player.playtimeSeconds
        };

        try {
            await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!silent) {
                this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 30, '¡PARTIDA GUARDADA!', '#38ef7d', true));
                document.getElementById('saves-modal').style.display = 'none';
                this.resumeFromModal();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async loadGame(slot = 1) {
        try {
            const res = await fetch(`/api/save/${slot}`);
            if (!res.ok) return;
            const data = await res.json();

            document.getElementById('saves-modal').style.display = 'none';
            document.getElementById('title-screen').style.display = 'none';
            document.getElementById('game-hud').style.display = 'block';

            this.player = new Player(data.character_class, data.player_name);
            this.player.level = data.level;
            this.player.exp = data.exp;
            this.player.nextExp = data.next_exp;
            this.player.hp = data.hp;
            this.player.maxHp = data.max_hp;
            this.player.mp = data.mp;
            this.player.maxMp = data.max_mp;
            this.player.strength = data.strength;
            this.player.dexterity = data.dexterity;
            this.player.magic = data.magic;
            this.player.constitution = data.constitution;
            this.player.attribute_points = data.attribute_points;
            this.player.gold = data.gold;

            const refresh = window.refreshItem || (it => it);
            this.player.inventory = (data.inventory || new Array(30).fill(null)).map(refresh);
            this.player.equipment = Object.fromEntries(
                Object.entries(data.equipment || {}).map(([s, it]) => [s, refresh(it)])
            );

            this.player.loreUnlocked = data.lore_unlocked || [];
            this.player.enemiesKilled = data.enemies_killed || 0;
            this.player.playtimeSeconds = data.playtime_seconds || 0;

            this.loadFloor(data.floor_reached || 1);
            this.state = this.STATE_PLAYING;
        } catch (e) {
            console.error(e);
        }
    }

    loop(timestamp) {
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        if (this.state === this.STATE_PLAYING) {
            this.update(dt);
            this.render();
        }
        requestAnimationFrame((time) => this.loop(time));
    }

    update(dt) {
        if (!this.player || !this.world) return;
        this.player.playtimeSeconds += dt;
        this.player.update(this.keys, this.world, this.projectiles, this.particles);

        if (this.player.hp <= 0) {
            this.triggerGameOver();
            return;
        }

        // =====================================================================
        // EMBOSCADAS ESCALADAS SEGÚN EL PISO (SIN LOBOS EN PISOS BAJOS)
        // =====================================================================
        if (this.world.ambushRoom && !this.world.ambushRoom.triggered) {
            const ar = this.world.ambushRoom;
            if (this.player.x > ar.x && this.player.x < ar.x + ar.w && this.player.y > ar.y && this.player.y < ar.y + ar.h) {
                this.world.ambushRoom.triggered = true;
                this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 30, '¡EMBOSCADA!', '#e74c3c', true));
                window.soundEngine.playBossRoar();

                const floor = this.world.floor;
                let ambushType = 'bandit';
                if (floor <= 2) ambushType = Math.random() < 0.5 ? 'rat' : 'bandit';
                else if (floor <= 4) ambushType = Math.random() < 0.5 ? 'skeleton' : 'spider';
                else if (floor <= 6) ambushType = 'spider';
                else if (floor <= 8) ambushType = 'werewolf';
                else ambushType = 'demon';

                for (let i = 0; i < 3; i++) {
                    const ex = ar.x + 30 + (i % 2) * 60;
                    const ey = ar.y + 30 + Math.floor(i / 2) * 60;
                    this.enemies.push(new Enemy(ambushType, ex, ey, floor));
                }
            }
        }

        // =====================================================================
        // DESTRUCCIÓN DE BARRILES Y CAJAS (ATAQUE CUERPO A CUERPO)
        // =====================================================================
        if (this.player.slashHitbox) {
            const hb = this.player.slashHitbox;
            this.enemies.forEach((enemy, idx) => {
                if (Math.hypot(enemy.x - hb.x, enemy.y - hb.y) < hb.radius) {
                    const isDead = enemy.takeDamage(hb.damage, this.player.x, this.player.y);
                    this.floatingTexts.push(new FloatingText(enemy.x, enemy.y - 15, `-${hb.damage}`, '#ffdd55'));
                    if (isDead) this.killEnemy(idx);
                }
            });

            if (this.activeBoss && Math.hypot(this.activeBoss.x - hb.x, this.activeBoss.y - hb.y) < hb.radius + 20) {
                const isDead = this.activeBoss.takeDamage(hb.damage, this.player.x, this.player.y);
                this.floatingTexts.push(new FloatingText(this.activeBoss.x, this.activeBoss.y - 20, `-${hb.damage}`, '#ffdd55'));
                if (isDead) this.killBoss();
            }

            // Romper barriles
            this.world.barrels.forEach(b => {
                if (!b.broken && Math.hypot(b.x + 16 - hb.x, b.y + 16 - hb.y) < hb.radius) {
                    b.broken = true;
                    window.soundEngine.playHit();
                    this.dropLoot('barrel', b.x + 16, b.y + 16);
                }
            });

            // Romper cajas
            if (this.world.crates) {
                this.world.crates.forEach(c => {
                    if (!c.broken && Math.hypot(c.x + 16 - hb.x, c.y + 16 - hb.y) < hb.radius) {
                        c.broken = true;
                        window.soundEngine.playHit();
                        this.dropLoot('barrel', c.x + 16, c.y + 16);
                    }
                });
            }

            this.player.slashHitbox = null;
        }

        this.enemies.forEach(enemy => enemy.update(this.player, this.world, this.projectiles, this.particles));
        if (this.activeBoss) this.activeBoss.update(this.player, this.world, this.projectiles, this.particles);

        // =====================================================================
        // PROYECTILES (FLECHAS Y MAGIA TAMBIÉN ROMPEN BARRILES Y CAJAS)
        // =====================================================================
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(this.world, this.particles);
            if (p.life <= 0) { this.projectiles.splice(i, 1); continue; }

            if (p.owner === 'player') {
                this.enemies.forEach((enemy, eIdx) => {
                    if (!p.hitEntities.has(enemy) && Math.hypot(enemy.x - p.x, enemy.y - p.y) < enemy.width / 2 + p.radius) {
                        p.hitEntities.add(enemy);
                        const isDead = enemy.takeDamage(p.damage, p.x, p.y);
                        this.floatingTexts.push(new FloatingText(enemy.x, enemy.y - 15, `-${p.damage}`, '#ffffff'));
                        if (isDead) this.killEnemy(eIdx);
                        p.pierce--;
                        if (p.pierce <= 0) p.life = 0;
                    }
                });

                // Flechas y magia rompen barriles
                this.world.barrels.forEach(b => {
                    if (!b.broken && Math.hypot(b.x + 16 - p.x, b.y + 16 - p.y) < 16 + p.radius) {
                        b.broken = true;
                        p.life = 0;
                        window.soundEngine.playHit();
                        this.dropLoot('barrel', b.x + 16, b.y + 16);
                    }
                });

                // Flechas y magia rompen cajas
                if (this.world.crates) {
                    this.world.crates.forEach(c => {
                        if (!c.broken && Math.hypot(c.x + 16 - p.x, c.y + 16 - p.y) < 16 + p.radius) {
                            c.broken = true;
                            p.life = 0;
                            window.soundEngine.playHit();
                            this.dropLoot('barrel', c.x + 16, c.y + 16);
                        }
                    });
                }

                if (this.activeBoss && Math.hypot(this.activeBoss.x - p.x, this.activeBoss.y - p.y) < this.activeBoss.width / 2 + p.radius) {
                    const isDead = this.activeBoss.takeDamage(p.damage, p.x, p.y);
                    this.floatingTexts.push(new FloatingText(this.activeBoss.x, this.activeBoss.y - 20, `-${p.damage}`, '#ffffff'));
                    if (isDead) this.killBoss();
                    p.life = 0;
                }
            } else if (p.owner === 'enemy') {
                if (Math.hypot(this.player.x - p.x, this.player.y - p.y) < this.player.width / 2 + p.radius) {
                    this.player.takeDamage(p.damage, p.x, p.y);
                    p.life = 0;
                }
            }
        }

        for (let i = this.lootDrops.length - 1; i >= 0; i--) {
            const drop = this.lootDrops[i];
            drop.update(this.player, this.particles, this.world);
            if (drop.pickedUp) this.lootDrops.splice(i, 1);
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) this.particles.splice(i, 1);
        }

        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            this.floatingTexts[i].update();
            if (this.floatingTexts[i].life <= 0) this.floatingTexts.splice(i, 1);
        }

        this.world.update(this.particles);

        if (this.enemies.length === 0 && !this.activeBoss) {
            this.world.stairsUnlocked = true;
        }

        this.camera.x = Math.max(0, Math.min(this.world.cols * this.world.tileSize - this.camera.width, this.player.x - this.camera.width / 2));
        this.camera.y = Math.max(0, Math.min(this.world.rows * this.world.tileSize - this.camera.height, this.player.y - (this.camera.height / 2 + 35)));

        window.uiManager.updateHUD(this.player, this.world);
        window.uiManager.renderMinimap(this.player, this.world);
    }

    killEnemy(index) {
        const enemy = this.enemies[index];
        this.player.enemiesKilled++;
        this.player.gainExp(enemy.expReward, this.floatingTexts);

        if (enemy.hasKey) {
            const keyItem = window.ITEM_DATABASE.dungeon_key;
            this.lootDrops.push(new GroundItem(enemy.x, enemy.y, { ...keyItem, qty: 1 }));
            this.floatingTexts.push(new FloatingText(enemy.x, enemy.y - 25, '¡LLAVE OBTENIDA!', '#f1c40f', true));
        }

        this.dropLoot(enemy.type, enemy.x, enemy.y);
        this.enemies.splice(index, 1);
    }

    killBoss() {
        const boss = this.activeBoss;
        this.player.enemiesKilled++;
        const pClass = this.player.characterClass;

        let expReward = 500;
        let lootTable = 'abracadabra';

        if (boss.name.includes('Lucian')) {
            expReward = 850;
            lootTable = 'lucian';

            const armors = {
                warrior: 'armor_plate_legend',
                archer: 'armor_leather_legend',
                mage: 'armor_robe_legend'
            };
            const aData = window.ITEM_DATABASE[armors[pClass] || 'armor_plate_legend'];
            if (aData) {
                this.lootDrops.push(new GroundItem(boss.x, boss.y, { ...aData, qty: 1 }));
                this.floatingTexts.push(new FloatingText(boss.x, boss.y - 35, '¡ARMADURA LEGENDARIA!', '#f1c40f', true));
            }
        } else if (boss.name.includes('Abracadabra')) {
            expReward = 1200;
            lootTable = 'abracadabra';

            const weapons = {
                warrior: 'sword_legend',
                archer: 'bow_legend',
                mage: 'staff_legend'
            };
            const wData = window.ITEM_DATABASE[weapons[pClass] || 'sword_legend'];
            if (wData) {
                this.lootDrops.push(new GroundItem(boss.x, boss.y, { ...wData, qty: 1 }));
                this.floatingTexts.push(new FloatingText(boss.x, boss.y - 35, '¡ARMA LEGENDARIA!', '#f1c40f', true));
            }
        } else if (boss.name.includes('Hong')) {
            expReward = 2000;
            lootTable = 'hong';
        }

        this.player.gainExp(expReward, this.floatingTexts);
        this.dropLoot(lootTable, boss.x, boss.y);

        this.activeBoss = null;
        window.soundEngine.startBgm(false);

        if (this.world.floor === 5 || this.world.floor === 8) {
            this.world.stairsUnlocked = true;
            this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, '¡ESCALERAS DESBLOQUEADAS!', '#ffd700', true));
        } else if (this.world.floor === 10) {
            this.world.stairs = { x: 20 * this.world.tileSize, y: 6 * this.world.tileSize };
            this.world.stairsUnlocked = true;
            this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, '¡PORTAL DESBLOQUEADO!', '#ffd700', true));
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));

        this.world.draw(this.ctx, this.camera);
        this.lootDrops.forEach(drop => drop.draw(this.ctx));
        this.enemies.forEach(e => e.draw(this.ctx));
        if (this.activeBoss) this.activeBoss.draw(this.ctx);
        this.player.draw(this.ctx);
        this.projectiles.forEach(p => p.draw(this.ctx));
        this.particles.forEach(pt => pt.draw(this.ctx));
        this.floatingTexts.forEach(ft => ft.draw(this.ctx));

        this.ctx.restore();
    }
}

window.addEventListener('load', () => {
    window.game = new DarkTowerGame();
});