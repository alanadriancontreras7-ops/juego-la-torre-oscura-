/**
 * GENERACIÓN Y GESTIÓN DE PISOS (1 A 10)
 * Incluye Altar gótico, Mercader Kaelen, Herrero Gunnar y Rejillas de hierro.
 */

const BIOME_STYLE = {
    crypt: { rim: 'rgba(150,135,175,0.55)', shade: '6,4,10' },
    demon: { rim: 'rgba(200,95,105,0.50)', shade: '14,2,4' },
    acid: { rim: 'rgba(140,190,120,0.50)', shade: '2,8,2' },
    apex: { rim: 'rgba(140,135,205,0.50)', shade: '4,3,12' }
};

class World {
    constructor(floor = 1) {
        this.floor = floor;
        this.tileSize = 32;
        this.cols = 60;
        this.rows = 45;

        this.grid = [];
        this.floorVariations = [];
        this.wallVariations = [];
        this.torches = [];
        this.barrels = [];
        this.crates = [];
        this.chests = [];
        this.banners = [];
        this.skeletons = [];
        this.acidPools = [];
        this.traps = [];

        this.bookshelves = [];
        this.floorBooks = [];
        this.tables = [];
        this.libRoom = null;

        this.shrine = null;
        this.merchant = null;
        this.blacksmith = null;
        this.lockedDoor = null;
        this.ambushRoom = null;

        this.loreScroll = null;
        this.stairs = null;
        this.stairsUnlocked = false;

        this.flameTimer = 0;
        this.flameFrame = 0;
        this.spikeTimer = 0;

        this.baked = null;
        this.bakedSheet = null;

        this.generateFloor();
    }

    getBiome() {
        if (this.floor <= 4) return 'crypt';
        if (this.floor <= 7) return 'demon';
        if (this.floor === 8) return 'acid';
        if (this.floor <= 10) return 'apex';
        if (this.floor <= 13) return 'void';  // Pisos 11 a 13: El Sello Quebrantado
        return 'demon';                        // Pisos 14 y 15: Vórtice de Magma de Silmarion
    }

    generateFloor() {
        this.grid = Array.from({ length: this.rows }, () => new Array(this.cols).fill(1));
        this.floorVariations = Array.from({ length: this.rows }, () => new Array(this.cols).fill(0));
        this.wallVariations = Array.from({ length: this.rows }, () => new Array(this.cols).fill(1));
        this.torches = [];
        this.barrels = [];
        this.crates = [];
        this.chests = [];
        this.banners = [];
        this.skeletons = [];
        this.acidPools = [];
        this.traps = [];
        this.bookshelves = [];
        this.floorBooks = [];
        this.tables = [];
        this.libRoom = null;
        this.shrine = null;
        this.merchant = null;
        this.blacksmith = null;
        this.lockedDoor = null;
        this.ambushRoom = null;

        if (this.floor === 5) {
            this.generateArenaLucian();
        } else if (this.floor === 8) {
            this.generateArenaRotunda();
        } else if (this.floor === 10) {
            this.generateArenaApex();
        } else if (this.floor === 13) {
            this.generateArenaMalakor();
        } else if (this.floor === 15) {
            this.generateArenaSilmarion();
        } else {
            this.generateDungeonRooms();
        }

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] === 0) {
                    const roll = Math.random();
                    let v;
                    if (roll < 0.025) v = 4;
                    else if (roll < 0.040) v = 5;
                    else if (roll < 0.055) v = 6;
                    else if (roll < 0.075) v = 7;
                    else v = Math.floor(Math.random() * 4);
                    this.floorVariations[r][c] = v;
                } else if (this.grid[r][c] === 1) {
                    const roll = Math.random();
                    if (r < this.rows - 1 && this.grid[r + 1][c] === 0 && roll < 0.10) {
                        this.wallVariations[r][c] = 3;
                    } else {
                        this.wallVariations[r][c] = (roll < 0.55) ? 2 : 1;
                    }
                }
            }
        }
        this.baked = null;

        this.placeTorches();
        this.placeBanners();
        this.placeLoreScroll();
        this.placeStairs();
    }

    generateDungeonRooms() {
        const rooms = [];
        const targetRooms = 9;
        let attempts = 0;

        while (rooms.length < targetRooms && attempts < 400) {
            attempts++;
            const isLib = (rooms.length === 2);
            const w = isLib ? 8 : (Math.floor(Math.random() * 4) + 8);
            const h = isLib ? 7 : (Math.floor(Math.random() * 3) + 7);
            const x = Math.floor(Math.random() * (this.cols - w - 8)) + 4;
            const y = Math.floor(Math.random() * (this.rows - h - 8)) + 4;

            const newRoom = { x, y, w, h, isLib };

            let overlaps = false;
            for (const r of rooms) {
                if (
                    newRoom.x - 3 < r.x + r.w &&
                    newRoom.x + newRoom.w + 3 > r.x &&
                    newRoom.y - 3 < r.y + r.h &&
                    newRoom.y + newRoom.h + 3 > r.y
                ) {
                    overlaps = true;
                    break;
                }
            }

            if (!overlaps) rooms.push(newRoom);
        }

        rooms.forEach((room, idx) => {
            for (let r = room.y; r < room.y + room.h; r++) {
                for (let c = room.x; c < room.x + room.w; c++) {
                    this.grid[r][c] = 0;
                }
            }

            if (room.isLib) room.type = 'library';
            else if (idx === 0) room.type = 'spawn';
            else if (idx === rooms.length - 1) room.type = 'exit';
            else if (this.floor >= 2 && idx === 1) room.type = 'shrine';
            else if (this.floor >= 2 && idx === 3) room.type = 'treasure_locked';
            else if (this.floor >= 3 && idx === 4) room.type = 'merchant';
            else if (this.floor >= 3 && idx === 5) room.type = 'ambush';
            else room.type = 'normal';
        });

        this.rooms = rooms;

        const mainRooms = rooms.filter(r => !r.isLib);
        for (let i = 1; i < mainRooms.length; i++) {
            const prev = mainRooms[i - 1];
            const curr = mainRooms[i];
            const cx1 = Math.floor(prev.x + prev.w / 2);
            const cy1 = Math.floor(prev.y + prev.h / 2);
            const cx2 = Math.floor(curr.x + curr.w / 2);
            const cy2 = Math.floor(curr.y + curr.h / 2);

            for (let c = Math.min(cx1, cx2); c <= Math.max(cx1, cx2); c++) {
                this.grid[cy1][c] = 0;
                this.grid[cy1 + 1][c] = 0;
            }
            for (let r = Math.min(cy1, cy2); r <= Math.max(cy1, cy2); r++) {
                this.grid[r][cx2] = 0;
                this.grid[r][cx2 + 1] = 0;
            }
        }

        const libRoom = rooms.find(r => r.isLib) || rooms[1];
        this.libRoom = libRoom;
        if (libRoom) {
            let closestRoom = mainRooms[0];
            let minDist = 9999;
            const lcx = Math.floor(libRoom.x + libRoom.w / 2);
            const lcy = Math.floor(libRoom.y + libRoom.h / 2);

            for (const r of mainRooms) {
                const rcx = Math.floor(r.x + r.w / 2);
                const rcy = Math.floor(r.y + r.h / 2);
                const d = Math.hypot(lcx - rcx, lcy - rcy);
                if (d < minDist) {
                    minDist = d;
                    closestRoom = r;
                }
            }

            const rcx = Math.floor(closestRoom.x + closestRoom.w / 2);
            const rcy = Math.floor(closestRoom.y + closestRoom.h / 2);
            for (let c = Math.min(lcx, rcx); c <= Math.max(lcx, rcx); c++) {
                this.grid[rcy][c] = 0;
                this.grid[rcy + 1][c] = 0;
            }
            for (let r = Math.min(lcy, rcy); r <= Math.max(lcy, rcy); r++) {
                this.grid[r][lcx] = 0;
                this.grid[r][lcx + 1] = 0;
            }

            for (let c = libRoom.x + 1; c <= libRoom.x + libRoom.w - 2; c++) {
                this.bookshelves.push({ x: c * this.tileSize, y: (libRoom.y + 1) * this.tileSize });
            }
            const deskX = Math.floor(libRoom.x + libRoom.w / 2) * this.tileSize;
            const deskY = Math.floor(libRoom.y + libRoom.h / 2 + 1) * this.tileSize;
            this.tables.push({ x: deskX, y: deskY });
            this.loreScroll = { x: deskX, y: deskY - 4, collected: false };
            this.floorBooks.push({ x: deskX - 32, y: deskY + 6 });
            this.floorBooks.push({ x: deskX + 32, y: deskY + 4 });
            this.torches.push({ x: (libRoom.x + 2) * this.tileSize, y: libRoom.y * this.tileSize });
        }

        rooms.forEach((room) => {
            const rx = Math.floor(room.x + room.w / 2) * this.tileSize;
            const ry = Math.floor(room.y + room.h / 2) * this.tileSize;

            if (room.type === 'shrine') {
                this.shrine = {
                    x: rx,
                    y: ry,
                    used: false,
                    type: Math.random() < 0.5 ? 'blood' : 'blessing'
                };
            } else if (room.type === 'merchant') {
                // Kaelen (izquierda) y Gunnar (derecha) juntos en la sala de comercio
                this.merchant = { x: rx - 60, y: ry, name: 'Kaelen el Renegado' };
                this.blacksmith = { x: rx + 60, y: ry, name: 'Gunnar el Herrero' };
            } else if (room.type === 'treasure_locked') {
                this.lockedDoor = {
                    x: room.x * this.tileSize,
                    y: (room.y + Math.floor(room.h / 2)) * this.tileSize,
                    opened: false
                };
                this.chests.push({ x: rx - 24, y: ry, opened: false, isGold: true });
                this.chests.push({ x: rx + 24, y: ry, opened: false, isGold: true });
            } else if (room.type === 'ambush') {
                this.ambushRoom = {
                    x: room.x * this.tileSize,
                    y: room.y * this.tileSize,
                    w: room.w * this.tileSize,
                    h: room.h * this.tileSize,
                    triggered: false,
                    cleared: false
                };
                for (let i = -1; i <= 1; i++) {
                    this.traps.push({ x: rx + i * 36 - 14, y: ry + 24, active: false });
                }
            } else if (room.type === 'normal') {
                this.barrels.push({ x: (room.x + room.w - 2) * this.tileSize, y: (room.y + 1) * this.tileSize, broken: false });
                this.crates.push({ x: (room.x + room.w - 2) * this.tileSize, y: (room.y + 2) * this.tileSize, broken: false });
            }
        });

        const eligibleRooms = mainRooms.filter(r => r.type === 'normal');
        if (eligibleRooms.length > 0) {
            const r = eligibleRooms[0];
            this.chests.push({ x: (r.x + 2) * this.tileSize, y: (r.y + 2) * this.tileSize, opened: false });
        }
    }

    generateArenaLucian() {
        const cx = Math.floor(this.cols / 2);
        for (let r = 33; r <= 41; r++) for (let c = cx - 6; c <= cx + 6; c++) this.grid[r][c] = 0;
        for (let r = 33; r <= 40; r++) for (let c = 14; c <= 21; c++) this.grid[r][c] = 0;
        this.grid[36][22] = 0; this.grid[37][22] = 0; this.grid[36][23] = 0; this.grid[37][23] = 0;

        for (let c = 15; c <= 20; c++) this.bookshelves.push({ x: c * this.tileSize, y: 34 * this.tileSize });
        const deskX = 18 * this.tileSize; const deskY = 37 * this.tileSize;
        this.tables.push({ x: deskX, y: deskY });
        this.loreScroll = { x: deskX, y: deskY - 4, collected: false };
        this.floorBooks.push({ x: deskX - 32, y: deskY + 6 });

        for (let r = 22; r <= 33; r++) for (let c = cx - 1; c <= cx + 1; c++) this.grid[r][c] = 0;
        for (let r = 5; r <= 22; r++) for (let c = cx - 14; c <= cx + 14; c++) this.grid[r][c] = 0;

        this.merchant = { x: (cx - 7) * this.tileSize, y: 36 * this.tileSize, name: 'Kaelen el Renegado' };
        this.blacksmith = { x: (cx + 7) * this.tileSize, y: 36 * this.tileSize, name: 'Gunnar el Herrero' };
    }

    generateArenaMalakor() {
        // PISO 13: LA CÁMARA DE LA CADENA ROTA
        const cx = Math.floor(this.cols / 2);
        for (let r = 33; r <= 41; r++) for (let c = cx - 6; c <= cx + 6; c++) this.grid[r][c] = 0;
        for (let r = 20; r <= 33; r++) for (let c = cx - 1; c <= cx + 1; c++) this.grid[r][c] = 0;
        // Gran sala de duelo octogonal
        for (let r = 4; r <= 20; r++) for (let c = cx - 13; c <= cx + 13; c++) this.grid[r][c] = 0;
        this.merchant = { x: (cx + 4) * this.tileSize, y: 36 * this.tileSize, name: 'Kaelen el Renegado' };
        this.blacksmith = { x: (cx - 4) * this.tileSize, y: 36 * this.tileSize, name: 'Gunnar el Herrero' };
    }

    generateArenaSilmarion() {
        // PISO 15: EL TRONO DE CENIZA Y PRISIÓN DEL SEÑOR OSCURO
        const cx = Math.floor(this.cols / 2);
        for (let r = 33; r <= 41; r++) for (let c = cx - 6; c <= cx + 6; c++) this.grid[r][c] = 0;
        for (let r = 20; r <= 33; r++) for (let c = cx - 1; c <= cx + 1; c++) this.grid[r][c] = 0;
        for (let r = 3; r <= 20; r++) for (let c = cx - 16; c <= cx + 16; c++) this.grid[r][c] = 0;
    }

    generateArenaRotunda() {
        const cx = Math.floor(this.cols / 2);
        for (let r = 33; r <= 41; r++) for (let c = cx - 6; c <= cx + 6; c++) this.grid[r][c] = 0;
        for (let r = 33; r <= 40; r++) for (let c = 14; c <= 21; c++) this.grid[r][c] = 0;
        this.grid[36][22] = 0; this.grid[37][22] = 0; this.grid[36][23] = 0; this.grid[37][23] = 0;

        for (let c = 15; c <= 20; c++) this.bookshelves.push({ x: c * this.tileSize, y: 34 * this.tileSize });
        const deskX = 18 * this.tileSize; const deskY = 37 * this.tileSize;
        this.tables.push({ x: deskX, y: deskY });
        this.loreScroll = { x: deskX, y: deskY - 4, collected: false };
        this.floorBooks.push({ x: deskX - 32, y: deskY + 6 });

        for (let r = 24; r <= 33; r++) for (let c = cx - 1; c <= cx + 1; c++) this.grid[r][c] = 0;
        const cy = 13; const radius = 10;
        for (let r = 3; r <= 24; r++) {
            for (let c = cx - 12; c <= cx + 12; c++) {
                if (Math.hypot(c - cx, r - cy) <= radius) this.grid[r][c] = 0;
            }
        }
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            this.addAcidPool((cx + Math.cos(angle) * 6) * this.tileSize, (cy + Math.sin(angle) * 6) * this.tileSize, 99999);
        }

        this.merchant = { x: (cx - 7) * this.tileSize, y: 36 * this.tileSize, name: 'Kaelen el Renegado' };
        this.blacksmith = { x: (cx + 7) * this.tileSize, y: 36 * this.tileSize, name: 'Gunnar el Herrero' };
    }

    generateArenaApex() {
        const cx = Math.floor(this.cols / 2);
        for (let r = 33; r <= 41; r++) for (let c = cx - 6; c <= cx + 6; c++) this.grid[r][c] = 0;
        for (let r = 33; r <= 40; r++) for (let c = 14; c <= 21; c++) this.grid[r][c] = 0;
        this.grid[36][22] = 0; this.grid[37][22] = 0; this.grid[36][23] = 0; this.grid[37][23] = 0;

        for (let c = 15; c <= 20; c++) this.bookshelves.push({ x: c * this.tileSize, y: 34 * this.tileSize });
        const deskX = 18 * this.tileSize; const deskY = 37 * this.tileSize;
        this.tables.push({ x: deskX, y: deskY });
        this.loreScroll = { x: deskX, y: deskY - 4, collected: false };
        this.floorBooks.push({ x: deskX - 32, y: deskY + 6 });

        for (let r = 21; r <= 33; r++) for (let c = cx - 1; c <= cx + 1; c++) this.grid[r][c] = 0;
        for (let r = 4; r <= 21; r++) for (let c = cx - 15; c <= cx + 15; c++) this.grid[r][c] = 0;

        this.merchant = { x: (cx - 7) * this.tileSize, y: 36 * this.tileSize, name: 'Kaelen el Renegado' };
        this.blacksmith = { x: (cx + 7) * this.tileSize, y: 36 * this.tileSize, name: 'Gunnar el Herrero' };
    }

    getStartingPosition() {
        const cx = Math.floor(this.cols / 2);
        if (this.floor === 5 || this.floor === 8 || this.floor === 10) {
            return { x: cx * this.tileSize + 16, y: 38 * this.tileSize + 16 };
        }
        if (this.rooms && this.rooms.length > 0) {
            const startRoom = this.rooms[0];
            const centerTileX = Math.floor(startRoom.x + startRoom.w / 2);
            const centerTileY = Math.max(startRoom.y + 2, Math.floor(startRoom.y + startRoom.h / 2));
            return { x: centerTileX * this.tileSize + 16, y: centerTileY * this.tileSize + 16 };
        }
        return { x: 5 * this.tileSize + 16, y: 5 * this.tileSize + 16 };
    }

    placeLoreScroll() {
        if (this.loreScroll) return;
        this.loreScroll = { x: 10 * this.tileSize, y: 10 * this.tileSize, collected: false };
    }

    placeStairs() {
        const cx = Math.floor(this.cols / 2);
        if (this.floor === 5 || this.floor === 8 || this.floor === 10 || this.floor === 13) {
            this.stairs = { x: cx * this.tileSize, y: 5 * this.tileSize };
            return;
        } else if (this.floor === 15) {
            this.stairs = null; // El piso 15 es el final absoluto
            return;
        }
        if (this.rooms && this.rooms.length > 0) {
            const lastRoom = this.rooms[this.rooms.length - 1];
            this.stairs = {
                x: (lastRoom.x + Math.floor(lastRoom.w / 2)) * this.tileSize,
                y: (lastRoom.y + Math.floor(lastRoom.h / 2)) * this.tileSize
            };
            return;
        }
        this.stairs = { x: (this.cols - 5) * this.tileSize, y: (this.rows - 5) * this.tileSize };

    }

    placeTorches() {
        for (let r = 1; r < this.rows - 1; r++) {
            for (let c = 1; c < this.cols - 1; c++) {
                if (this.grid[r][c] === 1 && this.grid[r + 1][c] === 0 && Math.random() < 0.15) {
                    this.torches.push({ x: c * this.tileSize, y: r * this.tileSize });
                }
            }
        }
    }

    placeBanners() {
        for (let r = 1; r < this.rows - 1; r++) {
            for (let c = 1; c < this.cols - 1; c++) {
                if (this.grid[r][c] === 1 && this.grid[r + 1][c] === 0) {
                    const hasTorch = this.torches.some(t => t.x === c * this.tileSize && t.y === r * this.tileSize);
                    if (!hasTorch && Math.random() < 0.10) {
                        this.banners.push({ x: c * this.tileSize, y: r * this.tileSize });
                    }
                }
            }
        }
    }

    addAcidPool(x, y, duration = 300) {
        this.acidPools.push({ x, y, radius: 20, life: duration });
    }

    isInAcid(x, y) {
        for (const pool of this.acidPools) {
            if (Math.hypot(x - pool.x, y - pool.y) < pool.radius) return true;
        }
        return false;
    }

    isWallAt(x, y) {
        const c = Math.floor(x / this.tileSize);
        const r = Math.floor(y / this.tileSize);
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return true;
        return this.grid[r][c] === 1;
    }

    isSolid(x, y, w, h) {
        const margin = 1;
        const left = Math.floor((x + margin) / this.tileSize);
        const right = Math.floor((x + w - margin) / this.tileSize);
        const top = Math.floor((y + margin) / this.tileSize);
        const bottom = Math.floor((y + h - margin) / this.tileSize);

        for (let r = top; r <= bottom; r++) {
            for (let c = left; c <= right; c++) {
                if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return true;
                if (this.grid[r][c] === 1) return true;
            }
        }

        if (this.lockedDoor && !this.lockedDoor.opened) {
            if (x + margin < this.lockedDoor.x + 32 && x + w - margin > this.lockedDoor.x &&
                y + margin < this.lockedDoor.y + 32 && y + h - margin > this.lockedDoor.y) {
                return true;
            }
        }

        for (const bs of this.bookshelves) {
            if (x + margin < bs.x + 30 && x + w - margin > bs.x + 2 && y + margin < bs.y + 28 && y + h - margin > bs.y + 4) return true;
        }

        for (const t of this.tables) {
            if (x + margin < t.x + 28 && x + w - margin > t.x + 4 && y + margin < t.y + 26 && y + h - margin > t.y + 6) return true;
        }

        for (const b of this.barrels) {
            if (!b.broken && x + margin < b.x + 24 && x + w - margin > b.x + 4 && y + margin < b.y + 24 && y + h - margin > b.y + 4) return true;
        }

        for (const c of this.crates) {
            if (!c.broken && x + margin < c.x + 24 && x + w - margin > c.x + 4 && y + margin < c.y + 24 && y + h - margin > c.y + 4) return true;
        }

        return false;
    }

    update(particles) {
        this.flameTimer++;
        if (this.flameTimer % 10 === 0) this.flameFrame = (this.flameFrame + 1) % 4;

        this.spikeTimer++;
        if (this.spikeTimer % 80 === 0) {
            this.traps.forEach(t => t.active = !t.active);
        }

        if (this.loreScroll && !this.loreScroll.collected && Math.random() < 0.25) {
            particles.push(new Particle(this.loreScroll.x + 16, this.loreScroll.y + 12, 0, -0.6, '#ffd700', 3, 20));
        }

        if (this.shrine && !this.shrine.used && Math.random() < 0.3) {
            const col = this.shrine.type === 'blood' ? '#e74c3c' : '#2ecc71';
            particles.push(new Particle(this.shrine.x + (Math.random() - 0.5) * 16, this.shrine.y + 6, 0, -0.8, col, 3, 22));
        }

        for (let i = this.acidPools.length - 1; i >= 0; i--) {
            this.acidPools[i].life--;
            if (this.acidPools[i].life <= 0) this.acidPools.splice(i, 1);
        }
    }

    _isWall(r, c) {
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return true;
        return this.grid[r][c] === 1;
    }

    _isFloor(r, c) {
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return false;
        return this.grid[r][c] === 0;
    }

    _hash(r, c) {
        let h = Math.imul(r, 73856093) ^ Math.imul(c, 19349663);
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    }

    _makeShadows(shade) {
        const mk = (fn) => {
            const cv = document.createElement('canvas');
            cv.width = 32; cv.height = 32;
            fn(cv.getContext('2d'));
            return cv;
        };
        const col = (a) => `rgba(${shade},${a})`;
        return {
            n: mk(g => { [0.42, 0.27, 0.13].forEach((a, i) => { g.fillStyle = col(a); g.fillRect(0, i * 4, 32, 4); }); }),
            w: mk(g => { [0.32, 0.18, 0.08].forEach((a, i) => { g.fillStyle = col(a); g.fillRect(i * 3, 0, 3, 32); }); }),
            e: mk(g => { [0.32, 0.18, 0.08].forEach((a, i) => { g.fillStyle = col(a); g.fillRect(29 - i * 3, 0, 3, 32); }); }),
            s: mk(g => { [0.20, 0.10].forEach((a, i) => { g.fillStyle = col(a); g.fillRect(0, 30 - i * 3, 32, 3); }); })
        };
    }

    bakeMap(sheet, biome) {
        const T = this.tileSize;
        const cv = document.createElement('canvas');
        cv.width = this.cols * T;
        cv.height = this.rows * T;
        const g = cv.getContext('2d');
        g.imageSmoothingEnabled = false;

        const style = BIOME_STYLE[biome] || BIOME_STYLE.crypt;
        const sh = this._makeShadows(style.shade);
        const tile = (col, row, dx, dy) => g.drawImage(sheet, col * 32, row * 32, 32, 32, dx, dy, 32, 32);

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const dx = c * T; const dy = r * T;
                if (this.grid[r][c] === 0) {
                    const v = this.floorVariations[r][c];
                    if (v < 4) tile(v, 0, dx, dy); else tile(v - 4, 1, dx, dy);
                    if (this._isWall(r - 1, c)) g.drawImage(sh.n, dx, dy);
                    if (this._isWall(r, c - 1)) g.drawImage(sh.w, dx, dy);
                    if (this._isWall(r, c + 1)) g.drawImage(sh.e, dx, dy);
                    if (this._isWall(r + 1, c)) g.drawImage(sh.s, dx, dy);
                    continue;
                }
                if (this._isFloor(r + 1, c)) {
                    const wv = this.wallVariations[r][c];
                    tile(wv === 3 ? 2 : (wv === 2 ? 1 : 0), 2, dx, dy);
                    if (this._isFloor(r, c - 1)) g.drawImage(sh.w, dx, dy);
                    if (this._isFloor(r, c + 1)) g.drawImage(sh.e, dx, dy);
                    continue;
                }
                let nearFloor = false;
                for (let dr = -1; dr <= 1 && !nearFloor; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (this._isFloor(r + dr, c + dc)) { nearFloor = true; break; }
                    }
                }
                if (!nearFloor) {
                    tile(0, 3, dx, dy);
                } else {
                    if (this._hash(r, c) < 0.5) tile(3, 2, dx, dy); else tile(1, 3, dx, dy);
                    g.fillStyle = style.rim;
                    if (this._isFloor(r - 1, c)) g.fillRect(dx, dy, 32, 2);
                    if (this._isFloor(r, c - 1)) g.fillRect(dx, dy, 2, 32);
                    if (this._isFloor(r, c + 1)) g.fillRect(dx + 30, dy, 2, 32);
                }
            }
        }
        return cv;
    }

    drawTerrain(ctx, viewport, sheet, biome) {
        if (!sheet) {
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    ctx.fillStyle = (this.grid[r][c] === 1) ? '#282430' : '#453f50';
                    ctx.fillRect(c * this.tileSize, r * this.tileSize, 32, 32);
                }
            }
            return;
        }
        if (!this.baked || this.bakedSheet !== sheet) {
            this.baked = this.bakeMap(sheet, biome);
            this.bakedSheet = sheet;
        }
        const sx = Math.max(0, Math.floor(viewport.x));
        const sy = Math.max(0, Math.floor(viewport.y));
        const sw = Math.min(this.baked.width - sx, Math.ceil(viewport.width) + 1);
        const sh = Math.min(this.baked.height - sy, Math.ceil(viewport.height) + 1);
        if (sw > 0 && sh > 0) ctx.drawImage(this.baked, sx, sy, sw, sh, sx, sy, sw, sh);
    }

    drawTrapSpike(ctx, t) {
        ctx.save();
        const x = t.x;
        const y = t.y;

        ctx.fillStyle = '#1c1b22';
        ctx.fillRect(x, y, 28, 28);
        ctx.fillStyle = '#3a3845';
        ctx.fillRect(x + 2, y + 2, 24, 24);
        ctx.fillStyle = '#121117';
        ctx.fillRect(x + 4, y + 4, 20, 20);

        ctx.fillStyle = '#686578';
        ctx.fillRect(x + 1, y + 1, 2, 2);
        ctx.fillRect(x + 25, y + 1, 2, 2);
        ctx.fillRect(x + 1, y + 25, 2, 2);
        ctx.fillRect(x + 25, y + 25, 2, 2);

        const holes = [
            [x + 6, y + 6], [x + 18, y + 6],
            [x + 6, y + 18], [x + 18, y + 18]
        ];
        ctx.fillStyle = '#0a090d';
        holes.forEach(([hx, hy]) => ctx.fillRect(hx, hy, 4, 4));

        if (t.active) {
            holes.forEach(([hx, hy]) => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.fillRect(hx + 1, hy + 2, 4, 4);

                ctx.fillStyle = '#8a93a2';
                ctx.beginPath();
                ctx.moveTo(hx - 1, hy + 3);
                ctx.lineTo(hx + 2, hy - 10);
                ctx.lineTo(hx + 5, hy + 3);
                ctx.fill();

                ctx.fillStyle = '#eaf0f8';
                ctx.beginPath();
                ctx.moveTo(hx + 1, hy + 3);
                ctx.lineTo(hx + 2, hy - 10);
                ctx.lineTo(hx + 3, hy + 3);
                ctx.fill();

                ctx.fillStyle = '#b71520';
                ctx.fillRect(hx + 1, hy - 10, 2, 3);
            });
        }
        ctx.restore();
    }

    drawAltar(ctx, shrine) {
        ctx.save();
        const sx = shrine.x;
        const sy = shrine.y;

        ctx.fillStyle = 'rgba(10, 10, 18, 0.45)';
        ctx.beginPath();
        ctx.ellipse(sx, sy + 14, 22, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        if (!shrine.used) {
            const glowColor = shrine.type === 'blood' ? 'rgba(231, 76, 60, 0.25)' : 'rgba(46, 204, 113, 0.25)';
            const radGrad = ctx.createRadialGradient(sx, sy + 4, 4, sx, sy + 4, 42);
            radGrad.addColorStop(0, glowColor);
            radGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.arc(sx, sy + 4, 42, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#26242e';
        ctx.fillRect(sx - 18, sy + 6, 36, 8);
        ctx.fillStyle = '#3f3b4d';
        ctx.fillRect(sx - 16, sy + 5, 32, 3);

        ctx.fillStyle = '#2f2b3a';
        ctx.fillRect(sx - 14, sy - 6, 28, 12);
        ctx.fillStyle = '#4c475d';
        ctx.fillRect(sx - 14, sy - 6, 28, 2);
        ctx.fillStyle = '#1c1924';
        ctx.fillRect(sx - 14, sy + 4, 28, 2);

        ctx.fillStyle = shrine.used ? '#1a1820' : (shrine.type === 'blood' ? '#962d22' : '#1e8449');
        ctx.fillRect(sx - 1, sy - 3, 2, 6);
        ctx.fillRect(sx - 3, sy - 1, 6, 2);

        ctx.fillStyle = '#3f3b4d';
        ctx.fillRect(sx - 16, sy - 12, 32, 6);
        ctx.fillStyle = '#5a546d';
        ctx.fillRect(sx - 15, sy - 12, 30, 2);

        if (!shrine.used) {
            if (shrine.type === 'blood') {
                ctx.fillStyle = '#900c3f';
                ctx.fillRect(sx - 12, sy - 10, 24, 3);
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(sx - 8, sy - 11, 16, 2);
            } else {
                ctx.fillStyle = '#1abc9c';
                ctx.fillRect(sx - 12, sy - 10, 24, 3);
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(sx - 8, sy - 12, 16, 3);
            }

            ctx.font = '8px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#000';
            ctx.fillText(shrine.type === 'blood' ? 'ALTAR DE SANGRE (E)' : 'BENDICIÓN DIVINA (E)', sx + 1, sy - 18);
            ctx.fillStyle = shrine.type === 'blood' ? '#ff6b6b' : '#2ecc71';
            ctx.fillText(shrine.type === 'blood' ? 'ALTAR DE SANGRE (E)' : 'BENDICIÓN DIVINA (E)', sx, sy - 19);
        } else {
            ctx.fillStyle = '#1a1920';
            ctx.fillRect(sx - 12, sy - 10, 24, 3);
            ctx.font = '7px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#636e72';
            ctx.fillText('[ALTAR VACÍO]', sx, sy - 16);
        }

        ctx.restore();
    }

    drawMerchant(ctx, merchant) {
        ctx.save();
        const mx = merchant.x;
        const my = merchant.y;

        ctx.fillStyle = 'rgba(10, 10, 18, 0.45)';
        ctx.fillRect(mx - 26, my - 12, 52, 34);

        ctx.fillStyle = '#541228';
        ctx.fillRect(mx - 24, my - 10, 48, 30);
        ctx.fillStyle = '#831e3d';
        ctx.fillRect(mx - 22, my - 8, 44, 26);

        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 1;
        ctx.strokeRect(mx - 20, my - 6, 40, 22);

        ctx.fillStyle = '#e1b12c';
        for (let i = 0; i < 7; i++) {
            ctx.fillRect(mx - 23 + i * 7, my + 20, 4, 2);
            ctx.fillRect(mx - 23 + i * 7, my - 12, 4, 2);
        }

        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(mx - 16, my + 8, 5, 6);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(mx - 9, my + 7, 5, 7);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(mx + 11, my + 8, 8, 4);

        window.spriteManager.draw(
            ctx,
            'bandit',
            0, 0,
            48, 48,
            Math.floor(mx - 24), Math.floor(my - 28),
            48, 48
        );

        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText('🛒 KAELEN (E)', mx, my - 34);
        ctx.fillStyle = '#f1c40f';
        ctx.fillText('🛒 KAELEN (E)', mx, my - 34);

        ctx.restore();
    }

    drawBlacksmith(ctx, bs) {
        ctx.save();
        const bx = bs.x;
        const by = bs.y;

        // 1. Sombra bajo la forja
        ctx.fillStyle = 'rgba(10, 10, 18, 0.45)';
        ctx.beginPath();
        ctx.ellipse(bx, by + 14, 26, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Brasero / Horno de forja con carbones ardientes (a la izquierda)
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(bx - 26, by + 2, 16, 12);
        ctx.fillStyle = '#e17055';
        ctx.fillRect(bx - 24, by + 4, 12, 5);
        ctx.fillStyle = '#ffeaa7';
        ctx.fillRect(bx - 22, by + 5, 8, 3); // Fuego vivo

        // Brillo cálido de la forja
        const radGrd = ctx.createRadialGradient(bx - 18, by + 6, 2, bx - 18, by + 6, 28);
        radGrd.addColorStop(0, 'rgba(255, 120, 40, 0.35)');
        radGrd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = radGrd;
        ctx.beginPath();
        ctx.arc(bx - 18, by + 6, 28, 0, Math.PI * 2);
        ctx.fill();

        // 3. Yunque de hierro forjado (a la derecha)
        ctx.fillStyle = '#2f3542';
        ctx.fillRect(bx + 14, by + 6, 14, 8);
        ctx.fillStyle = '#747d8c';
        ctx.fillRect(bx + 11, by + 2, 20, 4); // Cuerno y cara del yunque
        ctx.fillStyle = '#f1f2f6';
        ctx.fillRect(bx + 13, by + 2, 10, 1); // Brillo del filo

        // 4. GUNNAR EL HERRERO (Cuerpo Pixel Art dedicado)
        // Piernas con botas pesadas
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(bx - 6, by + 12, 4, 7);
        ctx.fillRect(bx + 2, by + 12, 4, 7);

        // Torso: Camisa remangada y Delantal de cuero grueso
        ctx.fillStyle = '#d63031'; // Camisa roja oscura
        ctx.fillRect(bx - 8, by - 6, 16, 18);
        ctx.fillStyle = '#634024'; // Delantal de cuero marrón
        ctx.fillRect(bx - 6, by - 2, 12, 15);
        ctx.fillStyle = '#e1b12c'; // Hebilla dorada
        ctx.fillRect(bx - 2, by + 4, 4, 2);

        // Brazos musculosos y Martillo de forja
        ctx.fillStyle = '#f6cd9e'; // Brazos descubiertos
        ctx.fillRect(bx - 10, by - 2, 3, 10);
        ctx.fillRect(bx + 7, by - 2, 3, 8);
        // Martillo en la mano derecha
        ctx.fillStyle = '#57606f';
        ctx.fillRect(bx + 8, by + 4, 8, 5); // Cabeza del martillo
        ctx.fillStyle = '#834c24';
        ctx.fillRect(bx + 8, by + 6, 2, 8); // Mango de madera

        // Cabeza: Barba abundante y Bandana de forja
        ctx.fillStyle = '#f6cd9e';
        ctx.fillRect(bx - 5, by - 16, 10, 10);
        ctx.fillStyle = '#834c24'; // Barba tupida de enano/herrero
        ctx.fillRect(bx - 6, by - 10, 12, 9);
        ctx.fillRect(bx - 4, by - 7, 8, 7);
        // Ojos
        ctx.fillStyle = '#1e272e';
        ctx.fillRect(bx - 3, by - 13, 2, 2);
        ctx.fillRect(bx + 1, by - 13, 2, 2);
        // Bandana negra en la frente
        ctx.fillStyle = '#1e272e';
        ctx.fillRect(bx - 6, by - 17, 12, 3);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(bx + 5, by - 16, 3, 3); // Nudo de la bandana

        // 5. Cartel flotante centrado sobre su cabeza
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText('🔨 GUNNAR (E)', bx, by - 26);
        ctx.fillStyle = '#ff9f43';
        ctx.fillText('🔨 GUNNAR (E)', bx, by - 26);

        ctx.restore();
    }

    draw(ctx, viewport) {
        const biome = this.getBiome();
        const tileSheetKey = `tiles_${biome}`;
        const sheet = window.spriteManager.sheets[tileSheetKey];

        this.drawTerrain(ctx, viewport, sheet, biome);

        this.acidPools.forEach(pool => {
            ctx.fillStyle = 'rgba(100, 240, 40, 0.45)';
            ctx.beginPath();
            ctx.arc(pool.x, pool.y, pool.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        this.traps.forEach(t => this.drawTrapSpike(ctx, t));

        const propsSheet = window.spriteManager.sheets.props;
        if (!propsSheet) return;

        this.floorBooks.forEach(fb => ctx.drawImage(propsSheet, 352, 0, 32, 32, fb.x, fb.y, 32, 32));
        this.skeletons.forEach(s => ctx.drawImage(propsSheet, 224, 0, 32, 32, s.x, s.y, 32, 32));
        this.banners.forEach(ban => ctx.drawImage(propsSheet, 192, 0, 32, 32, ban.x, ban.y, 32, 32));
        this.crates.forEach(c => { if (!c.broken) ctx.drawImage(propsSheet, 160, 0, 32, 32, c.x, c.y, 32, 32); });
        this.barrels.forEach(b => { if (!b.broken) ctx.drawImage(propsSheet, 32, 0, 32, 32, b.x, b.y, 32, 32); });
        this.chests.forEach(c => {
            const sx = c.opened ? 288 : 64;
            ctx.drawImage(propsSheet, sx, 0, 32, 32, c.x, c.y, 32, 32);
        });
        this.bookshelves.forEach(bs => ctx.drawImage(propsSheet, 320, 0, 32, 32, bs.x, bs.y, 32, 32));
        this.tables.forEach(t => ctx.drawImage(propsSheet, 384, 0, 32, 32, t.x, t.y, 32, 32));

        if (this.lockedDoor && !this.lockedDoor.opened) {
            ctx.drawImage(propsSheet, 256, 0, 32, 32, this.lockedDoor.x, this.lockedDoor.y, 32, 32);
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(this.lockedDoor.x + 16, this.lockedDoor.y + 16, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.shrine) this.drawAltar(ctx, this.shrine);
        if (this.merchant) this.drawMerchant(ctx, this.merchant);
        if (this.blacksmith) this.drawBlacksmith(ctx, this.blacksmith);

        this.torches.forEach(t => {
            const flickerOffset = (this.flameFrame % 2 === 0) ? 0 : (this.flameFrame === 1 ? -1 : 1);
            const flick = 0.9 + 0.1 * Math.sin(this.flameTimer * 0.18 + t.x * 0.37);
            const lx = t.x + 16; const ly = t.y + 22;
            const radGrad = ctx.createRadialGradient(lx, ly, 4, lx, ly, 66);
            radGrad.addColorStop(0, `rgba(255, 175, 70, ${0.30 * flick})`);
            radGrad.addColorStop(0.5, `rgba(255, 105, 30, ${0.12 * flick})`);
            radGrad.addColorStop(1, 'rgba(255, 80, 20, 0)');
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.arc(lx, ly, 66, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.drawImage(propsSheet, 0, 0, 32, 32, t.x, t.y + flickerOffset, 32, 32);
        });

        if (this.loreScroll && !this.loreScroll.collected) {
            ctx.drawImage(propsSheet, 96, 0, 32, 32, this.loreScroll.x, this.loreScroll.y, 32, 32);
        }

        if (this.stairs) {
            ctx.drawImage(propsSheet, 128, 0, 32, 32, this.stairs.x, this.stairs.y, 32, 32);
            if (this.stairsUnlocked) {
                ctx.fillStyle = 'rgba(90, 200, 255, 0.35)';
                ctx.beginPath();
                ctx.arc(this.stairs.x + 16, this.stairs.y + 16, 22, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

window.World = World;