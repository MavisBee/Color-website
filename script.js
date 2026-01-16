/**
 * Professional Color Generator Logic
 * Refactored for performance and modularity.
 */

class ColorApp {
    constructor() {
        this.config = {
            totalColors: 5,
            defaultMode: 'analogous'
        };

        this.state = {
            colors: new Array(this.config.totalColors).fill('#000000'),
            locked: new Array(this.config.totalColors).fill(false),
            mode: 'analogous',
            theme: localStorage.getItem('theme') || 'theme-dark'
        };

        this.dom = {
            root: document.documentElement,
            body: document.body,
            paletteContainer: document.getElementById('palette-container'),
            generateBtn: document.getElementById('generate-btn'),
            harmonySelect: document.getElementById('harmony-select'),
            themeToggle: document.getElementById('theme-toggle'),
            colorCards: document.querySelectorAll('.color-card'), // Initial load
        };

        this.init();
    }

    init() {
        // Apply initial theme
        this.dom.body.className = this.state.theme;
        this.updateThemeIcon();

        this.bindEvents();
        this.generatePalette();
        this.createToastContainer();
    }

    bindEvents() {
        // Generation
        this.dom.generateBtn.addEventListener('click', () => this.generatePalette());

        // Harmony Selection
        this.dom.harmonySelect.addEventListener('change', (e) => {
            this.state.mode = e.target.value;
            this.generatePalette();
        });

        // Theme Toggle
        this.dom.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Keyboard Shortcut (Spacebar)
        document.addEventListener('keydown', (e) => {
            // Prevent scrolling if space is pressed, unless text input is focused
            if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
                e.preventDefault();
                this.generatePalette();
            }
        });

        // Delegate Palette Interactions
        this.dom.paletteContainer.addEventListener('click', (e) => this.handlePaletteClick(e));
    }

    handlePaletteClick(e) {
        const card = e.target.closest('.color-card');
        if (!card) return;

        const index = parseInt(card.dataset.index, 10);
        const target = e.target;

        // Action routing
        if (target.closest('[title="Lock Color"]')) {
            this.toggleLock(index);
        } else if (target.closest('[title="Copy HEX"]')) {
            this.copyToClipboard(this.state.colors[index]);
        } else if (target.closest('[title="Refresh This Color"]')) {
            this.regenerateSingleColor(index);
        }
    }

    /* --- Theme Logic --- */
    toggleTheme() {
        this.state.theme = this.state.theme === 'theme-dark' ? 'theme-light' : 'theme-dark';
        this.dom.body.className = this.state.theme;
        localStorage.setItem('theme', this.state.theme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const icon = this.dom.themeToggle.querySelector('.material-icons-round');
        if (icon) {
            icon.textContent = this.state.theme === 'theme-dark' ? 'light_mode' : 'dark_mode';
        }
    }

    /* --- Core Color Logic --- */
    generatePalette() {
        // 1. Base Color Generation (Random HSL)
        const baseH = Math.floor(Math.random() * 360);
        const baseS = Math.floor(Math.random() * 60) + 40; // Avoid dull colors
        const baseL = Math.floor(Math.random() * 40) + 35; // Avoid too dark/light

        // 2. Harmony Calculation
        const harmonyColors = this.calculateHarmonies(baseH, baseS, baseL);

        // 3. Update State (respecting locks)
        harmonyColors.forEach((hsl, i) => {
            if (!this.state.locked[i]) {
                const hex = this.hslToHex(hsl.h, hsl.s, hsl.l);
                this.state.colors[i] = hex;
            }
        });

        // 4. Render
        this.updateUI();
    }

    regenerateSingleColor(index) {
        // Generate a random compatible variation
        const h = Math.floor(Math.random() * 360);
        const s = Math.floor(Math.random() * 40) + 50;
        const l = Math.floor(Math.random() * 40) + 40;

        this.state.colors[index] = this.hslToHex(h, s, l);
        this.updateUI();
    }

    calculateHarmonies(h, s, l) {
        let colors = [];
        const mode = this.state.mode;

        const clip = (val, min, max) => Math.max(min, Math.min(val, max));

        switch (mode) {
            case 'monochromatic':
                colors = [
                    { h, s, l: clip(l - 30, 20, 90) },
                    { h, s, l: clip(l - 15, 20, 90) },
                    { h, s, l }, // Base
                    { h, s, l: clip(l + 15, 20, 90) },
                    { h, s, l: clip(l + 30, 20, 95) }
                ];
                break;
            case 'analogous':
                colors = [
                    { h: (h - 30 + 360) % 360, s, l },
                    { h: (h - 15 + 360) % 360, s, l },
                    { h, s, l },
                    { h: (h + 15) % 360, s, l },
                    { h: (h + 30) % 360, s, l }
                ];
                break;
            case 'complementary': // 2 dominant colors + variations
                colors = [
                    { h, s, l },
                    { h, s, l: clip(l + 25, 20, 90) },
                    { h, s: Math.max(s - 20, 0), l: clip(l + 45, 80, 98) }, // Neutral
                    { h: (h + 180) % 360, s, l },
                    { h: (h + 180) % 360, s, l: clip(l - 20, 10, 80) }
                ];
                break;
            case 'triadic':
                colors = [
                    { h, s, l },
                    { h: (h + 120) % 360, s, l },
                    { h: (h + 240) % 360, s, l },
                    { h: (h + 120) % 360, s, l: clip(l + 20, 20, 90) },
                    { h: (h + 240) % 360, s, l: clip(l - 20, 20, 90) }
                ];
                break;
            case 'split-complementary':
                colors = [
                    { h, s, l },
                    { h: (h + 150) % 360, s, l },
                    { h: (h + 210) % 360, s, l },
                    { h: (h + 150) % 360, s: Math.max(s - 10, 0), l: clip(l + 20, 70, 95) },
                    { h: (h + 210) % 360, s: Math.max(s - 10, 0), l: clip(l - 20, 10, 50) }
                ];
                break;
            case 'square':
                colors = [
                    { h, s, l },
                    { h: (h + 90) % 360, s, l },
                    { h: (h + 180) % 360, s, l },
                    { h: (h + 270) % 360, s, l },
                    { h: (h + 90) % 360, s, l: clip(l + 30, 80, 95) }
                ];
                break;
            default:
                for (let i = 0; i < 5; i++) colors.push({ h: Math.random() * 360, s: 60, l: 50 });
        }
        return colors;
    }

    updateUI() {
        this.dom.colorCards.forEach((card, index) => {
            const color = this.state.colors[index];

            // 1. CSS Variables for global usage (previews)
            this.dom.root.style.setProperty(`--c-${index + 1}`, color);

            // 2. Contrast Color for text visibility
            const contrast = this.getContrastColor(color);
            this.dom.root.style.setProperty(`--text-c-${index + 1}`, contrast);

            // 3. DOM Text
            const hexEl = card.querySelector('.hex-text');
            if (hexEl) hexEl.textContent = color;

            // 4. Lock Visuals
            const lockIcon = card.querySelector('[title="Lock Color"] span');
            if (lockIcon) lockIcon.textContent = this.state.locked[index] ? 'lock' : 'lock_open';

            card.classList.toggle('locked', this.state.locked[index]);
        });
    }

    toggleLock(index) {
        this.state.locked[index] = !this.state.locked[index];
        this.updateUI();
    }

    /* --- Utils --- */
    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
    }

    getContrastColor(hex) {
        const r = parseInt(hex.substr(1, 2), 16);
        const g = parseInt(hex.substr(3, 2), 16);
        const b = parseInt(hex.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#0f1219' : '#ffffff';
    }

    copyToClipboard(text) {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(text).then(() => {
            this.showToast(`${text} copied!`);
        });
    }

    createToastContainer() {
        this.dom.toast = document.createElement('div');
        this.dom.toast.className = 'toast-notification'; // Ensure CSS exists
        this.dom.toast.innerHTML = `<span class="material-icons-round">check</span> <span class="msg"></span>`;
        document.body.appendChild(this.dom.toast);
    }

    showToast(msg) {
        if (!this.dom.toast) return;
        this.dom.toast.querySelector('.msg').textContent = msg;
        this.dom.toast.classList.add('active');
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            this.dom.toast.classList.remove('active');
        }, 2000);
    }
}

// Start
document.addEventListener('DOMContentLoaded', () => new ColorApp());
