/**
 * Pyari — 60fps Canvas Confetti & Balloon Physics
 */
class ConfettiEngine {
  constructor(canvasId = 'confetti-canvas') {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.balloons = [];
    this.animationId = null;
    this.colors = ['#FF3E00', '#FFC857', '#FFFFFF', '#FF6FA5', '#8C5CFF'];
    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    if (this.ctx) this.ctx.scale(dpr, dpr);
  }

  burst(count = 70, originX = null, originY = null) {
    if (!this.canvas || !this.ctx) return;
    const x = originX !== null ? originX : this.width / 2;
    const y = originY !== null ? originY : this.height * 0.45;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 10;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: 5 + Math.random() * 6,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.22,
        drag: 0.985,
        opacity: 1,
        life: 0,
        maxLife: 100 + Math.random() * 60
      });
    }
    if (!this.animationId) this.animate();
  }

  grandFinaleBurst() {
    this.burst(80, this.width / 2, this.height * 0.5);
    setTimeout(() => this.burst(50, this.width * 0.2, this.height * 0.6), 250);
    setTimeout(() => this.burst(50, this.width * 0.8, this.height * 0.6), 500);
  }

  animate() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      if (p.life > p.maxLife * 0.75) {
        p.opacity = Math.max(0, 1 - (p.life - p.maxLife * 0.75) / (p.maxLife * 0.25));
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
      this.ctx.restore();

      if (p.life >= p.maxLife || p.y > this.height + 50) this.particles.splice(i, 1);
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }
}

window.ConfettiEngine = ConfettiEngine;