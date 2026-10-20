/**
 * GENERACIÓN Y GESTIÓN DE PISOS (1 A 10)
 * Genera mazmorras, salas de jefe, coloca antorchas, cofres, barriles y pergaminos de lore.
 */

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

        // Variaciones decorativas de suelo y muro
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] === 0) {
                    // 15% de probabilidad de tener charco o huesos
                    this.floorVariations[r][c] = (Math.random() < 0.16) ? 2 : 0;
                } else if (this.grid[r][c] === 1) {
                    // Muros con rejilla de alcantarilla si tienen suelo transitable debajo
                    if (r < this.rows - 1 && this.grid[r + 1][c] === 0 && Math.random() < 0.12) {
                        this.wallVariations[r][c] = 3;
                    } else {
                        this.wallVariations[r][c] = 1;
                    }
                }
            }
        }

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
        const left = Math.floor(x / this.tileSize);
        const right = Math.floor((x + w) / this.tileSize);
        const top = Math.floor(y / this.tileSize);
        const bottom = Math.floor((y + h) / this.tileSize);

        for (let r = top; r <= bottom; r++) {
            for (let c = left; c <= right; c++) {
                if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return true;
                if (this.grid[r][c] === 1) return true;
            }
        }

        // Colisión con barriles y cajas no rotos
        for (const b of this.barrels) {
            if (!b.broken) {
                if (x < b.x + 24 && x + w > b.x + 4 && y < b.y + 24 && y + h > b.y + 4) {
                    return true;
                }
            }
        }

        for (const c of this.crates) {
            if (!c.broken) {
                if (x < c.x + 24 && x + w > c.x + 4 && y < c.y + 24 && y + h > c.y + 4) {
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

    draw(ctx, viewport) {
        const biome = this.getBiome();
        const tileSheetKey = `tiles_${biome}`;
        const sheet = window.spriteManager.sheets[tileSheetKey];

        // Rango visible en pantalla
        const startCol = Math.max(0, Math.floor(viewport.x / this.tileSize));
        const endCol = Math.min(this.cols - 1, Math.ceil((viewport.x + viewport.width) / this.tileSize));
        const startRow = Math.max(0, Math.floor(viewport.y / this.tileSize));
        const endRow = Math.min(this.rows - 1, Math.ceil((viewport.y + viewport.height) / this.tileSize));

        // 1. Dibujar Suelo y Muros con perspectiva 2.5D y variaciones
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const tileType = this.grid[r][c];
                const dx = c * this.tileSize;
                const dy = r * this.tileSize;

                if (sheet) {
                    if (tileType === 1) {
                        // Pared 2.5D: Muro estándar (col 1: sx=32) o muro con rejilla/alcantarilla (col 3: sx=96)
                        const wallVar = (this.wallVariations && this.wallVariations[r]) ? this.wallVariations[r][c] : 1;
                        const sx = (wallVar === 3) ? 96 : 32;
                        ctx.drawImage(sheet, sx, 0, 32, 32, dx, dy, 32, 32);
                    } else {
                        // Suelo: Baldosa agrietada estándar (col 0: sx=0) o suelo con charco/huesos (col 2: sx=64)
                        const floorVar = (this.floorVariations && this.floorVariations[r]) ? this.floorVariations[r][c] : 0;
                        const sx = (floorVar === 2) ? 64 : 0;
                        ctx.drawImage(sheet, sx, 0, 32, 32, dx, dy, 32, 32);
                    }
                } else {
                    ctx.fillStyle = (tileType === 1) ? '#282430' : '#453f50';
                    ctx.fillRect(dx, dy, 32, 32);
                }
            }
        }

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

        // 3. Puertas de madera con arco de sillería de piedra (col 8, sx=256)
        this.doors.forEach(d => {
            ctx.drawImage(propsSheet, 256, 0, 32, 32, d.x, d.y, 32, 32);
        });

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

        // 8. Cofres de madera y oro (col 2, sx=64)
        this.chests.forEach(c => {
            ctx.drawImage(propsSheet, 64, 0, 32, 32, c.x, c.y, 32, 32);
        });

        // 9. Antorchas con animación de llama y halo de luz cálida (col 0, sx=0)
        this.torches.forEach(t => {
            const flickerOffset = (this.flameFrame % 2 === 0) ? 0 : (this.flameFrame === 1 ? -1 : 1);
            
            // Halo de iluminación ambiental cálida
            const radGrad = ctx.createRadialGradient(t.x + 16, t.y + 10, 4, t.x + 16, t.y + 10, 42);
            radGrad.addColorStop(0, 'rgba(255, 185, 60, 0.28)');
            radGrad.addColorStop(0.5, 'rgba(255, 100, 20, 0.12)');
            radGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.arc(t.x + 16, t.y + 10, 42, 0, Math.PI * 2);
            ctx.fill();

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
