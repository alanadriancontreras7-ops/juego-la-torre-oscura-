/**
 * GESTOR Y RENDERIZADOR DE SPRITES PIXEL ART
 * Carga las hojas de sprites pregeneradas y proporciona renderizado con parpadeo rojo y dirección.
 */

class SpriteManager {
    constructor() {
        this.sheets = {};
        this.loaded = false;
        this.loadCount = 0;
        this.totalAssets = 0;

        // Rutas de todas las hojas de sprites
        this.assetUrls = {
            warrior: '/static/assets/sprites/player_warrior.png?v=2',
            archer: '/static/assets/sprites/player_archer.png?v=2',
            mage: '/static/assets/sprites/player_mage.png?v=2',
            bandit: '/static/assets/sprites/enemy_bandit.png?v=2',
            skeleton: '/static/assets/sprites/enemy_skeleton.png?v=2',
            spider: '/static/assets/sprites/enemy_spider.png?v=2',
            rat: '/static/assets/sprites/enemy_rat.png?v=2',
            werewolf: '/static/assets/sprites/enemy_werewolf.png?v=2',
            demon: '/static/assets/sprites/enemy_demon.png?v=2',
            abracadabra: '/static/assets/sprites/boss_abracadabra.png?v=2',
            hong: '/static/assets/sprites/boss_hong.png?v=2',
            tiles_crypt: '/static/assets/sprites/tileset_crypt.png?v=3',
            tiles_demon: '/static/assets/sprites/tileset_demon.png?v=3',
            tiles_acid: '/static/assets/sprites/tileset_acid.png?v=3',
            tiles_apex: '/static/assets/sprites/tileset_apex.png?v=3',
            props: '/static/assets/sprites/props.png?v=2',
            icons: '/static/assets/sprites/icons.png?v=2'
        };
    }

    loadAll(onComplete) {
        const keys = Object.keys(this.assetUrls);
        this.totalAssets = keys.length;

        keys.forEach(key => {
            const img = new Image();
            img.src = this.assetUrls[key];
            img.onload = () => {
                // Procesar la imagen en un canvas auxiliar para asegurar canal alfa transparente estricto
                // Si la imagen trae un fondo gris o no-alfa, lo eliminamos con un filtro de transparencia
                // Los tilesets son opacos a propósito: el chroma-key borraría píxeles de suelo/pared
                this.sheets[key] = key.startsWith('tiles_') ? img : this.processAlphaChannel(img);
                this.loadCount++;
                if (this.loadCount >= this.totalAssets) {
                    this.loaded = true;
                    if (onComplete) onComplete();
                }
            };
            img.onerror = () => {
                console.warn(`Error al cargar sprite: ${key}`);
                this.loadCount++;
                if (this.loadCount >= this.totalAssets) {
                    this.loaded = true;
                    if (onComplete) onComplete();
                }
            };
        });
    }

    /**
     * Asegura canal alfa transparente estricto en la hoja de sprites.
     * Si la imagen contiene un fondo opaco gris/negro sólido no deseado,
     * detecta el color de la esquina y lo convierte a transparente (RGBA 0,0,0,0).
     */
    processAlphaChannel(img) {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return img;

            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0);

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            // Verificar si la imagen ya tiene pixeles transparentes
            let hasAlpha = false;
            for (let i = 3; i < data.length; i += 4) {
                if (data[i] === 0) {
                    hasAlpha = true;
                    break;
                }
            }

            // Si ya tiene transparencia nativa perfecta en PNG, devolvemos la imagen o el canvas
            if (hasAlpha) {
                return canvas;
            }

            // Si no tiene alfa (fondo sólido gris/opaco común en JPGs o renders sin canal alfa),
            // tomamos el color del pixel de fondo en (0,0) como clave de color (chroma key)
            const bgR = data[0];
            const bgG = data[1];
            const bgB = data[2];

            const tolerance = 25; // Tolerancia para tonos grises comprimidos
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
                if (diff <= tolerance) {
                    data[i + 3] = 0; // Transparente total
                }
            }

            ctx.putImageData(imgData, 0, 0);
            return canvas;
        } catch (e) {
            console.warn("No se pudo procesar alfa en canvas, usando imagen original:", e);
            return img;
        }
    }

    /**
     * Dibuja un sprite individual de la hoja con soporte para parpadeo rojo (feedback de daño)
     */
    draw(ctx, sheetKey, col, row, frameW, frameH, dx, dy, destW, destH, flipX = false, flashRed = false) {
        const sheet = this.sheets[sheetKey];
        if (!sheet) return;

        ctx.save();

        if (flipX) {
            ctx.translate(dx + destW, dy);
            ctx.scale(-1, 1);
            dx = 0;
            dy = 0;
        }

        const sx = col * frameW;
        const sy = row * frameH;

        if (flashRed) {
            // Efecto de parpadeo rojo de daño usando un canvas temporal o filtro
            ctx.filter = 'brightness(1.5) sepia(1) saturate(1000%) hue-rotate(320deg)';
        }

        ctx.drawImage(sheet, sx, sy, frameW, frameH, dx, dy, destW, destH);

        ctx.restore();
    }

    /**
     * Dibuja un icono de 24x24 desde la hoja de iconos
     */
    drawIcon(ctx, iconIndex, dx, dy, size = 24) {
        const sheet = this.sheets.icons;
        if (!sheet) return;
        ctx.drawImage(sheet, iconIndex * 24, 0, 24, 24, dx, dy, size, size);
    }
}

window.spriteManager = new SpriteManager();