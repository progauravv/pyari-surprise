/**
 * Pyari — Procedural Audio Synthesizer & Soundtrack Engine
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('pyari_sound_muted') === 'true';
    this.activeTimeouts = [];
    this.currentAudioElem = null;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) this.ctx = new AudioCtx();
  }

  stopAll() {
    this.activeTimeouts.forEach((t) => clearTimeout(t));
    this.activeTimeouts = [];
    if (this.currentAudioElem) {
      try {
        this.currentAudioElem.pause();
        this.currentAudioElem.currentTime = 0;
      } catch (e) {}
      this.currentAudioElem = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('pyari_sound_muted', this.isMuted.toString());
    if (this.isMuted) this.stopAll();
    return this.isMuted;
  }

  _canPlay() {
    if (this.isMuted) return false;
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return Boolean(this.ctx);
  }

  _schedule(fn, delay) {
    const t = setTimeout(fn, delay);
    this.activeTimeouts.push(t);
  }

  playPop() {
    if (!this._canPlay()) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  // 1. 🎂 FULL FUNNY / 8-BIT HAPPY BIRTHDAY MELODY
  playBirthdayFunny() {
    if (!this._canPlay()) return;
    this.stopAll();

    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88, C5 = 523.25;
    const melody = [
      { f: C4, d: 0.28 }, { f: C4, d: 0.14 }, { f: D4, d: 0.42 }, { f: C4, d: 0.42 }, { f: F4, d: 0.42 }, { f: E4, d: 0.75 },
      { f: C4, d: 0.28 }, { f: C4, d: 0.14 }, { f: D4, d: 0.42 }, { f: C4, d: 0.42 }, { f: G4, d: 0.42 }, { f: F4, d: 0.75 },
      { f: C4, d: 0.28 }, { f: C4, d: 0.14 }, { f: C5, d: 0.42 }, { f: A4, d: 0.42 }, { f: F4, d: 0.42 }, { f: E4, d: 0.42 }, { f: D4, d: 0.65 },
      { f: B4, d: 0.28 }, { f: B4, d: 0.14 }, { f: A4, d: 0.42 }, { f: F4, d: 0.42 }, { f: G4, d: 0.42 }, { f: F4, d: 0.9 }
    ];

    let offset = 0;
    melody.forEach((note) => {
      this._schedule(() => {
        if (!this._canPlay()) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const now = this.ctx.currentTime;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note.f, now);
          osc.frequency.setValueAtTime(note.f + (Math.random() * 4 - 2), now + 0.05);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + note.d);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + note.d + 0.02);
        } catch (e) {}
      }, offset * 1000);
      offset += note.d + 0.06;
    });
  }

  // 2. 🤡 CIRCUS CLOWN
  playBirthdayClown() {
    if (!this._canPlay()) return;
    this.stopAll();

    const notes = [440, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99];
    for (let i = 0; i < 14; i++) {
      this._schedule(() => {
        if (!this._canPlay()) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const now = this.ctx.currentTime;
          const freq = notes[i % notes.length];
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 0.1);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.15);
        } catch (e) {}
      }, i * 140);
    }
  }

  // 3. 🎺 SAD TROMBONE
  playSadTrombone() {
    if (!this._canPlay()) return;
    this.stopAll();

    const wahNotes = [
      { f: 233.08, d: 0.35 },
      { f: 220.00, d: 0.35 },
      { f: 207.65, d: 0.35 },
      { f: 196.00, d: 0.9, slide: 160.00 }
    ];

    let offset = 0;
    wahNotes.forEach((n) => {
      this._schedule(() => {
        if (!this._canPlay()) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const now = this.ctx.currentTime;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(n.f, now);

          if (n.slide) {
            osc.frequency.linearRampToValueAtTime(n.slide, now + n.d);
          }

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + n.d);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + n.d + 0.05);
        } catch (e) {}
      }, offset * 1000);
      offset += n.d + 0.08;
    });
  }

  // 4. 🎷 VICTORY FANFARE
  playCelebrationFanfare() {
    if (!this._canPlay()) return;
    this.stopAll();

    const fanfare = [
      { f: 523.25, d: 0.16 },
      { f: 659.25, d: 0.16 },
      { f: 783.99, d: 0.16 },
      { f: 1046.50, d: 0.45 },
      { f: 880.00, d: 0.2 },
      { f: 1046.50, d: 0.8 }
    ];

    let offset = 0;
    fanfare.forEach((n) => {
      this._schedule(() => {
        if (!this._canPlay()) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const now = this.ctx.currentTime;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.f, now);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + n.d);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + n.d + 0.05);
        } catch (e) {}
      }, offset * 1000);
      offset += n.d + 0.04;
    });
  }

  // 5. 🌹 ROMANTIC STRINGS
  playRomanticStrings() {
    if (!this._canPlay()) return;
    this.stopAll();

    const chords = [261.63, 329.63, 392.00, 493.88, 587.33];
    chords.forEach((freq) => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 3.1);
      } catch (e) {}
    });
  }

  // 6. 👾 RETRO ARCADE
  playRetroArcade() {
    if (!this._canPlay()) return;
    this.stopAll();

    const notes = [330, 392, 659, 523, 587, 784];
    notes.forEach((freq, idx) => {
      this._schedule(() => {
        if (!this._canPlay()) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const now = this.ctx.currentTime;
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.13);
        } catch (e) {}
      }, idx * 70);
    });
  }

  // Master Soundtrack Dispatcher with Developer URL Check
  playTheme(themeName) {
    if (!themeName || themeName === 'none' || this.isMuted) return;

    // Check if developer custom audioUrl is configured in window.SOUND_TRACKS
    if (window.SOUND_TRACKS) {
      const found = window.SOUND_TRACKS.find((t) => t.id === themeName);
      if (found && found.audioUrl && found.audioUrl.trim().length > 0) {
        this.stopAll();
        try {
          const audio = new Audio(found.audioUrl);
          audio.volume = 0.6;
          this.currentAudioElem = audio;
          audio.play().catch(() => this._playSynth(themeName));
          return;
        } catch (e) {
          // fallback to synth
        }
      }
    }

    this._playSynth(themeName);
  }

  _playSynth(themeName) {
    switch (themeName) {
      case 'birthday_funny':
        this.playBirthdayFunny();
        break;
      case 'birthday_clown':
        this.playBirthdayClown();
        break;
      case 'sad_trombone':
        this.playSadTrombone();
        break;
      case 'celebration_fanfare':
        this.playCelebrationFanfare();
        break;
      case 'romantic_strings':
        this.playRomanticStrings();
        break;
      case 'retro_arcade':
        this.playRetroArcade();
        break;
      default:
        this.playCelebrationFanfare();
        break;
    }
  }
}

window.soundEngine = new SoundEngine();