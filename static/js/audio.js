/**
 * SISTEMA DE AUDIO RETRO CHIPTUNE (16-BIT)
 * Utiliza Web Audio API pura para efectos sonoros analógicos y música procedural.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        // Cargar preferencia guardada de silencio de localStorage
        const savedMute = localStorage.getItem('dark_tower_muted');
        this.enabled = savedMute !== 'true';
        this.muted = !this.enabled;

        this.musicGain = null;
        this.sfxGain = null;
        this.bgmInterval = null;
        this.currentBgm = null;
        this.isBossMusic = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            this.musicGain = this.ctx.createGain();
            const musicVol = this.muted ? 0.0 : 0.18;
            this.musicGain.gain.setValueAtTime(musicVol, this.ctx.currentTime);
            this.musicGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            const sfxVol = this.muted ? 0.0 : 0.28;
            this.sfxGain.gain.setValueAtTime(sfxVol, this.ctx.currentTime);
            this.sfxGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq, type = 'square', duration = 0.1, gainVal = 0.3) {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            g.gain.setValueAtTime(gainVal, this.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(g);
            g.connect(this.sfxGain);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) { }
    }

    playNoise(duration = 0.1, gainVal = 0.25) {
        if (!this.enabled || !this.ctx) return;
        try {
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, this.ctx.currentTime);

            const g = this.ctx.createGain();
            g.gain.setValueAtTime(gainVal, this.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            noise.connect(filter);
            filter.connect(g);
            g.connect(this.sfxGain);

            noise.start();
        } catch (e) { }
    }

    // Efectos de Combate y Gameplay
    playSwordSlash() {
        this.init();
        if (!this.enabled) return;
        this.playNoise(0.12, 0.35);
        this.playTone(320, 'sawtooth', 0.1, 0.2);
    }

    playArrowShot() {
        this.init();
        if (!this.enabled) return;
        try {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(250, this.ctx.currentTime + 0.14);
            g.gain.setValueAtTime(0.2, this.ctx.currentTime);
            g.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);
            osc.connect(g);
            g.connect(this.sfxGain);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.15);
        } catch (e) { }
    }

    playMagicCast() {
        this.init();
        if (!this.enabled) return;
        const notes = [440, 660, 880, 1100];
        notes.forEach((freq, idx) => {
            setTimeout(() => this.playTone(freq, 'sine', 0.15, 0.18), idx * 35);
        });
    }

    playHit() {
        this.init();
        if (!this.enabled) return;
        this.playTone(120, 'square', 0.15, 0.3);
        this.playNoise(0.08, 0.25);
    }

    playBossRoar() {
        this.init();
        if (!this.enabled) return;
        try {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(90, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(45, this.ctx.currentTime + 0.6);
            g.gain.setValueAtTime(0.4, this.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
            osc.connect(g);
            g.connect(this.sfxGain);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.65);
        } catch (e) { }
    }

    playAcidSpit() {
        this.init();
        if (!this.enabled) return;
        this.playTone(280, 'sawtooth', 0.25, 0.25);
        this.playNoise(0.3, 0.2);
    }

    playLevelUp() {
        this.init();
        if (!this.enabled) return;
        const fanfare = [261.6, 329.6, 392.0, 523.2, 659.2];
        fanfare.forEach((n, i) => {
            setTimeout(() => this.playTone(n, 'triangle', 0.25, 0.3), i * 90);
        });
    }

    playItemPickup() {
        this.init();
        if (!this.enabled) return;
        this.playTone(784, 'sine', 0.1, 0.25);
        setTimeout(() => this.playTone(1046.5, 'sine', 0.15, 0.25), 60);
    }

    playPotion() {
        this.init();
        if (!this.enabled) return;
        this.playTone(300, 'triangle', 0.08, 0.2);
        setTimeout(() => this.playTone(450, 'triangle', 0.1, 0.2), 70);
        setTimeout(() => this.playTone(600, 'triangle', 0.15, 0.2), 140);
    }

    // =========================================================================
    // MÚSICA CHIPTUNE DE FONDO (Procedural 16-Bit BGM)
    // =========================================================================
    startBgm(isBoss = false) {
        this.init();
        this.stopBgm();
        this.isBossMusic = isBoss;

        const dungeonScale = [110, 130.8, 146.8, 164.8, 174.6, 196.0, 220.0];
        const bossScale = [82.4, 98.0, 110.0, 123.5, 130.8, 164.8];
        const scale = isBoss ? bossScale : dungeonScale;

        let step = 0;
        const tempo = isBoss ? 160 : 320;

        this.bgmInterval = setInterval(() => {
            if (!this.enabled || !this.ctx) return;
            try {
                // Bass note
                const root = scale[step % scale.length];
                this.playTone(root, 'triangle', isBoss ? 0.12 : 0.22, 0.12);

                // Lead / arpeggio
                if (step % 2 === 0) {
                    const leadNote = scale[(step * 2) % scale.length] * 2;
                    this.playTone(leadNote, 'square', isBoss ? 0.08 : 0.15, 0.06);
                }

                // Ritmo de percusión retro en batallas de jefe
                if (isBoss && step % 4 === 2) {
                    this.playNoise(0.05, 0.1);
                }

                step++;
            } catch (e) { }
        }, tempo);
    }

    stopBgm() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }

    /**
     * Alterna el estado de silencio (Mute / Unmute), guarda en localStorage y actualiza la UI
     */
    toggleMute() {
        this.init();
        this.muted = !this.muted;
        this.enabled = !this.muted;
        localStorage.setItem('dark_tower_muted', this.muted ? 'true' : 'false');

        if (this.musicGain && this.ctx) {
            this.musicGain.gain.setValueAtTime(this.muted ? 0.0 : 0.18, this.ctx.currentTime);
        }
        if (this.sfxGain && this.ctx) {
            this.sfxGain.gain.setValueAtTime(this.muted ? 0.0 : 0.28, this.ctx.currentTime);
        }

        // Si se quita el silencio y no hay BGM sonando pero el juego está en marcha, reanudar BGM
        if (!this.muted && !this.bgmInterval && window.game && window.game.state === window.game.STATE_PLAYING) {
            this.startBgm(!!window.game.activeBoss);
        }

        // Actualizar visual del botón en HUD
        this.updateMuteButtonUI();

        return this.muted;
    }

    updateMuteButtonUI() {
        const btn = document.getElementById('btn-toggle-mute');
        const icon = document.getElementById('mute-icon');
        if (!btn || !icon) return;

        if (this.muted) {
            btn.classList.add('muted');
            icon.innerText = '🔇';
            btn.title = 'Activar Música [M] (Silenciado)';
        } else {
            btn.classList.remove('muted');
            icon.innerText = '🔊';
            btn.title = 'Silenciar Música [M]';
        }
    }
}

window.soundEngine = new SoundEngine();
