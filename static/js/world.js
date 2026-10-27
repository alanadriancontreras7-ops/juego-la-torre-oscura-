/**
 * GENERACIÓN Y GESTIÓN DE PISOS (1 A 10)
 * Mazmorras al doble de tamaño (60x45), salas de biblioteca desordenada con escritorio
 * y notas situadas siempre sobre la mesa.
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
        // Dimensiones aumentadas a más del doble (2.700 baldosas)
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
        this.doors = [];
        this.acidPools = [];

        // Elementos de la biblioteca
        this.bookshelves = [];
        this.floorBooks = [];
        this.tables = [];

        this.loreScroll = null;
        this.stairs = null;
        this.stairsUnlocked = false;

        this.flameTimer = 0;
        this.flameFrame = 0;

        this.baked = null;
        this.bakedSheet = null;

        this.generateFloor();
    }

    getBiome() {
        if (this.floor <= 4) return 'crypt';
        if (this.floor <= 7) return 'demon';
        if (this.floor === 8) return 'acid';
        return 'apex';
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
        this.doors = [];
        this.acidPools = [];
        this.bookshelves = [];
        this.floorBooks = [];
        this.tables = [];

        if (this.floor === 5) {
            this.generateArenaLucian();
        } else if (this.floor === 8) {
            this.generateArenaRotunda();
        } else if (this.floor === 10) {
            this.generateArenaApex();
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
        // Más salas para explorar en el mapa grande (10 habitaciones)
        const numRooms = 10;

        for (let i = 0; i < numRooms; i++) {
            const w = Math.floor(Math.random() * 5) + 7; // ancho 7 a 11
            const h = Math.floor(Math.random() * 4) + 6; // alto 6 a 9
            let x, y;
            if (i === 0) {
                x = Math.floor(Math.random() * 4) + 4;
                y = Math.floor(Math.random() * 3) + 5;
            } else {
                x = Math.floor(Math.random() * (this.cols - w - 6)) + 3;
                y = Math.floor(Math.random() * (this.rows - h - 6)) + 4;
            }

            for (let r = y; r < y + h; r++) {
                for (let c = x; c < x + w; c++) {
                    this.grid[r][c] = 0;
                }
            }

            if (rooms.length > 0) {
                const prev = rooms[rooms.length - 1];
                const cx1 = Math.floor(prev.x + prev.w / 2);
                const cy1 = Math.floor(prev.y + prev.h / 2);
                const cx2 = Math.floor(x + w / 2);
                const cy2 = Math.floor(y + h / 2);

                const startX = Math.min(cx1, cx2);
                const endX = Math.max(cx1, cx2);
                for (let c = startX; c <= endX; c++) {
                    this.grid[cy1][c] = 0;
                    if (cy1 + 1 < this.rows - 1) this.grid[cy1 + 1][c] = 0;
                }

                const startY = Math.min(cy1, cy2);
                const endY = Math.max(cy1, cy2);
                for (let r = startY; r <= endY; r++) {
                    this.grid[r][cx2] = 0;
                    if (cx2 + 1 < this.cols - 1) this.grid[r][cx2 + 1] = 0;
                }
            }

            rooms.push({ x, y, w, h });
        }

        this.rooms = rooms;

        // =====================================================================
        // CONSTRUCCIÓN DE LA SALA DE BIBLIOTECA DESORDENADA
        // =====================================================================
        // Elegimos una sala intermedia (ej: sala 3) para ser la biblioteca oficial
        const libRoomIdx = Math.min(3, rooms.length - 2);
        const libRoom = rooms[libRoomIdx];

        if (libRoom) {
            // 1. Estantes de libros a lo largo de la pared norte de la sala
            for (let c = libRoom.x + 1; c < libRoom.x + libRoom.w - 1; c += 2) {
                this.bookshelves.push({
                    x: c * this.tileSize,
                    y: (libRoom.y + 1) * this.tileSize
                });
            }

            // 2. Estantes en esquinas
            this.bookshelves.push({
                x: (libRoom.x + 1) * this.tileSize,
                y: (libRoom.y + 2) * this.tileSize
            });
            this.bookshelves.push({
                x: (libRoom.x + libRoom.w - 2) * this.tileSize,
                y: (libRoom.y + 2) * this.tileSize
            });

            // 3. Libros tirados y hojas caídas por el suelo alrededor
            this.floorBooks.push({
                x: (libRoom.x + 2) * this.tileSize,
                y: (libRoom.y + 3) * this.tileSize
            });
            this.floorBooks.push({
                x: (libRoom.x + libRoom.w - 3) * this.tileSize,
                y: (libRoom.y + 3) * this.tileSize
            });
            this.floorBooks.push({
                x: Math.floor(libRoom.x + libRoom.w / 2 - 1) * this.tileSize,
                y: (libRoom.y + Math.floor(libRoom.h / 2) + 1) * this.tileSize
            });

            // 4. Mesa / Escritorio en el centro de la biblioteca
            const deskX = Math.floor(libRoom.x + libRoom.w / 2) * this.tileSize;
            const deskY = Math.floor(libRoom.y + libRoom.h / 2) * this.tileSize;
            this.tables.push({ x: deskX, y: deskY });

            // 5. La nota estará SIEMPRE encima de esta mesa
            this.loreScroll = {
                x: deskX,
                y: deskY - 4, // Colocada sobre el tablero
                collected: false
            };
        }

        // =====================================================================
        // UTILERÍA EN LAS OTRAS SALAS
        // =====================================================================
        rooms.forEach((room, idx) => {
            if (idx === libRoomIdx) return; // No saturar la biblioteca

            this.barrels.push({
                x: (room.x + room.w - 2) * this.tileSize,
                y: (room.y + 1) * this.tileSize,
                broken: false
            });
            this.crates.push({
                x: (room.x + room.w - 2) * this.tileSize,
                y: (room.y + 2) * this.tileSize,
                broken: false
            });
            if (idx > 0 && Math.random() < 0.5) {
                this.skeletons.push({
                    x: (room.x + Math.floor(room.w / 2)) * this.tileSize,
                    y: (room.y + Math.floor(room.h / 2)) * this.tileSize
                });
            }
        });

        // Máximo 2 cofres en salas aleatorias
        const eligibleRooms = rooms.filter((_, idx) => idx !== 0 && idx !== libRoomIdx).sort(() => Math.random() - 0.5);
        const numChests = Math.min(2, Math.floor(Math.random() * 2) + 1);
        for (let i = 0; i < numChests && i < eligibleRooms.length; i++) {
            const room = eligibleRooms[i];
            this.chests.push({
                x: (room.x + 1) * this.tileSize,
                y: (room.y + 1) * this.tileSize,
                opened: false
            });
        }
    }

    generateArenaLucian() {
        // PISO 5: ANTESALA CON RINCÓN DE ESTUDIO + GUARIDA DE LUCIAN
        const cx = Math.floor(this.cols / 2); // 30

        // 1. Antesala sur
        for (let r = 32; r <= 40; r++) {
            for (let c = cx - 10; c <= cx + 10; c++) {
                this.grid[r][c] = 0;
            }
        }
        // Pasillo
        for (let r = 22; r <= 32; r++) {
            for (let c = cx - 2; c <= cx + 2; c++) {
                this.grid[r][c] = 0;
            }
        }
        // Guarida norte de Lucian
        for (let r = 5; r <= 22; r++) {
            for (let c = cx - 14; c <= cx + 14; c++) {
                this.grid[r][c] = 0;
            }
        }

        // Estudio / Mesa con nota en la antesala sur
        const deskX = (cx - 6) * this.tileSize;
        const deskY = 36 * this.tileSize;
        this.bookshelves.push({ x: (cx - 8) * this.tileSize, y: 34 * this.tileSize });
        this.bookshelves.push({ x: (cx - 6) * this.tileSize, y: 34 * this.tileSize });
        this.floorBooks.push({ x: (cx - 4) * this.tileSize, y: 37 * this.tileSize });
        this.tables.push({ x: deskX, y: deskY });
        this.loreScroll = { x: deskX, y: deskY - 4, collected: false };
    }

    generateArenaRotunda() {
        // PISO 8: ANTECÁMARA CON MESA + ROTONDA DE ABRACADABRA
        const cx = Math.floor(this.cols / 2); // 30

        // Antesala sur
        for (let r = 32; r <= 40; r++) {
            for (let c = cx - 10; c <= cx + 10; c++) {
                this.grid[r][c] = 0;
            }
        }
        // Pasillo
        for (let r = 24; r <= 32; r++) {
            for (let c = cx - 2; c <= cx + 2; c++) {
                this.grid[r][c] = 0;
            }
        }
        // Rotonda norte
        const cy = 13;
        const radius = 10;
        for (let r = 3; r <= 24; r++) {
            for (let c = cx - 12; c <= cx + 12; c++) {
                const dist = Math.hypot(c - cx, r - cy);
                if (dist <= radius) {
                    this.grid[r][c] = 0;
                }
            }
        }

        // Charcos de ácido en la rotonda norte
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const px = (cx + Math.cos(angle) * 6) * this.tileSize;
            const py = (cy + Math.sin(angle) * 6) * this.tileSize;
            this.addAcidPool(px, py, 99999);
        }

        // Mesa de estudio en la antesala
        const deskX = (cx - 6) * this.tileSize;
        const deskY = 36 * this.tileSize;
        this.bookshelves.push({ x: (cx - 8) * this.tileSize, y: 34 * this.tileSize });
        this.bookshelves.push({ x: (cx - 6) * this.tileSize, y: 34 * this.tileSize });
        this.floorBooks.push({ x: (cx - 4) * this.tileSize, y: 37 * this.tileSize });
        this.tables.push({ x: deskX, y: deskY });
        this.loreScroll = { x: deskX, y: deskY - 4, collected: false };
    }

    generateArenaApex() {
        // PISO 10: ANTESALA CON MESA + TRONO DE HONG
        const cx = Math.floor(this.cols / 2); // 30

        // Antesala sur
        for (let r = 32; r <= 40; r++) {
            for (let c = cx - 10; c <= cx + 10; c++) {
                this.grid[r][c] = 0;
            }
        }
        // Puente sobre el vacío
        for (let r = 21; r <= 32; r++) {
            for (let c = cx - 2; c <= cx + 2; c++) {
                this.grid[r][c] = 0;
            }
        }
        // Gran Salón del Trono (Norte)
        for (let r = 4; r <= 21; r++) {
            for (let c = cx - 15; c <= cx + 15; c++) {
                this.grid[r][c] = 0;
            }
        }

        // Mesa de estudio en la antesala
        const deskX = (cx - 6) * this.tileSize;
        const deskY = 36 * this.tileSize;
        this.bookshelves.push({ x: (cx - 8) * this.tileSize, y: 34 * this.tileSize });
        this.bookshelves.push({ x: (cx - 6) * this.tileSize, y: 34 * this.tileSize });
        this.floorBooks.push({ x: (cx - 4) * this.tileSize, y: 37 * this.tileSize });
        this.tables.push({ x: deskX, y: deskY });
        this.loreScroll = { x: deskX, y: deskY - 4, collected: false };
    }

    getStartingPosition() {
        const cx = Math.floor(this.cols / 2);
        if (this.floor === 5 || this.floor === 8 || this.floor === 10) {
            // Spawn al sur de la antesala
            return { x: cx * this.tileSize + 16, y: 37 * this.tileSize + 16 };
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
        // En todos los pisos la nota ya se colocó automáticamente sobre la mesa (en la biblioteca o antesala)
        if (this.loreScroll) return;

        // Fallback por si acaso
        this.loreScroll = {
            x: 10 * this.tileSize,
            y: 10 * this.tileSize,
            collected: false
        };
    }

    placeStairs() {
        const cx = Math.floor(this.cols / 2);
        if (this.floor === 5 || this.floor === 8) {
            // Escaleras al fondo norte detrás del sub-jefe
            this.stairs = {
                x: cx * this.tileSize,
                y: 5 * this.tileSize
            };
            return;
        } else if (this.floor === 10) {
            this.stairs = null; // Aparece como portal al morir Hong
            return;
        }

        // Pisos normales: en la última sala
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
                if (this.grid[r][c] === 1 && this.grid[r + 1][c] === 0) {
                    if (Math.random() < 0.16) {
                        this.torches.push({
                            x: c * this.tileSize,
                            y: r * this.tileSize
                        });
                    }
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
                        this.banners.push({
                            x: c * this.tileSize,
                            y: r * this.tileSize
                        });
                    }
                }
            }
        }
    }

    addAcidPool(x, y, duration = 300) {
        this.acidPools.push({
            x: x,
            y: y,
            radius: 20,
            life: duration
        });
    }

    isInAcid(x, y) {
        for (const pool of this.acidPools) {
            if (Math.hypot(x - pool.x, y - pool.y) < pool.radius) {
                return true;
            }
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

        // Colisión con estanterías de libros
        for (const bs of this.bookshelves) {
            if (x + margin < bs.x + 28 && x + w - margin > bs.x + 4 && y + margin < bs.y + 28 && y + h - margin > bs.y + 4) {
                return true;
            }
        }

        // Colisión con la mesa de la biblioteca
        for (const t of this.tables) {
            if (x + margin < t.x + 28 && x + w - margin > t.x + 4 && y + margin < t.y + 26 && y + h - margin > t.y + 6) {
                return true;
            }
        }

        for (const b of this.barrels) {
            if (!b.broken) {
                if (x + margin < b.x + 24 && x + w - margin > b.x + 4 && y + margin < b.y + 24 && y + h - margin > b.y + 4) {
                    return true;
                }
            }
        }

        for (const c of this.crates) {
            if (!c.broken) {
                if (x + margin < c.x + 24 && x + w - margin > c.x + 4 && y + margin < c.y + 24 && y + h - margin > c.y + 4) {
                    return true;
                }
            }
        }

        return false;
    }

    update(particles) {
        this.flameTimer++;
        if (this.flameTimer % 10 === 0) {
            this.flameFrame = (this.flameFrame + 1) % 4;
        }

        // Partículas sobre la nota en la mesa
        if (this.loreScroll && !this.loreScroll.collected && Math.random() < 0.25) {
            particles.push(new Particle(
                this.loreScroll.x + 16 + (Math.random() - 0.5) * 16,
                this.loreScroll.y + 12 + (Math.random() - 0.5) * 10,
                0, -0.6, '#ffd700', 3, 20
            ));
        }

        for (let i = this.acidPools.length - 1; i >= 0; i--) {
            this.acidPools[i].life--;
            if (this.acidPools[i].life <= 0) {
                this.acidPools.splice(i, 1);
            }
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
                const dx = c * T;
                const dy = r * T;

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

    draw(ctx, viewport) {
        const biome = this.getBiome();
        const tileSheetKey = `tiles_${biome}`;
        const sheet = window.spriteManager.sheets[tileSheetKey];

        // 1. Terreno
        this.drawTerrain(ctx, viewport, sheet, biome);

        // 2. Charcos de ácido
        this.acidPools.forEach(pool => {
            ctx.fillStyle = 'rgba(100, 240, 40, 0.45)';
            ctx.beginPath();
            ctx.arc(pool.x, pool.y, pool.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#88ff33';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        const propsSheet = window.spriteManager.sheets.props;
        if (!propsSheet) return;

        // 3. Libros tirados y hojas caídas en el piso de la biblioteca (col 11, sx=352)
        this.floorBooks.forEach(fb => {
            ctx.drawImage(propsSheet, 352, 0, 32, 32, fb.x, fb.y, 32, 32);
        });

        // 4. Esqueletos
        this.skeletons.forEach(s => {
            ctx.drawImage(propsSheet, 224, 0, 32, 32, s.x, s.y, 32, 32);
        });

        // 5. Estandartes
        this.banners.forEach(ban => {
            ctx.drawImage(propsSheet, 192, 0, 32, 32, ban.x, ban.y, 32, 32);
        });

        // 6. Cajas y Barriles
        this.crates.forEach(c => {
            if (!c.broken) {
                ctx.drawImage(propsSheet, 160, 0, 32, 32, c.x, c.y, 32, 32);
            }
        });
        this.barrels.forEach(b => {
            if (!b.broken) {
                ctx.drawImage(propsSheet, 32, 0, 32, 32, b.x, b.y, 32, 32);
            }
        });

        // 7. Cofres
        this.chests.forEach(c => {
            const sx = c.opened ? 288 : 64;
            ctx.drawImage(propsSheet, sx, 0, 32, 32, c.x, c.y, 32, 32);
        });

        // 8. Estanterías de libros (col 10, sx=320)
        this.bookshelves.forEach(bs => {
            ctx.drawImage(propsSheet, 320, 0, 32, 32, bs.x, bs.y, 32, 32);
        });

        // 9. Mesa / Escritorio de roble (col 12, sx=384)
        this.tables.forEach(t => {
            ctx.drawImage(propsSheet, 384, 0, 32, 32, t.x, t.y, 32, 32);
        });

        // 10. Antorchas con luz
        this.torches.forEach(t => {
            const flickerOffset = (this.flameFrame % 2 === 0) ? 0 : (this.flameFrame === 1 ? -1 : 1);
            const flick = 0.9 + 0.1 * Math.sin(this.flameTimer * 0.18 + t.x * 0.37);
            const lx = t.x + 16;
            const ly = t.y + 22;
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

        // 11. Pergamino de Lore (col 3, sx=96) - Colocado sobre la mesa
        if (this.loreScroll && !this.loreScroll.collected) {
            ctx.drawImage(propsSheet, 96, 0, 32, 32, this.loreScroll.x, this.loreScroll.y, 32, 32);
        }

        // 12. Escaleras / Portal
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