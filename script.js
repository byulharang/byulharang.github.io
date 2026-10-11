'use strict';

document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileNavigation = window.matchMedia('(max-width: 680px)');
const header = document.querySelector('.site-header');
const navigation = document.getElementById('primary-nav');
const menuButton = document.querySelector('.menu-toggle');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('span').textContent = '+';
  navigation.hidden = mobileNavigation.matches;
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.querySelector('span').textContent = open ? '−' : '+';
  navigation.hidden = !open;
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', (event) => {
  if (mobileNavigation.matches && !header.contains(event.target)) closeMenu();
});
mobileNavigation.addEventListener('change', closeMenu);
closeMenu();

// Content is readable without JavaScript. Only animate elements below the fold.
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('[data-reveal]').forEach((element) => {
    if (!reducedMotion.matches && element.getBoundingClientRect().top > window.innerHeight - 30) {
      element.classList.add('will-reveal');
      revealObserver.observe(element);
    }
  });

  const navigationLinks = [...navigation.querySelectorAll('a[href^="#"]')];
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navigationLinks.forEach((link) => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    });
  }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
  navigationLinks.forEach((link) => {
    const section = document.querySelector(link.hash);
    if (section) activeObserver.observe(section);
  });
}

document.querySelectorAll('[data-citation]').forEach((button) => {
  const citation = document.getElementById(button.dataset.citation);
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', citation.id);
  button.addEventListener('click', () => {
    citation.hidden = !citation.hidden;
    button.setAttribute('aria-expanded', String(!citation.hidden));
    button.querySelector('span').textContent = citation.hidden ? '＋' : '−';
  });
});
document.getElementById('copyright-year').textContent = new Date().getFullYear();

const hero = document.querySelector('.hero');
const heroLayers = document.querySelectorAll('[data-hero-layer]');
const motionButton = document.getElementById('motion-toggle');
let motionPaused = false;
let scrollRequested = false;

function updateScroll() {
  header.classList.toggle('scrolled', window.scrollY > 12);
  const progress = Math.min(1, window.scrollY / Math.max(hero.offsetHeight, 1));
  heroLayers.forEach((layer, index) => {
    const animate = !reducedMotion.matches && !motionPaused;
    layer.style.transform = animate ? `translateY(${progress * (index ? 65 : 28)}px)` : '';
    layer.style.opacity = animate ? String(Math.max(0.12, 1 - progress * 1.05)) : '';
  });
  if (window.scrollY < 100) navigation.querySelectorAll('[aria-current]').forEach((link) => link.removeAttribute('aria-current'));
  scrollRequested = false;
}
window.addEventListener('scroll', () => {
  if (!scrollRequested) {
    scrollRequested = true;
    requestAnimationFrame(updateScroll);
  }
}, { passive: true });
updateScroll();

// A procedural signal sculpture: independent rings form one shared space.
// The canvas is decorative; all content and navigation live in semantic HTML.
const canvas = document.getElementById('signal-canvas');
const context = canvas.getContext('2d');
let frame = 0;
let lastFrame = 0;
let elapsed = 0;
let canvasVisible = true;
let canvasWidth = 500;
let canvasHeight = 455;

function project(x, y, z, time) {
  const yaw = -.4 + time * .11;
  const pitch = .82 + Math.sin(time * .15) * .08;
  const rx = x * Math.cos(yaw) - z * Math.sin(yaw);
  const rz = x * Math.sin(yaw) + z * Math.cos(yaw);
  const ry = y * Math.cos(pitch) - rz * Math.sin(pitch);
  const depth = y * Math.sin(pitch) + rz * Math.cos(pitch);
  const perspective = 560 / (560 + depth);
  return { x: rx * perspective, y: ry * perspective, depth };
}

function drawSignal(time) {
  if (!context) return;
  const scale = Math.min(canvasWidth / 500, canvasHeight / 430);
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.save();
  context.translate(canvasWidth / 2, canvasHeight / 2);
  context.scale(scale, scale);

  // Light coordinate axes behind the ring structure.
  context.lineWidth = .6;
  context.strokeStyle = '#cdd4c3';
  context.setLineDash([3, 6]);
  [[-204, 78, 205, -78], [-155, -120, 155, 120], [0, -176, 0, 178]].forEach((axis) => {
    context.beginPath(); context.moveTo(axis[0], axis[1]); context.lineTo(axis[2], axis[3]); context.stroke();
  });
  context.setLineDash([]);

  const curves = [];
  for (let ring = 0; ring < 36; ring++) {
    const u = ring / 36 * Math.PI * 2;
    const points = [];
    let averageDepth = 0;
    for (let step = 0; step <= 80; step++) {
      const v = step / 80 * Math.PI * 2;
      const tube = 50 + Math.sin(u * 3 + time * .3) * 7;
      const radius = 111 + tube * Math.cos(v);
      const p = project(radius * Math.cos(u), tube * Math.sin(v), radius * Math.sin(u), time);
      points.push(p);
      averageDepth += p.depth;
    }
    curves.push({ points, depth: averageDepth / points.length, ring });
  }
  curves.sort((a, b) => b.depth - a.depth);
  curves.forEach(({ points, depth, ring }) => {
    const alpha = .25 + (1 - (depth + 170) / 340) * .55;
    context.strokeStyle = ring % 9 === 0 ? `rgba(105,145,48,${alpha})` : `rgba(47,67,47,${alpha})`;
    context.lineWidth = ring % 9 === 0 ? 1.3 : .7;
    context.beginPath();
    points.forEach((p, index) => index ? context.lineTo(p.x, p.y) : context.moveTo(p.x, p.y));
    context.stroke();
    if (ring % 3 === 0) {
      for (let j = 0; j < points.length; j += 8) {
        context.fillStyle = `rgba(54,74,45,${alpha})`;
        context.beginPath(); context.arc(points[j].x, points[j].y, 1.2, 0, Math.PI * 2); context.fill();
      }
    }
  });

  const center = project(0, 0, 0, time);
  const glow = context.createRadialGradient(center.x - 7, center.y - 8, 0, center.x, center.y, 29);
  glow.addColorStop(0, '#edffb2'); glow.addColorStop(.7, '#d5f86a'); glow.addColorStop(1, '#bed856');
  context.fillStyle = glow;
  context.beginPath(); context.arc(center.x, center.y, 27, 0, Math.PI * 2); context.fill();
  const satellite = project(Math.cos(time * .23 + .8) * 170, 28, Math.sin(time * .23 + .8) * 170, time);
  context.strokeStyle = 'rgba(180,125,72,.35)'; context.lineWidth = .7;
  context.beginPath(); context.moveTo(center.x, center.y); context.lineTo(satellite.x, satellite.y); context.stroke();
  context.fillStyle = '#e49158'; context.beginPath(); context.arc(satellite.x, satellite.y, 5, 0, Math.PI * 2); context.fill();
  context.strokeStyle = '#e4915850'; context.beginPath(); context.arc(satellite.x, satellite.y, 11, 0, Math.PI * 2); context.stroke();
  context.restore();
}

function resizeCanvas() {
  if (!context) return;
  const bounds = canvas.getBoundingClientRect();
  canvasWidth = bounds.width;
  canvasHeight = bounds.height;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(canvasWidth * pixelRatio);
  canvas.height = Math.round(canvasHeight * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  drawSignal(elapsed);
}
function canAnimate() {
  return context && canvasVisible && !document.hidden && !reducedMotion.matches && !motionPaused;
}
function animate(now) {
  frame = 0;
  if (!canAnimate()) return;
  if (now - lastFrame >= 1000 / 30) {
    elapsed += Math.min((now - lastFrame) / 1000, .05);
    lastFrame = now;
    drawSignal(elapsed);
  }
  frame = requestAnimationFrame(animate);
}
function syncAnimation() {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  lastFrame = performance.now();
  motionButton.disabled = reducedMotion.matches;
  motionButton.setAttribute('aria-pressed', String(motionPaused || reducedMotion.matches));
  motionButton.textContent = reducedMotion.matches ? 'Motion off' : motionPaused ? 'Play motion ▷' : 'Pause motion Ⅱ';
  if (canAnimate()) frame = requestAnimationFrame(animate);
  else drawSignal(elapsed);
  updateScroll();
}
motionButton.addEventListener('click', () => { motionPaused = !motionPaused; syncAnimation(); });
reducedMotion.addEventListener('change', syncAnimation);
document.addEventListener('visibilitychange', syncAnimation);
if (context) {
  canvas.parentElement.classList.add('canvas-ready');
  if ('ResizeObserver' in window) new ResizeObserver(resizeCanvas).observe(canvas);
  else window.addEventListener('resize', resizeCanvas);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { canvasVisible = entry.isIntersecting; syncAnimation(); }, { threshold: 0 }).observe(canvas);
  }
  resizeCanvas();
  syncAnimation();
}
