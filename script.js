class ColorApp {
    constructor() {
        this.config = {
            minColors: 3,
            maxColors: 8,
            defaultMode: 'analogous'
        };

        const savedCount = parseInt(localStorage.getItem('colorCount'), 10) || 5;
        this.state = {
            totalColors: Math.max(this.config.minColors, Math.min(this.config.maxColors, savedCount)),
            colors: [],
            locked: [],
            mode: 'analogous',
            theme: localStorage.getItem('theme') || 'theme-dark'
        };

        // Initialize state arrays based on totalColors
        this.state.colors = new Array(this.state.totalColors).fill('#000000');
        this.state.locked = new Array(this.state.totalColors).fill(false);

        this.dom = {
            root: document.documentElement,
            body: document.body,
            paletteContainer: document.getElementById('palette-container'),
            generateBtn: document.getElementById('generate-btn'),
            harmonySelect: document.getElementById('harmony-select'),
            colorCountInput: document.getElementById('color-count'),
            themeToggle: document.getElementById('theme-toggle'),
            chartArea: document.getElementById('chart-area'),
            colorCards: [], // Will be populated dynamically
        };

        this.init();
    }

    init() {
        // Apply initial theme
        this.dom.body.className = this.state.theme;
        this.updateThemeIcon();

        // Set initial color count in input
        if (this.dom.colorCountInput) {
            this.dom.colorCountInput.value = this.state.totalColors;
        }

        this.renderCards();
        this.bindEvents();
        this.generatePalette();
        this.createToastContainer();
        this.loadSVG(); // Load the dynamic SVG
    }

    renderCards() {
        this.dom.paletteContainer.innerHTML = '';
        this.dom.colorCards = [];
        this.dom.root.style.setProperty('--total-colors', this.state.totalColors);

        for (let i = 0; i < this.state.totalColors; i++) {
            const card = document.createElement('div');
            card.className = 'color-card';
            card.dataset.index = i;
            card.innerHTML = `
                <div class="color-swatch-area">
                    <div class="color-overlay">
                        <button class="action-btn" title="Lock Color">
                            <span class="material-icons-round">lock_open</span>
                        </button>
                        <button class="action-btn" title="Refresh This Color">
                            <span class="material-icons-round">refresh</span>
                        </button>
                    </div>
                </div>
                <div class="color-details">
                    <input type="text" class="hex-input" spellcheck="false" maxlength="7" title="Edit HEX">
                    <button class="copy-btn" title="Copy HEX">
                        <span class="material-icons-round">content_copy</span>
                    </button>
                </div>
            `;
            this.dom.paletteContainer.appendChild(card);
            this.dom.colorCards.push(card);
        }

        // Render Chart Bars
        if (this.dom.chartArea) {
            this.dom.chartArea.innerHTML = '';
            const heights = [40, 75, 55, 90, 65, 80, 45, 70];
            for (let i = 0; i < this.state.totalColors; i++) {
                const bar = document.createElement('div');
                bar.className = 'bar color-interactive';
                bar.dataset.index = i;
                bar.dataset.colorIndex = i;
                bar.style.height = `${heights[i] || 50}%`;
                bar.style.backgroundColor = `var(--c-${i + 1})`;
                this.dom.chartArea.appendChild(bar);
            }
        }
    }

    async loadSVG() {
        try {
            const response = await fetch('Illustration.svg');
            if (response.ok) {
                const text = await response.text();
                // Parse TEXT to DOM
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'image/svg+xml');

                this.processSVGDOM(doc);

                const container = document.getElementById('svg-container');
                if (container) {
                    // Re-serialize
                    container.innerHTML = doc.documentElement.outerHTML;
                }
            }
        } catch (e) {
            console.error('Failed to load SVG', e);
        }
    }

    processSVGDOM(doc) {
        const replacements = {
            // --- Dark / Outlines / Shadows (text-primary) ---
            '#5B4B55': 'var(--text-primary)',
            '#373639': 'var(--text-primary)',
            '#3E383F': 'var(--text-primary)',
            '#2D2C31': 'var(--text-primary)',
            '#323035': 'var(--text-primary)',
            '#333534': 'var(--text-primary)',
            '#5B4A50': 'var(--text-primary)',
            '#544750': 'var(--text-primary)',
            '#373330': 'var(--text-primary)',
            '#53434E': 'var(--text-primary)',

            // --- CAR & Strong Accents (Color 1 - Primary) ---
            '#F7B853': 'var(--c-1)',
            '#F9C266': 'var(--c-1)',
            '#D98A3D': 'var(--c-1)',
            '#F7BF60': 'var(--c-1)',
            '#F8BE5C': 'var(--c-1)',
            '#F8BD61': 'var(--c-1)',
            '#F9BA56': 'var(--c-1)',
            '#F9C97F': 'var(--c-1)',
            '#F8C87A': 'var(--c-1)',
            '#BE8F62': 'var(--c-1)',

            // --- Skin / Backgrounds (Color 2 - Secondary/Light) ---
            '#FAECD1': 'var(--c-2)',
            '#FEE8C0': 'var(--c-2)',
            '#FDEFD6': 'var(--c-2)',
            '#FDE7B5': 'var(--c-2)',
            '#F4DF9E': 'var(--c-2)',
            '#FADEAF': 'var(--c-2)',
            '#FADDA6': 'var(--c-2)',
            '#FEE9C1': 'var(--c-2)',
            '#F7D997': 'var(--c-2)',
            '#F4D69A': 'var(--c-2)',
            '#F7E7C6': 'var(--c-2)',
            '#D9863D': 'var(--c-2)',
            '#F5B25C': 'var(--c-2)',
            '#B5793B': 'var(--c-2)',
            '#B6783F': 'var(--c-2)',

            // --- Earth Tones / Buildings (Color 3) ---
            '#DD8946': 'var(--c-3)',
            '#CC8159': 'var(--c-3)',
            '#C57E4A': 'var(--c-3)',
            '#E58943': 'var(--c-3)',
            '#9D592D': 'var(--c-3)',
            '#DAB48D': 'var(--c-3)',
            '#EFBA6C': 'var(--c-3)',
            '#CD7E45': 'var(--c-3)',
            '#9D6C4B': 'var(--c-3)',
            '#EDCA8B': 'var(--c-3)',
            '#EFC887': 'var(--c-3)',
            '#726670': 'var(--c-3)',
            '#887E72': 'var(--c-3)',
            '#DB8C3D': 'var(--c-3)',
            '#AF7135': 'var(--c-4)',

            // --- SHIRTS / People Accents (Color 4) ---
            '#D74D42': 'var(--c-4)',
            '#9A3B39': 'var(--c-4)',
            '#DC9F60': 'var(--c-4)',
            '#EDC37B': 'var(--c-4)',
            '#F8DCA5': 'var(--c-4)',
            '#FBDEA9': 'var(--c-4)',
            '#AB7338': 'var(--c-4)',

            // --- Trees / Nature / Sky (Color 5) ---
            '#6EAFC7': 'var(--c-5)',
            '#5FADCA': 'var(--c-5)',
            '#42707F': 'var(--c-5)',
            '#84A4B1': 'var(--c-5)',
            '#6EB0C6': 'var(--c-5)',
            '#457684': 'var(--c-5)',
            '#4A7480': 'var(--c-5)',

            // Misc
            'white': 'transparent'
        };

        // Normalize Hex for matching (helper)
        const normalize = (c) => c ? c.toUpperCase() : '';

        // Walk all elements
        const allElements = doc.querySelectorAll('*');
        allElements.forEach(el => {
            // Check fill
            const fill = normalize(el.getAttribute('fill'));
            if (replacements[fill]) {
                const variable = replacements[fill];
                el.style.fill = variable; // Use style for precedence
                el.setAttribute('fill', variable);

                // Add interaction if it's a palette color
                if (variable.includes('var(--c-')) {
                    const indexVal = variable.replace('var(--c-', '').replace(')', '');
                    const index = parseInt(indexVal, 10) - 1; // 1-based var to 0-based index

                    el.classList.add('color-interactive');
                    el.setAttribute('data-color-index', index);
                }
            }

            // Check stroke
            const stroke = normalize(el.getAttribute('stroke'));
            if (replacements[stroke]) {
                const variable = replacements[stroke];
                el.style.stroke = variable;
                el.setAttribute('stroke', variable);

                // Add interaction
                if (variable.includes('var(--c-')) {
                    const indexVal = variable.replace('var(--c-', '').replace(')', '');
                    const index = parseInt(indexVal, 10) - 1;

                    el.classList.add('color-interactive');
                    el.setAttribute('data-color-index', index);
                }
            }
        });

        // Ensure Width/Height scaling
        const svg = doc.documentElement;
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
    }

    bindEvents() {
        // Generation
        this.dom.generateBtn.addEventListener('click', () => this.generatePalette());

        // Harmony Selection
        this.dom.harmonySelect.addEventListener('change', (e) => {
            this.state.mode = e.target.value;
            this.generatePalette();
        });

        // Color Count Adjustment
        this.dom.colorCountInput.addEventListener('change', (e) => {
            let val = parseInt(e.target.value, 10);
            if (isNaN(val)) val = 5;
            val = Math.max(this.config.minColors, Math.min(this.config.maxColors, val));
            e.target.value = val;

            if (val !== this.state.totalColors) {
                this.updateColorCount(val);
            }
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
        
        // Handle Hex Input
        this.dom.paletteContainer.addEventListener('input', (e) => {
            if (e.target.classList.contains('hex-input')) {
                this.handleHexInput(e);
            }
        });

        this.dom.paletteContainer.addEventListener('blur', (e) => {
            if (e.target.classList.contains('hex-input')) {
                this.validateHexInput(e.target);
            }
        }, true);

        // Interactive Preview Elements
        this.bindInteractivePreview();
    }

    updateColorCount(newCount) {
        // Prepare new arrays
        const oldColors = [...this.state.colors];
        const oldLocked = [...this.state.locked];

        this.state.totalColors = newCount;
        this.state.colors = new Array(newCount);
        this.state.locked = new Array(newCount).fill(false);

        // Preserve existing colors/locks where possible
        for (let i = 0; i < newCount; i++) {
            if (i < oldColors.length) {
                this.state.colors[i] = oldColors[i];
                this.state.locked[i] = oldLocked[i];
            } else {
                this.state.colors[i] = '#000000'; // Default, will be updated by generate
            }
        }

        localStorage.setItem('colorCount', newCount);
        this.renderCards();
        this.generatePalette();
    }

    handleHexInput(e) {
        const input = e.target;
        const card = input.closest('.color-card');
        const index = parseInt(card.dataset.index, 10);
        let val = input.value;

        if (!val.startsWith('#')) {
            val = '#' + val;
            input.value = val;
        }

        if (/^#[0-9A-F]{6}$/i.test(val)) {
            this.state.colors[index] = val.toUpperCase();
            this.updateSingleCardUI(index);
        }
    }

    validateHexInput(input) {
        const card = input.closest('.color-card');
        const index = parseInt(card.dataset.index, 10);
        const val = this.state.colors[index];
        input.value = val; // Reset to state value (guaranteed valid hex)
    }

    bindInteractivePreview() {
        // Create Tooltip if not exists
        if (!this.dom.tooltip) {
            this.dom.tooltip = document.createElement('div');
            this.dom.tooltip.className = 'preview-tooltip';
            document.body.appendChild(this.dom.tooltip);
        }

        // Helper to get color info
        const getColorInfo = (target) => {
            const el = target.closest('.color-interactive');
            if (!el) return null;
            const index = parseInt(el.dataset.colorIndex, 10);
            // Check if index is within current range
            if (isNaN(index) || index >= this.state.totalColors) return null;
            return { el, index };
        };

        // Delegate MouseOver (for tooltip show)
        document.addEventListener('mouseover', (e) => {
            const info = getColorInfo(e.target);
            if (info) {
                const color = this.state.colors[info.index];
                this.dom.tooltip.textContent = color;
                this.dom.tooltip.style.opacity = '1';
                this.dom.tooltip.style.left = `${e.clientX}px`;
                this.dom.tooltip.style.top = `${e.clientY}px`;
            }
        });

        // Delegate MouseMove (for tooltip follow)
        document.addEventListener('mousemove', (e) => {
            if (this.dom.tooltip.style.opacity === '1') {
                this.dom.tooltip.style.left = `${e.clientX}px`;
                this.dom.tooltip.style.top = `${e.clientY}px`;
            }
        });

        // Delegate MouseOut (for tooltip hide)
        document.addEventListener('mouseout', (e) => {
            const info = getColorInfo(e.target);
            if (info) {
                this.dom.tooltip.style.opacity = '0';
            }
        });

        // Delegate Click (for copy)
        document.addEventListener('click', (e) => {
            const info = getColorInfo(e.target);
            if (info) {
                this.copyToClipboard(this.state.colors[info.index]);

                // Visual feedback
                const originalTransform = info.el.style.transform;
                info.el.style.transition = 'transform 0.1s';
                info.el.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    info.el.style.transform = originalTransform || '';
                }, 100);
            }
        });
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
        const baseS = Math.floor(Math.random() * 60) + 40; 
        const baseL = Math.floor(Math.random() * 40) + 35; 

        // 2. Harmony Calculation
        const harmonyColors = this.calculateHarmonies(baseH, baseS, baseL);

        // 3. Update State (respecting locks)
        harmonyColors.forEach((hsl, i) => {
            if (i < this.state.totalColors && !this.state.locked[i]) {
                const hex = this.hslToHex(hsl.h, hsl.s, hsl.l);
                this.state.colors[i] = hex;
            }
        });

        // 4. Render
        this.updateUI();
    }

    regenerateSingleColor(index) {
        const h = Math.floor(Math.random() * 360);
        const s = Math.floor(Math.random() * 40) + 50;
        const l = Math.floor(Math.random() * 40) + 40;

        this.state.colors[index] = this.hslToHex(h, s, l);
        this.updateSingleCardUI(index);
    }

    calculateHarmonies(h, s, l) {
        let colors = [];
        const mode = this.state.mode;
        const count = this.state.totalColors;

        const clip = (val, min, max) => Math.max(min, Math.min(val, max));

        const generateSteps = (baseValue, stepSize, num) => {
            const steps = [];
            const half = Math.floor(num / 2);
            for (let i = -half; i < -half + num; i++) {
                steps.push(baseValue + i * stepSize);
            }
            return steps;
        };

        switch (mode) {
            case 'monochromatic':
                const lSteps = generateSteps(l, 12, count);
                colors = lSteps.map(L => ({ h, s, l: clip(L, 15, 95) }));
                break;
            case 'analogous':
                const hSteps = generateSteps(h, 20, count);
                colors = hSteps.map(H => ({ h: (H + 360) % 360, s, l }));
                break;
            case 'complementary':
                for (let i = 0; i < count; i++) {
                    if (i < Math.ceil(count / 2)) {
                        colors.push({ h, s, l: clip(l + (i * 15), 20, 90) });
                    } else {
                        const offset = i - Math.ceil(count / 2);
                        colors.push({ h: (h + 180) % 360, s, l: clip(l - (offset * 15), 20, 90) });
                    }
                }
                break;
            case 'triadic':
                const triH = [h, (h + 120) % 360, (h + 240) % 360];
                for (let i = 0; i < count; i++) {
                    colors.push({ h: triH[i % 3], s, l: clip(l + (Math.floor(i / 3) * 15), 20, 90) });
                }
                break;
            case 'split-complementary':
                const splitH = [h, (h + 150) % 360, (h + 210) % 360];
                for (let i = 0; i < count; i++) {
                    colors.push({ h: splitH[i % 3], s, l: clip(l + (Math.floor(i / 3) * 15), 20, 90) });
                }
                break;
            case 'square':
                const squareH = [h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360];
                for (let i = 0; i < count; i++) {
                    colors.push({ h: squareH[i % 4], s, l: clip(l + (Math.floor(i / 4) * 15), 20, 90) });
                }
                break;
            default:
                for (let i = 0; i < count; i++) colors.push({ h: Math.random() * 360, s: 60, l: 50 });
        }
        return colors;
    }

    updateUI() {
        this.dom.colorCards.forEach((card, index) => {
            this.updateSingleCardUI(index);
        });
    }

    updateSingleCardUI(index) {
        const card = this.dom.colorCards[index];
        if (!card) return;

        const color = this.state.colors[index];
        const contrast = this.getContrastColor(color);

        // 1. CSS Variables for the card itself
        card.style.setProperty('--card-color', color);
        card.style.setProperty('--card-text', contrast);

        // 2. Global CSS Variables (previews)
        this.dom.root.style.setProperty(`--c-${index + 1}`, color);
        this.dom.root.style.setProperty(`--text-c-${index + 1}`, contrast);

        // 3. Hex Input
        const hexInput = card.querySelector('.hex-input');
        if (hexInput && document.activeElement !== hexInput) {
            hexInput.value = color;
        }

        // 4. Lock Visuals
        const lockIcon = card.querySelector('[title="Lock Color"] span');
        if (lockIcon) {
            lockIcon.textContent = this.state.locked[index] ? 'lock' : 'lock_open';
        }
        card.classList.toggle('locked', this.state.locked[index]);
    }

    toggleLock(index) {
        this.state.locked[index] = !this.state.locked[index];
        this.updateSingleCardUI(index);
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
        this.dom.toast.className = 'toast-notification';
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

