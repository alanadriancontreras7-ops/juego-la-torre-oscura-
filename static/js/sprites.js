/**
 * GESTOR Y RENDERIZADOR DE SPRITES PIXEL ART
 * Carga las hojas de sprites y provee renderizado seguro sin crasheos de GPU.
 */

class SpriteManager {
    constructor() {
        this.sheets = {};
        this.loaded = false;
        this.loadCount = 0;
        this.totalAssets = 0;

        this.assetUrls = {
            warrior: '/static/assets/sprites/player_warrior.png?v=4',
            archer: '/static/assets/sprites/player_archer.png?v=4',
            mage: '/static/assets/sprites/player_mage.png?v=4',
            bandit: '/static/assets/sprites/enemy_bandit.png?v=3',
            skeleton: '/static/assets/sprites/enemy_skeleton.png?v=3',
            spider: '/static/assets/sprites/enemy_spider.png?v=3',
            rat: '/static/assets/sprites/enemy_rat.png?v=3',
            werewolf: '/static/assets/sprites/enemy_werewolf.png?v=3',
            demon: '/static/assets/sprites/enemy_demon.png?v=3',
            lucian: '/static/assets/sprites/boss_lucian.png?v=1',
            abracadabra: '/static/assets/sprites/boss_abracadabra.png?v=3',
            hong: '/static/assets/sprites/boss_hong.png?v=3',
            tiles_crypt: '/static/assets/sprites/tileset_crypt.png?v=4',
            tiles_demon: '/static/assets/sprites/tileset_demon.png?v=4',
            tiles_acid: '/static/assets/sprites/tileset_acid.png?v=4',
            tiles_apex: '/static/assets/sprites/tileset_apex.png?v=4',
            props: '/static/assets/sprites/props.png?v=4',
            icons: '/static/assets/sprites/icons.png?v=5'
        };

        // Registrar dinámicamente las 9 variantes visuales (arma x armadura) de cada héroe

        ['warrior', 'archer', 'mage'].forEach(cls => {
            for (let w = 0; w < 3; w++) {
                for (let a = 0; a < 3; a++) {
                    const key = `player_${cls}_w${w}_a${a}`;
                    this.assetUrls[key] = `/static/assets/sprites/${key}.png?v=5`;
                }
            }
        });
    }

    loadAll(onComplete) {
        const keys = Object.keys(this.assetUrls);
        this.totalAssets = keys.length;

        keys.forEach(key => {
            const img = new Image();
            img.src = this.assetUrls[key];
            img.onload = () => {
                this.sheets[key] = key.startsWith('tiles_') ? img : this.processAlphaChannel(img);
                this.loadCount++;
                if (this.loadCount >= this.totalAssets) {
                    this.loaded = true;
                    if (onComplete) onComplete();
                }
            };
            img.onerror = () => {
                console.warn(`No se pudo cargar sprite opcional: ${key}`);
                this.loadCount++;
                if (this.loadCount >= this.totalAssets) {
                    this.loaded = true;
                    if (onComplete) onComplete();
                }
            };
        });
    }

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

            let hasAlpha = false;
            for (let i = 3; i < data.length; i += 4) {
                if (data[i] === 0) {
                    hasAlpha = true;
                    break;
                }
            }

            if (hasAlpha) return canvas;

            const bgR = data[0], bgG = data[1], bgB = data[2];
            const tolerance = 25;
            for (let i = 0; i < data.length; i += 4) {
                const diff = Math.abs(data[i] - bgR) + Math.abs(data[i + 1] - bgG) + Math.abs(data[i + 2] - bgB);
                if (diff <= tolerance) {
                    data[i + 3] = 0;
                }
            }

            ctx.putImageData(imgData, 0, 0);
            return canvas;
        } catch (e) {
            return img;
        }
    }


    /**
       * Dibuja un sprite individual con soporte de parpadeo rojo seguro
       */
    draw(ctx, sheetKey, col, row, frameW, frameH, dx, dy, destW, destH, flipX = false, flashRed = false) {
        let sheet = this.sheets[sheetKey];
        if (!sheet) {
            const baseClass = String(sheetKey).replace('player_', '').split('_')[0];
            sheet = this.sheets[baseClass] || this.sheets[`player_${baseClass}`] || this.sheets['warrior'];
        }
        if (!sheet) return;

        ctx.save();
        if (flipX) {
            ctx.translate(dx + destW, dy);
            ctx.scale(-1, 1);
            dx = 0;
            dy = 0;
        }

        ctx.drawImage(sheet, col * frameW, row * frameH, frameW, frameH, dx, dy, destW, destH);
        ctx.restore();
    }

    drawIcon(ctx, iconIndex, dx, dy, size = 24) {
        const sheet = this.sheets.icons;
        if (!sheet) return;
        ctx.drawImage(sheet, iconIndex * 24, 0, 24, 24, dx, dy, size, size);
    }
}

window.spriteManager = new SpriteManager();