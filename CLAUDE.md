# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static portfolio site for Rishi Vishwakarma, motion designer based in Mumbai. Deployed via GitHub Pages at `https://harsh-2002.github.io/Rishi-Web/`. No build step — files are served directly.

## Structure

```
index.html                  — markup only, no inline styles or scripts
style.css                   — all styles
main.js                     — all interactivity
CLAUDE.md
.github/workflows/deploy.yml
```

## Serving locally

```bash
cd rishi-portfolio
python3 -m http.server 8090
# open http://localhost:8090
```

## Deploying

Push to `main` — GitHub Pages redeploys automatically. No CI pipeline needed for content changes.

## Design system

All design tokens are CSS custom properties in `:root` inside `style.css`. Light and dark mode are handled entirely via `@media (prefers-color-scheme: dark)` — no JS toggle.

Key tokens:
- `--bg` / `--bg-alt` — background (cream / slightly deeper cream)
- `--text` — near-black (`#0F0F0C`) / warm white (`#F0EDE0`)
- `--muted` — label text, must stay ≥ 4.5:1 contrast on its background
- `--accent` — blue (`#1238E8` light / `#6B9DFF` dark), used for links, cursor, hover lines
- `--border` — visible dividers
- `--font-sans` — Helvetica Neue stack (headings, body)
- `--font-mono` — Space Mono 700 (all label/meta text)

Gradient background is set directly on `body` with `background-attachment: fixed` so it doesn't scroll. A noise SVG overlay (`#noise`, z-index 9990) sits above it at 3–5% opacity.

## Animations

All animations are CSS-only except scramble text and IntersectionObserver triggers in `main.js`.

- **Scramble** (`scramble(el)` in `main.js`) — randomises chars then resolves left-to-right. Fires on load for hero name, on scroll-into-view for section headings. Controlled by `data-target` attribute on `.js-scramble` elements.
- **Work rows** — fade up with 90ms stagger via IntersectionObserver. Triggered by `.in-view` class.
- **Heading rules** — `growRight` keyframe triggered by `.animate` class added from JS.
- All animations respect `prefers-reduced-motion` via a blanket `0.001ms` override in CSS.

## Custom cursor

Desktop only (`@media (pointer: fine)`). Two elements: `#cursor-ring` (28px blue circle, lags behind mouse at 10% lerp via `requestAnimationFrame`) and `#cursor-dot` (5px dot, snaps immediately). On link hover, body gets `.cur-link` which expands the ring to 48px. `cursor: none` is set on body only for fine-pointer devices.

## Responsive rules

- All font sizes use `clamp(min, vw, max)` — no fixed breakpoints for type.
- Hero name minimum is 28px (`clamp(28px, 9.5vw, 130px)`) — sized so "VISHWAKARMA" fits on one line at 375px viewport.
- Work rows: 3-col (number / title / tags) at desktop → 2-col at 860px (tags hidden) → tighter 2-col at 480px.
- iOS safe areas handled via `env(safe-area-inset-*)` on `body` padding and `viewport-fit=cover`.

## Content updates

All content is hardcoded in `index.html`. To add a work category, copy a `.work-row` block and increment the index. To update social links, edit the `.contact-link` anchors in the contact section.
