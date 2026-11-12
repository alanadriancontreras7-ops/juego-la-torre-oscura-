/**
 * GESTOR DE INTERFAZ DE USUARIO (UI / HUD / MODALES / TIENDA / HERRERO / MENÚ CONTEXTUAL / SESIONES)
 */

class UIManager {
    constructor() {
        this.selectedClass = 'warrior';
        this.selectedInventorySlot = null;
        this.tooltip = document.getElementById('item-tooltip');

        this.currentUser = null;
        this.authMode = 'login'; // 'login' o 'register'
        this.selectedPortalClass = 'warrior';
        this.selectedPortalFloor = 1;
    }

    init() {
        this.bindEvents();
        this.createShopModalDOM();
        this.createBlacksmithModalDOM();
        this.createContextMenuDOM();
        this.createAuthModalDOM();         // Crea el modal de Login si no existe
        this.createFloorSelectModalDOM();  // Crea el selector de pisos si no existe
        this.initAuthSystem();             // <-- ¡AQUÍ SE CONECTAN LOS BOTONES!
    }

    bindEvents() {
        document.querySelectorAll('.close-modal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.game-modal');
                if (modal) modal.style.display = 'none';
                if (window.game) window.game.resumeFromModal();
            });
        });

        document.querySelectorAll('.class-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedClass = card.getAttribute('data-class');
            });
        });

        document.getElementById('confirm-class-btn').addEventListener('click', () => {
            document.getElementById('class-select-modal').style.display = 'none';
            if (window.game) window.game.startNewGame(this.selectedClass);
        });

        document.getElementById('btn-hud-inv').addEventListener('click', () => this.toggleInventory());
        document.getElementById('btn-hud-stats').addEventListener('click', () => this.toggleStats());
        document.getElementById('btn-hud-save').addEventListener('click', () => this.showSavesModal());

        const muteBtn = document.getElementById('btn-toggle-mute');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.toggleMute();
            });
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.item-context-menu')) {
                this.hideContextMenu();
            }
        });

        document.getElementById('quick-pot-hp').addEventListener('click', () => {
            if (window.game && window.game.player) window.game.usePotion('potion_health');
        });
        document.getElementById('quick-pot-mp').addEventListener('click', () => {
            if (window.game && window.game.player) window.game.usePotion('potion_mana');
        });

        document.getElementById('btn-restart-game').addEventListener('click', () => {
            document.getElementById('game-over-screen').style.display = 'none';
            if (window.game) window.game.returnToTitle();
        });
        document.getElementById('btn-victory-restart').addEventListener('click', () => {
            document.getElementById('victory-screen').style.display = 'none';
            if (window.game) window.game.returnToTitle();
        });
    }

    // =========================================================================
    // CREACIÓN GARANTIZADA DE MODALES DE AUTENTICACIÓN Y SELECTOR DE PISOS
    // =========================================================================
    createAuthModalDOM() {
        if (document.getElementById('login-modal')) return;
        const div = document.createElement('div');
        div.id = 'login-modal';
        div.className = 'game-modal';
        div.style.display = 'none';
        div.innerHTML = `
            <div class="modal-window" style="width: 380px; padding: 20px; background: #140f1c; border: 3px solid #f1c40f; border-radius: 6px;">
                <h3 id="auth-modal-title" style="font-family:'Cinzel',serif; color:#f1c40f; text-align:center; margin-bottom:14px;">INICIAR SESIÓN</h3>
                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px;">
                    <input type="text" id="auth-input-user" placeholder="Nombre de usuario" style="background:#0a0710; border:2px solid #5a4270; color:#fff; padding:8px; font-family:'Press Start 2P'; font-size:10px;">
                    <input type="password" id="auth-input-pass" placeholder="Contraseña" style="background:#0a0710; border:2px solid #5a4270; color:#fff; padding:8px; font-family:'Press Start 2P'; font-size:10px;">
                </div>
                <div id="auth-error-msg" style="color:#e74c3c; font-size:12px; margin-bottom:10px; display:none; text-align:center;"></div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button id="btn-auth-submit" class="pixel-btn btn-gold">ENTRAR</button>
                    <button id="btn-toggle-auth-mode" class="pixel-btn" style="font-size:8px;">¿No tienes cuenta? Regístrate</button>
                    <button class="pixel-btn close-modal-btn" style="background:#4a151b; font-size:8px;">CANCELAR</button>
                </div>
            </div>
        `;
        document.body.appendChild(div);
    }

    createFloorSelectModalDOM() {
        if (document.getElementById('floor-select-modal')) return;
        const div = document.createElement('div');
        div.id = 'floor-select-modal';
        div.className = 'game-modal';
        div.style.display = 'none';
        div.innerHTML = `
            <div class="modal-window" style="width: 580px; padding: 20px; background: #140f1c; border: 3px solid #f1c40f; border-radius: 6px;">
                <h3 style="font-family:'Cinzel',serif; color:#f1c40f; text-align:center; margin-bottom:8px;">🏰 SALA DE PORTALES</h3>
                <p style="font-size:13px; color:#aaa; text-align:center; margin-bottom:14px;">Elige el piso al que deseas descender y tu héroe:</p>

                <div style="margin-bottom: 14px;">
                    <div style="font-family:'Press Start 2P'; font-size:9px; color:#f1c40f; margin-bottom:8px;">1. SELECCIONA TU CLASE:</div>
                    <div style="display:flex; gap:10px;">
                        <div class="floor-hero-choice selected" data-class="warrior">
                            <span>⚔️ GUERRERO</span>
                            <span class="hero-status-tag" id="status-tag-warrior">⚪ BÁSICO</span>
                        </div>
                        <div class="floor-hero-choice" data-class="archer">
                            <span>🏹 ARQUERO</span>
                            <span class="hero-status-tag" id="status-tag-archer">⚪ BÁSICO</span>
                        </div>
                        <div class="floor-hero-choice" data-class="mage">
                            <span>🔮 MAGO</span>
                            <span class="hero-status-tag" id="status-tag-mage">⚪ BÁSICO</span>
                        </div>
                    </div>
                    <div id="floor-hero-summary" style="font-size:11px; color:#38ef7d; margin-top:8px; text-align:center;"></div>
                </div>

                <div style="margin-bottom: 16px;">
                    <div style="font-family:'Press Start 2P'; font-size:9px; color:#f1c40f; margin-bottom:8px;">2. SELECCIONA EL PISO:</div>
                    <div class="floor-grid-buttons" style="display:grid; grid-template-columns: repeat(5, 1fr); gap:6px;">
                        <button class="floor-pick-btn selected" data-floor="1">PISO 1</button>
                        <button class="floor-pick-btn" data-floor="2">PISO 2</button>
                        <button class="floor-pick-btn" data-floor="3">PISO 3</button>
                        <button class="floor-pick-btn" data-floor="4">PISO 4</button>
                        <button class="floor-pick-btn" data-floor="5" style="border-color:#e74c3c;">PISO 5 🐺</button>
                        <button class="floor-pick-btn" data-floor="6">PISO 6</button>
                        <button class="floor-pick-btn" data-floor="7">PISO 7</button>
                        <button class="floor-pick-btn" data-floor="8" style="border-color:#2ecc71;">PISO 8 🧪</button>
                        <button class="floor-pick-btn" data-floor="9">PISO 9</button>
                        <button class="floor-pick-btn" data-floor="10" style="border-color:#f1c40f;">PISO 10 👑</button>
                    </div>
                </div>

                <div style="display:flex; justify-content:space-between; gap:10px;">
                    <button id="btn-launch-floor" class="pixel-btn btn-gold" style="flex:1;">ABRIR PORTAL</button>
                    <button class="pixel-btn close-modal-btn" style="background:#4a151b;">CERRAR</button>
                </div>
            </div>
        `;
        document.body.appendChild(div);
    }

    // =========================================================================
    // INICIALIZADOR DEL SISTEMA DE SESIÓN
    // =========================================================================
    initAuthSystem() {
        // 1. Comprobar si hay sesión iniciada al cargar
        fetch('/api/me')
            .then(res => res.json())
            .then(data => {
                if (data.logged_in) {
                    this.currentUser = data;
                    this.updateAuthUI(true, data.username);
                } else {
                    this.updateAuthUI(false);
                }
            })
            .catch(() => this.updateAuthUI(false));

        // 2. Conectar botón de Abrir Login
        const openLoginBtn = document.getElementById('btn-open-login');
        if (openLoginBtn) {
            openLoginBtn.onclick = () => {
                const modal = document.getElementById('login-modal');
                if (modal) modal.style.display = 'flex';
            };
        }

        // 3. Alternar entre Entrar y Registrarse
        const toggleBtn = document.getElementById('btn-toggle-auth-mode');
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                this.authMode = (this.authMode === 'login') ? 'register' : 'login';
                document.getElementById('auth-modal-title').innerText = (this.authMode === 'login') ? 'INICIAR SESIÓN' : 'REGISTRARSE';
                document.getElementById('btn-auth-submit').innerText = (this.authMode === 'login') ? 'ENTRAR' : 'CREAR CUENTA';
                toggleBtn.innerText = (this.authMode === 'login') ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión';
                document.getElementById('auth-error-msg').style.display = 'none';
            };
        }

        // 4. Enviar formulario
        const submitBtn = document.getElementById('btn-auth-submit');
        if (submitBtn) {
            submitBtn.onclick = () => this.handleAuthSubmit();
        }

        // 5. Cerrar sesión
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.onclick = () => {
                fetch('/api/logout', { method: 'POST' }).then(() => {
                    this.currentUser = null;
                    this.updateAuthUI(false);
                    location.reload();
                });
            };
        }

        // 6. Botón selector de pisos
        const selectFloorBtn = document.getElementById('btn-select-floor');
        if (selectFloorBtn) {
            selectFloorBtn.onclick = () => this.showFloorSelectModal();
        }
    }

    handleAuthSubmit() {
        const user = document.getElementById('auth-input-user').value.trim();
        const pass = document.getElementById('auth-input-pass').value.trim();
        const errBox = document.getElementById('auth-error-msg');

        if (!user || !pass) {
            errBox.innerText = 'Rellena todos los campos';
            errBox.style.display = 'block';
            return;
        }

        const endpoint = (this.authMode === 'login') ? '/api/login' : '/api/register';
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    this.currentUser = data;
                    document.getElementById('login-modal').style.display = 'none';
                    this.updateAuthUI(true, data.username);
                } else {
                    errBox.innerText = data.message || 'Error al autenticar';
                    errBox.style.display = 'block';
                }
            })
            .catch(() => {
                errBox.innerText = 'Error al conectar con el servidor';
                errBox.style.display = 'block';
            });
    }

    updateAuthUI(isLoggedIn, username = '') {
        const loggedOutDiv = document.getElementById('auth-logged-out');
        const loggedInDiv = document.getElementById('auth-logged-in');
        const floorSelectBtn = document.getElementById('btn-select-floor');

        if (isLoggedIn) {
            if (loggedOutDiv) loggedOutDiv.style.display = 'none';
            if (loggedInDiv) loggedInDiv.style.display = 'flex';
            const userLabel = document.getElementById('auth-username-label');
            if (userLabel) userLabel.innerText = `👤 ${username}`;

            const cleared = (this.currentUser && this.currentUser.cleared_heroes) || {};
            const hasWonAny = Object.keys(cleared).length > 0;
            if (floorSelectBtn) floorSelectBtn.style.display = hasWonAny ? 'block' : 'none';
        } else {
            if (loggedOutDiv) loggedOutDiv.style.display = 'flex';
            if (loggedInDiv) loggedInDiv.style.display = 'none';
            if (floorSelectBtn) floorSelectBtn.style.display = 'none';
        }
    }

    showFloorSelectModal() {
        const modal = document.getElementById('floor-select-modal');
        if (!modal) return;
        modal.style.display = 'flex';

        const cleared = (this.currentUser && this.currentUser.cleared_heroes) || {};

        ['warrior', 'archer', 'mage'].forEach(cls => {
            const tag = document.getElementById(`status-tag-${cls}`);
            if (tag) {
                if (cleared[cls]) {
                    tag.innerText = '⭐ VENCEDOR';
                    tag.className = 'hero-status-tag status-victorious';
                } else {
                    tag.innerText = '⚪ BÁSICO';
                    tag.className = 'hero-status-tag status-fresh';
                }
            }
        });

        this.updatePortalSummary();

        document.querySelectorAll('.floor-hero-choice').forEach(card => {
            card.onclick = () => {
                document.querySelectorAll('.floor-hero-choice').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedPortalClass = card.getAttribute('data-class');
                this.updatePortalSummary();
            };
        });

        document.querySelectorAll('.floor-pick-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.floor-pick-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedPortalFloor = parseInt(btn.getAttribute('data-floor'), 10);
            };
        });

        const launchBtn = document.getElementById('btn-launch-floor');
        if (launchBtn) {
            launchBtn.onclick = () => {
                modal.style.display = 'none';
                if (window.game) {
                    window.game.startCustomFloorRun(this.selectedPortalClass, this.selectedPortalFloor);
                }
            };
        }
    }

    updatePortalSummary() {
        const summary = document.getElementById('floor-hero-summary');
        if (!summary) return;
        const cleared = (this.currentUser && this.currentUser.cleared_heroes) || {};
        const heroData = cleared[this.selectedPortalClass];

        if (heroData) {
            summary.innerHTML = `⭐ <b>${this.selectedPortalClass.toUpperCase()} VENCEDOR:</b> Iniciarás con tu equipo legendario, nivel ${heroData.level} y ${heroData.gold} G.`;
            summary.style.color = '#f1c40f';
        } else {
            summary.innerHTML = `⚪ <b>${this.selectedPortalClass.toUpperCase()} NO COMPLETADO:</b> Aún no has ganado con esta clase. Iniciarás desde nivel 1 con equipo básico.`;
            summary.style.color = '#a4b0be';
        }
    }

    // =========================================================================
    // MENÚ CONTEXTUAL (CLIC DERECHO PARA DESTRUIR)
    // =========================================================================
    createContextMenuDOM() {
        if (document.getElementById('item-context-menu')) return;
        const menu = document.createElement('div');
        menu.id = 'item-context-menu';
        menu.className = 'item-context-menu';
        menu.style.display = 'none';
        menu.style.position = 'absolute';
        menu.style.zIndex = '10000';
        document.body.appendChild(menu);
    }

    showContextMenu(item, index, event) {
        this.hideTooltip();
        let menu = document.getElementById('item-context-menu');
        if (!menu) return;

        const actionText = (item.type === 'consumable') ? '👉 Usar' : '⚔️ Equipar';
        menu.innerHTML = `
            <div style="font-family:'Press Start 2P'; font-size:8px; color:#f1c40f; padding:6px 8px; border-bottom:1px dashed #3a2a4c; margin-bottom:4px;">
                ${item.name}
            </div>
            <button class="item-context-btn" id="ctx-action-btn" style="background:#241d30;border:1px solid #5a4270;color:#fff;font-family:'Press Start 2P';font-size:8px;padding:6px;width:100%;text-align:left;cursor:pointer;margin-bottom:3px;">
                <span>${actionText}</span>
            </button>
            <button class="item-context-btn danger" id="ctx-discard-btn" style="background:#4a151b;border:1px solid #e74c3c;color:#ff7675;font-family:'Press Start 2P';font-size:8px;padding:6px;width:100%;text-align:left;cursor:pointer;">
                <span>🗑️ Destruir / Eliminar</span>
            </button>
        `;

        document.getElementById('ctx-action-btn').onclick = (e) => {
            e.stopPropagation();
            this.handleSlotClick(index);
            this.hideContextMenu();
        };

        document.getElementById('ctx-discard-btn').onclick = (e) => {
            e.stopPropagation();
            this.discardItem(index);
        };

        menu.style.display = 'flex';
        menu.style.flexDirection = 'column';
        menu.style.background = '#15111d';
        menu.style.border = '2px solid #5a4270';
        menu.style.padding = '4px';
        menu.style.borderRadius = '4px';

        const container = document.getElementById('game-container') || document.body;
        const rect = container.getBoundingClientRect();
        let x = event.clientX - rect.left + 5;
        let y = event.clientY - rect.top + 5;

        const menuW = 160;
        const menuH = 100;
        if (x + menuW > rect.width) x = rect.width - menuW - 10;
        if (y + menuH > rect.height) y = rect.height - menuH - 10;

        menu.style.left = `${Math.max(10, x)}px`;
        menu.style.top = `${Math.max(10, y)}px`;
    }

    hideContextMenu() {
        const menu = document.getElementById('item-context-menu');
        if (menu) menu.style.display = 'none';
    }

    discardItem(index) {
        const player = window.game.player;
        if (!player || !player.inventory[index]) return;
        const item = player.inventory[index];
        const itemName = item.name;

        if (item.qty && item.qty > 1) {
            item.qty--;
            if (item.qty <= 0) player.inventory[index] = null;
        } else {
            player.inventory[index] = null;
        }

        if (window.soundEngine) window.soundEngine.playTone(130, 'square', 0.15, 0.2);
        if (window.game && window.game.floatingTexts) {
            window.game.floatingTexts.push(new FloatingText(player.x, player.y - 20, `-${itemName}`, '#a4b0be'));
        }

        this.hideContextMenu();
        this.hideTooltip();
        this.renderInventory();
    }

    // =========================================================================
    // TIENDA DE KAELEN
    // =========================================================================
    createShopModalDOM() {
        if (document.getElementById('shop-modal')) return;
        const shopDiv = document.createElement('div');
        shopDiv.id = 'shop-modal';
        shopDiv.className = 'game-modal';
        shopDiv.style.display = 'none';
        shopDiv.innerHTML = `
            <div class="modal-content" style="max-width:520px;background:#15111d;border:2px solid #f1c40f;padding:16px;color:#fff;border-radius:6px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <h3 style="font-family:'Press Start 2P';font-size:11px;color:#f1c40f;">🛒 KAELEN EL RENEGADO</h3>
                    <span id="shop-player-gold" style="font-family:'Press Start 2P';font-size:10px;color:#f1c40f;">0 G</span>
                </div>
                <div style="display:flex;gap:8px;margin-bottom:12px;">
                    <button id="shop-tab-buy" class="pixel-btn" style="font-size:9px;padding:6px 14px;">COMPRAR</button>
                    <button id="shop-tab-sell" class="pixel-btn btn-gold" style="font-size:9px;padding:6px 14px;">VENDER</button>
                </div>
                <div id="shop-body-content" style="max-height:260px;overflow-y:auto;padding-right:4px;margin-bottom:12px;"></div>
                <button class="pixel-btn close-modal-btn" style="font-size:9px;padding:6px 12px;">CERRAR (ESC)</button>
            </div>
        `;
        document.body.appendChild(shopDiv);
    }

    showShopModal() {
        this.createShopModalDOM();
        const modal = document.getElementById('shop-modal');
        if (!modal) return;
        modal.style.display = 'flex';
        if (window.game) window.game.pauseForModal();
        this.renderShopTab('buy');

        document.getElementById('shop-tab-buy').onclick = () => this.renderShopTab('buy');
        document.getElementById('shop-tab-sell').onclick = () => this.renderShopTab('sell');
        modal.querySelector('.close-modal-btn').onclick = () => this.closeShopModal();
    }

    closeShopModal() {
        const modal = document.getElementById('shop-modal');
        if (modal) modal.style.display = 'none';
        if (window.game) window.game.resumeFromModal();
    }

    renderShopTab(tab) {
        const container = document.getElementById('shop-body-content');
        const player = window.game ? window.game.player : null;
        if (!container || !player) return;
        container.innerHTML = '';
        document.getElementById('shop-player-gold').innerText = `${player.gold} G`;

        if (tab === 'buy') {
            const stock = [
                { id: 'potion_health', price: 20 },
                { id: 'potion_mana', price: 18 },
                { id: 'potion_elixir', price: 65 },
                { id: 'mat_bone', price: 25 },
                { id: 'mat_pelt', price: 45 }
            ];

            stock.forEach(itemInfo => {
                const item = window.ITEM_DATABASE[itemInfo.id];
                if (!item) return;

                const row = document.createElement('div');
                row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:#241d30;padding:8px;margin-bottom:6px;border-radius:4px;border:1px solid #3d324d;';

                const leftDiv = document.createElement('div');
                leftDiv.style.cssText = 'display:flex;align-items:center;gap:10px;';

                const cvs = document.createElement('canvas');
                cvs.width = 24; cvs.height = 24;
                window.spriteManager.drawIcon(cvs.getContext('2d'), item.icon || 0, 0, 0, 24);

                const infoDiv = document.createElement('div');
                infoDiv.innerHTML = `
                    <div style="font-size:12px;font-weight:bold;color:#f5f6fa;">${item.name}</div>
                    <div style="font-size:10px;color:#a4b0be;">${item.desc || ''}</div>
                `;

                leftDiv.appendChild(cvs);
                leftDiv.appendChild(infoDiv);

                const buyBtn = document.createElement('button');
                buyBtn.className = 'pixel-btn btn-gold';
                buyBtn.style.cssText = 'font-size:9px;padding:6px 10px;white-space:nowrap;';
                buyBtn.innerText = `COMPRAR (${itemInfo.price} G)`;

                buyBtn.onclick = () => {
                    if (player.gold >= itemInfo.price) {
                        const emptyIdx = player.inventory.findIndex(s => s === null);
                        if (emptyIdx !== -1) {
                            player.gold -= itemInfo.price;
                            player.inventory[emptyIdx] = { ...item, qty: 1 };
                            window.soundEngine.playItemPickup();
                            this.renderShopTab('buy');
                        } else {
                            window.game.floatingTexts.push(new FloatingText(player.x, player.y - 25, '¡Inventario lleno!', '#ff4444'));
                        }
                    }
                };

                row.appendChild(leftDiv);
                row.appendChild(buyBtn);
                container.appendChild(row);
            });
        } else if (tab === 'sell') {
            let hasItems = false;
            player.inventory.forEach((item, idx) => {
                if (!item) return;
                hasItems = true;
                const sellValue = Math.max(2, Math.floor((item.value || 10) * 0.6));

                const row = document.createElement('div');
                row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:#241d30;padding:8px;margin-bottom:6px;border-radius:4px;border:1px solid #3d324d;';

                const leftDiv = document.createElement('div');
                leftDiv.style.cssText = 'display:flex;align-items:center;gap:10px;';

                const cvs = document.createElement('canvas');
                cvs.width = 24; cvs.height = 24;
                window.spriteManager.drawIcon(cvs.getContext('2d'), item.icon || 0, 0, 0, 24);

                const countStr = (item.qty && item.qty > 1) ? ` (x${item.qty})` : '';
                leftDiv.innerHTML = `
                    <div style="font-size:12px;font-weight:bold;color:#f5f6fa;">${item.name}${countStr}</div>
                `;
                leftDiv.prepend(cvs);

                const sellBtn = document.createElement('button');
                sellBtn.className = 'pixel-btn';
                sellBtn.style.cssText = 'font-size:9px;padding:6px 10px;white-space:nowrap;background:#27ae60;border-color:#2ecc71;';
                sellBtn.innerText = `VENDER (+${sellValue} G)`;

                sellBtn.onclick = () => {
                    player.gold += sellValue;
                    if (item.qty && item.qty > 1) {
                        item.qty--;
                    } else {
                        player.inventory[idx] = null;
                    }
                    window.soundEngine.playItemPickup();
                    this.renderShopTab('sell');
                };

                row.appendChild(leftDiv);
                row.appendChild(sellBtn);
                container.appendChild(row);
            });

            if (!hasItems) {
                container.innerHTML = '<div style="color:#888;text-align:center;padding:20px;font-size:12px;">Tu inventario está vacío.</div>';
            }
        }
    }

    // =========================================================================
    // FORJA DE GUNNAR
    // =========================================================================
    createBlacksmithModalDOM() {
        if (document.getElementById('blacksmith-modal')) return;
        const bDiv = document.createElement('div');
        bDiv.id = 'blacksmith-modal';
        bDiv.className = 'game-modal';
        bDiv.style.display = 'none';
        bDiv.innerHTML = `
            <div class="modal-content" style="max-width:540px;background:#181316;border:2px solid #e67e22;padding:16px;color:#fff;border-radius:6px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <h3 style="font-family:'Press Start 2P';font-size:11px;color:#e67e22;">🔨 FORJA DE GUNNAR</h3>
                    <span id="forge-player-gold" style="font-family:'Press Start 2P';font-size:10px;color:#f1c40f;">0 G</span>
                </div>
                <div style="display:flex;gap:8px;margin-bottom:12px;">
                    <button id="forge-tab-craft" class="pixel-btn btn-gold" style="font-size:9px;padding:6px 14px;">FORJAR EQUIPO</button>
                    <button id="forge-tab-upgrade" class="pixel-btn" style="font-size:9px;padding:6px 14px;">REFORZAR (+1)</button>
                </div>
                <div id="forge-body-content" style="max-height:260px;overflow-y:auto;padding-right:4px;margin-bottom:12px;"></div>
                <button class="pixel-btn close-modal-btn" style="font-size:9px;padding:6px 12px;">CERRAR (ESC)</button>
            </div>
        `;
        document.body.appendChild(bDiv);
    }

    showBlacksmithModal() {
        this.createBlacksmithModalDOM();
        const modal = document.getElementById('blacksmith-modal');
        if (!modal) return;
        modal.style.display = 'flex';
        if (window.game) window.game.pauseForModal();
        this.renderForgeTab('craft');

        document.getElementById('forge-tab-craft').onclick = () => this.renderForgeTab('craft');
        document.getElementById('forge-tab-upgrade').onclick = () => this.renderForgeTab('upgrade');
        modal.querySelector('.close-modal-btn').onclick = () => this.closeBlacksmithModal();
    }

    closeBlacksmithModal() {
        const modal = document.getElementById('blacksmith-modal');
        if (modal) modal.style.display = 'none';
        if (window.game) window.game.resumeFromModal();
    }

    renderForgeTab(tab) {
        const container = document.getElementById('forge-body-content');
        const player = window.game ? window.game.player : null;
        if (!container || !player) return;
        container.innerHTML = '';
        document.getElementById('forge-player-gold').innerText = `${player.gold} G`;

        if (tab === 'craft') {
            const recipes = window.BLACKSMITH_RECIPES || [];
            const pClass = player.characterClass;

            recipes.forEach(recipe => {
                const targetId = recipe.resultId[pClass];
                const item = window.ITEM_DATABASE[targetId];
                if (!item) return;

                let canCraft = (player.gold >= recipe.costGold);
                const matReqStrings = [];

                recipe.materials.forEach(req => {
                    let count = 0;
                    player.inventory.forEach(invItem => {
                        if (invItem && invItem.id === req.id) count += (invItem.qty || 1);
                    });
                    if (count < req.qty) canCraft = false;
                    const matDef = window.ITEM_DATABASE[req.id];
                    matReqStrings.push(`${count}/${req.qty} ${matDef ? matDef.name : req.id}`);
                });

                const row = document.createElement('div');
                row.style.cssText = 'background:#261e22;padding:10px;margin-bottom:8px;border-radius:4px;border:1px solid #4a343b;display:flex;justify-content:space-between;align-items:center;';

                const leftDiv = document.createElement('div');
                leftDiv.style.cssText = 'display:flex;align-items:center;gap:10px;';

                const cvs = document.createElement('canvas');
                cvs.width = 24; cvs.height = 24;
                window.spriteManager.drawIcon(cvs.getContext('2d'), item.icon || 0, 0, 0, 24);

                leftDiv.innerHTML = `
                    <div>
                        <div style="font-size:12px;font-weight:bold;color:#f39c12;">${item.name}</div>
                        <div style="font-size:10px;color:#aaa;margin-top:2px;">Materiales: ${matReqStrings.join(', ')}</div>
                    </div>
                `;
                leftDiv.prepend(cvs);

                const craftBtn = document.createElement('button');
                craftBtn.className = canCraft ? 'pixel-btn btn-gold' : 'pixel-btn';
                craftBtn.style.cssText = `font-size:9px;padding:6px 10px;white-space:nowrap;${canCraft ? '' : 'opacity:0.5;cursor:not-allowed;'}`;
                craftBtn.innerText = `FORJAR (${recipe.costGold} G)`;

                craftBtn.onclick = () => {
                    if (canCraft) {
                        const emptyIdx = player.inventory.findIndex(s => s === null);
                        if (emptyIdx === -1) {
                            window.game.floatingTexts.push(new FloatingText(player.x, player.y - 25, '¡Inventario lleno!', '#ff4444'));
                            return;
                        }

                        player.gold -= recipe.costGold;
                        recipe.materials.forEach(req => {
                            let needed = req.qty;
                            player.inventory.forEach((invItem, i) => {
                                if (invItem && invItem.id === req.id && needed > 0) {
                                    if ((invItem.qty || 1) <= needed) {
                                        needed -= (invItem.qty || 1);
                                        player.inventory[i] = null;
                                    } else {
                                        invItem.qty -= needed;
                                        needed = 0;
                                    }
                                }
                            });
                        });

                        player.inventory[emptyIdx] = { ...item, qty: 1 };
                        window.soundEngine.playLevelUp();
                        window.game.floatingTexts.push(new FloatingText(player.x, player.y - 30, `¡${item.name} FORJADA!`, '#f1c40f', true));
                        this.renderForgeTab('craft');
                    }
                };

                row.appendChild(leftDiv);
                row.appendChild(craftBtn);
                container.appendChild(row);
            });
        } else if (tab === 'upgrade') {
            ['weapon', 'armor'].forEach(slot => {
                const item = player.equipment[slot];
                if (!item) return;

                const cost = ((item.upgradeLevel || 0) + 1) * 70;
                const row = document.createElement('div');
                row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:#261e22;padding:10px;margin-bottom:8px;border-radius:4px;border:1px solid #4a343b;';

                const leftDiv = document.createElement('div');
                leftDiv.style.cssText = 'display:flex;align-items:center;gap:10px;';

                const cvs = document.createElement('canvas');
                cvs.width = 24; cvs.height = 24;
                window.spriteManager.drawIcon(cvs.getContext('2d'), item.icon || 0, 0, 0, 24);

                leftDiv.innerHTML = `
                    <div>
                        <div style="font-size:12px;font-weight:bold;color:#f1c40f;">${item.name}</div>
                        <div style="font-size:10px;color:#aaa;">Incrementa +4 de Estadística básica</div>
                    </div>
                `;
                leftDiv.prepend(cvs);

                const upBtn = document.createElement('button');
                upBtn.className = 'pixel-btn btn-gold';
                upBtn.style.cssText = 'font-size:9px;padding:6px 10px;white-space:nowrap;';
                upBtn.innerText = `REFORZAR (${cost} G)`;

                upBtn.onclick = () => {
                    if (player.gold >= cost) {
                        player.gold -= cost;
                        item.upgradeLevel = (item.upgradeLevel || 0) + 1;
                        item.name = `${item.name.replace(/\s\+\d+$/, '')} +${item.upgradeLevel}`;
                        if (slot === 'weapon') item.atk = (item.atk || 0) + 4;
                        else item.def = (item.def || 0) + 3;

                        window.soundEngine.playItemPickup();
                        this.renderForgeTab('upgrade');
                    }
                };

                row.appendChild(leftDiv);
                row.appendChild(upBtn);
                container.appendChild(row);
            });
        }
    }

    // =========================================================================
    // HUD Y MINIMAPA
    // =========================================================================
    updateHUD(player, world) {
        if (!player) return;
        const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
        document.getElementById('hud-hp-fill').style.width = `${hpPct}%`;
        document.getElementById('hud-hp-text').innerText = `${Math.ceil(player.hp)} / ${player.maxHp}`;

        const mpPct = Math.max(0, (player.mp / player.maxMp) * 100);
        document.getElementById('hud-mp-fill').style.width = `${mpPct}%`;
        document.getElementById('hud-mp-text').innerText = `${Math.ceil(player.mp)} / ${player.maxMp}`;

        const expPct = Math.min(100, (player.exp / player.nextExp) * 100);
        document.getElementById('hud-exp-fill').style.width = `${expPct}%`;
        document.getElementById('hud-exp-text').innerText = `EXP: ${player.exp} / ${player.nextExp}`;

        document.getElementById('hud-player-name').innerText = `${player.name} (Nv. ${player.level})`;
        document.getElementById('hud-floor-num').innerText = `PISO ${world.floor} / 10`;

        let hpPots = 0; let mpPots = 0;
        player.inventory.forEach(item => {
            if (item && item.id === 'potion_health') hpPots += (item.qty || 1);
            if (item && item.id === 'potion_mana') mpPots += (item.qty || 1);
        });
        document.getElementById('hp-pot-count').innerText = hpPots;
        document.getElementById('mp-pot-count').innerText = mpPots;

        const bossCard = document.getElementById('boss-health-card');
        if (window.game && window.game.activeBoss) {
            const boss = window.game.activeBoss;
            bossCard.style.display = 'block';
            document.getElementById('boss-name-label').innerText = boss.name.toUpperCase();
            const bossHpPct = Math.max(0, (boss.hp / boss.maxHp) * 100);
            document.getElementById('boss-hp-fill').style.width = `${bossHpPct}%`;
        } else {
            bossCard.style.display = 'none';
        }
    }

    renderMinimap(player, world) {
        const canvas = document.getElementById('minimapCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const scaleX = canvas.width / world.cols;
        const scaleY = canvas.height / world.rows;

        for (let r = 0; r < world.rows; r++) {
            for (let c = 0; c < world.cols; c++) {
                if (world.grid[r][c] === 0) {
                    ctx.fillStyle = '#2d243a';
                    ctx.fillRect(c * scaleX, r * scaleY, scaleX, scaleY);
                }
            }
        }

        if (world.stairs) {
            ctx.fillStyle = world.stairsUnlocked ? '#38ef7d' : '#888888';
            ctx.fillRect((world.stairs.x / world.tileSize) * scaleX, (world.stairs.y / world.tileSize) * scaleY, scaleX * 1.5, scaleY * 1.5);
        }

        if (world.merchant) {
            ctx.fillStyle = '#9b59b6';
            ctx.fillRect((world.merchant.x / world.tileSize) * scaleX, (world.merchant.y / world.tileSize) * scaleY, scaleX * 1.5, scaleY * 1.5);
        }

        if (world.blacksmith) {
            ctx.fillStyle = '#e67e22';
            ctx.fillRect((world.blacksmith.x / world.tileSize) * scaleX, (world.blacksmith.y / world.tileSize) * scaleY, scaleX * 1.5, scaleY * 1.5);
        }

        if (world.shrine) {
            ctx.fillStyle = world.shrine.type === 'blood' ? '#e74c3c' : '#2ecc71';
            ctx.fillRect((world.shrine.x / world.tileSize) * scaleX, (world.shrine.y / world.tileSize) * scaleY, scaleX * 1.5, scaleY * 1.5);
        }

        ctx.fillStyle = '#00d2d3';
        ctx.fillRect((player.x / world.tileSize) * scaleX - 1, (player.y / world.tileSize) * scaleY - 1, scaleX * 2, scaleY * 2);
    }

    // =========================================================================
    // INVENTARIO
    // =========================================================================
    toggleInventory() {
        const modal = document.getElementById('inventory-modal');
        this.hideContextMenu();
        this.hideTooltip();
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
            if (window.game) window.game.resumeFromModal();
        } else {
            modal.style.display = 'flex';
            this.renderInventory();
            if (window.game) window.game.pauseForModal();
        }
    }

    renderInventory() {
        const player = window.game.player;
        if (!player) return;
        const grid = document.getElementById('inventory-grid-container');
        grid.innerHTML = '';

        player.inventory.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.className = 'item-slot';

            if (item) {
                const rarityInfo = window.ITEM_RARITIES[item.rarity] || window.ITEM_RARITIES.COMMON;
                slot.classList.add(rarityInfo.class);

                const cvs = document.createElement('canvas');
                cvs.width = 24; cvs.height = 24;
                window.spriteManager.drawIcon(cvs.getContext('2d'), item.icon || 0, 0, 0, 24);
                slot.appendChild(cvs);

                if (item.qty && item.qty > 1) {
                    const qtyLabel = document.createElement('span');
                    qtyLabel.className = 'item-qty';
                    qtyLabel.innerText = item.qty;
                    slot.appendChild(qtyLabel);
                }

                slot.addEventListener('mouseenter', (e) => this.showTooltip(item, e));
                slot.addEventListener('mousemove', (e) => this.updateTooltipPos(e));
                slot.addEventListener('mouseleave', () => this.hideTooltip());

                slot.addEventListener('click', () => {
                    this.hideContextMenu();
                    this.handleSlotClick(index);
                });

                slot.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showContextMenu(item, index, e);
                });
            }
            grid.appendChild(slot);
        });

        this.renderEquipSlot('equip-slot-weapon', player.equipment.weapon, 'weapon');
        this.renderEquipSlot('equip-slot-armor', player.equipment.armor, 'armor');
        this.renderEquipSlot('equip-slot-acc', player.equipment.accessory, 'accessory');
        document.getElementById('inv-gold-count').innerText = `${player.gold} G`;
        this.renderPaperdoll(player);
    }

    renderEquipSlot(elementId, item, slotType) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.innerHTML = '';

        if (item) {
            const cvs = document.createElement('canvas');
            cvs.width = 24; cvs.height = 24;
            window.spriteManager.drawIcon(cvs.getContext('2d'), item.icon || 0, 0, 0, 24);
            el.appendChild(cvs);

            el.onclick = () => {
                const player = window.game.player;
                const emptyIdx = player.inventory.findIndex(s => s === null);
                if (emptyIdx !== -1) {
                    player.inventory[emptyIdx] = item;
                    player.equipment[slotType] = null;
                    window.soundEngine.playItemPickup();
                    this.renderInventory();
                }
            };
            el.onmouseenter = (e) => this.showTooltip(item, e);
            el.onmousemove = (e) => this.updateTooltipPos(e);
            el.onmouseleave = () => this.hideTooltip();
        } else {
            el.innerHTML = '<span style="color:#555;font-size:10px;">Vacío</span>';
            el.onclick = null;
        }
    }

    handleSlotClick(index) {
        const player = window.game.player;
        const item = player.inventory[index];
        if (!item) return;

        if (item.type === 'consumable') {
            if (item.heal_hp) player.hp = Math.min(player.maxHp, player.hp + item.heal_hp);
            if (item.heal_mp) player.mp = Math.min(player.maxMp, player.mp + item.heal_mp);
            window.soundEngine.playPotion();
            item.qty = (item.qty || 1) - 1;
            if (item.qty <= 0) player.inventory[index] = null;
            this.hideTooltip();
            this.renderInventory();
            return;
        }

        if (item.type === 'weapon' || item.type === 'armor') {
            if (item.classReq && item.classReq !== player.characterClass) return;

            const targetSlot = item.type;
            const currentEquipped = player.equipment[targetSlot];
            player.equipment[targetSlot] = item;
            player.inventory[index] = currentEquipped;

            window.soundEngine.playItemPickup();
            this.hideTooltip();
            this.renderInventory();
        }
    }

    renderPaperdoll(player) {
        const canvas = document.getElementById('dollCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        window.spriteManager.draw(ctx, player.getSpriteKey(), 0, 0, 48, 48, 0, 0, 96, 96);
    }

    showTooltip(item, event) {
        const tt = this.tooltip;
        if (!tt) return;
        const rarity = window.ITEM_RARITIES[item.rarity] || window.ITEM_RARITIES.COMMON;
        const player = window.game ? window.game.player : null;

        let compHtml = '';
        if (player && (item.type === 'weapon' || item.type === 'armor')) {
            const equipped = player.equipment[item.type];
            if (equipped && equipped.id !== item.id) {
                const diffAtk = (item.atk || 0) - (equipped.atk || 0);
                const diffDef = (item.def || 0) - (equipped.def || 0);
                compHtml = `
                    <div style="margin-top:6px;padding-top:4px;border-top:1px dashed #555;font-size:10px;">
                        <div style="color:#aaa;margin-bottom:2px;">vs Equipado actualmente:</div>
                        ${diffAtk !== 0 ? `<div style="color:${diffAtk > 0 ? '#2ecc71' : '#e74c3c'};">${diffAtk > 0 ? '+' : ''}${diffAtk} Ataque</div>` : ''}
                        ${diffDef !== 0 ? `<div style="color:${diffDef > 0 ? '#2ecc71' : '#e74c3c'};">${diffDef > 0 ? '+' : ''}${diffDef} Defensa</div>` : ''}
                    </div>
                `;
            }
        }

        tt.innerHTML = `
            <div class="tooltip-title" style="color:${rarity.color}">${item.name}</div>
            <div class="tooltip-type">${rarity.name} - ${item.type.toUpperCase()}</div>
            <div class="tooltip-stats">
                ${item.atk ? `<div>+${item.atk} Daño de Ataque</div>` : ''}
                ${item.def ? `<div>+${item.def} Defensa Física</div>` : ''}
                ${item.str ? `<div>+${item.str} Fuerza</div>` : ''}
                ${item.dex ? `<div>+${item.dex} Destreza</div>` : ''}
                ${item.mag ? `<div>+${item.mag} Magia</div>` : ''}
                ${item.con ? `<div>+${item.con} Constitución</div>` : ''}
            </div>
            ${compHtml}
            <div class="tooltip-lore">${item.desc || ''}</div>
            <div style="font-size:12px;color:#f1c40f;margin-top:6px;display:flex;justify-content:space-between;">
                <span>Valor: ${item.value || 0} G</span>
                <span style="font-size:9px;color:#aaa;">[Clic Der: Opciones]</span>
            </div>
        `;
        tt.style.display = 'block';
        this.updateTooltipPos(event);
    }

    updateTooltipPos(event) {
        const tt = this.tooltip;
        if (!tt || tt.style.display === 'none') return;
        const container = document.getElementById('game-container') || document.body;
        const rect = container.getBoundingClientRect();
        let posX = event.clientX - rect.left + 16;
        let posY = event.clientY - rect.top + 16;
        if (posX + 250 > rect.width - 10) posX = event.clientX - rect.left - 260;
        tt.style.left = `${Math.max(10, posX)}px`;
        tt.style.top = `${Math.max(10, posY)}px`;
    }

    hideTooltip() {
        if (this.tooltip) this.tooltip.style.display = 'none';
    }

    toggleStats() {
        const modal = document.getElementById('stats-modal');
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
            if (window.game) window.game.resumeFromModal();
        } else {
            modal.style.display = 'flex';
            this.renderStatsModal();
            if (window.game) window.game.pauseForModal();
        }
    }

    renderStatsModal() {
        const player = window.game.player;
        if (!player) return;
        const total = player.getTotalStats();

        document.getElementById('stat-level-val').innerText = player.level;
        document.getElementById('stat-pts-val').innerText = player.attributePoints;
        document.getElementById('stat-str-val').innerText = `${player.strength} (Total: ${total.str})`;
        document.getElementById('stat-dex-val').innerText = `${player.dexterity} (Total: ${total.dex})`;
        document.getElementById('stat-mag-val').innerText = `${player.magic} (Total: ${total.mag})`;
        document.getElementById('stat-con-val').innerText = `${player.constitution} (Total: ${total.con})`;
        document.getElementById('stat-atk-total').innerText = total.atk;
        document.getElementById('stat-def-total').innerText = total.def;
        document.getElementById('stat-crit-total').innerText = `${total.critChance}%`;

        let setEl = document.getElementById('set-bonus-indicator');
        if (!setEl) {
            setEl = document.createElement('div');
            setEl.id = 'set-bonus-indicator';
            setEl.style.cssText = 'color:#f1c40f;font-size:10px;margin-top:8px;font-family:"Press Start 2P";';
            document.getElementById('stats-modal').querySelector('.modal-content').appendChild(setEl);
        }
        setEl.innerText = total.setBonus || 'Sin bono de conjunto';

        const hasPoints = player.attributePoints > 0;
        ['str', 'dex', 'mag', 'con'].forEach(attr => {
            const btn = document.getElementById(`btn-add-${attr}`);
            if (btn) {
                btn.style.display = hasPoints ? 'inline-block' : 'none';
                btn.onclick = () => {
                    if (player.attributePoints > 0) {
                        if (attr === 'str') player.strength++;
                        if (attr === 'dex') player.dexterity++;
                        if (attr === 'mag') { player.magic++; player.maxMp += 5; }
                        if (attr === 'con') { player.constitution++; player.maxHp += 10; player.hp += 10; }
                        player.attributePoints--;
                        this.renderStatsModal();
                    }
                };
            }
        });
    }

    showLoreModal(loreData) {
        const modal = document.getElementById('lore-modal');
        document.getElementById('parchment-title').innerText = loreData.title;
        document.getElementById('parchment-author').innerText = `- ${loreData.author}`;
        document.getElementById('parchment-content').innerText = loreData.content;
        document.getElementById('parchment-tip').innerText = loreData.combat_tip;
        modal.style.display = 'flex';
    }

    closeLoreModal() {
        document.getElementById('lore-modal').style.display = 'none';
        if (window.game) window.game.resumeFromModal();
    }

    async showHallOfFame() {
        const modal = document.getElementById('hall-of-fame-modal');
        modal.style.display = 'flex';
        try {
            const res = await fetch('/api/hall_of_fame');
            const data = await res.json();
            const tbody = document.getElementById('hof-table-body');
            tbody.innerHTML = '';
            data.forEach((r, idx) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#${idx + 1}</td>
                    <td>${r.player_name}</td>
                    <td>${r.character_class.toUpperCase()}</td>
                    <td>Piso ${r.floor_reached}</td>
                    <td>${r.enemies_killed}</td>
                    <td>${r.gold} G</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (e) { }
    }

    async showSavesModal() {
        const modal = document.getElementById('saves-modal');
        modal.style.display = 'flex';
        if (window.game) window.game.pauseForModal();
        try {
            const res = await fetch('/api/saves');
            const saves = await res.json();
            const container = document.getElementById('saves-slots-container');
            container.innerHTML = '';
            [1, 2, 3].forEach(slotNum => {
                const save = saves.find(s => s.slot === slotNum);
                const slotDiv = document.createElement('div');
                slotDiv.style.cssText = 'background:#1a1324;border:2px solid #5a4270;border-radius:4px;padding:12px;display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;';
                slotDiv.innerHTML = save ? `
                    <div>
                        <div style="font-family:'Press Start 2P';font-size:11px;color:#f1c40f;">SLOT ${slotNum}: ${save.player_name}</div>
                        <div style="font-size:13px;color:#aaa;">Piso: ${save.floor_reached} / 10 | Nivel: ${save.level}</div>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="pixel-btn" id="load-slot-${slotNum}">CARGAR</button>
                        <button class="pixel-btn btn-gold" id="save-slot-${slotNum}">GUARDAR</button>
                    </div>
                ` : `
                    <div style="color:#888;">SLOT ${slotNum}: [VACÍO]</div>
                    <button class="pixel-btn btn-gold" id="save-slot-${slotNum}">GUARDAR</button>
                `;
                container.appendChild(slotDiv);

                const saveBtn = document.getElementById(`save-slot-${slotNum}`);
                if (saveBtn) saveBtn.onclick = () => window.game && window.game.saveGame(slotNum);
                const loadBtn = document.getElementById(`load-slot-${slotNum}`);
                if (loadBtn) loadBtn.onclick = () => window.game && window.game.loadGame(slotNum);
            });
        } catch (e) { }
    }
}

// =============================================================================
// LIBRO DE CRÓNICAS ILUSTRADO (SOLO TRAS LA VICTORIA)
// =============================================================================
const LORE_CHAPTERS = [
    {
        num: 1,
        titleLeft: "I. El Origen y la Gran Sinfonía",
        image: "/static/assets/lore/Ainor.jpg",
        textLeft: `
            <h4>El Dios Absoluto Ainor</h4>
            <p>En el principio, cuando solo existía la nada y la oscuridad absoluta, habitaba un ser supremo: el Dios Absoluto <b>Ainor</b>. Poseía el poder primordial de dar origen a la vida y destruirla a voluntad, y morando en la inmensidad del vacío concibió el gran plan de la existencia.</p>
            <h4>Los Cinco Eonaris</h4>
            <p>Deseando compañía para la eternidad y para ejecutar su designio divino, Ainor dio forma a <b>cinco seres de luz pura</b> llamados los <b>Eonaris</b>, manantiales incandescentes de poder divino manifestados en el vacío sin cuerpo físico.</p>
            <h4>La Gran Sinfonía de la Creación</h4>
            <p>Ainor y los Eonaris alzaron su voz en un canto sagrado. Mientras la voz de Ainor moldeaba planetas y estrellas, la resonancia de los Eonaris daba origen a cada uno de los conceptos y aspectos del universo en expansión.</p>
        `,
        titleRight: "El Canto del Cosmos",
        textRight: "<i>«Antes del tiempo y de la luz, toda la realidad nació de la armonía entre Ainor y el canto de los cinco Eonaris.»</i>"
    },
    {
        num: 2,
        titleLeft: "II. Los Soles, la Tierra y los Primogénitos",
        image: "/static/assets/lore/Batalla.png",
        textLeft: `
            <h4>El Eonari de los Soles</h4>
            <p>Entre los cinco seres divinos, uno sobresalía con singular resplandor: su canto era tan cálido e intenso que con cada nota lograba dar origen a soles resplandecientes en la oscuridad, avivando el calor de la existencia.</p>
            <h4>La Creación de la Tierra</h4>
            <p>Tras incontables milenios, Ainor moldeó un mundo con sus propias manos y lo pobló con ríos, montañas y criaturas vivientes. Sin embargo, al contemplar su obra sintió un vacío: los animales no bastaban para llenar el mundo.</p>
            <h4>Las Cuatro Razas y los Espíritus</h4>
            <p>Buscando superar esa soledad, Ainor experimentó y dio origen a los <b>humanos, elfos, enanos y espíritus</b>. Tras concederles atributos únicos, los depositó a dormir pacíficamente en rincones estratégicos del nuevo mundo.</p>
        `,
        titleRight: "Los Primogénitos del Sueño",
        textRight: "<i>«Encendidos los soles y moldeada la Tierra, los pueblos mortales aguardaron en un plácido letargo su momento de despertar.»</i>"
    },
    {
        num: 3,
        titleLeft: "III. Los Guardianes Elementales",
        image: "/static/assets/lore/los Eonaris.png",
        textLeft: `
            <h4>El Mandato de la Custodia</h4>
            <p>Para proteger su creación mientras los mortales dormían, Ainor envió a los cinco Eonaris a la Tierra. Al ser energía pura que rompería la mente mortal, adoptaron formas físicas basadas en los elementos que más ayudaron a cantar en la Creación.</p>
            <h4>Aethelgard, Kataida y Okeanos</h4>
            <p><b>Aethelgard</b> tomó la forma de la Tierra Inmutable y la fuerza indomable. <b>Kataida</b> asumió el manto de la Justicia y los Rayos de la tormenta. <b>Okeanos</b> tomó el dominio de la Marea Ancestral, custodiando la Sabiduría, la Verdad y el Tiempo.</p>
            <h4>Valariel y Silmarion</h4>
            <p><b>Valariel</b> tomó el aspecto de la Vida Astral, la Misericordia y la Esperanza. Por último, <b>Silmarion</b> (creador de soles) asumió la forma del Fuego Solar, la Justicia Inquebrantable, la Ley y la Claridad para guiar al panteón.</p>
        `,
        titleRight: "Los Protectores Manifestados",
        textRight: "<i>«La energía pura tomó la forma de carne y elemento para velar por el mundo sin cegar a los mortales.»</i>"
    },
    {
        num: 4,
        titleLeft: "IV. El Despertar y el Silencio de Ainor",
        image: "/static/assets/lore/simarion.png",
        textLeft: `
            <h4>La Era de Oro Primordial</h4>
            <p>Con las cinco deidades guardianas velando en los cuatro confines y las razas listas para despertar de su largo reposo, Ainor se retiró al descanso divino. El mundo quedó bajo la vigilancia eterna de los Eonaris en una era de esplendor y armonía.</p>
        `,
        titleRight: "La Era de Oro Primordial",
        textRight: "<i>«Los Eonaris tomaron su puesto y el mundo despertó a la luz.»</i>"
    },
    {
        num: 5,
        titleLeft: "V. La Caída del Portador de Soles",
        image: "/static/assets/lore/caida_silmarion.png",
        textLeft: `
            <h4>La Envidia de Silmarion</h4>
            <p>Siendo el más brillante de los cinco Eonaris, el corazón de <b>Silmarion</b> se llenó de oscuridad y avaricia. Quiso igualar a <b>Ainor</b> y crear vida propia, pero al fracasar, optó por corromper y modificar cruelmente a los seres vivos del mundo.</p>
            <h4>La Rebelión y el Destierro</h4>
            <p>Sus hermanos intentaron detenerlo, pero Silmarion era tan poderoso que casi logra vencerlos a todos. Ante tal amenaza, <b>Ainor</b> intervino directamente: al ver en qué se había convertido, le quitó su poder, lo despojó de su brillo solar y lo desterró a la Tierra.</p>
        `,
        titleRight: "El Eonari Caído",
        textRight: "<i>«De aquel que encendía los soles solo quedó el rencor de una estrella caída.»</i>"
    },
    {
        num: 6,
        titleLeft: "VI. El Nacimiento del Señor Oscuro",
        image: "/static/assets/lore/simarion.png",
        textLeft: `
            <h4>El Fuego del Núcleo Terrestre</h4>
            <p>En las profundidades de la Tierra, Silmarion encontró el magma primordial del núcleo y absorbió su poder sin perder su porte regio. Fusionándolo con su rencor, creó las <b>llamas sombrías</b>, alzando su trono oscuro con una corona pálida y ojos ardientes como brasas.</p>
            <h4>La Corrupción de las Razas</h4>
            <p>Recordando dónde dormían los humanos, elfos, enanos y espíritus, raptó a los primeros en despertar y retorció sus almas para crear monstruos y demonios. Alimentándose de esa corrupción, acumuló un poder inmenso hasta convertirse en el <b>Señor Oscuro</b>.</p>
        `,
        titleRight: "El Señor Oscuro",
        textRight: "<i>«Sin poder crear vida, aprendió a retorcerla; y de las llamas sin luz forjó su corona.»</i>"
    },
    {
        num: 7,
        titleLeft: "VII. El Despertar de los Pueblos Libres",
        image: "/static/assets/lore/despertar_razas.png",
        textLeft: `
            <h4>La Llamada en la Oscuridad</h4>
            <p>Sintiendo el avance de la sombra bajo la tierra, los cuatro Eonaris —<b>Aethelgard</b>, <b>Kataida</b>, <b>Okeanos</b> y <b>Valariel</b>— despertaron antes de tiempo a los <b>humanos, elfos, enanos y espíritus</b> para evitar que fueran devorados en su letargo.</p>
            <h4>La Primera Alianza</h4>
            <p>Guiados por la sabiduría de Okeanos y la esperanza de Valariel, las cuatro razas dejaron atrás sus diferencias, forjaron sus primeras armas y unieron sus destinos junto a los espíritus para defender la creación de Ainor.</p>
        `,
        titleRight: "El Despertar de los Primogénitos",
        textRight: "<i>«Despertaron de un sueño de paz para encontrar la sombra llamando a sus puertas.»</i>"
    },
    {
        num: 8,
        titleLeft: "VIII. La Guerra de las Legiones Corrompidas",
        image: "/static/assets/lore/Batalla.png",
        textLeft: `
            <h4>El Azote del Señor Oscuro</h4>
            <p>Desde su trono de ceniza y fuego negro, <b>Silmarion</b> desató los ejércitos que había retorcido en las sombras: bestias colosales, espectros y demonios nacidos de los primeros cautivos. Los cielos se cubrieron de humo bajo las llamas sombrías.</p>
            <h4>La Resistencia Mortal</h4>
            <p>Durante siglos, enanos, elfos, humanos y espíritus resistieron con valor el embate interminable. Sin embargo, cada caída alimentaba el poder oscuro de Silmarion, haciendo imposible derrotarlo únicamente con acero mortal.</p>
        `,
        titleRight: "Siglos de Fuego y Ceniza",
        textRight: "<i>«El acero de los mortales brilló con honor, pero la sombra se alimentaba de cada herida.»</i>"
    },
    {
        num: 9,
        titleLeft: "IX. El Juicio de los Cuatro Eonaris",
        image: "/static/assets/lore/Guardianes.png",
        textLeft: `
            <h4>El Descenso de los Guardianes</h4>
            <p>Al ver a los pueblos libres al borde de la extinción, los cuatro Eonaris intervinieron: <b>Aethelgard</b> quebró las fortalezas oscuras, <b>Kataida</b> descargó tormentas de rayos, <b>Okeanos</b> desató mareas purificadoras y <b>Valariel</b> protegió las almas con luz astral.</p>
            <h4>El Enfrentamiento Final</h4>
            <p>Acorralado en el corazón de su dominio, Silmarion desató el fuego del núcleo terrestre, pero la unión perfecta de los cuatro elementos primordiales logró doblegar su cuerpo y dispersar sus legiones.</p>
        `,
        titleRight: "La Furia de los Cuatro",
        textRight: "<i>«Cuatro fuerzas de la Creación unidas contra el hermano que eligió la penumbra.»</i>"
    },
    {
        num: 10,
        titleLeft: "X. El Abismo Sellado y el Origen de la Torre",
        image: "/static/assets/lore/torre_sello.png",
        textLeft: `
            <h4>Una Esencia Indestructible</h4>
            <p>Tras derrotar su forma física, los cuatro Eonaris comprendieron que la esencia de <b>Silmarion</b> no podía ser destruida por completo, pues al haber nacido de la mano de Ainor seguía ligada a la existencia misma.</p>
            <h4>Los Cimientos de La Torre Oscura</h4>
            <p>Confinaron su espíritu ardiente en el abismo más profundo y erigieron sobre él un sello monumental de piedra y luz. Con las eras, el susurro constante del Señor Oscuro corrompió aquel monumento desde adentro, dando origen a <b>La Torre Oscura</b>.</p>
        `,
        titleRight: "La Prisión Corrupta",
        textRight: "<i>«No pudieron destruir su esencia eterna; así que levantaron una prisión que el tiempo convertiría en pesadilla.»</i>"
    }
];

UIManager.prototype.currentLorePage = 0;

UIManager.prototype.updateBookUnlockStatus = function () {
    const isCleared = localStorage.getItem('dark_tower_game_cleared') === 'true';
    const bookWidget = document.getElementById('btn-lore-book');
    if (bookWidget) {
        bookWidget.style.display = isCleared ? 'flex' : 'none';
    }
};

UIManager.prototype.showLoreBook = function () {
    const modal = document.getElementById('lore-book-modal');
    if (!modal) return;
    this.currentLorePage = 0;
    this.renderLoreBookPage();
    modal.style.display = 'flex';
    if (window.soundEngine) window.soundEngine.playTone(320, 'sine', 0.2, 0.25);
};

UIManager.prototype.renderLoreBookPage = function () {
    const chap = LORE_CHAPTERS[this.currentLorePage];
    if (!chap) return;

    document.getElementById('book-chap-title-left').innerText = chap.titleLeft;
    document.getElementById('book-text-left').innerHTML = chap.textLeft;
    document.getElementById('book-page-num-left').innerText = (this.currentLorePage * 2 + 1);

    document.getElementById('book-chap-title-right').innerText = chap.titleRight;

    const captionEl = document.getElementById('book-text-right');
    if (captionEl) captionEl.innerHTML = chap.textRight;

    document.getElementById('book-page-num-right').innerText = (this.currentLorePage * 2 + 2);
    document.getElementById('book-progress-label').innerText = `${chap.num} / ${LORE_CHAPTERS.length}`;

    const imgEl = document.getElementById('book-illu-img');
    if (imgEl && chap.image) {
        imgEl.src = chap.image;
    }

    document.getElementById('btn-prev-page').style.opacity = this.currentLorePage === 0 ? "0.4" : "1";
    document.getElementById('btn-prev-page').disabled = this.currentLorePage === 0;

    const isLast = this.currentLorePage === LORE_CHAPTERS.length - 1;
    document.getElementById('btn-next-page').style.opacity = isLast ? "0.4" : "1";
    document.getElementById('btn-next-page').disabled = isLast;
};

UIManager.prototype.nextLorePage = function () {
    if (this.currentLorePage < LORE_CHAPTERS.length - 1) {
        this.currentLorePage++;
        this.renderLoreBookPage();
        if (window.soundEngine) window.soundEngine.playTone(280, 'sine', 0.12, 0.2);
    }
};

UIManager.prototype.prevLorePage = function () {
    if (this.currentLorePage > 0) {
        this.currentLorePage--;
        this.renderLoreBookPage();
        if (window.soundEngine) window.soundEngine.playTone(240, 'sine', 0.12, 0.2);
    }
};

window.uiManager = new UIManager();