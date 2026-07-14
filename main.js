'use strict';

/* ── Circle cursor ── */
const ring = document.getElementById('cursor-ring');
const dot  = document.getElementById('cursor-dot');
if (ring && window.matchMedia('(pointer: fine)').matches) {
  let rx = window.innerWidth / 2, ry = window.innerHeight / 2;
  let mx = rx, my = ry;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function animRing() {
    rx += (mx - rx) * 0.10;
    ry += (my - ry) * 0.10;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-link'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-link'));
  });
}

/* ────────────────────────────────────
   SCRAMBLE TEXT
──────────────────────────────────── */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!#@&*%';

function scramble(el) {
  const target = el.dataset.target || el.textContent.trim();
  let frame = null;
  let iter  = 0;
  const total = target.replace(/\s/g, '').length;
  const speed = 1.8;

  el.classList.add('ready');

  clearInterval(frame);
  frame = setInterval(() => {
    el.textContent = target
      .split('')
      .map((ch, i) => {
        if (ch === ' ' || ch === "'") return ch;
        const nonSpaceIdx = target.slice(0, i + 1).replace(/[\s']/g, '').length - (ch === ' ' || ch === "'" ? 1 : 0);
        if (nonSpaceIdx < Math.floor(iter)) return ch;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      })
      .join('');

    if (iter >= total) {
      clearInterval(frame);
      el.textContent = target;
    }
    iter += speed;
  }, 32);
}

/* ────────────────────────────────────
   INTERSECTION OBSERVER — headings
──────────────────────────────────── */
const headings = Array.from(document.querySelectorAll('.js-scramble'));

/* Hero fires on load after a short delay */
window.addEventListener('load', () => {
  if (headings[0]) setTimeout(() => scramble(headings[0]), 280);
});

/* Remaining headings fire on scroll */
const headingObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    scramble(entry.target);
    const rule = entry.target.nextElementSibling;
    if (rule && rule.classList.contains('heading-rule')) {
      setTimeout(() => rule.classList.add('animate'), 380);
    }
    headingObserver.unobserve(entry.target);
  });
}, { threshold: 0.25 });

headings.slice(1).forEach(el => {
  el.classList.add('ready');
  headingObserver.observe(el);
});

/* ────────────────────────────────────
   INTERSECTION OBSERVER — work rows
──────────────────────────────────── */
const workRows = document.querySelectorAll('.work-row');

const rowObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = Array.from(entry.target.parentElement.children);
    const idx = siblings.indexOf(entry.target);
    setTimeout(() => entry.target.classList.add('in-view'), idx * 90);
    rowObserver.unobserve(entry.target);
  });
}, { threshold: 0.15 });

workRows.forEach(row => rowObserver.observe(row));

/* ────────────────────────────────────
   INTERSECTION OBSERVER — reveal-up elements
──────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal-up');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in-view');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.25 });

revealEls.forEach(el => revealObserver.observe(el));
