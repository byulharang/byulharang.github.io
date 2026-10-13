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
    layer.style.transform = animate && index ? `translateY(${progress * 12}px)` : '';
    layer.style.opacity = '';
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

// Three sensory signals flow into a shared representation. The emphasis moves
// gently between inputs before highlighting their combination.
// The canvas is decorative; all content and navigation live in semantic HTML.
const canvas = document.getElementById('signal-canvas');
const context = canvas.getContext('2d');
let frame = 0;
let lastFrame = 0;
let elapsed = 0;
let canvasVisible = true;
let canvasWidth = 500;
let canvasHeight = 190;
let highlightedSignal = -1;
const signalLabels = [...document.querySelectorAll('.signal-label')];

function drawSignal(time) {
  if (!context) return;
  const scale = Math.min(canvasWidth / 500, canvasHeight / 190);
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.save();
  context.translate((canvasWidth - 500 * scale) / 2, (canvasHeight - 190 * scale) / 2);
  context.scale(scale, scale);

  const active = Math.floor(time / 3) % 4;
  if (active !== highlightedSignal) {
    highlightedSignal = active;
    signalLabels.forEach((label, i) => label.classList.toggle('is-active', active === i || active === 3));
  }
  const colors = [[167,138,190], [150,114,182], [181,140,171]];
  const origins = [40, 95, 150];
  // A faint sampling grid keeps the sketch connected to signal processing.
  context.fillStyle = '#ebe1f0';
  for (let x = 135; x <= 320; x += 20) {
    for (let y = 30; y <= 160; y += 20) {
      context.beginPath(); context.arc(x, y, .8, 0, Math.PI * 2); context.fill();
    }
  }
  function point(channel, u) {
    const ease = u * u * (3 - 2 * u);
    const envelope = Math.sin(Math.PI * u) * (1 - u * .65);
    const wave = channel === 0 ? Math.sin(u * 14 - time * 1.2) : channel === 1 ? Math.sin(u * 35 - time * 2.4) : Math.pow(Math.sin(u * 17 - time * 1.7), 5);
    return { x: 119 + u * 212, y: origins[channel] + (95 - origins[channel]) * ease + wave * envelope * (channel === 1 ? 19 : 13) };
  }
  colors.forEach((rgb, channel) => {
    const emphasis = active === channel || active === 3;
    context.strokeStyle = `rgba(${rgb.join(',')},${emphasis ? 1 : .67})`;
    context.lineWidth = emphasis ? 2.6 : 1.8;
    context.beginPath();
    for (let j = 0; j <= 100; j++) {
      const p = point(channel, j / 100);
      if (j) context.lineTo(p.x, p.y); else context.moveTo(p.x, p.y);
    }
    context.stroke();
    const p = point(channel, (time * .28 + channel * .27) % 1);
    context.fillStyle = `rgb(${rgb.join(',')})`;
    context.beginPath(); context.arc(p.x, p.y, emphasis ? 3.7 : 2.5, 0, Math.PI * 2); context.fill();
  });

  const glow = context.createRadialGradient(353, 95, 8, 353, 95, 44);
  glow.addColorStop(0, '#eadcf3'); glow.addColorStop(1, '#fffdfb00');
  context.fillStyle = glow;
  context.beginPath(); context.arc(353, 95, 44, 0, Math.PI * 2); context.fill();
  colors.forEach((rgb, i) => {
    context.strokeStyle = `rgba(${rgb.join(',')},${active === 3 ? .85 : .5})`;
    context.lineWidth = 1.7;
    context.beginPath();
    context.arc(353, 95, 29 + i * 4, time * .15 + i * 2.1, time * .15 + i * 2.1 + 1.55);
    context.stroke();
  });
  context.fillStyle = '#efe1f7'; context.strokeStyle = '#b297c5'; context.lineWidth = 1.4;
  context.beginPath(); context.arc(353, 95, 21, 0, Math.PI * 2); context.fill(); context.stroke();
  context.strokeStyle = '#9270a6'; context.lineWidth = 2; context.lineCap = 'round';
  context.beginPath(); context.moveTo(345, 95); context.lineTo(361, 95); context.moveTo(353, 87); context.lineTo(353, 103); context.stroke();
  context.restore();
}

function resizeCanvas() {
  if (!context) return;
  canvasWidth = canvas.clientWidth;
  canvasHeight = canvas.clientHeight;
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
