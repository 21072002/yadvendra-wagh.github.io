/**
 * MINIMALIST PORTFOLIO — INTERACTIVE BACKGROUND & LOGIC
 * Portfolio: Yadvendra Wagh
 */

document.addEventListener('DOMContentLoaded', () => {
  initInteractiveCanvas();
  initCursorAura();
  initCopyEmail();
  initFloatingProjectPreview();
});

/* ==========================================================================
   1. GENERATIVE INTERACTIVE CANVAS BACKGROUND
   Particles & Constellation Mesh reacting dynamically to mouse & touch
   ========================================================================== */
function initInteractiveCanvas() {
  const canvas = document.getElementById('interactive-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Mouse interaction state
  const mouse = {
    x: width / 2,
    y: height / 2,
    targetX: width / 2,
    targetY: height / 2,
    radius: 160,
    isActive: false
  };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.isActive = true;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.isActive = true;
    }
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.isActive = false;
  });

  // Responsive particle density
  const particleCount = Math.min(Math.floor((width * height) / 14000), 85);
  const particles = [];

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 1.8 + 0.8;
      this.baseAlpha = Math.random() * 0.45 + 0.2;
      this.alpha = this.baseAlpha;
      // Ember crimson or cool off-white
      this.isAccent = Math.random() < 0.25;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Wrap around edges seamlessly
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // Mouse repulsion / attraction
      if (mouse.isActive) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 1.2;
          this.x -= (dx / dist) * force * 2;
          this.y -= (dy / dist) * force * 2;
          this.alpha = Math.min(this.baseAlpha + 0.4, 0.9);
        } else {
          this.alpha += (this.baseAlpha - this.alpha) * 0.05;
        }
      } else {
        this.alpha += (this.baseAlpha - this.alpha) * 0.05;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      if (this.isAccent) {
        ctx.fillStyle = `rgba(255, 64, 69, ${this.alpha})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.75})`;
      }
      ctx.fill();
    }
  }

  // Populate particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Draw connecting constellation lines
  function drawLines() {
    const maxDist = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.14;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);

          if (particles[i].isAccent || particles[j].isAccent) {
            ctx.strokeStyle = `rgba(255, 64, 69, ${alpha * 1.3})`;
          } else {
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          }
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    drawLines();
    requestAnimationFrame(animate);
  }

  animate();

  // Resize listener
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
}

/* ==========================================================================
   2. SMOOTH CURSOR SPOTLIGHT AURA
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
    // Lerp inertia for smooth gliding
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    aura.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    requestAnimationFrame(renderAura);
  }

  renderAura();
}

/* ==========================================================================
   3. ONE-CLICK EMAIL COPY WITH TOAST
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
   4. FLOATING PROJECT IMAGE HOVER PREVIEW
   Smooth cursor-following thumbnail preview on hover
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
      currentX += (mouseX - currentX) * 0.15;
      currentY += (mouseY - currentY) * 0.15;
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
