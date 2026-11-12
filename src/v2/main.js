import { startMark } from './mark.js';

// The motion setting on this laptop asks for less motion; the mark keeps moving, just slower.
const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
const hero = document.querySelector('.hero');
if (!startMark(document.getElementById('mark'), { reduced })) hero.classList.add('no-gl');

// ---------- Offset Interference: horizontal lines displaced where a slanted red line cuts through ----------
const VARIANTS = {
  light: { bg: null, line: 'rgba(44,20,18,.55)', accent: 'rgba(228,33,20,.75)', slash: '#E42114', n: 38 },
  blue: { bg: '#1A18FF', line: 'rgba(221,228,255,.42)', accent: 'rgba(255,94,85,.9)', slash: '#FF5E55', n: 30 },
  dark: { bg: null, line: 'rgba(124,141,255,.28)', accent: 'rgba(255,94,85,.42)', slash: null, n: 46 },
};
const pointer = { x: .5, y: .5 };
addEventListener('pointermove', e => { pointer.x = e.clientX / innerWidth; pointer.y = e.clientY / innerHeight; }, { passive: true });

function interference(canvas) {
  const v = VARIANTS[canvas.dataset.variant] || VARIANTS.light, ctx = canvas.getContext('2d');
  let w = 0, h = 0, on = false, slant = .14, pos = .55, amp = 1;
  new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(canvas);
  const draw = (t) => {
    const dpr = Math.min(devicePixelRatio, 2), W = canvas.clientWidth, H = canvas.clientHeight;
    if (W !== w || H !== h) { w = W; h = H; canvas.width = W * dpr; canvas.height = H * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    if (v.bg) { ctx.fillStyle = v.bg; ctx.fillRect(0, 0, w, h); }
    // The slash eases toward the pointer; the bend breathes slowly.
    const r = canvas.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (pointer.x * innerWidth - r.left) / r.width));
    pos += ((.35 + px * .35) - pos) * .04;
    slant += ((.08 + (pointer.y - .5) * .16) - slant) * .03;
    amp = .85 + Math.sin(t * .0009) * .25;
    const gap = h / (v.n + 1), A = gap * 2.2 * amp, L = Math.max(40, w * .09);
    const sx = y => w * pos + (y - h / 2) * slant;
    for (let i = 1; i <= v.n; i++) {
      const y0 = i * gap, s = sx(y0);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const dx = x - s;
        const g = (u) => Math.exp(-u * u);
        const d = !v.slash ? A * 1.5 * (dx / L) * g(dx / (L * 1.3)) : dx < 0 ? -A * g(dx / L) * .9 : A * g((dx - L * .7) / L) - A * .35 * g(dx / (L * .25));
        x === 0 ? ctx.moveTo(x, y0 + d) : ctx.lineTo(x, y0 + d);
      }
      const red = i % 4 === 1;
      ctx.strokeStyle = red ? v.accent : v.line; ctx.lineWidth = red ? 1.1 : .8; ctx.stroke();
    }
    if (v.slash) { ctx.beginPath(); ctx.moveTo(sx(-10), -10); ctx.lineTo(sx(h + 10), h + 10);
    ctx.strokeStyle = v.slash; ctx.lineWidth = 3; ctx.stroke(); }
  };
  const loop = (t) => { requestAnimationFrame(loop); if (on) draw(t); };
  requestAnimationFrame(loop);
}
document.querySelectorAll('canvas.interference').forEach(interference);

// ---------- Pixel fields: the sea breaking into pixels; a sparse rising field in a bento cell ----------
const SWATCH = ['#DDE4FF', '#7C8DFF', '#2D36FF', '#1A18FF', '#C7D0FF', '#FF5E55'];
function pixels(canvas, { cell = 12, density, colors = SWATCH, coral = .05 }) {
  const ctx = canvas.getContext('2d');
  let cols = 0, rows = 0, grid = [], on = false, last = 0;
  new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(canvas);
  const pick = () => Math.random() < coral ? '#FF5E55' : colors[Math.floor(Math.random() * (colors.length - 1))];
  const fill = () => { grid = []; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) grid.push(Math.random() < density(r / Math.max(1, rows - 1), c / cols) ? pick() : null); };
  const resize = () => { const C = Math.ceil(canvas.clientWidth / cell), R = Math.ceil(canvas.clientHeight / cell); if (C !== cols || R !== rows) { cols = C; rows = R; canvas.width = cols; canvas.height = rows; fill(); } };
  const draw = () => { ctx.clearRect(0, 0, cols, rows); for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const k = grid[r * cols + c]; if (k) { ctx.fillStyle = k; ctx.fillRect(c, r, 1, 1); } } };
  const loop = (t) => {
    requestAnimationFrame(loop);
    if (!on || t - last < (reduced ? 220 : 110)) return; last = t; resize();
    for (let i = 0; i < Math.ceil(cols * rows * .015); i++) { const j = Math.floor(Math.random() * grid.length), r = Math.floor(j / cols); grid[j] = Math.random() < density(r / Math.max(1, rows - 1), (j % cols) / cols) ? pick() : null; }
    draw();
  };
  resize(); draw(); requestAnimationFrame(loop);
}
document.querySelectorAll('.cell--pixel canvas').forEach(c => pixels(c, { cell: 10, colors: ['#1A18FF', '#2D36FF', '#7C8DFF', '#1A18FF'], coral: .06, density: (y) => y ** 3 * .7 }));

// ---------- Where you are: section index + nav box + light/dark nav ----------
const secs = [...document.querySelectorAll('[data-sec]')];
const idx = new Map([...document.querySelectorAll('.index a')].map(a => [a.dataset.idx, a]));
const nav = new Map([...document.querySelectorAll('.navbox a')].map(a => [a.dataset.nav, a]));
let current = null;
const update = () => {
  const mid = innerHeight * .45;
  let active = secs[0];
  for (const s of secs) if (s.getBoundingClientRect().top <= mid) active = s;
  const id = active.dataset.sec;
  if (id !== current) {
    current = id;
    idx.forEach((a, k) => a.toggleAttribute('aria-current', k === id));
    nav.forEach((a, k) => k === id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
  }
  // The nav box reads the section underneath it.
  let under = secs[0];
  for (const s of secs) if (s.getBoundingClientRect().top <= 60) under = s;
  document.body.classList.toggle('on-dark', under.dataset.tone === 'dark');
  document.body.classList.toggle('in-hero', hero.getBoundingClientRect().bottom > innerHeight * .55);
  // The section index reads the section at mid-screen.
  let atMid = secs[0];
  for (const s of secs) if (s.getBoundingClientRect().top <= innerHeight / 2) atMid = s;
  document.body.classList.toggle('idx-dark', atMid.dataset.tone === 'dark');
};
addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();

// ---------- Live Bengaluru clock ----------
const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
const clocks = document.querySelectorAll('[data-clock]');
const tick = () => { const s = fmt.format(new Date()); clocks.forEach(c => { c.textContent = s; }); };
tick(); setInterval(tick, 1000);
document.querySelectorAll('[data-year]').forEach(n => { n.textContent = new Date().getFullYear(); });

// ---------- Reveal on scroll ----------
const rv = document.querySelectorAll('.premise .col-text > *, .plate, .head, .cell, .approach .t-section, .rows li, .studio .grid > *, .foot .t-statement, .email, .cols > div');
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
rv.forEach((el, i) => { el.classList.add('rv'); el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });

// ---------- Footer mark: the six arrows fly in from outside, turn into place and lock together ----------
(() => {
  const host = document.querySelector('.fmark'); if (!host) return;
  const svg = host.querySelector('svg'), paths = [...svg.querySelectorAll('path')];
  const C = { x: 290, y: 290 };                                   // centre of the mark in its 580 x 580 drawing
  // The red arrow arrives last, as the piece that completes it.
  const order = paths.map((p, i) => ({ p, i, red: /E32112/i.test(p.getAttribute('fill')) })).sort((a, b) => a.red - b.red);
  let running = [];
  const play = () => {
    running.forEach(a => a.cancel()); running = [];
    host.classList.add('played');
    const slow = reduced ? 1.4 : 1;
    order.forEach(({ p, red }, k) => {
      const b = p.getBBox(), dx = b.x + b.width / 2 - C.x, dy = b.y + b.height / 2 - C.y, len = Math.hypot(dx, dy) || 1;
      const out = 0.55, tx = dx / len * 580 * out * .25, ty = dy / len * 580 * out * .25, turn = (k % 2 ? -1 : 1) * 60;
      // CSS transforms on SVG shapes are in the drawing's own units, so no screen scaling is needed.
      running.push(p.animate([
        { opacity: 0, transform: `translate(${tx}px, ${ty}px) rotate(${turn}deg) scale(.55)` },
        { opacity: 1, offset: .6 },
        { opacity: 1, transform: 'none' },
      ], { duration: (red ? 820 : 640) * slow, delay: k * 85 * slow, easing: red ? 'cubic-bezier(.34,1.56,.64,1)' : 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
    });
  };
  new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) play(); }), { threshold: .6 }).observe(host);
  host.addEventListener('mouseenter', play);
})();
