/**
 * MOTOR PRINCIPAL DEL VIDEOJUEGO 'LA TORRE OSCURA'
 * Coordina bucle principal, máquina de estados, cámara, combate, jefes y persistencia.
 */

class DarkTowerGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        if (this.ctx) {
            this.ctx.imageSmoothingEnabled = false;
        }

        this.titleEyeCanvas = document.getElementById('titleEyeCanvas');
        this.titleEyeCtx = this.titleEyeCanvas ? this.titleEyeCanvas.getContext('2d') : null;
        if (this.titleEyeCtx) {
            this.titleEyeCtx.imageSmoothingEnabled = false;
        }

        // Estados del Juego
        this.STATE_TITLE = 'TITLE';
        this.STATE_PLAYING = 'PLAYING';
        this.STATE_PAUSED = 'PAUSED';
        this.STATE_GAMEOVER = 'GAMEOVER';
        this.STATE_VICTORY = 'VICTORY';
        this.state = this.STATE_TITLE;

        // Entidades y Mundo
        this.player = null;
        this.world = null;
        this.enemies = [];
        this.activeBoss = null;
        this.projectiles = [];
        this.particles = [];
        this.floatingTexts = [];
        this.lootDrops = [];

        // Entrada de Teclado y Ratón
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.camera = { x: 0, y: 0, width: 1024, height: 720 };

        // Ojo de la Cúspide
        this.eyeAngle = 0;
        this.eyePulse = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Eventos de teclado
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Eventos de ratón
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = e.clientX - rect.left + this.camera.x;
            this.mousePos.y = e.clientY - rect.top + this.camera.y;
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (this.state === this.STATE_PLAYING && this.player) {
                if (e.button === 0) {
                    this.player.attack(this.mousePos.x, this.mousePos.y, this.projectiles, this.particles);
                }
            }
        });

        // Botones del Menú Principal
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
            console.log("Sprites cargados con éxito.");
            window.uiManager.init();
            this.lastTime = performance.now();
            requestAnimationFrame((time) => this.loop(time));
        });
    }

    resize() {
        const container = document.getElementById('game-container');
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            if (this.ctx) {
                this.ctx.imageSmoothingEnabled = false;
            }
            this.camera.width = this.canvas.width;
            this.camera.height = this.canvas.height;
        }
    }

    handleKeyDown(e) {
        this.keys[e.key] = true;

        if (this.state === this.STATE_PLAYING) {
            if (e.key === 'i' || e.key === 'I') {
                window.uiManager.toggleInventory();
            } else if (e.key === 'c' || e.key === 'C') {
                window.uiManager.toggleStats();
            } else if (e.key === '1') {
                this.usePotion('potion_health');
            } else if (e.key === '2') {
                this.usePotion('potion_mana');
            } else if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
                this.checkInteractions();
            } else if (e.key === 'm' || e.key === 'M') {
                window.soundEngine.toggleMute();
            }
        } else if (this.state === this.STATE_PAUSED) {
            if (e.key === 'm' || e.key === 'M') {
                window.soundEngine.toggleMute();
            } else if (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Escape') {
                window.uiManager.closeLoreModal();
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

        if (floorNumber === 8) {
            const cx = Math.floor(this.world.cols / 2) * this.world.tileSize;
            const cy = Math.floor(this.world.rows / 2) * this.world.tileSize;
            this.activeBoss = new BossAbracadabra(cx, cy);
            window.soundEngine.startBgm(true);
        } else if (floorNumber === 10) {
            const cx = Math.floor(this.world.cols / 2) * this.world.tileSize;
            const cy = Math.floor(this.world.rows / 2) * this.world.tileSize;
            this.activeBoss = new BossHong(cx, cy);
            window.soundEngine.startBgm(true);
        } else {
            this.spawnFloorEnemies(floorNumber);
            window.soundEngine.startBgm(false);
        }

        this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, `PISO ${floorNumber}`, '#ffcc00', true));
    }

    spawnFloorEnemies(floor) {
        const count = 4 + floor * 2;
        const types = [];

        if (floor <= 2) types.push('bandit', 'skeleton', 'rat');
        else if (floor <= 4) types.push('bandit', 'skeleton', 'spider', 'rat');
        else if (floor <= 6) types.push('spider', 'werewolf', 'rat');
        else if (floor <= 7) types.push('werewolf', 'demon');
        else if (floor === 9) types.push('demon', 'werewolf');

        for (let i = 0; i < count; i++) {
            let placed = false;
            let tries = 0;
            while (!placed && tries < 50) {
                tries++;
                const r = Math.floor(Math.random() * (this.world.rows - 4)) + 2;
                const c = Math.floor(Math.random() * (this.world.cols - 4)) + 2;
                if (this.world.grid[r][c] === 0) {
                    const ex = c * this.world.tileSize + 16;
                    const ey = r * this.world.tileSize + 16;
                    if (Math.hypot(ex - this.player.x, ey - this.player.y) > 160) {
                        const randomType = types[Math.floor(Math.random() * types.length)];
                        this.enemies.push(new Enemy(randomType, ex, ey, floor));
                        placed = true;
                    }
                }
            }
        }
    }

    checkInteractions() {
        const p = this.player;
        const w = this.world;

        if (w.loreScroll && !w.loreScroll.collected) {
            const dist = Math.hypot(p.x - w.loreScroll.x, p.y - w.loreScroll.y);
            if (dist < 48) {
                w.loreScroll.collected = true;
                this.fetchAndShowLore(w.floor);
                return;
            }
        }

        if (w.stairs && w.stairsUnlocked) {
            const dist = Math.hypot(p.x - (w.stairs.x + 16), p.y - (w.stairs.y + 16));
            if (dist < 48) {
                if (w.floor < 10) {
                    this.loadFloor(w.floor + 1);
                    this.saveGame(1, true);
                } else {
                    this.triggerVictory();
                }
                return;
            }
        }

        w.chests.forEach(chest => {
            if (!chest.opened) {
                const dist = Math.hypot(p.x - (chest.x + 16), p.y - (chest.y + 16));
                if (dist < 48) {
                    chest.opened = true;
                    window.soundEngine.playItemPickup();
                    this.dropLoot('chest', chest.x + 16, chest.y + 16);
                }
            }
        });
    }

    async fetchAndShowLore(floor) {
        this.pauseForModal();
        try {
            const res = await fetch(`/api/lore/${floor}`);
            const data = await res.json();
            window.uiManager.showLoreModal(data);
            if (!this.player.loreUnlocked.includes(floor)) {
                this.player.loreUnlocked.push(floor);
            }
        } catch (e) {
            console.error(e);
            this.resumeFromModal();
        }
    }

    pauseForModal() {
        if (this.state === this.STATE_PLAYING) {
            this.state = this.STATE_PAUSED;
        }
    }

    resumeFromModal() {
        if (this.state === this.STATE_PAUSED) {
            this.state = this.STATE_PLAYING;
        }
    }

    usePotion(potionId) {
        const itemIdx = this.player.inventory.findIndex(i => i && i.id === potionId);
        if (itemIdx !== -1) {
            window.uiManager.handleSlotClick(itemIdx);
        }
    }

    dropLoot(sourceType, x, y) {
        let tableKey = sourceType;
        if (sourceType === 'chest') {
            const floor = (this.world && this.world.floor) ? this.world.floor : 1;
            if (floor <= 3) tableKey = 'chest_early';
            else if (floor <= 7) tableKey = 'chest_mid';
            else tableKey = 'chest_late';
        }

        const table = window.DROP_TABLES[tableKey] || window.DROP_TABLES[sourceType];
        if (!table) return;

        table.forEach(entry => {
            if (entry.goldMin !== undefined) {
                const goldAmt = Math.floor(Math.random() * (entry.goldMax - entry.goldMin + 1)) + entry.goldMin;
                if (goldAmt > 0) {
                    this.lootDrops.push(new GroundItem(
                        x + (Math.random() - 0.5) * 12,
                        y + (Math.random() - 0.5) * 12,
                        null, true, goldAmt
                    ));
                }
            } else if (Math.random() <= entry.chance) {
                const itemData = window.ITEM_DATABASE[entry.id];
                if (itemData) {
                    this.lootDrops.push(new GroundItem(
                        x + (Math.random() - 0.5) * 16,
                        y + (Math.random() - 0.5) * 16,
                        { ...itemData, qty: entry.qty || 1 }
                    ));
                }
            }
        });
    }

    triggerGameOver() {
        this.state = this.STATE_GAMEOVER;
        window.soundEngine.stopBgm();
        window.soundEngine.playTone(80, 'sawtooth', 0.8, 0.4);

        document.getElementById('game-hud').style.display = 'none';
        document.getElementById('game-over-screen').style.display = 'flex';

        document.getElementById('defeat-stats-summary').innerHTML = `
            <div>Héroe: ${this.player.name} (${this.player.characterClass.toUpperCase()})</div>
            <div>Nivel alcanzado: ${this.player.level}</div>
            <div>Piso en que cayó: ${this.world.floor} / 10</div>
            <div>Enemigos derrotados: ${this.player.enemiesKilled}</div>
            <div>Oro acumulado: ${this.player.gold} G</div>
        `;

        fetch('/api/hall_of_fame', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                player_name: this.player.name,
                character_class: this.player.characterClass,
                floor_reached: this.world.floor,
                level: this.player.level,
                enemies_killed: this.player.enemiesKilled,
                gold: this.player.gold,
                playtime_seconds: this.player.playtimeSeconds,
                outcome: 'DEFEAT'
            })
        });
    }

    triggerVictory() {
        this.state = this.STATE_VICTORY;
        window.soundEngine.stopBgm();
        window.soundEngine.playLevelUp();

        document.getElementById('game-hud').style.display = 'none';
        document.getElementById('victory-screen').style.display = 'flex';

        document.getElementById('victory-stats-summary').innerHTML = `
            <div>¡LA TORRE OSCURA HA SIDO PURIFICADA!</div>
            <div>Héroe Legendario: ${this.player.name} (${this.player.characterClass.toUpperCase()})</div>
            <div>Nivel Final: ${this.player.level}</div>
            <div>Enemigos y Jefes Eliminados: ${this.player.enemiesKilled}</div>
            <div>Fortuna Extraída: ${this.player.gold} G</div>
        `;

        fetch('/api/hall_of_fame', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                player_name: this.player.name,
                character_class: this.player.characterClass,
                floor_reached: 10,
                level: this.player.level,
                enemies_killed: this.player.enemiesKilled,
                gold: this.player.gold,
                playtime_seconds: this.player.playtimeSeconds,
                outcome: 'VICTORY'
            })
        });
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
            slot: slot,
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
            const res = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success && !silent) {
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
            this.player.inventory = data.inventory || new Array(30).fill(null);
            this.player.equipment = data.equipment || {};
            this.player.loreUnlocked = data.lore_unlocked || [];
            this.player.enemiesKilled = data.enemies_killed || 0;
            this.player.playtimeSeconds = data.playtime_seconds || 0;

            this.loadFloor(data.floor_reached || 1);
            this.state = this.STATE_PLAYING;
            window.soundEngine.startBgm(data.floor_reached === 8 || data.floor_reached === 10);
        } catch (e) {
            console.error(e);
        }
    }

    loop(timestamp) {
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        if (this.state === this.STATE_TITLE) {
            this.renderTitleEye();
        } else if (this.state === this.STATE_PLAYING) {
            this.update(dt);
            this.render();
        }

        requestAnimationFrame((time) => this.loop(time));
    }

    update(dt) {
        if (!this.player || !this.world) return;

        this.player.playtimeSeconds += dt;

        // 1. Actualizar Jugador
        this.player.update(this.keys, this.world, this.projectiles, this.particles);

        if (this.player.hp <= 0) {
            this.triggerGameOver();
            return;
        }

        // 2. Comprobar ataque cuerpo a cuerpo de Guerrera
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

            this.world.barrels.forEach(b => {
                if (!b.broken && Math.hypot(b.x + 16 - hb.x, b.y + 16 - hb.y) < hb.radius) {
                    b.broken = true;
                    window.soundEngine.playHit();
                    this.dropLoot('barrel', b.x + 16, b.y + 16);
                }
            });

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

        // 3. Actualizar Enemigos
        this.enemies.forEach(enemy => {
            enemy.update(this.player, this.world, this.projectiles, this.particles);
        });

        // 4. Actualizar Jefe Activo
        if (this.activeBoss) {
            this.activeBoss.update(this.player, this.world, this.projectiles, this.particles);
        }

        // 5. Actualizar Proyectiles y Colisiones
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(this.world, this.particles);

            if (p.life <= 0) {
                this.projectiles.splice(i, 1);
                continue;
            }

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

        // 6. Actualizar Objetos en el Suelo (Loot Drops) de forma INDEPENDIENTE
        for (let i = this.lootDrops.length - 1; i >= 0; i--) {
            const drop = this.lootDrops[i];
            drop.update(this.player, this.particles, this.world);
            if (drop.pickedUp) {
                this.lootDrops.splice(i, 1);
            }
        }

        // 7. Actualizar Partículas y Textos Flotantes
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) this.particles.splice(i, 1);
        }

        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            this.floatingTexts[i].update();
            if (this.floatingTexts[i].life <= 0) this.floatingTexts.splice(i, 1);
        }

        // 8. Actualizar Mundo
        this.world.update(this.particles);

        if (this.enemies.length === 0 && !this.activeBoss) {
            this.world.stairsUnlocked = true;
        }

        // 9. Cámara
        this.camera.x = Math.max(0, Math.min(this.world.cols * this.world.tileSize - this.camera.width, this.player.x - this.camera.width / 2));
        this.camera.y = Math.max(0, Math.min(this.world.rows * this.world.tileSize - this.camera.height, this.player.y - (this.camera.height / 2 + 35)));

        // 10. HUD y Minimapa
        window.uiManager.updateHUD(this.player, this.world);
        window.uiManager.renderMinimap(this.player, this.world);
    }

    killEnemy(index) {
        const enemy = this.enemies[index];
        this.player.enemiesKilled++;
        this.player.gainExp(enemy.expReward, this.floatingTexts);
        this.dropLoot(enemy.type, enemy.x, enemy.y);

        for (let i = 0; i < 12; i++) {
            this.particles.push(new Particle(
                enemy.x, enemy.y,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3,
                '#ff4444', 4, 20
            ));
        }

        this.enemies.splice(index, 1);
    }

    killBoss() {
        const boss = this.activeBoss;
        this.player.enemiesKilled++;
        this.player.gainExp(boss.name.includes('Abracadabra') ? 500 : 2000, this.floatingTexts);
        this.dropLoot(boss.name.includes('Abracadabra') ? 'abracadabra' : 'hong', boss.x, boss.y);

        for (let i = 0; i < 40; i++) {
            this.particles.push(new Particle(
                boss.x, boss.y,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
                '#ffcc00', 6, 40
            ));
        }

        this.activeBoss = null;
        window.soundEngine.startBgm(false);

        if (this.world.floor === 10) {
            setTimeout(() => this.triggerVictory(), 1500);
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));

        // 1. Terreno
        this.world.draw(this.ctx, this.camera);

        // 2. Objetos en el Suelo (Loot Drops)
        this.lootDrops.forEach(drop => drop.draw(this.ctx));

        // 3. Enemigos
        this.enemies.forEach(e => e.draw(this.ctx));

        // 4. Jefe
        if (this.activeBoss) this.activeBoss.draw(this.ctx);

        // 5. Jugador
        this.player.draw(this.ctx);

        // 6. Proyectiles
        this.projectiles.forEach(p => p.draw(this.ctx));

        // 7. Partículas
        this.particles.forEach(pt => pt.draw(this.ctx));

        // 8. Textos Flotantes
        this.floatingTexts.forEach(ft => ft.draw(this.ctx));

        this.ctx.restore();
    }

    renderTitleEye() {
        if (!this.titleEyeCtx) return;
        const ctx = this.titleEyeCtx;
        ctx.clearRect(0, 0, 120, 80);

        this.eyePulse += 0.05;
        const scale = 1 + Math.sin(this.eyePulse) * 0.08;

        ctx.save();
        ctx.translate(60, 40);
        ctx.scale(scale, scale);

        const radGrd = ctx.createRadialGradient(0, 0, 4, 0, 0, 35);
        radGrd.addColorStop(0, '#ffffff');
        radGrd.addColorStop(0.3, '#ffcc00');
        radGrd.addColorStop(0.6, '#ff2200');
        radGrd.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrd;
        ctx.beginPath();
        ctx.arc(0, 0, 35, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0a0000';
        ctx.beginPath();
        ctx.ellipse(0, 0, 4, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

window.addEventListener('load', () => {
    window.game = new DarkTowerGame();
});