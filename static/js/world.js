/**
 * GENERACIÓN Y GESTIÓN DE PISOS (1 A 10)
 * Genera mazmorras, salas de jefe, coloca antorchas, cofres, barriles y pergaminos de lore.
 */

// Colores de borde (rim) y de sombra de contacto por bioma
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
        this.cols = 40;
        this.rows = 30;

        // 0: Suelo, 1: Muro, 2: Lava/Vacío
        this.grid = [];
        this.floorVariations = []; // 0: estándar, 2: charco/huesos
        this.wallVariations = [];  // 1: muro estándar, 3: rejilla alcantarilla/grieta
        this.torches = [];
        this.barrels = [];
        this.crates = [];
        this.chests = [];
        this.banners = [];
        this.skeletons = [];
        this.doors = [];
        this.acidPools = [];
        this.loreScroll = null;
        this.stairs = null;
        this.stairsUnlocked = false;

        this.flameTimer = 0;
        this.flameFrame = 0;

        // Mapa pre-renderizado (se hornea una sola vez por piso)
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
        // Inicializar cuadrícula llena de muros (1)
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

        if (this.floor === 8) {
            this.generateArenaRotunda();
        } else if (this.floor === 10) {
            this.generateArenaApex();
        } else {
            this.generateDungeonRooms();
        }

        // Variaciones decorativas
        // floorVariations: 0-3 = losas base, 4 = grieta, 5 = acento A, 6 = acento B, 7 = escombros
        // wallVariations:  1 = ladrillo A, 2 = ladrillo B, 3 = ladrillo con acento
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

        // Colocar antorchas decorativas en los muros interiores
        this.placeTorches();

        // Colocar estandartes rojos en paredes
        this.placeBanners();

        // Colocar pergamino de lore
        this.placeLoreScroll();

        // Colocar escaleras / portal de salida
        this.placeStairs();
    }

    generateDungeonRooms() {
        const rooms = [];
        const numRooms = 6;

        for (let i = 0; i < numRooms; i++) {
            const w = Math.floor(Math.random() * 5) + 6;
            const h = Math.floor(Math.random() * 4) + 5;
            let x, y;
            if (i === 0) {
                // Habitación inicial: garantiza margen superior de al menos 4 casillas
                x = Math.floor(Math.random() * 4) + 3;
                y = Math.floor(Math.random() * 3) + 4;
            } else {
                x = Math.floor(Math.random() * (this.cols - w - 4)) + 2;
                y = Math.floor(Math.random() * (this.rows - h - 6)) + 4;
            }

            // Esculpir habitación
            for (let r = y; r < y + h; r++) {
                for (let c = x; c < x + w; c++) {
                    this.grid[r][c] = 0;
                }
            }

            // Conectar con la sala anterior mediante pasillo y puerta
            if (rooms.length > 0) {
                const prev = rooms[rooms.length - 1];
                const cx1 = Math.floor(prev.x + prev.w / 2);
                const cy1 = Math.floor(prev.y + prev.h / 2);
                const cx2 = Math.floor(x + w / 2);
                const cy2 = Math.floor(y + h / 2);

                // Pasillo horizontal
                const startX = Math.min(cx1, cx2);
                const endX = Math.max(cx1, cx2);
                for (let c = startX; c <= endX; c++) {
                    this.grid[cy1][c] = 0;
                    if (cy1 + 1 < this.rows - 1) this.grid[cy1 + 1][c] = 0;
                }

                // Pasillo vertical
                const startY = Math.min(cy1, cy2);
                const endY = Math.max(cy1, cy2);
                for (let r = startY; r <= endY; r++) {
                    this.grid[r][cx2] = 0;
                    if (cx2 + 1 < this.cols - 1) this.grid[r][cx2 + 1] = 0;
                }

                // Colocar puerta de arco de piedra en la entrada de la habitación
                this.doors.push({
                    x: x * this.tileSize,
                    y: y * this.tileSize
                });
            }

            rooms.push({ x, y, w, h });
        }

        this.rooms = rooms;

        // Colocar utilería (barriles, cajas reforzadas, cofres y esqueletos) en las salas
        rooms.forEach((room, idx) => {
            if (idx > 0 && Math.random() < 0.75) {
                this.chests.push({
                    x: (room.x + 1) * this.tileSize,
                    y: (room.y + 1) * this.tileSize,
                    opened: false
                });
            }
            // Barriles reforzados
            this.barrels.push({
                x: (room.x + room.w - 2) * this.tileSize,
                y: (room.y + 1) * this.tileSize,
                broken: false
            });
            // Cajas de madera (Crates)
            this.crates.push({
                x: (room.x + room.w - 2) * this.tileSize,
                y: (room.y + 2) * this.tileSize,
                broken: false
            });
            // Esqueletos caídos decorativos en el suelo
            if (idx > 0 && Math.random() < 0.6) {
                this.skeletons.push({
                    x: (room.x + Math.floor(room.w / 2)) * this.tileSize,
                    y: (room.y + Math.floor(room.h / 2)) * this.tileSize
                });
            }
        });
    }

    generateArenaRotunda() {
        // Rotonda circular gigante para el combate contra Abracadabra
        const cx = Math.floor(this.cols / 2);
        const cy = Math.floor(this.rows / 2);
        const radius = 11;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const dist = Math.hypot(c - cx, r - cy);
                if (dist <= radius) {
                    this.grid[r][c] = 0;
                }
            }
        }

        // Charcos permanentes de ácido en el suelo
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const px = (cx + Math.cos(angle) * 6) * this.tileSize;
            const py = (cy + Math.sin(angle) * 6) * this.tileSize;
            this.addAcidPool(px, py, 99999);
        }
    }

    generateArenaApex() {
        // Cúspide de la torre sobre el abismo para Hong Devorador de Hombres
        const startX = 6;
        const endX = this.cols - 6;
        const startY = 4;
        const endY = this.rows - 4;

        for (let r = startY; r < endY; r++) {
            for (let c = startX; c < endX; c++) {
                this.grid[r][c] = 0;
            }
        }
    }

    placeTorches() {
        for (let r = 1; r < this.rows - 1; r++) {
            for (let c = 1; c < this.cols - 1; c++) {
                if (this.grid[r][c] === 1 && this.grid[r + 1][c] === 0) {
                    if (Math.random() < 0.20) {
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
        // Coloca estandartes heráldicos rojos en muros con suelo transitable al sur
        for (let r = 1; r < this.rows - 1; r++) {
            for (let c = 1; c < this.cols - 1; c++) {
                if (this.grid[r][c] === 1 && this.grid[r + 1][c] === 0) {
                    const hasTorch = this.torches.some(t => t.x === c * this.tileSize && t.y === r * this.tileSize);
                    if (!hasTorch && Math.random() < 0.14) {
                        this.banners.push({
                            x: c * this.tileSize,
                            y: r * this.tileSize
                        });
                    }
                }
            }
        }
    }

    placeLoreScroll() {
        // Colocar pergamino en una posición transitable y accesible
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 100) {
            attempts++;
            const r = Math.floor(Math.random() * (this.rows - 4)) + 2;
            const c = Math.floor(Math.random() * (this.cols - 4)) + 2;
            if (this.grid[r][c] === 0) {
                this.loreScroll = {
                    x: c * this.tileSize + 8,
                    y: r * this.tileSize + 8,
                    collected: false
                };
                placed = true;
            }
        }
    }

    placeStairs() {
        // Colocar escaleras en el extremo más alejado
        for (let r = this.rows - 3; r >= 2; r--) {
            for (let c = this.cols - 3; c >= 2; c--) {
                if (this.grid[r][c] === 0) {
                    this.stairs = {
                        x: c * this.tileSize,
                        y: r * this.tileSize
                    };
                    return;
                }
            }
        }
    }

    /**
     * Calcula la posición de spawn garantizada en casilla transitable (TILE_FLOOR),
     * asegurando margen superior de al menos 2-3 casillas para que el HUD no tape al personaje.
     */
    getStartingPosition() {
        let spawnX = 0;
        let spawnY = 0;

        if (this.rooms && this.rooms.length > 0) {
            const startRoom = this.rooms[0];
            // Centro de la primera habitación
            const centerTileX = Math.floor(startRoom.x + startRoom.w / 2);
            // Asegurar mínimo 2 o 3 casillas de distancia de la pared superior
            const centerTileY = Math.max(startRoom.y + 2, Math.floor(startRoom.y + startRoom.h / 2));
            spawnX = centerTileX * this.tileSize + 16;
            spawnY = centerTileY * this.tileSize + 16;
        } else if (this.floor === 8) {
            // Rotonda de Abracadabra: spawn en el sector sur de la arena
            const cx = Math.floor(this.cols / 2);
            const cy = Math.floor(this.rows / 2) + 6;
            spawnX = cx * this.tileSize + 16;
            spawnY = cy * this.tileSize + 16;
        } else if (this.floor === 10) {
            // Cúspide de Hong: spawn en el sector sur
            const cx = Math.floor(this.cols / 2);
            const cy = this.rows - 6;
            spawnX = cx * this.tileSize + 16;
            spawnY = cy * this.tileSize + 16;
        }

        // Validación estricta: asegurar que la casilla es suelo (0) y NUNCA (0, 0) ni muro
        const checkC = Math.floor(spawnX / this.tileSize);
        const checkR = Math.floor(spawnY / this.tileSize);

        if (checkR >= 3 && checkR < this.rows - 2 && checkC >= 2 && checkC < this.cols - 2 && this.grid[checkR][checkC] === 0) {
            return { x: spawnX, y: spawnY };
        }

        // Búsqueda de respaldo: primera casilla de suelo con margen superior >= 4 casillas
        for (let r = 4; r < this.rows - 3; r++) {
            for (let c = 3; c < this.cols - 3; c++) {
                if (this.grid[r][c] === 0) {
                    return { x: c * this.tileSize + 16, y: r * this.tileSize + 16 };
                }
            }
        }

        return { x: 5 * this.tileSize + 16, y: 5 * this.tileSize + 16 };
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
        // Margen de tolerancia de 1px hacia adentro para evitar atascos por redondeo de flotantes en esquinas
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

        // Colisión con barriles y cajas no rotos
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
        // Animación de antorchas
        this.flameTimer++;
        if (this.flameTimer % 10 === 0) {
            this.flameFrame = (this.flameFrame + 1) % 4;
        }

        // Partículas en pergamino de lore
        if (this.loreScroll && Math.random() < 0.25) {
            particles.push(new Particle(
                this.loreScroll.x + 8 + (Math.random() - 0.5) * 16,
                this.loreScroll.y + 8 + (Math.random() - 0.5) * 16,
                0, -0.6, '#ffd700', 3, 20
            ));
        }

        // Actualizar charcos de ácido
        for (let i = this.acidPools.length - 1; i >= 0; i--) {
            this.acidPools[i].life--;
            if (this.acidPools[i].life <= 0) {
                this.acidPools.splice(i, 1);
            }
        }
    }

    // ------------------------------------------------------------------
    // RENDER DE TERRENO (pared con volumen, sombras de contacto, mapa horneado)
    // ------------------------------------------------------------------
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

    // Sombras de contacto en bandas (estilo pixel art, sin degradados suaves)
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

    /**
     * Pre-renderiza todo el terreno en un canvas auxiliar (una sola vez por piso).
     * Layout del tileset (4x4 tiles de 32px):
     *   fila 0: suelo A-D | fila 1: grieta, acento A, acento B, escombros
     *   fila 2: muro frontal A, B, con acento, cima plana | fila 3: vacío, cima plana B
     */
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
                    // SUELO + sombras de contacto contra los muros vecinos
                    const v = this.floorVariations[r][c];
                    if (v < 4) tile(v, 0, dx, dy); else tile(v - 4, 1, dx, dy);
                    if (this._isWall(r - 1, c)) g.drawImage(sh.n, dx, dy);
                    if (this._isWall(r, c - 1)) g.drawImage(sh.w, dx, dy);
                    if (this._isWall(r, c + 1)) g.drawImage(sh.e, dx, dy);
                    if (this._isWall(r + 1, c)) g.drawImage(sh.s, dx, dy);
                    continue;
                }

                if (this._isFloor(r + 1, c)) {
                    // CARA FRONTAL: el muro que mira al jugador (con ladrillos)
                    const wv = this.wallVariations[r][c];
                    tile(wv === 3 ? 2 : (wv === 2 ? 1 : 0), 2, dx, dy);
                    if (this._isFloor(r, c - 1)) g.drawImage(sh.w, dx, dy);
                    if (this._isFloor(r, c + 1)) g.drawImage(sh.e, dx, dy);
                    continue;
                }

                // CIMA o ROCA PROFUNDA
                let nearFloor = false;
                for (let dr = -1; dr <= 1 && !nearFloor; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (this._isFloor(r + dr, c + dc)) { nearFloor = true; break; }
                    }
                }
                if (!nearFloor) {
                    tile(0, 3, dx, dy);               // vacío liso (sin ruido)
                } else {
                    if (this._hash(r, c) < 0.5) tile(3, 2, dx, dy); else tile(1, 3, dx, dy);
                    // Borde claro hacia el suelo para definir la silueta de la sala
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
            // Respaldo si el tileset no cargó
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

        // 1. Terreno (suelo, muros con volumen y sombras) desde el mapa horneado
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

        // 3. Puertas: desactivadas (no se dibujan). Para volver a mostrarlas, descomenta:
        // this.doors.forEach(d => {
        //     ctx.drawImage(propsSheet, 256, 0, 32, 32, d.x, d.y, 32, 32);
        // });

        // 4. Esqueletos caídos en el suelo (col 7, sx=224)
        this.skeletons.forEach(s => {
            ctx.drawImage(propsSheet, 224, 0, 32, 32, s.x, s.y, 32, 32);
        });

        // 5. Estandartes heráldicos rojos en muros (col 6, sx=192)
        this.banners.forEach(ban => {
            ctx.drawImage(propsSheet, 192, 0, 32, 32, ban.x, ban.y, 32, 32);
        });

        // 6. Cajas de madera reforzada (Crates) (col 5, sx=160)
        this.crates.forEach(c => {
            if (!c.broken) {
                ctx.drawImage(propsSheet, 160, 0, 32, 32, c.x, c.y, 32, 32);
            }
        });

        // 7. Barriles reforzados con aros de hierro (col 1, sx=32)
        this.barrels.forEach(b => {
            if (!b.broken) {
                ctx.drawImage(propsSheet, 32, 0, 32, 32, b.x, b.y, 32, 32);
            }
        });

        // 8. Cofres de madera y oro 
        this.chests.forEach(c => {
            const sx = c.opened ? 288 : 64; // sx = 288 es el cofre abierto generado en props.png
            ctx.drawImage(propsSheet, sx, 0, 32, 32, c.x, c.y, 32, 32);
        });

        // 9. Antorchas con animación de llama y halo de luz cálida (col 0, sx=0)
        this.torches.forEach(t => {
            const flickerOffset = (this.flameFrame % 2 === 0) ? 0 : (this.flameFrame === 1 ? -1 : 1);

            // Halo de luz cálida (mezcla aditiva + parpadeo leve), cae sobre el suelo
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

            // Dibujar antorcha
            ctx.drawImage(propsSheet, 0, 0, 32, 32, t.x, t.y + flickerOffset, 32, 32);
        });

        // 10. Pergamino de Lore Brillante (col 3, sx=96)
        if (this.loreScroll) {
            ctx.drawImage(propsSheet, 96, 0, 32, 32, this.loreScroll.x, this.loreScroll.y, 32, 32);
        }

        // 11. Escaleras de Descenso con Arco de Piedra / Portal de Piso (col 4, sx=128)
        if (this.stairs) {
            ctx.drawImage(propsSheet, 128, 0, 32, 32, this.stairs.x, this.stairs.y, 32, 32);
            // Si está desbloqueado, aura luminosa celeste
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