# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static portfolio site for Rishi Vishwakarma, motion designer based in Mumbai. Live at `https://iamrishi.website/` (served by GitHub Pages from the upstream repo `Harsh-2002/Rishi-Web`; local `origin` points at the `BRV188/Rishi-Web` fork). No build step — files are served directly.

## Structure

```
index.html                  — markup only; the sole exception is a 1-line inline
                              script in <head> that sets the .js class (see below)
style.css                   — all styles
main.js                     — all interactivity
CLAUDE.md
favicon.png
logo.svg
.github/workflows/deploy.yml
```

## Serving locally

```bash
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
- `--font-mono` — Space Mono 700 (all label/meta text, including `.tool-chip span` and `.work-tags`). The `.resume-btn` label is the one deliberate exception: it uses `--font-sans` so the primary CTA reads as body-adjacent copy rather than a meta label.

Gradient background is set directly on `body` with `background-attachment: fixed` so it doesn't scroll. A noise SVG overlay (`#noise`, z-index 9990) sits above it at 3–5% opacity.

## Animations

All animations are CSS-only except scramble text and IntersectionObserver triggers in `main.js`.

- **Scramble** (`scramble(el)` in `main.js`) — randomises chars then resolves left-to-right. Fires on load for hero name, on scroll-into-view for section headings. Controlled by `data-target` attribute on `.js-scramble` elements.
- **Work rows** — fade up with 90ms stagger via IntersectionObserver. Triggered by `.in-view` class.
- **Heading rules** — `growRight` keyframe triggered by `.animate` class added from JS.
- All animations respect `prefers-reduced-motion` via a blanket `0.001ms` override in CSS.

## Progressive enhancement (no-JS fallback)

The reveal animations start at `opacity: 0` and depend on `main.js` adding `.ready` / `.in-view`. If JS never runs, that would leave the entire page invisible with no pointer, so `index.html` sets `class="js"` on `<html>` from a 1-line inline script in `<head>` (runs before first paint), and the last block in `style.css` uses `html:not(.js)` to force everything visible and restore `cursor: auto`. Keep that fallback block **last** in the file — it overrides earlier rules — and keep it in sync if new elements are added with an `opacity: 0` initial state.

The same applies to the Tools stagger: it is driven by structural selectors, never positional ones (see Tools below).

## Custom cursor

Desktop only (`@media (pointer: fine)`). Two elements: `#cursor-ring` (28px blue circle, lags behind mouse at 10% lerp via `requestAnimationFrame`) and `#cursor-dot` (5px dot, snaps immediately). On link hover, body gets `.cur-link` which expands the ring to 48px. `cursor: none` is set on body only for fine-pointer devices.

## Responsive rules

- All font sizes use `clamp(min, vw, max)` — no fixed breakpoints for type.
- Hero name minimum is 28px (`clamp(28px, 9.5vw, 130px)`) — sized so "VISHWAKARMA" fits on one line at 375px viewport.
- Work rows: 3-col (number / title / tags) at desktop → 2-col at 860px (tags hidden) → tighter 2-col at 480px.
- Tools chips: flex-wrap grid (no fixed breakpoint needed to avoid overflow), with a 480px rule that tightens chip padding/gap/icon size for mobile.
- iOS safe areas handled via `env(safe-area-inset-*)` on `body` padding and `viewport-fit=cover`.

## Section order

Hero → About (01) → Tools (02) → Philosophy (03) → Work (04) → Contact (05). Section numbers in each `.section-tag` must stay sequential if sections are reordered or added/removed.

## Content updates

All content is hardcoded in `index.html`.

- **Work**: each `.work-row` is an `<a>` (clickable, links out to the relevant portfolio/drive/site for that category) — copy a block and increment the index to add a category.
- **About**: the `.about-body` bio, then a `.resume-btn` capsule CTA (document icon + single `View My Resume` label) linking to the Google Drive resume. There is no `.about-statement` lede — it was removed; do not reintroduce one without being asked.

  `.resume-btn` deliberately mirrors the `.tool-chip` pill: same `border-radius: 999px`, same `1px solid var(--border)`, same `0.25s` border/color transition, and the icon follows the Tools icon conventions — bare `viewBox="0 0 24 24"`, `fill="currentColor"`, sized to match `.tool-icon` (18px desktop / 16px mobile), no forced `color` so it inherits `--text` and turns accent with the button on hover. The icon does need `fill-rule="evenodd"`: the glyph is a solid document silhouette with the folded corner and the two text rules knocked out as level-1 subpaths, so without evenodd the rules fill solid and vanish into the page. The label is `--font-sans` 14px uppercase (13px at 480px), unlike every other label on the site.
- **Tools**: grouped under `.tools-group` blocks (Adobe Creative Suite / Editing & Design Apps / AI Tools & Creative Workflow). Every entry uses the same component — a `.tool-chip` (icon + label) inside a flex-wrap `.tools-grid` — so all three groups read as one continuous list of pills. Each group is just a `.tools-cat` heading plus its chips; no descriptive paragraphs.

  **Group spacing and stagger must stay structural, not positional.** The Tools `<section>` also contains `.section-tag` and `.heading-rule` divs, so `:nth-of-type()` and `:first-of-type` count those and silently fail to match the groups — that bug shipped once already. Use sibling combinators instead: `.tools-group + .tools-group` for the 48px gap and the 0.1s delay, and `.tools-group + .tools-group + .tools-group` for 0.2s. The 480px override (36px gap) must stay **after** the base rule in source order, since equal-specificity later rules win.

  Icons are the official Simple Icons marks wherever one exists, in the monochrome Simple Icons convention: `viewBox="0 0 24 24"`, `fill="currentColor"`, no brand colour, no background tile. That covers the four Adobe apps, Canva, ChatGPT, Google Gemini, and Behance in Contact. Brand marks are deliberately *not* recoloured — the whole section inherits `--text` so it inverts with `prefers-color-scheme`.

  Where no official mark exists, use a hand-drawn monochrome glyph in the same bare style (no tile). Current ones: CapCut and VN Editor use `.tool-icon--stroke`; Google Flow, AI Video Generation, AI Image Generation and AI Social Media Content use solid `fill="currentColor"` glyphs. Google Flow has no official logo in any icon library (Simple Icons 404s), so these are deliberately generic — do not invent a fake "official" logo for them. Icons are `aria-hidden="true"` with the name as adjacent real text, so each pair is announced once.
- **Contact**: social links in `.contact-links` also carry official brand SVG icons (same Simple Icons convention) before the label. Edit the `.contact-link` anchors to update social links.
