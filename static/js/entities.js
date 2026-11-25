/**
 * ENTIDADES DE JUEGO: JUGADOR CON BONOS DE CONJUNTO, ENEMIGOS REBALANCEADOS Y JEFES
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

const PROJECTILE_LOOKS = [
    { a: '#ff7722', b: '#ffe066' },
    { a: '#b04aff', b: '#f0c0ff' },
    { a: '#7fdcff', b: '#ffffff' }
];

class Projectile {
    constructor(x, y, vx, vy, type, damage, owner, look = 0) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type;
        this.damage = damage;
        this.owner = owner;
        this.look = look;
        this.life = 120;
        this.radius = type === 'fireball' || type === 'acid' ? 7 : (type === 'void' ? 9 : (type === 'slash' ? 8 : 4));
        this.pierce = type === 'void' ? 2 : 1;
        this.hitEntities = new Set();
    }

    update(world, particles) {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        const fx = PROJECTILE_LOOKS[this.look] || PROJECTILE_LOOKS[0];
        if (this.type === 'fireball') {
            particles.push(new Particle(this.x, this.y, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, fx.a, 4, 15));
            particles.push(new Particle(this.x, this.y, 0, 0, fx.b, 2, 10));
        } else if (this.type === 'arrow' && this.look > 0) {
            particles.push(new Particle(this.x, this.y, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, this.look === 1 ? '#ff3a5c' : fx.a, 3, 12));
        } else if (this.type === 'acid') {
            particles.push(new Particle(this.x, this.y, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, '#77ff22', 4, 18));
        } else if (this.type === 'void') {
            particles.push(new Particle(this.x, this.y, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8, '#aa22ff', 5, 20));
        } else if (this.type === 'slash') {
            particles.push(new Particle(this.x, this.y, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, '#70d6ff', 3.5, 12));
        }

        if (world.isWallAt(this.x, this.y)) {
            this.life = 0;
            if (this.type === 'acid') {
                world.addAcidPool(this.x, this.y);
            }
        }
        // Dentro del método update(world, particles) de Projectile:
        if (this.type === 'homing' || this.type === 'curved_arrow') {
            // Persiguen suavemente al jugador
            if (window.game && window.game.player) {
                const target = window.game.player;
                const angleToPlayer = Math.atan2(target.y - this.y, target.x - this.x);
                const currentAngle = Math.atan2(this.vy, this.vx);
                const turnSpeed = this.type === 'homing' ? 0.045 : 0.025;
                const newAngle = currentAngle + Math.sin(angleToPlayer - currentAngle) * turnSpeed;
                const currentSpeed = Math.hypot(this.vx, this.vy);
                this.vx = Math.cos(newAngle) * currentSpeed;
                this.vy = Math.sin(newAngle) * currentSpeed;
            }
            particles.push(new Particle(this.x, this.y, 0, 0, this.type === 'homing' ? '#9b59b6' : '#2ecc71', 3, 10));
        }
    }

    draw(ctx) {
        ctx.save();
        if (this.type === 'arrow') {
            const angle = Math.atan2(this.vy, this.vx);
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);
            const lk = this.look || 0;
            if (lk > 0) {
                ctx.globalAlpha = 0.35;
                ctx.fillStyle = lk === 1 ? '#ff3a5c' : '#9fe8ff';
                ctx.fillRect(-10, -3.5, 22, 7);
                ctx.globalAlpha = 1;
            }
            ctx.fillStyle = ['#ffffff', '#3a2a50', '#ffe9a0'][lk];
            ctx.fillRect(-8, -1.5, 16, 3);
            ctx.fillStyle = ['#b0b0b0', '#ff6a28', '#bff3ff'][lk];
            ctx.beginPath();
            ctx.moveTo(8, -3);
            ctx.lineTo(12, 0);
            ctx.lineTo(8, 3);
            ctx.fill();
        } else if (this.type === 'fireball') {
            ctx.fillStyle = ['#ff4411', '#7a22d8', '#3fb4ff'][this.look || 0];
            ctx.beginPath();
            ctx.arc(this.x, this.y, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = ['#ffff66', '#f0b0ff', '#ffffff'][this.look || 0];
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
        } else if (this.type === 'slash') {
            const angle = Math.atan2(this.vy, this.vx);
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);
            ctx.strokeStyle = '#00d2d3';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, 16, -Math.PI / 3, Math.PI / 3);
            ctx.stroke();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(-2, 0, 14, -Math.PI / 3, Math.PI / 3);
            ctx.stroke();
        }
        ctx.restore();
    }
}

class GroundItem {
    constructor(x, y, item, isGold = false, goldAmount = 0) {
        this.x = x;
        this.y = y;
        this.item = item;
        this.isGold = isGold;
        this.goldAmount = goldAmount;

        const spreadAngle = Math.random() * Math.PI * 2;
        const spreadSpeed = 1.0 + Math.random() * 2.2;
        this.vx = Math.cos(spreadAngle) * spreadSpeed;
        this.vy = Math.sin(spreadAngle) * spreadSpeed;

        this.bobTimer = Math.random() * Math.PI * 2;
        this.life = 0;
        this.pickupDelay = 12;
        this.pickedUp = false;

        if (this.isGold) {
            this.color = '#f1c40f';
            this.name = `${this.goldAmount} Oro`;
            this.rarity = 'COMMON';
        } else if (this.item) {
            const rInfo = window.ITEM_RARITIES[this.item.rarity] || window.ITEM_RARITIES.COMMON;
            this.color = rInfo.color;
            this.name = this.item.name;
            this.rarity = this.item.rarity;
        }
    }

    canPlayerPickup(player) {
        if (!player) return false;
        if (this.isGold) return true;
        if (!this.item) return false;

        if (this.item.type === 'consumable' || this.item.type === 'material') {
            const existing = player.inventory.find(s => s && s.id === this.item.id);
            if (existing) return true;
        }

        return player.inventory.some(s => s === null);
    }

    update(player, particles, world) {
        this.life++;
        this.bobTimer += 0.08;

        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.85;
        this.vy *= 0.85;

        if (world && world.isWallAt(this.x, this.y)) {
            this.x -= this.vx * 1.5;
            this.y -= this.vy * 1.5;
        }

        if (!this.isGold && this.item && this.rarity === 'LEGENDARY' && Math.random() < 0.28) {
            particles.push(new Particle(this.x + (Math.random() - 0.5) * 14, this.y + (Math.random() - 0.5) * 10, 0, -0.6, '#fdcb6e', 3.5, 20));
        }

        if (this.life < this.pickupDelay) return;

        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        const canPickup = this.canPlayerPickup(player);

        if (dist < 50 && canPickup) {
            const pullAngle = Math.atan2(player.y - this.y, player.x - this.x);
            this.x += Math.cos(pullAngle) * 3.8;
            this.y += Math.sin(pullAngle) * 3.8;
        }

        if (dist < 26) {
            if (canPickup) {
                this.tryPickup(player);
            } else {
                if (!player.invFullWarningTimer || player.invFullWarningTimer <= 0) {
                    player.invFullWarningTimer = 60;
                    if (window.game && window.game.floatingTexts) {
                        window.game.floatingTexts.push(new FloatingText(player.x, player.y - 25, '¡INVENTARIO LLENO!', '#ff3333', true));
                    }
                }
            }
        }
    }

    tryPickup(player) {
        if (this.pickedUp) return;

        if (this.isGold) {
            player.gold += this.goldAmount;
            window.soundEngine.playItemPickup();
            if (window.game && window.game.floatingTexts) {
                window.game.floatingTexts.push(new FloatingText(this.x, this.y - 12, `+${this.goldAmount} G`, '#f1c40f'));
            }
            this.pickedUp = true;
            return;
        }

        if (!this.item) return;

        if (this.item.type === 'consumable' || this.item.type === 'material') {
            const existingIdx = player.inventory.findIndex(s => s && s.id === this.item.id);
            if (existingIdx !== -1) {
                player.inventory[existingIdx].qty = (player.inventory[existingIdx].qty || 1) + (this.item.qty || 1);
                this.onSuccessfulPickup(player);
                return;
            }
        }

        const emptyIdx = player.inventory.findIndex(s => s === null);
        if (emptyIdx !== -1) {
            player.inventory[emptyIdx] = { ...this.item, qty: this.item.qty || 1 };
            this.onSuccessfulPickup(player);
        }
    }

    onSuccessfulPickup(player) {
        this.pickedUp = true;
        window.soundEngine.playItemPickup();

        if (window.game && window.game.floatingTexts) {
            const rInfo = window.ITEM_RARITIES[this.item.rarity] || window.ITEM_RARITIES.COMMON;
            window.game.floatingTexts.push(new FloatingText(this.x, this.y - 18, `+ ${this.item.name}`, rInfo.color, true));
        }

        if (window.uiManager && document.getElementById('inventory-modal').style.display === 'flex') {
            window.uiManager.renderInventory();
        }
    }

    draw(ctx) {
        ctx.save();
        const floatY = Math.sin(this.bobTimer) * 3;
        const drawX = Math.floor(this.x);
        const drawY = Math.floor(this.y + floatY);

        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(drawX, drawY, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        const iconSize = 20;
        const iconIdx = this.isGold ? 9 : (this.item ? (this.item.icon || 0) : 0);
        window.spriteManager.drawIcon(ctx, iconIdx, drawX - iconSize / 2, drawY - iconSize / 2, iconSize);
        ctx.restore();
    }
}

class Player {
    constructor(characterClass = 'warrior', name = 'Aventurero') {
        this.name = name;
        this.characterClass = characterClass;
        this.x = 200;
        this.y = 200;
        this.width = 24;
        this.height = 30;
        this.speed = 2.8;

        this.vx = 0;
        this.vy = 0;
        this.knockbackX = 0;
        this.knockbackY = 0;

        this.direction = 0;
        this.animFrame = 0;
        this.animTimer = 0;
        this.isMoving = false;

        this.isAttacking = false;
        this.attackFrame = 0;
        this.attackTimer = 0;
        this.attackCooldown = 0;

        this.flashRedTimer = 0;
        this.invulnerableTimer = 0;
        this.invFullWarningTimer = 0;
        this.abilityCooldown = 0;

        this.level = 1;
        this.exp = 0;
        this.nextExp = 100;
        this.attributePoints = 0;
        this.gold = 50;

        this.applyClassBaseStats();

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
        this.direction = 0;
        this.animFrame = 0;
        this.animTimer = 0;
        this.isMoving = false;
        this.isAttacking = false;
        this.attackFrame = 0;
        this.attackTimer = 0;
        this.slashHitbox = null;
    }

    applyClassBaseStats() {
        if (this.characterClass === 'warrior') {
            this.maxHp = 150; this.hp = 150; this.maxMp = 30; this.mp = 30;
            this.strength = 14; this.dexterity = 8; this.magic = 4; this.constitution = 14; this.speed = 2.7;
        } else if (this.characterClass === 'archer') {
            this.maxHp = 110; this.hp = 110; this.maxMp = 50; this.mp = 50;
            this.strength = 8; this.dexterity = 15; this.magic = 6; this.constitution = 10; this.speed = 3.2;
        } else if (this.characterClass === 'mage') {
            this.maxHp = 90; this.hp = 90; this.maxMp = 100; this.mp = 100;
            this.strength = 5; this.dexterity = 7; this.magic = 16; this.constitution = 8; this.speed = 2.8;
        }
    }

    getTotalStats() {
        let totalStr = this.strength;
        let totalDex = this.dexterity;
        let totalMag = this.magic;
        let totalCon = this.constitution;
        let bonusAtk = 0;
        let bonusDef = 0;

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

        const wLook = this.getWeaponLook();
        const aLook = this.getArmorLook();
        let setBonusName = null;

        if (wLook === 1 && aLook === 1) {
            bonusAtk += 8;
            totalStr += 3;
            setBonusName = 'SET DEMONÍACO (+8 ATK)';
        } else if (wLook === 2 && aLook === 2) {
            bonusAtk += 14;
            bonusDef += 10;
            setBonusName = 'SET CELESTIAL (+14 ATK, +10 DEF, REGEN)';
        }

        return {
            str: totalStr,
            dex: totalDex,
            mag: totalMag,
            con: totalCon,
            atk: bonusAtk + Math.floor(totalStr * 1.5 + totalDex * 0.5),
            def: bonusDef + Math.floor(totalCon * 0.8),
            critChance: Math.min(50, 5 + totalDex * 1.2),
            setBonus: setBonusName
        };
    }

    giveInitialEquipment() {
        if (this.characterClass === 'warrior') {
            this.equipment.weapon = window.ITEM_DATABASE.sword_short;
            this.equipment.armor = window.ITEM_DATABASE.armor_plate;
        } else if (this.characterClass === 'archer') {
            this.equipment.weapon = window.ITEM_DATABASE.bow_short;
            this.equipment.armor = window.ITEM_DATABASE.armor_leather;
        } else if (this.characterClass === 'mage') {
            this.equipment.weapon = window.ITEM_DATABASE.staff_apprentice;
            this.equipment.armor = window.ITEM_DATABASE.armor_robe;
        }
        this.inventory[0] = { ...window.ITEM_DATABASE.potion_health, qty: 3 };
        this.inventory[1] = { ...window.ITEM_DATABASE.potion_mana, qty: 2 };
    }

    getWeaponLook() {
        const w = this.equipment && this.equipment.weapon;
        if (!w) return 0;
        const itemDef = (window.ITEM_DATABASE && window.ITEM_DATABASE[w.id]) || w;
        return (itemDef.look !== undefined) ? itemDef.look : (w.look !== undefined ? w.look : 0);
    }

    getArmorLook() {
        const a = this.equipment && this.equipment.armor;
        if (!a) return 0;
        const itemDef = (window.ITEM_DATABASE && window.ITEM_DATABASE[a.id]) || a;
        return (itemDef.look !== undefined) ? itemDef.look : (a.look !== undefined ? a.look : 0);
    }

    /**
     * Apariencia de la armadura en el sprite: 0 común, 1 oscura, 2 legendaria, 3 hueso, 4 lobo.
     * Usa `skin` del ítem si lo tiene; si no, su `look`. (Los bonus de set siguen usando getArmorLook().)
     */
    getArmorSkin() {
        const nativeArmor = { warrior: 'plate', archer: 'leather', mage: 'robe' }[this.characterClass];
        const a = this.equipment && this.equipment.armor;
        if (!a) return 0;
        const itemDef = window.ITEM_DATABASE[a.id] || a;
        if (itemDef.armorType && itemDef.armorType !== nativeArmor) return 0;
        if (itemDef.skin !== undefined) return itemDef.skin;
        return (itemDef.look !== undefined) ? itemDef.look : 0;
    }

    getSpriteKey() {
        return `player_${this.characterClass}_w${this.getWeaponLook()}_a${this.getArmorSkin()}`;
    }

    update(keys, world, projectiles, particles) {
        if (this.flashRedTimer > 0) this.flashRedTimer--;
        if (this.invulnerableTimer > 0) this.invulnerableTimer--;
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.invFullWarningTimer > 0) this.invFullWarningTimer--;
        if (this.abilityCooldown > 0) this.abilityCooldown--;

        if (this.getWeaponLook() === 2 && this.getArmorLook() === 2 && Math.random() < 0.03) {
            this.hp = Math.min(this.maxHp, this.hp + 2);
            this.mp = Math.min(this.maxMp, this.mp + 2);
        }

        let dx = 0;
        let dy = 0;

        if (keys['w'] || keys['W'] || keys['ArrowUp']) dy -= 1;
        if (keys['s'] || keys['S'] || keys['ArrowDown']) dy += 1;
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) dx -= 1;
        if (keys['d'] || keys['D'] || keys['ArrowRight']) dx += 1;

        this.isMoving = (dx !== 0 || dy !== 0);

        if (this.isMoving) {
            const length = Math.hypot(dx, dy) || 1;
            dx /= length;
            dy /= length;

            if (Math.abs(dx) > Math.abs(dy)) {
                this.direction = dx > 0 ? 2 : 1;
            } else {
                this.direction = dy > 0 ? 0 : 3;
            }

            const moveSpeed = this.speed;
            let nextX = this.x + dx * moveSpeed + this.knockbackX;
            if (!world.isSolid(nextX - this.width / 2, this.y - this.height / 2, this.width, this.height)) {
                this.x = nextX;
            }
            let nextY = this.y + dy * moveSpeed + this.knockbackY;
            if (!world.isSolid(this.x - this.width / 2, nextY - this.height / 2, this.width, this.height)) {
                this.y = nextY;
            }

            this.animTimer++;
            if (this.animTimer >= 7) {
                this.animFrame = (this.animFrame + 1) % 4;
                this.animTimer = 0;
            }
        } else {
            this.animFrame = 0;
            this.animTimer = 0;
        }

        this.knockbackX *= 0.82;
        this.knockbackY *= 0.82;

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

        if (world.traps) {
            world.traps.forEach(t => {
                if (t.active && Math.hypot(this.x - (t.x + 12), this.y - (t.y + 12)) < 16) {
                    this.takeDamage(12, t.x + 12, t.y + 12);
                }
            });
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

        if (Math.abs(targetX - this.x) > Math.abs(targetY - this.y)) {
            this.direction = (targetX > this.x) ? 2 : 1;
        } else {
            this.direction = (targetY > this.y) ? 0 : 3;
        }

        const weaponLook = this.getWeaponLook();

        if (this.characterClass === 'warrior') {
            window.soundEngine.playSwordSlash();
            const slashDist = 28;
            const sx = this.x + Math.cos(angle) * slashDist;
            const sy = this.y + Math.sin(angle) * slashDist;
            this.slashHitbox = { x: sx, y: sy, radius: 36, damage: stats.atk, angle };
        } else if (this.characterClass === 'archer') {
            window.soundEngine.playArrowShot();
            projectiles.push(new Projectile(this.x, this.y, Math.cos(angle) * 8.5, Math.sin(angle) * 8.5, 'arrow', stats.atk, 'player', weaponLook));
        } else if (this.characterClass === 'mage') {
            if (this.mp >= 4) {
                this.mp -= 4;
                window.soundEngine.playMagicCast();
                projectiles.push(new Projectile(this.x, this.y, Math.cos(angle) * 5.5, Math.sin(angle) * 5.5, 'fireball', stats.atk + 8, 'player', weaponLook));
            }
        }
    }

    useSpecialAbility(targetX, targetY, world, enemies, activeBoss, projectiles, particles, floatingTexts) {
        if (this.abilityCooldown > 0) return;
        const stats = this.getTotalStats();
        const angle = Math.atan2(targetY - this.y, targetX - this.x);

        if (this.characterClass === 'warrior' && this.mp >= 6) {
            this.mp -= 6;
            this.abilityCooldown = 180;
            window.soundEngine.playSwordSlash();
            const radius = 75;
            const dmg = Math.floor(stats.atk * 1.5);
            floatingTexts.push(new FloatingText(this.x, this.y - 42, '¡TORBELLINO!', '#f1c40f', true));

            enemies.forEach(enemy => {
                if (Math.hypot(enemy.x - this.x, enemy.y - this.y) <= radius) enemy.takeDamage(dmg, this.x, this.y);
            });
            if (activeBoss && Math.hypot(activeBoss.x - this.x, activeBoss.y - this.y) <= radius + 25) activeBoss.takeDamage(dmg, this.x, this.y);
        } else if (this.characterClass === 'archer' && this.mp >= 8) {
            this.mp -= 8;
            this.abilityCooldown = 150;
            window.soundEngine.playArrowShot();
            floatingTexts.push(new FloatingText(this.x, this.y - 42, '¡LLUVIA DE FLECHAS!', '#2ecc71', true));

            [-0.36, -0.18, 0, 0.18, 0.36].forEach(offset => {
                const a = angle + offset;
                const p = new Projectile(this.x, this.y, Math.cos(a) * 9.2, Math.sin(a) * 9.2, 'arrow', Math.floor(stats.atk * 0.95), 'player', this.getWeaponLook());
                p.pierce = 2;
                projectiles.push(p);
            });
        } else if (this.characterClass === 'mage' && this.mp >= 14) {
            this.mp -= 14;
            this.abilityCooldown = 180;
            window.soundEngine.playMagicCast();
            const radius = 105;
            const dmg = Math.floor(stats.atk + stats.mag * 1.8);
            floatingTexts.push(new FloatingText(this.x, this.y - 42, '¡NOVA DE HIELO!', '#00d2d3', true));

            enemies.forEach(enemy => {
                if (Math.hypot(enemy.x - this.x, enemy.y - this.y) <= radius) {
                    enemy.takeDamage(dmg, this.x, this.y);
                    enemy.slowTimer = 180;
                }
            });
            if (activeBoss && Math.hypot(activeBoss.x - this.x, activeBoss.y - this.y) <= radius + 30) {
                activeBoss.takeDamage(dmg, this.x, this.y);
                activeBoss.slowTimer = 90;
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
        if (this.exp >= this.nextExp) this.levelUp(floatingTexts);
    }

    levelUp(floatingTexts) {
        this.level++;
        this.exp -= this.nextExp;
        this.nextExp = Math.floor(this.nextExp * 1.5);
        this.attributePoints += 3;
        this.maxHp += 15; this.hp = this.maxHp;
        this.maxMp += 10; this.mp = this.maxMp;
        window.soundEngine.playLevelUp();
        floatingTexts.push(new FloatingText(this.x, this.y - 40, '¡NIVEL SUPERADO!', '#ffd700', true));
    }

    draw(ctx) {
        const frameW = 48; const frameH = 48;
        const dx = Math.floor(this.x - 24);
        const dy = Math.floor(this.y - 30);
        let col = this.isAttacking ? (4 + this.attackFrame) : this.animFrame;
        let row = this.direction;

        window.spriteManager.draw(ctx, this.getSpriteKey(), col, row, frameW, frameH, dx, dy, 48, 48, false, this.flashRedTimer > 0);
    }
}

// ==============================================================================
// CLASES DE ENEMIGOS REBALANCEADAS (VIDA Y DAÑO EQUILIBRADOS)
// ==============================================================================

class Enemy {
    constructor(type, x, y, floor = 1) {
        this.type = type;
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
        this.slowTimer = 0;
        this.hasKey = false;
        this.initStats();
    }

    initStats() {
        // Multiplicador de dificultad aumentado a +35% por piso
        const fMod = 1 + (this.floor - 1) * 0.35;

        if (this.type === 'rat') {
            this.name = 'Rata de Cloaca';
            this.maxHp = Math.floor(65 * fMod);
            this.atk = Math.floor(16 * fMod);
            this.speed = 2.6;
            this.expReward = 28;
            this.width = 24; this.height = 22;
            this.spriteKey = 'rat'; this.frameSize = 48;
        } else if (this.type === 'bandit') {
            this.name = 'Bandido de Cripta';
            this.maxHp = Math.floor(85 * fMod);
            this.atk = Math.floor(20 * fMod);
            this.speed = 1.9;
            this.expReward = 32;
            this.width = 24; this.height = 28;
            this.spriteKey = 'bandit'; this.frameSize = 48;
        } else if (this.type === 'skeleton') {
            this.name = 'Esqueleto del Osario';
            this.maxHp = Math.floor(110 * fMod);
            this.atk = Math.floor(24 * fMod);
            this.speed = 1.5;
            this.expReward = 40;
            this.width = 24; this.height = 30;
            this.spriteKey = 'skeleton'; this.frameSize = 48;
        } else if (this.type === 'spider') {
            this.name = 'Araña Ponzoñosa';
            this.maxHp = Math.floor(95 * fMod);
            this.atk = Math.floor(26 * fMod);
            this.speed = 2.4;
            this.expReward = 45;
            this.width = 30; this.height = 24;
            this.spriteKey = 'spider'; this.frameSize = 48;
        } else if (this.type === 'werewolf') {
            this.name = 'Hombre Lobo Feral';
            this.maxHp = Math.floor(240 * fMod);
            this.atk = Math.floor(42 * fMod);
            this.speed = 2.7;
            this.expReward = 90;
            this.width = 32; this.height = 36;
            this.spriteKey = 'werewolf'; this.frameSize = 56;
        } else if (this.type === 'demon') {
            this.name = 'Demonio Menor';
            this.maxHp = Math.floor(320 * fMod);
            this.atk = Math.floor(55 * fMod);
            this.speed = 2.0;
            this.expReward = 130;
            this.width = 32; this.height = 36;
            this.spriteKey = 'demon'; this.frameSize = 56;
        }
        else if (this.type === 'specter') {
            this.name = 'Espectro del Vacío';
            this.maxHp = Math.floor(210 * fMod);
            this.atk = Math.floor(38 * fMod);
            this.speed = 2.2;
            this.expReward = 140;
            this.width = 28; this.height = 32;
            this.spriteKey = 'demon'; this.frameSize = 56;
            this.isFlying = true; // Atraviesa obstáculos
        } else if (this.type === 'golem') {
            this.name = 'Coloso de Obsidiana';
            this.maxHp = Math.floor(480 * fMod);
            this.atk = Math.floor(52 * fMod);
            this.speed = 1.3;
            this.expReward = 180;
            this.width = 38; this.height = 42;
            this.spriteKey = 'skeleton'; this.frameSize = 48;
        } else if (this.type === 'void_elf') {
            this.name = 'Elfo del Vacío';
            this.maxHp = Math.floor(190 * fMod);
            this.atk = Math.floor(42 * fMod);
            this.speed = 2.8;
            this.expReward = 150;
            this.width = 24; this.height = 28;
            this.spriteKey = 'bandit'; this.frameSize = 48;
        }
        this.hp = this.maxHp;
    }

    update(player, world, projectiles, particles) {
        if (this.flashRedTimer > 0) this.flashRedTimer--;
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.slowTimer > 0) this.slowTimer--;

        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        if (dist < 260) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.direction = Math.abs(player.x - this.x) > Math.abs(player.y - this.y) ? (player.x > this.x ? 2 : 1) : (player.y > this.y ? 0 : 3);
            const attackDist = this.type === 'demon' ? 140 : (this.type === 'spider' ? 100 : 26);

            if (dist > attackDist) {
                const moveSpeed = (this.slowTimer > 0) ? (this.speed * 0.40) : this.speed;
                const nx = this.x + Math.cos(angle) * moveSpeed + this.knockbackX;
                const ny = this.y + Math.sin(angle) * moveSpeed + this.knockbackY;
                if (!world.isSolid(nx - this.width / 2, this.y - this.height / 2, this.width, this.height)) this.x = nx;
                if (!world.isSolid(this.x - this.width / 2, ny - this.height / 2, this.width, this.height)) this.y = ny;

                this.animTimer++;
                if (this.animTimer >= 8) {
                    this.animFrame = (this.animFrame + 1) % 4;
                    this.animTimer = 0;
                }
            } else if (this.attackCooldown <= 0) {
                this.attackCooldown = 45;
                if (this.type === 'spider') projectiles.push(new Projectile(this.x, this.y, Math.cos(angle) * 4.5, Math.sin(angle) * 4.5, 'acid', this.atk, 'enemy'));
                else if (this.type === 'demon') projectiles.push(new Projectile(this.x, this.y, Math.cos(angle) * 4.0, Math.sin(angle) * 4.0, 'void', this.atk, 'enemy'));
                else player.takeDamage(this.atk, this.x, this.y);
            }
        }
        this.knockbackX *= 0.82;
        this.knockbackY *= 0.82;
    }

    takeDamage(damage, sourceX, sourceY) {
        this.hp = Math.max(0, this.hp - damage);
        this.flashRedTimer = 8;
        window.soundEngine.playHit();
        const angle = Math.atan2(this.y - sourceY, this.x - sourceX);
        this.knockbackX = Math.cos(angle) * 4.5;
        this.knockbackY = Math.sin(angle) * 4.5;
        return this.hp <= 0;
    }

    draw(ctx) {
        const dx = Math.floor(this.x - this.frameSize / 2);
        const dy = Math.floor(this.y - this.frameSize / 2 - 4);

        // Efecto de escarcha si está ralentizado
        if (this.slowTimer > 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(112, 214, 255, 0.45)';
            ctx.beginPath();
            ctx.arc(this.x, this.y + this.height / 2 - 2, this.width / 2 + 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Dibujar el sprite del enemigo
        window.spriteManager.draw(
            ctx,
            this.spriteKey,
            this.animFrame,
            this.direction,
            this.frameSize,
            this.frameSize,
            dx, dy,
            this.frameSize,
            this.frameSize,
            false,
            this.flashRedTimer > 0
        );

        // Ícono de llave sobre la cabeza si es el portador
        if (this.hasKey) {
            ctx.fillStyle = '#f1c40f';
            ctx.font = '8px "Press Start 2P"';
            ctx.fillText('🔑', this.x - 4, this.y - this.height / 2 - 18);
        }

        // =====================================================================
        // BARRA DE VIDA: SOLO APARECE TRAS RECIBIR EL PRIMER GOLPE
        // =====================================================================
        if (this.hp < this.maxHp && this.hp > 0) {
            const barW = 30;
            const barH = 5;
            const bx = Math.floor(this.x - barW / 2);
            const by = Math.floor(this.y - this.height / 2 - 10);

            // 1. Marco exterior negro grueso
            ctx.fillStyle = '#08050d';
            ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);

            // 2. Fondo rojo oscuro (vida perdida)
            ctx.fillStyle = '#4a151b';
            ctx.fillRect(bx, by, barW, barH);

            // 3. Relleno rojo vivo de vida actual
            const hpPct = Math.max(0, Math.min(1, this.hp / this.maxHp));
            const fillW = Math.floor(barW * hpPct);
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(bx, by, fillW, barH);

            // 4. Brillo superior de 1px
            ctx.fillStyle = '#ff7675';
            ctx.fillRect(bx, by, fillW, 1);
        }
    }
}

// ==============================================================================
// JEFES REBALANCEADOS CON COMBATE DESAFIANTE
// ==============================================================================

class BossLucian {
    constructor(x, y) {
        this.name = 'Sub-Jefe Lucian';
        this.x = x; this.y = y;
        this.maxHp = 3200; // Antes 1850
        this.hp = 3200;
        this.atk = 52;    // Antes 28
        this.width = 46; this.height = 48;
        this.state = 'stalk'; this.stateTimer = 0; this.animFrame = 0; this.activated = false; this.slowTimer = 0;
        this.pounceVx = 0; this.pounceVy = 0; this.flashRedTimer = 0;
    }

    update(player, world, projectiles, particles) {
        if (this.flashRedTimer > 0) this.flashRedTimer--;
        if (this.slowTimer > 0) this.slowTimer--;
        const dist = Math.hypot(player.x - this.x, player.y - this.y);

        if (!this.activated) {
            if (player.y < 16 * world.tileSize || dist < 240) {
                this.activated = true;
                window.soundEngine.playBossRoar();
            } else return;
        }

        this.stateTimer++;
        const angle = Math.atan2(player.y - this.y, player.x - this.x);

        if (this.state === 'stalk') {
            const speed = (this.slowTimer > 0) ? 0.9 : 1.6;
            this.x += Math.cos(angle) * speed;
            this.y += Math.sin(angle) * speed;
            if (this.stateTimer % 10 === 0) this.animFrame = (this.animFrame + 1) % 4;

            if (this.stateTimer > 110) {
                this.stateTimer = 0;
                const roll = Math.random();
                if (dist > 110 || roll < 0.35) {
                    this.state = 'ranged_slash';
                    window.soundEngine.playBossRoar();
                } else if (roll < 0.70) {
                    this.state = 'pounce';
                    this.pounceVx = Math.cos(angle) * 7.5;
                    this.pounceVy = Math.sin(angle) * 7.5;
                } else {
                    this.state = 'howl';
                    window.soundEngine.playBossRoar();
                }
            }
        } else if (this.state === 'ranged_slash') {
            this.animFrame = Math.min(3, Math.floor(this.stateTimer / 7));
            if (this.stateTimer === 15) {
                window.soundEngine.playSwordSlash();
                [-0.25, 0, 0.25].forEach(offset => {
                    const a = angle + offset;
                    projectiles.push(new Projectile(this.x, this.y, Math.cos(a) * 5.8, Math.sin(a) * 5.8, 'slash', this.atk + 12, 'enemy'));
                });
            }
            if (this.stateTimer > 35) { this.state = 'stalk'; this.stateTimer = 0; }
        } else if (this.state === 'howl') {
            this.animFrame = Math.min(3, Math.floor(this.stateTimer / 12));
            if (this.stateTimer === 25 && dist < 120) player.takeDamage(this.atk - 10, this.x, this.y);
            if (this.stateTimer > 50) { this.state = 'frenzy'; this.stateTimer = 0; }
        } else if (this.state === 'pounce') {
            this.animFrame = Math.min(3, Math.floor(this.stateTimer / 8));
            const nx = this.x + this.pounceVx; const ny = this.y + this.pounceVy;
            if (world.isSolid(nx - this.width / 2, ny - this.height / 2, this.width, this.height) || this.stateTimer > 28) {
                this.state = 'stalk'; this.stateTimer = 0;
            } else {
                this.x = nx; this.y = ny;
                if (dist < 42) { player.takeDamage(this.atk + 20, this.x, this.y); this.state = 'frenzy'; this.stateTimer = 0; }
            }
        } else if (this.state === 'frenzy') {
            this.animFrame = (Math.floor(this.stateTimer / 6)) % 4;
            if (this.stateTimer % 15 === 0 && dist < 55) {
                window.soundEngine.playSwordSlash();
                player.takeDamage(this.atk + 10, this.x, this.y);
            }
            if (this.stateTimer > 45) { this.state = 'stalk'; this.stateTimer = 0; }
        }
    }

    takeDamage(damage, sourceX, sourceY) {
        this.hp = Math.max(0, this.hp - damage);
        this.flashRedTimer = 6;
        window.soundEngine.playHit();
        return this.hp <= 0;
    }

    draw(ctx) {
        let row = 0;
        if (this.state === 'howl') row = 1;
        else if (this.state === 'pounce') row = 2;
        else if (this.state === 'frenzy' || this.state === 'ranged_slash') row = 3;
        window.spriteManager.draw(ctx, 'lucian', this.animFrame, row, 72, 72, Math.floor(this.x - 36), Math.floor(this.y - 44), 72, 72, false, this.flashRedTimer > 0);
    }
}

class BossAbracadabra {
    constructor(x, y) {
        this.name = 'Sub-Jefe Abracadabra';
        this.x = x; this.y = y;
        this.maxHp = 5200; // Antes 2950
        this.hp = 5200;
        this.atk = 135;   // Antes 100
        this.width = 44; this.height = 46;
        this.state = 'walk'; this.stateTimer = 0; this.animFrame = 0; this.activated = false; this.slowTimer = 0;
        this.chargeVx = 0; this.chargeVy = 0; this.flashRedTimer = 0;
    }

    update(player, world, projectiles, particles) {
        if (this.flashRedTimer > 0) this.flashRedTimer--;
        if (this.slowTimer > 0) this.slowTimer--;
        const dist = Math.hypot(player.x - this.x, player.y - this.y);

        if (!this.activated) {
            if (player.y < 16 * world.tileSize || dist < 240) {
                this.activated = true;
                window.soundEngine.playBossRoar();
            } else return;
        }

        this.stateTimer++;
        const angle = Math.atan2(player.y - this.y, player.x - this.x);

        if (this.state === 'walk') {
            const speed = (this.slowTimer > 0) ? 0.8 : 1.3;
            this.x += Math.cos(angle) * speed;
            this.y += Math.sin(angle) * speed;
            if (this.stateTimer % 12 === 0) this.animFrame = (this.animFrame + 1) % 4;
            if (this.stateTimer > 160) {
                this.state = 'swell';
                this.stateTimer = 0;
                window.soundEngine.playBossRoar();
            }
        } else if (this.state === 'swell') {
            this.animFrame = Math.min(3, Math.floor(this.stateTimer / 15));
            if (this.stateTimer > 60) {
                if (Math.random() < 0.5) {
                    this.state = 'vomit';
                    this.stateTimer = 0;
                    [-0.4, -0.2, 0, 0.2, 0.4].forEach(offset => {
                        const a = angle + offset;
                        projectiles.push(new Projectile(this.x, this.y, Math.cos(a) * 4.2, Math.sin(a) * 4.2, 'acid', this.atk + 40, 'enemy'));
                    });
                } else {
                    this.state = 'charge';
                    this.stateTimer = 0;
                    this.chargeVx = Math.cos(angle) * 6.5;
                    this.chargeVy = Math.sin(angle) * 6.5;
                }
            }
        } else if (this.state === 'vomit') {
            this.animFrame = Math.min(3, Math.floor(this.stateTimer / 10));
            if (this.stateTimer > 40) { this.state = 'exhausted'; this.stateTimer = 0; }
        } else if (this.state === 'charge') {
            const nx = this.x + this.chargeVx; const ny = this.y + this.chargeVy;
            if (world.isSolid(nx - this.width / 2, ny - this.height / 2, this.width, this.height) || this.stateTimer > 35) {
                this.state = 'exhausted'; this.stateTimer = 0;
            } else {
                this.x = nx; this.y = ny;
                if (dist < 40) player.takeDamage(this.atk + 45, this.x, this.y);
            }
        } else if (this.state === 'exhausted') {
            this.animFrame = 0;
            if (this.stateTimer > 110) { this.state = 'walk'; this.stateTimer = 0; }
        }
    }

    takeDamage(damage, sourceX, sourceY) {
        this.hp = Math.max(0, this.hp - damage);
        this.flashRedTimer = 6;
        window.soundEngine.playHit();
        return this.hp <= 0;
    }

    draw(ctx) {
        let row = 0;
        if (this.state === 'swell') row = 1;
        else if (this.state === 'vomit') row = 2;
        else if (this.state === 'charge') row = 3;
        window.spriteManager.draw(ctx, 'abracadabra', this.animFrame, row, 72, 72, Math.floor(this.x - 36), Math.floor(this.y - 44), 72, 72, false, this.flashRedTimer > 0);
    }
}

class BossHong {
    constructor(x, y) {
        this.name = 'Hong Devorador de Hombres';
        this.x = x; this.y = y;
        this.maxHp = 7500; // Antes 3400
        this.hp = 7500;
        this.atk = 165;   // Antes 114
        this.width = 60; this.height = 64;
        this.state = 'idle'; this.stateTimer = 0; this.animFrame = 0; this.flashRedTimer = 0; this.activated = false; this.slowTimer = 0;
    }

    update(player, world, projectiles, particles) {
        if (this.flashRedTimer > 0) this.flashRedTimer--;
        if (this.slowTimer > 0) this.slowTimer--;
        const dist = Math.hypot(player.x - this.x, player.y - this.y);

        if (!this.activated) {
            if (player.y < 14 * world.tileSize || dist < 260) {
                this.activated = true;
                window.soundEngine.playBossRoar();
            } else return;
        }

        this.stateTimer++;
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        if (this.stateTimer % 10 === 0) this.animFrame = (this.animFrame + 1) % 4;

        if (this.state === 'idle') {
            const speed = (this.slowTimer > 0) ? 0.8 : 1.4;
            this.x += Math.cos(angle) * speed;
            this.y += Math.sin(angle) * speed;
            if (this.stateTimer > 120) {
                this.stateTimer = 0;
                this.state = Math.random() < 0.45 ? 'barrage' : 'cleave';
                window.soundEngine.playBossRoar();
            }
        } else if (this.state === 'barrage') {
            if (this.stateTimer === 30) {
                for (let i = 0; i < 8; i++) {
                    const a = (i * Math.PI * 2) / 8;
                    projectiles.push(new Projectile(this.x, this.y, Math.cos(a) * 3.8, Math.sin(a) * 3.8, 'void', this.atk + 40, 'enemy'));
                }
            }
            if (this.stateTimer > 60) { this.state = 'idle'; this.stateTimer = 0; }
        } else if (this.state === 'cleave') {
            if (this.stateTimer === 25) {
                window.soundEngine.playSwordSlash();
                if (dist < 80) player.takeDamage(this.atk + 45, this.x, this.y);
            }
            if (this.stateTimer > 55) { this.state = 'idle'; this.stateTimer = 0; }
        }
    }

    takeDamage(damage, sourceX, sourceY) {
        this.hp = Math.max(0, this.hp - damage);
        this.flashRedTimer = 6;
        window.soundEngine.playHit();
        return this.hp <= 0;
    }

    draw(ctx) {
        const row = (this.state === 'cleave') ? 1 : 0;
        window.spriteManager.draw(ctx, 'hong', this.animFrame, row, 96, 96, Math.floor(this.x - 48), Math.floor(this.y - 58), 96, 96, false, this.flashRedTimer > 0);
    }
}
// =============================================================================
// SUB-JEFE PISO 13: MALAKOR, EL PRIMERGÉNITO (LUGARTENIENTE DE SILMARION)
// =============================================================================
class BossMalakor {
    constructor(x, y) {
        this.name = 'Malakor, El Primogénito';
        this.x = x; this.y = y;
        this.maxHp = 6200;
        this.hp = 6200;
        this.atk = 75;
        this.width = 46; this.height = 54;
        this.state = 'stalk';
        this.stateTimer = 0;
        this.animFrame = 0;
        this.activated = false;
        this.slowTimer = 0;
        this.flashRedTimer = 0;
    }

    update(player, world, projectiles, particles, floatingTexts) {
        if (this.flashRedTimer > 0) this.flashRedTimer--;
        if (this.slowTimer > 0) this.slowTimer--;

        const dist = Math.hypot(player.x - this.x, player.y - this.y);

        if (!this.activated) {
            if (player.y < 16 * world.tileSize || dist < 260) {
                this.activated = true;
                window.soundEngine.playBossRoar();
                if (window.soundEngine) window.soundEngine.startBgm(true);
            } else return;
        }

        this.stateTimer++;
        const angle = Math.atan2(player.y - this.y, player.x - this.x);

        // Fase 2: Al 35% de vida se desata duplicando su agilidad
        const isEnraged = (this.hp / this.maxHp) < 0.35;
        const baseSpeed = isEnraged ? 2.5 : 1.7;

        if (this.state === 'stalk') {
            this.x += Math.cos(angle) * baseSpeed;
            this.y += Math.sin(angle) * baseSpeed;
            if (this.stateTimer % 8 === 0) this.animFrame = (this.animFrame + 1) % 4;

            if (this.stateTimer > 90) {
                this.stateTimer = 0;
                const roll = Math.random();
                if (roll < 0.40) {
                    // ARTIMAÑA 1: Teleport a la espalda con señuelo explosivo
                    this.state = 'clone_teleport';
                } else if (roll < 0.75) {
                    // ARTIMAÑA 2: Cuchillas de magma sombrío
                    this.state = 'magma_slash';
                } else {
                    // ARTIMAÑA 3: Cadenas subterráneas
                    this.state = 'chains';
                }
            }
        } else if (this.state === 'clone_teleport') {
            // Deja humo y se teleporta detrás del jugador
            if (this.stateTimer === 10) {
                for (let i = 0; i < 14; i++) {
                    particles.push(new Particle(this.x, this.y, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, '#2c3e50', 5, 25));
                }
                const behindAngle = Math.atan2(player.y - this.y, player.x - this.x);
                this.x = player.x - Math.cos(behindAngle) * 45;
                this.y = player.y - Math.sin(behindAngle) * 45;
                window.soundEngine.playSwordSlash();
                player.takeDamage(this.atk + 15, this.x, this.y);
            }
            if (this.stateTimer > 35) { this.state = 'stalk'; this.stateTimer = 0; }
        } else if (this.state === 'magma_slash') {
            if (this.stateTimer === 15) {
                window.soundEngine.playSwordSlash();
                [-0.3, 0, 0.3].forEach(offset => {
                    const a = angle + offset;
                    projectiles.push(new Projectile(this.x, this.y, Math.cos(a) * 6.0, Math.sin(a) * 6.0, 'slash', this.atk + 20, 'enemy'));
                });
            }
            if (this.stateTimer > 40) { this.state = 'stalk'; this.stateTimer = 0; }
        } else if (this.state === 'chains') {
            if (this.stateTimer === 15) {
                // Inmoviliza al jugador con cadenas oscuras
                player.takeDamage(this.atk - 10, this.x, this.y);
                player.slowTimer = 90; // Ralentizado severo
                for (let i = 0; i < 20; i++) {
                    particles.push(new Particle(player.x, player.y, (Math.random() - 0.5) * 3, -1, '#e74c3c', 4, 20));
                }
            }
            if (this.stateTimer > 45) { this.state = 'stalk'; this.stateTimer = 0; }
        }
    }

    takeDamage(damage, sourceX, sourceY) {
        this.hp = Math.max(0, this.hp - damage);
        this.flashRedTimer = 6;
        window.soundEngine.playHit();
        return this.hp <= 0;
    }

    draw(ctx) {
        // Dibuja a Malakor usando su silueta de espadachín de fuego sombrío
        const dx = Math.floor(this.x - 24);
        const dy = Math.floor(this.y - 32);
        window.spriteManager.draw(ctx, 'bandit', this.animFrame, 0, 48, 48, dx, dy, 48, 54, false, this.flashRedTimer > 0);

        // Aura de fuego negro y brasas
        ctx.save();
        ctx.fillStyle = 'rgba(231, 76, 60, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// =============================================================================
// JEFE FINAL ABSOLUTO PISO 15: SILMARION, EL SEÑOR OSCURO (2 FASES)
// =============================================================================
class BossSilmarion {
    constructor(x, y) {
        this.name = 'Silmarion, El Señor Oscuro';
        this.x = x; this.y = y;
        this.maxHp = 10500;
        this.hp = 10500;
        this.atk = 110;
        this.width = 64; this.height = 70;
        this.state = 'idle';
        this.stateTimer = 0;
        this.animFrame = 0;
        this.activated = false;
        this.phase = 1;
        this.flashRedTimer = 0;
    }

    update(player, world, projectiles, particles) {
        if (this.flashRedTimer > 0) this.flashRedTimer--;

        const dist = Math.hypot(player.x - this.x, player.y - this.y);

        if (!this.activated) {
            if (player.y < 16 * world.tileSize || dist < 280) {
                this.activated = true;
                window.soundEngine.playBossRoar();
                if (window.soundEngine) window.soundEngine.startBgm(true);
            } else return;
        }

        this.stateTimer++;
        const angle = Math.atan2(player.y - this.y, player.x - this.x);

        // TRANSICIÓN A FASE 2: ESENCIA INDESTRUCTIBLE DESATADA
        if (this.phase === 1 && (this.hp / this.maxHp) <= 0.45) {
            this.phase = 2;
            this.state = 'storm';
            this.stateTimer = 0;
            window.soundEngine.playBossRoar();
        }

        if (this.phase === 1) {
            // FASE 1: El Portador de Soles Caído
            if (this.state === 'idle') {
                this.x += Math.cos(angle) * 1.6;
                this.y += Math.sin(angle) * 1.6;
                if (this.stateTimer > 100) {
                    this.stateTimer = 0;
                    this.state = Math.random() < 0.5 ? 'shadow_sun' : 'solar_cleave';
                }
            } else if (this.state === 'shadow_sun') {
                // Dispara un sol oscuro giratorio de 8 llamas
                if (this.stateTimer === 20) {
                    for (let i = 0; i < 8; i++) {
                        const a = (i * Math.PI * 2) / 8;
                        projectiles.push(new Projectile(this.x, this.y, Math.cos(a) * 4.2, Math.sin(a) * 4.2, 'void', this.atk + 25, 'enemy'));
                    }
                }
                if (this.stateTimer > 50) { this.state = 'idle'; this.stateTimer = 0; }
            } else if (this.state === 'solar_cleave') {
                if (this.stateTimer === 25) {
                    window.soundEngine.playSwordSlash();
                    if (dist < 90) player.takeDamage(this.atk + 35, this.x, this.y);
                }
                if (this.stateTimer > 55) { this.state = 'idle'; this.stateTimer = 0; }
            }
        } else {
            // FASE 2: Tormenta Primordial del Núcleo
            if (this.state === 'storm' || this.stateTimer % 60 === 0) {
                // Lluvia de meteoros sombríos alrededor del jugador
                for (let i = 0; i < 4; i++) {
                    const rx = player.x + (Math.random() - 0.5) * 120;
                    const ry = player.y + (Math.random() - 0.5) * 120;
                    projectiles.push(new Projectile(rx, ry - 180, 0, 5.5, 'void', this.atk + 30, 'enemy'));
                }
            }

            this.x += Math.cos(angle) * 2.4;
            this.y += Math.sin(angle) * 2.4;

            if (this.stateTimer % 80 === 0) {
                // Rayo expansivo en 360°
                for (let i = 0; i < 12; i++) {
                    const a = (i * Math.PI * 2) / 12;
                    projectiles.push(new Projectile(this.x, this.y, Math.cos(a) * 5.0, Math.sin(a) * 5.0, 'slash', this.atk + 20, 'enemy'));
                }
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
        const dx = Math.floor(this.x - 48);
        const dy = Math.floor(this.y - 54);
        window.spriteManager.draw(ctx, 'hong', this.animFrame, 0, 96, 96, dx, dy, 96, 96, false, this.flashRedTimer > 0);

        // Corona pálida y fuego solar oscuro sobre su cabeza
        ctx.save();
        ctx.fillStyle = '#f1c40f';
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(this.phase === 1 ? '👑 SILMARION' : '🔥 ESENCIA DESATADA', this.x, this.y - 45);
        ctx.restore();
    }
}

window.BossMalakor = BossMalakor;
window.BossSilmarion = BossSilmarion;
window.Player = Player;
window.Enemy = Enemy;
window.BossAbracadabra = BossAbracadabra;
window.BossHong = BossHong;
window.BossLucian = BossLucian;
window.Projectile = Projectile;
window.Particle = Particle;
window.FloatingText = FloatingText;
window.GroundItem = GroundItem;