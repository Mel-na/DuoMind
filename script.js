class TypingEcosystem {
    constructor() {
        this.input = document.getElementById('codeInput');
        this.ecosystem = document.getElementById('ecosystem');
        this.creatures = [];
        this.soundEnabled = true;
        this.audio = null;
        
        this.stats = {
            keyCount: 0,
            errorCount: 0,
            capsCount: 0,
            startTime: Date.now(),
            intervals: []
        };
        
        this.creatureTypes = {
            fast: { emoji: '🔥', name: 'Fire Spirit' },
            slow: { emoji: '🌊', name: 'Water Drop' },
            error: { emoji: '⚡', name: 'Storm Cloud' },
            caps: { emoji: '👑', name: 'Thunder King' },
            normal: { emoji: '🌱', name: 'Forest Sprite' }
        };
        
        this.init();
    }
    
    init() {
        this.setupAudio();
        this.input.addEventListener('input', () => this.onType());
        this.input.addEventListener('keydown', (e) => this.onKeyDown(e));
        setInterval(() => this.updateCreatures(), 2000);
    }
    
    setupAudio() {
        try {
            this.audio = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.soundEnabled = false;
        }
    }
    
    playSound(freq = 440, duration = 100) {
        if (!this.soundEnabled || !this.audio) return;
        
        const osc = this.audio.createOscillator();
        const gain = this.audio.createGain();
        
        osc.connect(gain);
        gain.connect(this.audio.destination);
        
        osc.frequency.value = freq;
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0.1, this.audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audio.currentTime + duration/1000);
        
        osc.start();
        osc.stop(this.audio.currentTime + duration/1000);
    }
    
    onKeyDown(e) {
        const now = Date.now();
        
        if (this.stats.intervals.length > 0) {
            const interval = now - this.stats.intervals[this.stats.intervals.length - 1];
            this.stats.intervals.push(now);
            if (this.stats.intervals.length > 10) {
                this.stats.intervals.shift();
            }
        } else {
            this.stats.intervals.push(now);
        }
        
        this.stats.keyCount++;
        
        if (e.key === 'Backspace') {
            this.stats.errorCount++;
        }
        
        if (e.key.length === 1 && e.key === e.key.toUpperCase() && /[A-Z]/.test(e.key)) {
            this.stats.capsCount++;
        }
    }
    
    onType() {
        this.updateStats();
        const pattern = this.getPattern();
        
        if (this.stats.keyCount % 5 === 0) {
            this.createCreature(pattern);
        }
    }
    
    getPattern() {
        if (this.stats.keyCount < 5) return 'normal';
        
        const timeElapsed = (Date.now() - this.stats.startTime) / 60000;
        const wpm = timeElapsed > 0 ? (this.stats.keyCount / 5) / timeElapsed : 0;
        const errorRate = (this.stats.errorCount / this.stats.keyCount) * 100;
        const capsRate = (this.stats.capsCount / this.stats.keyCount) * 100;
        
        if (capsRate > 20) return 'caps';
        if (errorRate > 10) return 'error';
        if (wpm > 60) return 'fast';
        if (wpm < 20 && this.stats.keyCount > 20) return 'slow';
        return 'normal';
    }
    
    updateStats() {
        const timeElapsed = (Date.now() - this.stats.startTime) / 60000;
        const wpm = timeElapsed > 0 ? Math.round((this.stats.keyCount / 5) / timeElapsed) : 0;
        const errorRate = this.stats.keyCount > 0 ? Math.round((this.stats.errorCount / this.stats.keyCount) * 100) : 0;
        const capsRate = this.stats.keyCount > 0 ? Math.round((this.stats.capsCount / this.stats.keyCount) * 100) : 0;
        const pattern = this.getPattern();
        
        document.getElementById('speed').textContent = wpm + ' WPM';
        document.getElementById('errors').textContent = errorRate + '%';
        document.getElementById('caps').textContent = capsRate + '%';
        document.getElementById('population').textContent = this.creatures.length;
        document.getElementById('pattern').textContent = this.creatureTypes[pattern].name;
    }
    
    createCreature(type) {
        const creature = document.createElement('div');
        creature.className = `creature ${type}-typer`;
        
        if (Math.random() < 0.3) {
            creature.className += ' roblox-style';
        }
        
        creature.innerHTML = this.creatureTypes[type].emoji;
        creature.title = this.creatureTypes[type].name;
        
        const x = Math.random() * (this.ecosystem.clientWidth - 60) + 30;
        const y = Math.random() * (this.ecosystem.clientHeight - 60) + 30;
        
        creature.style.left = x + 'px';
        creature.style.top = y + 'px';
        
        creature.addEventListener('click', () => this.killCreature(creature));
        
        this.ecosystem.appendChild(creature);
        this.creatures.push(creature);
        
        this.createExplosion(x, y);
        this.playSound(200 + Math.random() * 600, 150);
        
        // Resume audio context on first interaction
        if (this.audio && this.audio.state === 'suspended') {
            this.audio.resume();
        }
    }
    
    createExplosion(x, y) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = (x - 40) + 'px';
        explosion.style.top = (y - 40) + 'px';
        
        this.ecosystem.appendChild(explosion);
        
        setTimeout(() => {
            if (explosion.parentNode) {
                explosion.parentNode.removeChild(explosion);
            }
        }, 800);
    }
    
    killCreature(creature) {
        const rect = creature.getBoundingClientRect();
        const ecoRect = this.ecosystem.getBoundingClientRect();
        
        this.createExplosion(
            rect.left - ecoRect.left + 25,
            rect.top - ecoRect.top + 25
        );
        
        this.playSound(800, 100);
        
        setTimeout(() => {
            if (creature.parentNode) {
                creature.parentNode.removeChild(creature);
                this.creatures = this.creatures.filter(c => c !== creature);
                this.updateStats();
            }
        }, 200);
    }
    
    updateCreatures() {
        this.creatures.forEach(creature => {
            if (Math.random() < 0.3) {
                const x = Math.random() * (this.ecosystem.clientWidth - 60) + 30;
                const y = Math.random() * (this.ecosystem.clientHeight - 60) + 30;
                creature.style.left = x + 'px';
                creature.style.top = y + 'px';
            }
        });
        
        if (Math.random() < 0.1 && this.creatures.length > 0) {
            this.playSound(300 + Math.random() * 200, 50);
        }
    }
}

function clearAll() {
    const app = window.ecosystem;
    app.creatures.forEach(creature => {
        if (creature.parentNode) {
            creature.parentNode.removeChild(creature);
        }
    });
    app.creatures = [];
    app.stats = {
        keyCount: 0,
        errorCount: 0,
        capsCount: 0,
        startTime: Date.now(),
        intervals: []
    };
    app.updateStats();
    app.playSound(150, 200);
}

function toggleSound() {
    const app = window.ecosystem;
    app.soundEnabled = !app.soundEnabled;
    document.getElementById('soundBtn').textContent = app.soundEnabled ? '🔊' : '🔇';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.ecosystem = new TypingEcosystem();
});