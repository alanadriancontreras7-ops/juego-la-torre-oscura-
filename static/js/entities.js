/**
 * ENTIDADES DE JUEGO: JUGADOR, ENEMIGOS, JEFES Y PROYECTILES
 * Gestiona físicas, IA, animaciones en 4 direcciones, combate y partículas.
 */

class Particle {
    constructor(x, y, vx, vy, color, size, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.size = Math.max(0, this.size - 0.05);
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

class FloatingText {
    constructor(x, y, text, color = '#ffffff', isCrit = false) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.isCrit = isCrit;
        this.life = 45;
        this.vy = -1.2;
    }

    update() {
        this.y += this.vy;
        this.life--;
    }

    draw(ctx) {
        ctx.save();
        ctx.font = this.isCrit ? 'bold 13px "Press Start 2P"' : '10px "Press Start 2P"';
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.globalAlpha = Math.min(1, this.life / 20);
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

class Projectile {
    constructor(x, y, vx, vy, type, damage, owner) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type; // 'arrow', 'fireball', 'acid', 'void'
        this.damage = damage;
        this.owner = owner; // 'player' o 'enemy'
        this.life = 120;
        this.radius = type === 'fireball' || type === 'acid' ? 7 : (type === 'void' ? 9 : 4);
        this.pierce = type === 'void' ? 2 : 1;
        this.hitEntities = new Set();
    }

    update(world, particles) {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        // Rastro de partículas
        if (this.type === 'fireball') {
            particles.push(new Particle(this.x, this.y, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, '#ff7722', 4, 15));
            particles.push(new Particle(this.x, this.y, 0, 0, '#ffe066', 2, 10));
        } else if (this.type === 'acid') {
            particles.push(new Particle(this.x, this.y, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, '#77ff22', 4, 18));
        } else if (this.type === 'void') {
            particles.push(new Particle(this.x, this.y, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8, '#aa22ff', 5, 20));
        }

        // Colisión con muros
        if (world.isWallAt(this.x, this.y)) {
            this.life = 0;
            // Charco de ácido al impactar si es proyectil de Abracadabra
            if (this.type === 'acid') {
                world.addAcidPool(this.x, this.y);
            }
        }
    }

    draw(ctx) {
        ctx.save();
        if (this.type === 'arrow') {
            const angle = Math.atan2(this.vy, this.vx);
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-8, -1.5, 16, 3);
            ctx.fillStyle = '#b0b0b0';
            ctx.beginPath();
            ctx.moveTo(8, -3);
            ctx.lineTo(12, 0);
            ctx.lineTo(8, 3);
            ctx.fill();
        } else if (this.type === 'fireball') {
            ctx.fillStyle = '#ff4411';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffff66';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'acid') {
            ctx.fillStyle = '#66ee22';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ddff44';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'void') {
            ctx.fillStyle = '#110522';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#bb33ff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.restore();
    }
}

// ==============================================================================
// CLASE DEL JUGADOR
// ==============================================================================

class Player {
    constructor(characterClass = 'warrior', name = 'Aventurero') {
        this.name = name;
        this.characterClass = characterClass; // 'warrior', 'archer', 'mage'
        this.x = 200;
        this.y = 200;
        this.width = 24;
        this.height = 30;
        this.speed = 2.8;

        // Físicas y Retroceso (Knockback)
        this.vx = 0;
        this.vy = 0;
        this.knockbackX = 0;
        this.knockbackY = 0;

        // Animación en 4 Direcciones (0: Abajo, 1: Izq, 2: Der, 3: Arriba)
        this.direction = 0;
        this.animFrame = 0;
        this.animTimer = 0;
        this.isMoving = false;

        // Combate y Armas Visibles
        this.isAttacking = false;
        this.attackFrame = 0;
        this.attackTimer = 0;
        this.attackCooldown = 0;
        this.slashArcAngle = 0;

        // Feedback de daño
        this.flashRedTimer = 0;
        this.invulnerableTimer = 0;

        // Estadísticas y Progresión
        this.level = 1;
        this.exp = 0;
        this.nextExp = 100;
        this.attributePoints = 0;
        this.gold = 50;

        this.applyClassBaseStats();

        // Inventario (30 slots) y Equipamiento
        this.inventory = new Array(30).fill(null);
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };
        this.giveInitialEquipment();

        this.loreUnlocked = [];
        this.enemiesKilled = 0;
        this.playtimeSeconds = 0;
    }

    spawnPlayer(x, y) {
        if (x !== undefined && y !== undefined && x > 0 && y > 0) {
            this.x = x;
            this.y = y;
        }
        this.vx = 0;
        this.vy = 0;
        this.knockbackX = 0;
        this.knockbackY = 0;
        this.direction = 0; // Frente
        this.animFrame = 0;
        this.animTimer = 0;
        this.isMoving = false;
        this.isAttacking = false;
        this.attackFrame = 0;
        this.attackTimer = 0;
        this.slashHitbox = null;
    }

    resetPlayerPosition(x, y) {
        this.spawnPlayer(x, y);
    }

    applyClassBaseStats() {
        if (this.characterClass === 'warrior') {
            this.maxHp = 150;
            this.hp = 150;
            this.maxMp = 30;
            this.mp = 30;
            this.strength = 14;
            this.dexterity = 8;
            this.magic = 4;
            this.constitution = 14;
            this.speed = 2.7;
        } else if (this.characterClass === 'archer') {
            this.maxHp = 110;
            this.hp = 110;
            this.maxMp = 50;
            this.mp = 50;
            this.strength = 8;
            this.dexterity = 15;
            this.magic = 6;
            this.constitution = 10;
            this.speed = 3.2;
        } else if (this.characterClass === 'mage') {
            this.maxHp = 90;
            this.hp = 90;
            this.maxMp = 100;
            this.mp = 100;
            this.strength = 5;
            this.dexterity = 7;
            this.magic = 16;
            this.constitution = 8;
            this.speed = 2.8;
        }
    }

    giveInitialEquipment() {
        if (this.characterClass === 'warrior') {
            this.equipment.weapon = window.ITEM_DATABASE.sword_short;
            this.equipment.armor = window.ITEM_DATABASE.armor_leather;
        } else if (this.characterClass === 'archer') {
            this.equipment.weapon = window.ITEM_DATABASE.bow_hunter;
            this.equipment.armor = window.ITEM_DATABASE.armor_leather;
        } else if (this.characterClass === 'mage') {
            this.equipment.weapon = window.ITEM_DATABASE.staff_apprentice;
            this.equipment.armor = window.ITEM_DATABASE.armor_robe;
        }
        // Pociones iniciales en slots 0 y 1
        this.inventory[0] = { ...window.ITEM_DATABASE.potion_health, qty: 3 };
        this.inventory[1] = { ...window.ITEM_DATABASE.potion_mana, qty: 2 };
    }

    getTotalStats() {
        let totalStr = this.strength;
        let totalDex = this.dexterity;
        let totalMag = this.magic;
        let totalCon = this.constitution;
        let bonusAtk = 0;
        let bonusDef = 0;

        // Bonificaciones de equipamiento
        ['weapon', 'armor', 'accessory'].forEach(slot => {
            const item = this.equipment[slot];
            if (item) {
                if (item.str) totalStr += item.str;
                if (item.dex) totalDex += item.dex;
                if (item.mag) totalMag += item.mag;
                if (item.con) totalCon += item.con;
                if (item.atk) bonusAtk += item.atk;
                if (item.def) bonusDef += item.def;
            }
        });

        return {
            str: totalStr,
            dex: totalDex,
            mag: totalMag,
            con: totalCon,
            atk: bonusAtk + Math.floor(totalStr * 1.5 + totalDex * 0.5),
            def: bonusDef + Math.floor(totalCon * 0.8),
            critChance: Math.min(50, 5 + totalDex * 1.2)
        };
    }

    update(keys, world, projectiles, particles) {
        // Reducir temporizadores
        if (this.flashRedTimer > 0) this.flashRedTimer--;
        if (this.invulnerableTimer > 0) this.invulnerableTimer--;
        if (this.attackCooldown > 0) this.attackCooldown--;

        // Movimiento por teclado
        let dx = 0;
        let dy = 0;

        if (keys['w'] || keys['W'] || keys['ArrowUp']) dy -= 1;
        if (keys['s'] || keys['S'] || keys['ArrowDown']) dy += 1;
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) dx -= 1;
        if (keys['d'] || keys['D'] || keys['ArrowRight']) dx += 1;

        this.isMoving = (dx !== 0 || dy !== 0);

        if (this.isMoving) {
            // Normalizar dirección
            const length = Math.hypot(dx, dy) || 1;
            dx /= length;
            dy /= length;

            // Determinar dirección del sprite
            if (Math.abs(dx) > Math.abs(dy)) {
                this.direction = dx > 0 ? 2 : 1; // 2: Derecha, 1: Izquierda
            } else {
                this.direction = dy > 0 ? 0 : 3; // 0: Abajo, 3: Arriba
            }

            // Aplicar velocidad con colisión con el mapa
            const moveSpeed = this.speed;
            const newX = this.x + dx * moveSpeed + this.knockbackX;
            const newY = this.y + dy * moveSpeed + this.knockbackY;

            if (!world.isSolid(newX - this.width / 2, this.y - this.height / 2, this.width, this.height)) {
                this.x = newX;
            }
            if (!world.isSolid(this.x - this.width / 2, newY - this.height / 2, this.width, this.height)) {
                this.y = newY;
            }

            // Ciclo de animación de caminata (4 frames)
            this.animTimer++;
            if (this.animTimer >= 7) {
                this.animFrame = (this.animFrame + 1) % 4;
                this.animTimer = 0;
            }
        } else {
            this.animFrame = 0;
            this.animTimer = 0;
            // Mantener física de knockback incluso quieto
            if (Math.abs(this.knockbackX) > 0.1 || Math.abs(this.knockbackY) > 0.1) {
                if (!world.isSolid(this.x + this.knockbackX, this.y, this.width, this.height)) {
                    this.x += this.knockbackX;
                }
                if (!world.isSolid(this.x, this.y + this.knockbackY, this.width, this.height)) {
                    this.y += this.knockbackY;
                }
            }
        }

        // Amortiguación del knockback suave
        this.knockbackX *= 0.82;
        this.knockbackY *= 0.82;

        // Animación de ataque
        if (this.isAttacking) {
            this.attackTimer++;
            if (this.attackTimer % 5 === 0) {
                this.attackFrame++;
                if (this.attackFrame >= 3) {
                    this.isAttacking = false;
                    this.attackFrame = 0;
                }
            }
        }

        // Regeneración pasiva lenta de maná
        if (this.mp < this.maxMp && Math.random() < 0.05) {
            this.mp = Math.min(this.maxMp, this.mp + 1);
        }

        // Daño por charco de ácido en piso 8
        if (world.isInAcid(this.x, this.y)) {
            if (this.invulnerableTimer === 0) {
                this.takeDamage(6, 0, 0);
                particles.push(new Particle(this.x, this.y, (Math.random() - 0.5) * 2, -1, '#66ee22', 5, 20));
            }
        }
    }

    attack(targetX, targetY, projectiles, particles) {
        if (this.attackCooldown > 0 || this.isAttacking) return;

        this.isAttacking = true;
        this.attackFrame = 0;
        this.attackTimer = 0;
        this.attackCooldown = 18;

        const stats = this.getTotalStats();
        const angle = Math.atan2(targetY - this.y, targetX - this.x);

        // Orientar sprite hacia el objetivo del ataque
        if (Math.abs(targetX - this.x) > Math.abs(targetY - this.y)) {
            this.direction = (targetX > this.x) ? 2 : 1;
        } else {
            this.direction = (targetY > this.y) ? 0 : 3;
        }

        if (this.characterClass === 'warrior') {
            window.soundEngine.playSwordSlash();
            // Partículas de corte metálico brillante
            const slashDist = 28;
            const sx = this.x + Math.cos(angle) * slashDist;
            const sy = this.y + Math.sin(angle) * slashDist;
            for (let i = 0; i < 8; i++) {
                particles.push(new Particle(
                    sx, sy,
                    Math.cos(angle + (Math.random() - 0.5)) * 3,
                    Math.sin(angle + (Math.random() - 0.5)) * 3,
                    '#b0e0ff', 4, 15
                ));
            }
            // Área de golpe cuerpo a cuerpo
            this.slashHitbox = {
                x: sx,
                y: sy,
                radius: 36,
                damage: stats.atk,
                angle: angle
            };
        } else if (this.characterClass === 'archer') {
            window.soundEngine.playArrowShot();
            const arrowSpeed = 8.5;
            projectiles.push(new Projectile(
                this.x, this.y,
                Math.cos(angle) * arrowSpeed,
                Math.sin(angle) * arrowSpeed,
                'arrow',
                stats.atk,
                'player'
            ));
        } else if (this.characterClass === 'mage') {
            if (this.mp >= 8) {
                this.mp -= 8;
                window.soundEngine.playMagicCast();
                const magicSpeed = 5.5;
                projectiles.push(new Projectile(
                    this.x, this.y,
                    Math.cos(angle) * magicSpeed,
                    Math.sin(angle) * magicSpeed,
                    'fireball',
                    stats.atk + 8,
                    'player'
                ));
            } else {
                window.soundEngine.playTone(150, 'sine', 0.1, 0.2); // Sin maná
            }
        }
    }

    takeDamage(damage, sourceX = 0, sourceY = 0) {
        if (this.invulnerableTimer > 0) return;

        const stats = this.getTotalStats();
        const actualDmg = Math.max(1, damage - Math.floor(stats.def * 0.4));
        this.hp = Math.max(0, this.hp - actualDmg);

        this.flashRedTimer = 10;
        this.invulnerableTimer = 25;
        window.soundEngine.playHit();

        // Retroceso (Knockback) físico direccional suave
        if (sourceX !== 0 || sourceY !== 0) {
            const kbAngle = Math.atan2(this.y - sourceY, this.x - sourceX);
            this.knockbackX = Math.cos(kbAngle) * 5.0;
            this.knockbackY = Math.sin(kbAngle) * 5.0;
        }

        return actualDmg;
    }

    gainExp(amount, floatingTexts) {
        this.exp += amount;
        floatingTexts.push(new FloatingText(this.x, this.y - 20, `+${amount} EXP`, '#f39c12'));

        if (this.exp >= this.nextExp) {
            this.levelUp(floatingTexts);
        }
    }

    levelUp(floatingTexts) {
        this.level++;
        this.exp -= this.nextExp;
        this.nextExp = Math.floor(this.nextExp * 1.5);
        this.attributePoints += 3;

        // Aumentar HP/MP al subir de nivel
        this.maxHp += 15;
        this.hp = this.maxHp;
        this.maxMp += 10;
        this.mp = this.maxMp;

        window.soundEngine.playLevelUp();
        floatingTexts.push(new FloatingText(this.x, this.y - 40, '¡NIVEL SUPERADO!', '#ffd700', true));
    }

    draw(ctx) {
        const frameW = 48;
        const frameH = 48;
        const destW = 48;
        const destH = 48;
        const dx = Math.floor(this.x - destW / 2);
        const dy = Math.floor(this.y - destH / 2 - 6);

        let col = this.animFrame;
        if (this.isAttacking) {
            col = 4 + this.attackFrame;
        }
        let row = this.direction;

        const flash = this.flashRedTimer > 0;
        window.spriteManager.draw(
            ctx,
            this.characterClass,
            col, row,
            frameW, frameH,
            dx, dy, destW, destH,
            false,
            flash
        );
    }
}

// ==============================================================================
// CLASE DE ENEMIGOS BASE
// ==============================================================================

class Enemy {
    constructor(type, x, y, floor = 1) {
        this.type = type; // 'bandit', 'skeleton', 'spider', 'werewolf', 'demon'
        this.x = x;
        this.y = y;
        this.floor = floor;

        this.direction = 0;
        this.animFrame = 0;
        this.animTimer = 0;

        this.knockbackX = 0;
        this.knockbackY = 0;
        this.flashRedTimer = 0;
        this.attackCooldown = 0;

        this.initStats();
    }

    initStats() {
        const fMod = 1 + (this.floor - 1) * 0.22;

        if (this.type === 'bandit') {
            this.name = 'Bandido de Cripta';
            this.maxHp = Math.floor(35 * fMod);
            this.atk = Math.floor(8 * fMod);
            this.speed = 1.9;
            this.expReward = 25;
            this.width = 24;
            this.height = 28;
            this.spriteKey = 'bandit';
            this.frameSize = 48;
        } else if (this.type === 'skeleton') {
            this.name = 'Esqueleto del Osario';
            this.maxHp = Math.floor(45 * fMod);
            this.atk = Math.floor(10 * fMod);
            this.speed = 1.5;
            this.expReward = 32;
            this.width = 24;
            this.height = 30;
            this.spriteKey = 'skeleton';
            this.frameSize = 48;
        } else if (this.type === 'spider') {
            this.name = 'Araña Ponzoñosa';
            this.maxHp = Math.floor(38 * fMod);
            this.atk = Math.floor(12 * fMod);
            this.speed = 2.4;
            this.expReward = 35;
            this.width = 30;
            this.height = 24;
            this.spriteKey = 'spider';
            this.frameSize = 48;
        } else if (this.type === 'rat') {
            this.name = 'Rata Gigante de Cloaca';
            this.maxHp = Math.floor(32 * fMod);
            this.atk = Math.floor(9 * fMod);
            this.speed = 2.6;
            this.expReward = 28;
            this.width = 24;
            this.height = 22;
            this.spriteKey = 'rat';
            this.frameSize = 48;
        } else if (this.type === 'werewolf') {
            this.name = 'Hombre Lobo Feral';
            this.maxHp = Math.floor(75 * fMod);
            this.atk = Math.floor(18 * fMod);
            this.speed = 2.7;
            this.expReward = 60;
            this.width = 32;
            this.height = 36;
            this.spriteKey = 'werewolf';
            this.frameSize = 56;
        } else if (this.type === 'demon') {
            this.name = 'Demonio Menor de Obsidiana';
            this.maxHp = Math.floor(95 * fMod);
            this.atk = Math.floor(22 * fMod);
            this.speed = 2.0;
            this.expReward = 85;
            this.width = 32;
            this.height = 36;
            this.spriteKey = 'demon';
            this.frameSize = 56;
        }
        this.hp = this.maxHp;
    }

    update(player, world, projectiles, particles) {
        if (this.flashRedTimer > 0) this.flashRedTimer--;
        if (this.attackCooldown > 0) this.attackCooldown--;

        const dist = Math.hypot(player.x - this.x, player.y - this.y);

        // IA de Persecución si el jugador está en rango de visión (260px)
        if (dist < 260) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);

            // Dirección del sprite
            if (Math.abs(player.x - this.x) > Math.abs(player.y - this.y)) {
                this.direction = player.x > this.x ? 2 : 1;
            } else {
                this.direction = player.y > this.y ? 0 : 3;
            }

            // Distancia de ataque
            const attackDist = this.type === 'demon' ? 140 : (this.type === 'spider' ? 100 : 26);

            if (dist > attackDist) {
                const nx = this.x + Math.cos(angle) * this.speed + this.knockbackX;
                const ny = this.y + Math.sin(angle) * this.speed + this.knockbackY;

                if (!world.isSolid(nx - this.width / 2, this.y - this.height / 2, this.width, this.height)) {
                    this.x = nx;
                }
                if (!world.isSolid(this.x - this.width / 2, ny - this.height / 2, this.width, this.height)) {
                    this.y = ny;
                }

                this.animTimer++;
                if (this.animTimer >= 8) {
                    this.animFrame = (this.animFrame + 1) % 4;
                    this.animTimer = 0;
                }
            } else {
                // Ejecutar ataque si el cooldown está listo
                if (this.attackCooldown <= 0) {
                    this.executeAttack(player, angle, projectiles, particles);
                }
            }
        }

        // Amortiguación de knockback
        this.knockbackX *= 0.82;
        this.knockbackY *= 0.82;
    }

    executeAttack(player, angle, projectiles, particles) {
        this.attackCooldown = 45;

        if (this.type === 'spider') {
            // Escupitajo de veneno
            projectiles.push(new Projectile(this.x, this.y, Math.cos(angle) * 4.5, Math.sin(angle) * 4.5, 'acid', this.atk, 'enemy'));
        } else if (this.type === 'demon') {
            // Orbe de vacío
            projectiles.push(new Projectile(this.x, this.y, Math.cos(angle) * 4.0, Math.sin(angle) * 4.0, 'void', this.atk, 'enemy'));
        } else {
            // Golpe cuerpo a cuerpo
            player.takeDamage(this.atk, this.x, this.y);
            // Partículas de impacto
            for (let i = 0; i < 5; i++) {
                particles.push(new Particle(player.x, player.y, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, '#ff3333', 3, 12));
            }
        }
    }

    takeDamage(damage, sourceX, sourceY) {
        this.hp = Math.max(0, this.hp - damage);
        this.flashRedTimer = 8;
        window.soundEngine.playHit();

        // Retroceso directional suave
        const angle = Math.atan2(this.y - sourceY, this.x - sourceX);
        this.knockbackX = Math.cos(angle) * 4.5;
        this.knockbackY = Math.sin(angle) * 4.5;

        return this.hp <= 0;
    }

    draw(ctx) {
        const destW = this.frameSize;
        const destH = this.frameSize;
        const dx = Math.floor(this.x - destW / 2);
        const dy = Math.floor(this.y - destH / 2 - 4);

        window.spriteManager.draw(
            ctx,
            this.spriteKey,
            this.animFrame,
            this.direction,
            this.frameSize,
            this.frameSize,
            dx, dy, destW, destH,
            false,
            this.flashRedTimer > 0
        );

        // Barra de vida pequeña sobre enemigo herido
        if (this.hp < this.maxHp) {
            const barW = 28;
            const barH = 4;
            const bx = this.x - barW / 2;
            const by = this.y - this.height / 2 - 12;

            ctx.fillStyle = '#100a12';
            ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
            ctx.fillStyle = '#ff2a3b';
            ctx.fillRect(bx, by, Math.max(0, (this.hp / this.maxHp) * barW), barH);
        }
    }
}

// ==============================================================================
// SUB-JEFE ABRACADABRA (Piso 8) - 72x72
// ==============================================================================

class BossAbracadabra {
    constructor(x, y) {
        this.name = 'Sub-Jefe Abracadabra';
        this.x = x;
        this.y = y;
        this.maxHp = 650;
        this.hp = 650;
        this.atk = 26;
        this.width = 44;
        this.height = 46;

        this.state = 'walk'; // 'walk', 'swell', 'vomit', 'charge', 'exhausted'
        this.stateTimer = 0;
        this.animFrame = 0;
        this.direction = 0;

        this.chargeVx = 0;
        this.chargeVy = 0;
        this.flashRedTimer = 0;
        this.knockbackX = 0;
        this.knockbackY = 0;
    }

    update(player, world, projectiles, particles) {
        if (this.flashRedTimer > 0) this.flashRedTimer--;

        this.stateTimer++;
        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        const angle = Math.atan2(player.y - this.y, player.x - this.x);

        if (this.state === 'walk') {
            // Caminar hacia el jugador lentamente
            const speed = 1.3;
            this.x += Math.cos(angle) * speed;
            this.y += Math.sin(angle) * speed;

            if (this.stateTimer % 12 === 0) {
                this.animFrame = (this.animFrame + 1) % 4;
            }

            // Cambiar a hinchado de tórax cada 160 frames (~2.6 segundos)
            if (this.stateTimer > 160) {
                this.state = 'swell';
                this.stateTimer = 0;
                this.animFrame = 0;
                window.soundEngine.playBossRoar();
            }
        } else if (this.state === 'swell') {
            // Hinchando el tórax visiblemente
            this.animFrame = Math.min(3, Math.floor(this.stateTimer / 15));

            // Partículas neón de advertencia alrededor de sus pústulas
            particles.push(new Particle(
                this.x + (Math.random() - 0.5) * 30,
                this.y - 10 + (Math.random() - 0.5) * 20,
                0, -1, '#b4ff1e', 4, 15
            ));

            if (this.stateTimer > 60) { // 1 segundo hinchando
                // Decidir entre vómito ácido o embestida
                if (Math.random() < 0.5) {
                    this.state = 'vomit';
                    this.stateTimer = 0;
                    this.animFrame = 0;
                    this.spewAcid(angle, projectiles, particles);
                } else {
                    this.state = 'charge';
                    this.stateTimer = 0;
                    this.chargeVx = Math.cos(angle) * 6.5;
                    this.chargeVy = Math.sin(angle) * 6.5;
                }
            }
        } else if (this.state === 'vomit') {
            this.animFrame = Math.min(3, Math.floor(this.stateTimer / 10));
            // Dejar charcos de ácido cerca
            if (this.stateTimer > 40) {
                this.state = 'exhausted';
                this.stateTimer = 0;
            }
        } else if (this.state === 'charge') {
            // Embestida pesada a gran velocidad
            const nx = this.x + this.chargeVx;
            const ny = this.y + this.chargeVy;

            // Rastro de polvo y lodo
            particles.push(new Particle(this.x, this.y + 16, -this.chargeVx * 0.2, -0.5, '#6b5438', 5, 20));

            if (world.isSolid(nx, ny, this.width, this.height) || this.stateTimer > 35) {
                // Impacto o fin de embestida -> Agotado
                this.state = 'exhausted';
                this.stateTimer = 0;
            } else {
                this.x = nx;
                this.y = ny;
                // Daño por contacto durante la embestida
                if (dist < 38) {
                    player.takeDamage(this.atk + 10, this.x, this.y);
                }
            }
        } else if (this.state === 'exhausted') {
            // Queda exhausto 2 segundos (120 frames), vulnerable a contraataques
            this.animFrame = 0;
            if (this.stateTimer > 110) {
                this.state = 'walk';
                this.stateTimer = 0;
            }
        }
    }

    spewAcid(centerAngle, projectiles, particles) {
        window.soundEngine.playAcidSpit();
        // Disparar abanico de 5 proyectiles de ácido
        const spread = [-0.4, -0.2, 0, 0.2, 0.4];
        spread.forEach(offset => {
            const a = centerAngle + offset;
            projectiles.push(new Projectile(
                this.x, this.y,
                Math.cos(a) * 4.2, Math.sin(a) * 4.2,
                'acid',
                this.atk,
                'enemy'
            ));
        });
    }

    takeDamage(damage, sourceX, sourceY) {
        // Recibe 30% más de daño cuando está agotado
        const mul = (this.state === 'exhausted') ? 1.3 : 1.0;
        const actual = Math.floor(damage * mul);
        this.hp = Math.max(0, this.hp - actual);
        this.flashRedTimer = 6;
        window.soundEngine.playHit();
        return this.hp <= 0;
    }

    draw(ctx) {
        const destW = 72;
        const destH = 72;
        const dx = Math.floor(this.x - destW / 2);
        const dy = Math.floor(this.y - destH / 2 - 8);

        let row = 0; // walk
        if (this.state === 'swell') row = 1;
        else if (this.state === 'vomit') row = 2;
        else if (this.state === 'charge') row = 3;

        window.spriteManager.draw(
            ctx,
            'abracadabra',
            this.animFrame,
            row,
            72, 72,
            dx, dy, destW, destH,
            false,
            this.flashRedTimer > 0
        );
    }
}

// ==============================================================================
// JEFE FINAL HONG DEVORADOR DE HOMBRES (Piso 10) - 96x96
// ==============================================================================

class BossHong {
    constructor(x, y) {
        this.name = 'Hong Devorador de Hombres';
        this.x = x;
        this.y = y;
        this.maxHp = 1400;
        this.hp = 1400;
        this.atk = 34;
        this.width = 60;
        this.height = 64;

        this.state = 'idle'; // 'idle', 'barrage', 'cleave', 'devour'
        this.stateTimer = 0;
        this.animFrame = 0;
        this.flashRedTimer = 0;
    }

    update(player, world, projectiles, particles) {
        if (this.flashRedTimer > 0) this.flashRedTimer--;

        this.stateTimer++;
        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        const angle = Math.atan2(player.y - this.y, player.x - this.x);

        // Fauces abriéndose cíclicamente en el torso
        if (this.stateTimer % 10 === 0) {
            this.animFrame = (this.animFrame + 1) % 4;
        }

        // Rastro de miasma de vacío continuo
        particles.push(new Particle(
            this.x + (Math.random() - 0.5) * 50,
            this.y + (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 0.5, -0.8,
            '#aa22ee', 5, 25
        ));

        if (this.state === 'idle') {
            // Moverse amenazadoramente hacia el jugador
            const speed = 1.4;
            this.x += Math.cos(angle) * speed;
            this.y += Math.sin(angle) * speed;

            if (this.stateTimer > 120) {
                this.stateTimer = 0;
                const rand = Math.random();
                if (rand < 0.45) {
                    this.state = 'barrage'; // Erupción de proyectiles de vacío
                    window.soundEngine.playBossRoar();
                } else {
                    this.state = 'cleave'; // Zarpazo demoledor
                }
            }
        } else if (this.state === 'barrage') {
            // Disparar anillo de 8 orbes de vacío desde las fauces del torso
            if (this.stateTimer === 30) {
                for (let i = 0; i < 8; i++) {
                    const a = (i * Math.PI * 2) / 8;
                    projectiles.push(new Projectile(
                        this.x, this.y,
                        Math.cos(a) * 3.8, Math.sin(a) * 3.8,
                        'void',
                        this.atk,
                        'enemy'
                    ));
                }
            }
            if (this.stateTimer > 60) {
                this.state = 'idle';
                this.stateTimer = 0;
            }
        } else if (this.state === 'cleave') {
            // Cargar y asestar zarpazo gigante
            if (this.stateTimer === 25) {
                window.soundEngine.playSwordSlash();
                if (dist < 80) {
                    player.takeDamage(this.atk + 12, this.x, this.y);
                }
                // Arco de zarpazo visible
                for (let i = 0; i < 15; i++) {
                    particles.push(new Particle(
                        this.x + Math.cos(angle) * 45,
                        this.y + Math.sin(angle) * 45,
                        (Math.random() - 0.5) * 4,
                        (Math.random() - 0.5) * 4,
                        '#ff2244', 5, 18
                    ));
                }
            }
            if (this.stateTimer > 55) {
                this.state = 'idle';
                this.stateTimer = 0;
            }
        }
    }

    takeDamage(damage, sourceX, sourceY) {
        this.hp = Math.max(0, this.hp - damage);
        this.flashRedTimer = 6;
        window.soundEngine.playHit();
        return this.hp <= 0;
    }

    draw(ctx) {
        const destW = 96;
        const destH = 96;
        const dx = Math.floor(this.x - destW / 2);
        const dy = Math.floor(this.y - destH / 2 - 10);

        const row = (this.state === 'cleave') ? 1 : 0;

        window.spriteManager.draw(
            ctx,
            'hong',
            this.animFrame,
            row,
            96, 96,
            dx, dy, destW, destH,
            false,
            this.flashRedTimer > 0
        );
    }
}

window.Player = Player;
window.Enemy = Enemy;
window.BossAbracadabra = BossAbracadabra;
window.BossHong = BossHong;
window.Projectile = Projectile;
window.Particle = Particle;
window.FloatingText = FloatingText;
