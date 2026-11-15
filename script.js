/**
 * LIQUID GLASS PORTFOLIO — INTERACTIVE FLUID ENGINE & DYNAMICS
 * Portfolio: Yadvendra Wagh — Data Engineer
 * Features:
 *   1. Real-time Interactive Liquid Canvas (Fluid Ripples, Metaballs & Caustics)
 *   2. Interactive Liquid Theme Switcher (Cyan, Amethyst, Mercury, Emerald)
 *   3. 3D Glass Tilt & Specular Light Tracker on Glass Cards
 *   4. Smooth Cursor Aura with Fluid Inertia
 *   5. Floating Glass Thumbnail Hover Preview
 *   6. One-Click Email Copy with Toast
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvasEngine = initInteractiveLiquidCanvas();
  initThemeSelector(canvasEngine);
  initGlassCards();
  initCursorAura();
  initCopyEmail();
  initFloatingProjectPreview();
});

/* ==========================================================================
   1. REAL-TIME INTERACTIVE LIQUID CANVAS (Physics, Ripples & Organic Blobs)
   ========================================================================== */
function initInteractiveLiquidCanvas() {
  const canvas = document.getElementById('interactive-canvas');
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
  }

  resize();
  window.addEventListener('resize', resize);

  // Theme Color Configurations
  const themes = {
    cyan: {
      primary: [0, 240, 255],     // Electric Cyan
      secondary: [99, 102, 241],   // Indigo
      tertiary: [6, 182, 212],    // Ocean Aqua
      specular: [255, 255, 255],
      particleAlpha: 0.65
    },
    amethyst: {
      primary: [192, 132, 252],   // Neon Violet
      secondary: [236, 72, 153],  // Magenta
      tertiary: [99, 102, 241],   // Royal Blue
      specular: [255, 255, 255],
      particleAlpha: 0.7
    },
    mercury: {
      primary: [226, 232, 240],   // Platinum Silver
      secondary: [147, 197, 253], // Ice Blue
      tertiary: [203, 213, 225],  // Steel
      specular: [255, 255, 255],
      particleAlpha: 0.55
    },
    emerald: {
      primary: [52, 211, 153],    // Cyber Jade
      secondary: [45, 212, 191],  // Teal
      tertiary: [16, 185, 129],   // Deep Emerald
      specular: [255, 255, 255],
      particleAlpha: 0.65
    }
  };

  let currentThemeName = document.documentElement.getAttribute('data-liquid-theme') || 'cyan';
  let targetPalette = themes[currentThemeName] || themes.cyan;
  let activePalette = {
    primary: [...targetPalette.primary],
    secondary: [...targetPalette.secondary],
    tertiary: [...targetPalette.tertiary],
    particleAlpha: targetPalette.particleAlpha
  };

  // Mouse & Touch Tracking
  const pointer = {
    x: width / 2,
    y: height / 2,
    prevX: width / 2,
    prevY: height / 2,
    vx: 0,
    vy: 0,
    isActive: false,
    radius: 180
  };

  window.addEventListener('mousemove', (e) => {
    pointer.prevX = pointer.x;
    pointer.prevY = pointer.y;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.vx = pointer.x - pointer.prevX;
    pointer.vy = pointer.y - pointer.prevY;
    pointer.isActive = true;

    // Small trail ripple if moving quickly
    const speed = Math.sqrt(pointer.vx * pointer.vx + pointer.vy * pointer.vy);
    if (speed > 14 && Math.random() < 0.25) {
      createRipple(pointer.x, pointer.y, Math.min(speed * 0.8, 22), 0.35);
    }
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      pointer.x = e.touches[0].clientX;
      pointer.y = e.touches[0].clientY;
      pointer.isActive = true;
    }
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    pointer.isActive = false;
  });

  // Liquid Ripple Shockwaves
  const ripples = [];

  function createRipple(x, y, maxRadius = 140, strength = 0.85) {
    ripples.push({
      x,
      y,
      radius: 5,
      maxRadius: Math.max(maxRadius, 120),
      speed: 3.2 + Math.random() * 1.5,
      alpha: strength,
      decay: 0.016,
      lineWidth: 2.2
    });
    if (ripples.length > 15) ripples.shift();
  }

  // Click anywhere to spawn expanding liquid wave & splash droplets
  window.addEventListener('pointerdown', (e) => {
    createRipple(e.clientX, e.clientY, 190, 0.95);

    // Micro splash burst
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1.5;
      particles.push(new LiquidDroplet(e.clientX, e.clientY, Math.cos(angle) * speed, Math.sin(angle) * speed, true));
    }
  });

  // Fluid Organic Blobs (Morphing liquid light caustics)
  class LiquidBlob {
    constructor(colorKey, baseRadius, speedMult, phase) {
      this.colorKey = colorKey;
      this.baseRadius = baseRadius;
      this.speedMult = speedMult;
      this.phase = phase;
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
    }

    update(time) {
      this.x += this.vx * this.speedMult;
      this.y += this.vy * this.speedMult;

      // Soft bounce inside bounds
      if (this.x < -100) this.x = width + 100;
      if (this.x > width + 100) this.x = -100;
      if (this.y < -100) this.y = height + 100;
      if (this.y > height + 100) this.y = -100;

      // Gentle attraction towards cursor if active
      if (pointer.isActive) {
        const dx = pointer.x - this.x;
        const dy = pointer.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 450 && dist > 20) {
          this.x += (dx / dist) * 0.4;
          this.y += (dy / dist) * 0.4;
        }
      }

      this.currentRadius = this.baseRadius + Math.sin(time * 0.0015 * this.speedMult + this.phase) * 35;
    }

    draw() {
      const rgb = activePalette[this.colorKey] || activePalette.primary;
      const grad = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.currentRadius
      );
      grad.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.28)`);
      grad.addColorStop(0.5, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.12)`);
      grad.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const blobs = [
    new LiquidBlob('primary', Math.min(width * 0.35, 360), 0.7, 0),
    new LiquidBlob('secondary', Math.min(width * 0.3, 310), 0.9, 2),
    new LiquidBlob('tertiary', Math.min(width * 0.38, 400), 0.6, 4),
    new LiquidBlob('primary', Math.min(width * 0.25, 260), 0.8, 1)
  ];

  // Suspended Bioluminescent Droplets
  class LiquidDroplet {
    constructor(x, y, vx, vy, isSplash = false) {
      this.isSplash = isSplash;
      this.reset(x, y, vx, vy);
    }

    reset(x, y, vx, vy) {
      this.x = x !== undefined ? x : Math.random() * width;
      this.y = y !== undefined ? y : Math.random() * height;
      this.vx = vx !== undefined ? vx : (Math.random() - 0.5) * 0.45;
      this.vy = vy !== undefined ? vy : (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 2 + 0.8;
      this.baseAlpha = Math.random() * 0.45 + 0.2;
      this.alpha = this.baseAlpha;
      this.isSpecular = Math.random() < 0.3;
      this.life = this.isSplash ? 40 : 1;
    }

    update() {
      if (this.isSplash) {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.92;
        this.vy *= 0.92;
        this.alpha -= 0.025;
        return;
      }

      this.x += this.vx;
      this.y += this.vy;

      // Wrap edges
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // React to pointer
      if (pointer.isActive) {
        const dx = pointer.x - this.x;
        const dy = pointer.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < pointer.radius) {
          const force = (1 - dist / pointer.radius) * 1.5;
          // Fluid swirl vortex
          this.x -= (dx / dist) * force * 2.2 - (dy / dist) * 0.6;
          this.y -= (dy / dist) * force * 2.2 + (dx / dist) * 0.6;
          this.alpha = Math.min(this.baseAlpha + 0.45, 0.95);
        } else {
          this.alpha += (this.baseAlpha - this.alpha) * 0.05;
        }
      } else {
        this.alpha += (this.baseAlpha - this.alpha) * 0.05;
      }

      // Displaced by ripples
      for (let i = 0; i < ripples.length; i++) {
        const rip = ripples[i];
        const rdx = this.x - rip.x;
        const rdy = this.y - rip.y;
        const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
        if (Math.abs(rdist - rip.radius) < 20) {
          const push = rip.alpha * 1.6;
          this.x += (rdx / rdist) * push;
          this.y += (rdy / rdist) * push;
          this.alpha = Math.min(this.alpha + 0.3, 1);
        }
      }
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

      const rgb = this.isSpecular ? [255, 255, 255] : activePalette.primary;
      ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${this.alpha * activePalette.particleAlpha})`;
      ctx.fill();
    }
  }

  const dropletCount = Math.min(Math.floor((width * height) / 13000), 80);
  const particles = [];
  for (let i = 0; i < dropletCount; i++) {
    particles.push(new LiquidDroplet());
  }

  // Draw Dynamic Caustic Mesh Filaments
  function drawCausticFilaments() {
    const maxDist = 105;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        if (p1.isSplash || p2.isSplash) continue;

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.16 * activePalette.particleAlpha;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);

          const rgb = (p1.isSpecular || p2.isSpecular) ? [255, 255, 255] : activePalette.primary;
          ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  // Draw Ripples
  function drawRipples() {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.radius += rip.speed;
      rip.alpha -= rip.decay;

      if (rip.alpha <= 0 || rip.radius > rip.maxRadius) {
        ripples.splice(i, 1);
        continue;
      }

      // Outer refraction crest
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${rip.alpha * 0.7})`;
      ctx.lineWidth = rip.lineWidth;
      ctx.stroke();

      // Inner chromatic halo
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, Math.max(rip.radius - 4, 1), 0, Math.PI * 2);
      const pr = activePalette.primary;
      ctx.strokeStyle = `rgba(${pr[0]}, ${pr[1]}, ${pr[2]}, ${rip.alpha * 0.45})`;
      ctx.lineWidth = rip.lineWidth * 1.5;
      ctx.stroke();
    }
  }

  // Palette Lerp for silky smooth theme switching
  function updatePaletteTransition() {
    for (let key of ['primary', 'secondary', 'tertiary']) {
      for (let c = 0; c < 3; c++) {
        activePalette[key][c] += (targetPalette[key][c] - activePalette[key][c]) * 0.08;
      }
    }
    activePalette.particleAlpha += (targetPalette.particleAlpha - activePalette.particleAlpha) * 0.08;
  }

  // Master Render Loop
  let lastTime = 0;
  function render(time) {
    updatePaletteTransition();

    ctx.clearRect(0, 0, width, height);

    // 1. Organic Liquid Blobs
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < blobs.length; i++) {
      blobs[i].update(time);
      blobs[i].draw();
    }

    // 2. Suspended Micro-Droplets & Filaments
    ctx.globalCompositeOperation = 'lighter';
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();
      if (p.isSplash && p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    drawCausticFilaments();

    // 3. Expanding Liquid Waves
    drawRipples();

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  return {
    setTheme(themeName) {
      if (themes[themeName]) {
        targetPalette = themes[themeName];
      }
    },
    spawnSplash(x, y) {
      createRipple(x, y, 220, 1.0);
    }
  };
}

/* ==========================================================================
   2. INTERACTIVE THEME SELECTOR CONTROLLER
   ========================================================================== */
function initThemeSelector(canvasEngine) {
  const themeButtons = document.querySelectorAll('.theme-pill-btn');
  if (themeButtons.length === 0) return;

  const savedTheme = localStorage.getItem('portfolio-liquid-theme') || 'cyan';
  applyTheme(savedTheme, false);

  themeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const selectedTheme = btn.getAttribute('data-theme');
      if (selectedTheme) {
        applyTheme(selectedTheme, true);
        if (canvasEngine) {
          const rect = btn.getBoundingClientRect();
          canvasEngine.spawnSplash(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      }
    });
  });

  function applyTheme(themeName, animate = true) {
    document.documentElement.setAttribute('data-liquid-theme', themeName);
    localStorage.setItem('portfolio-liquid-theme', themeName);

    themeButtons.forEach(btn => {
      if (btn.getAttribute('data-theme') === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (canvasEngine) {
      canvasEngine.setTheme(themeName);
    }
  }
}

/* ==========================================================================
   3. 3D GLASS TILT & SPECULAR LIGHT TRACKING ON CARDS
   ========================================================================== */
function initGlassCards() {
  const glassCards = document.querySelectorAll('.hero-frame, .experience-card, .cert-card, .portrait-frame-card, .contact-card');
  if (glassCards.length === 0) return;

  // Only enable 3D tilt on devices with hover capability
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  glassCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update specular highlight position
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      if (!isTouch && !card.classList.contains('no-tilt')) {
        const normX = (x / rect.width) - 0.5;
        const normY = (y / rect.height) - 0.5;
        const tiltX = (normY * -5).toFixed(2);
        const tiltY = (normX * 5).toFixed(2);

        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-2px)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--mouse-x', `-500px`);
      card.style.setProperty('--mouse-y', `-500px`);
      card.style.transform = '';
    });
  });
}

/* ==========================================================================
   4. SMOOTH CURSOR AURA GLOW
   ========================================================================== */
function initCursorAura() {
  const aura = document.querySelector('.cursor-aura');
  if (!aura) return;

  let currentX = window.innerWidth / 2;
  let currentY = window.innerHeight / 2;
  let targetX = currentX;
  let targetY = currentY;

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  function renderAura() {
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    aura.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    requestAnimationFrame(renderAura);
  }

  renderAura();
}

/* ==========================================================================
   5. ONE-CLICK EMAIL COPY WITH TOAST
   ========================================================================== */
function initCopyEmail() {
  const copyBtns = document.querySelectorAll('[data-copy-email]');
  const toast = document.getElementById('copyToast');
  let timeoutId = null;

  copyBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = btn.getAttribute('data-copy-email') || 'yad.wagh21@gmail.com';

      try {
        await navigator.clipboard.writeText(email);
        showToast(`Copied ${email} to clipboard!`);
      } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(`Copied ${email} to clipboard!`);
      }
    });
  });

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
}

/* ==========================================================================
   6. FLOATING LIQUID GLASS PROJECT HOVER PREVIEW
   ========================================================================== */
function initFloatingProjectPreview() {
  const preview = document.getElementById('floatingPreview');
  const previewImg = document.getElementById('previewImg');
  const projectRows = document.querySelectorAll('.project-row[data-preview]');
  if (!preview || !previewImg || projectRows.length === 0) return;

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  let isHovering = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX + 24;
    mouseY = e.clientY - 90;
    if (mouseX + 340 > window.innerWidth) {
      mouseX = e.clientX - 344;
    }
    if (mouseY + 220 > window.innerHeight) {
      mouseY = window.innerHeight - 230;
    }
  });

  function renderPreview() {
    if (isHovering) {
      currentX += (mouseX - currentX) * 0.16;
      currentY += (mouseY - currentY) * 0.16;
      preview.style.setProperty('--x', `${currentX}px`);
      preview.style.setProperty('--y', `${currentY}px`);
    }
    requestAnimationFrame(renderPreview);
  }

  renderPreview();

  projectRows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      const src = row.getAttribute('data-preview');
      if (src) {
        previewImg.src = src;
        isHovering = true;
        preview.classList.add('active');
      }
    });

    row.addEventListener('mouseleave', () => {
      isHovering = false;
      preview.classList.remove('active');
    });
  });
}
