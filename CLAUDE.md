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
assets/instagram/*.jpg      — 1.4 graphic card thumbnails, local on purpose
                              (see Projects → 1.4 for why they are not hotlinked)
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

Hero → About (01) → Tools (02) → Philosophy (03) → Projects (04) → Work (05) → Contact (06). Section numbers in each `.section-tag` must stay sequential if sections are reordered or added/removed.

## Content updates

All content is hardcoded in `index.html`.

- **Work**: each `.work-row` is an `<a>` (clickable, links out to the relevant portfolio/drive/site for that category) — copy a block and increment the index to add a category.
- **Projects**: section tag reads `04 — Project`, the `<h2>` heading is `PROJECT`, and the section holds **four** subsections, each a `.projects-lede` label followed by its own `.project-grid`:
  - `1.1 — EDITED WORK` — the five personal videos, rendered `4 + 1` on desktop (fifth wraps, left-aligned, same width).
  - `1.2 — ICICI BANK EDITED WORK` — four client videos, rendered as one row of four on desktop.
  - `1.3 — PHOTO EDITED WORK` — four stills from AuraShots, one row of four, followed by the More Images CTA.
  - `1.4 — GRAPHIC EDITED WORK` — four Instagram posts, one row of four on desktop.

  The 1.2, 1.3 and 1.4 labels carry the extra class `projects-lede--sub` for their `margin-top: 72px`. It is a separate class rather than an edit to `.projects-lede` so 1.1 keeps its original spacing — do not fold the margin into the base rule.

  Cards are `.project-card` anchors. 1.1 and 1.2 `href` the video's normal YouTube **watch** URL; 1.3 `href`s the AuraShots product page; 1.4 `href`s the exact Instagram post URL (including any query string, e.g. `?img_index=1`). All use `target="_blank" rel="noopener noreferrer"`. All four subsections reuse the exact same component and classes (`project-thumb`, `project-scrim`, `project-play`, `project-overlay`, `project-index`, `project-title`, `project-meta`); there is no second card style. Keep `loading="lazy"`, `decoding="async"`, explicit `width`/`height`, and empty `alt=""` on every `<img>` — the visible `.project-title` already carries the name, so the image is decorative and duplicating it in `alt` would make screen readers announce it twice. Every card **must** also carry `reveal-up`: `main.js` only observes `.reveal-up` / `.work-row` / `.js-scramble`, so a card without it stays at `opacity: 0` and is invisible. This shipped twice already.

  **1.3 photos are external and aspect-mixed.** The `src` is `aurashots.s3.ap-south-1.amazonaws.com/aurashots/aurashotswatermark/<code>.jpg`; the code is the `AS……` id in the linked page's `<h3 class="pro-category pro-name">` caption, e.g. `AS26090052`. `width`/`height` must be the file's real intrinsic size — these are 1800×1200 or 1200×1800. Unlike 1.4 these stay hotlinked from S3, which serves unsigned public URLs that do not expire, so there is nothing to commit.

  **1.4 thumbnails are local files, and must stay that way.** `assets/instagram/<postShortcode>.jpg`, e.g. `DckaFHhjO-S.jpg`. Instagram has no durable image URL: `instagram.com/p/<id>/media/?size=l` answers **HTTP 302** to a *signed* `*.fbcdn.net` URL that expires in ~4 days, and Chrome would not decode it at all in testing (it loaded neither the `/media/` path nor the signed target, while S3 and `i.ytimg.com` controls loaded fine on the same page). So the bytes are committed and the `src` is a relative path. Do not swap it back to a hotlink, and do not add an `<iframe>`, Instagram embed, lightbox, or preview modal — the click goes straight to Instagram. To re-pull an image, `curl -L -H "User-Agent: <browser UA>" "https://www.instagram.com/p/<id>/media/?size=l"` and commit the result; the intrinsic size varies (720×720 square or 1080×1350/1439 4:5), so keep `width`/`height` equal to the file's real size.

  **1.1/1.2 thumbnails come from YouTube.** `i.ytimg.com/vi/<videoId>/maxresdefault.jpg`, and the id in the path must match the one in the card's `href`. **Not every video has a `maxresdefault.jpg`.** `_ytkWBPlzKY` is a low-resolution upload, so that path 404s and it uses `hqdefault.jpg` (480×360) instead, with matching `width`/`height` attributes. Its black bars are removed by the existing `object-fit: cover`. Any new video must be HEAD-checked against `https://i.ytimg.com/vi/<id>/maxresdefault.jpg` before being added, and the `width`/`height` attributes must match whatever variant is actually used. Headless `file://` Chrome cannot reach `i.ytimg.com`, so `naturalWidth` reads 0 for every card — never use it to judge whether a thumbnail loads.

  **1.3 and 1.4 use a shared square frame with `contain`, and must keep it.** These eight are real creative stills, not video thumbnails, so `.project-card--photo .project-thumb` and `.project-card--still .project-thumb` override the base `.project-thumb` to `aspect-ratio: 1 / 1` and their `<img>` to `object-fit: contain; object-position: center`. 1.1 and 1.2 deliberately keep 16:9 `cover` — **never widen these overrides to `.project-card`**, or the video thumbnails get letterboxed too.

  Square is the neutral compromise for this exact set — two 3:2 landscapes (1.3) and six portrait/square creatives — so the frame stays identical across both sections (verified 259×259 at 1440px, 423×423 at 1024px, 429×429 at 480px) and no creative loses more than about a third of its frame on a single axis. The letterbox bars are the frame's own `background: var(--bg-alt)`, which is what makes them read as a deliberate mount rather than a broken image — do not set the thumb background to `transparent`. An earlier revision used 16:9 `cover` here and re-anchored `object-position: 50% 30%` on `.project-card--photo` to rescue the portraits; both are gone, because `contain` shows the whole frame anyway and no image is cropped.

  `.project-card--photo` and `.project-card--still` also share the `.project-play svg { margin-left: 0 }` reset (the base rule's `2px` optically centres the play triangle, not the image glyph) and swap that glyph for a stroke image icon, reading `View image` in 1.3 and `View post` in 1.4. The two modifiers differ in **nothing else**.

  One known, accepted trade-off: the shared hover zoom `.project-card:hover .project-thumb img { transform: scale(1.07) }` runs inside `.project-thumb { overflow: hidden }`, so for creatives that fill the square edge-to-edge on one axis, ~3.5% of that axis is clipped *during hover only*. At rest every creative is 100% visible. The zoom was kept because it is part of the site's hover language; if that clip is ever unwanted, scope a gentler `transform` to these two modifiers rather than removing the effect everywhere.

  The **More Images** CTA under 1.3 is `.projects-more` (a centring flex row) wrapping a stock `.resume-btn` — the About CTA verbatim, linking to `aurashots.com/category/festivals-occasions`. `.projects-more .resume-btn { margin-top: 0 }` clears the About-sized top margin; do not delete it. Only the icon differs, via `.resume-icon--disc`, which adds the thin circle. It must stay scoped to that modifier: `.resume-btn` is shared with About, whose flat `.resume-icon` must not gain a border.

  **Not every video has a `maxresdefault.jpg`.** `_ytkWBPlzKY` is a low-resolution upload, so that path 404s and it uses `hqdefault.jpg` (480×360) instead, with matching `width`/`height` attributes. Its black bars are removed by the existing `object-fit: cover`. Any new video must be HEAD-checked against `https://i.ytimg.com/vi/<id>/maxresdefault.jpg` before being added, and the `width`/`height` attributes must match whatever variant is actually used. Headless `file://` Chrome cannot reach `i.ytimg.com`, so `naturalWidth` reads 0 for every card — never use it to judge whether a thumbnail loads.

  `.project-meta` is `Category · N min · N views`, joined by `·` (U+00B7). View counts are **hardcoded snapshots**, not live: they were scraped from each watch page's `"viewCount"` field (YouTube needs an API key for anything live) and compacted to `919K` / `709K` / `505K` / `2.1M` / `129K`. They will drift — refresh them by re-scraping and editing the five spans, keeping the same compaction.

  **Never embed these videos.** An earlier revision intercepted the card click, opened a native `<dialog>`, and played a `youtube-nocookie.com/embed/<id>` iframe. YouTube rejected it with **player error 153** (it could not verify the embed's `Referer`/`Origin`), so the user saw a broken player. The embed, the `<dialog>`, all `.viewer*` CSS, and the click handler are gone. `main.js` now deliberately registers **no** click handler for these cards. Do not add an `<iframe>`, a modal player, `youtube.com/embed/`, or `youtube-nocookie` back without the user asking for it explicitly.

  Grid is `repeat(4, 1fr)` on desktop, `repeat(2, 1fr)` at 1024px, `1fr` at 860px. Fixed track counts only, never `auto-fit` — `auto-fit` reflows to three columns at this container width and breaks the four-across first row. Five cards render 4 + 1, and because every track is `1fr` the fifth is the same size as the rest and stays left-aligned; do not special-case it. No masonry, no `grid-column` spans. Cards are equal height via `.project-card { height: 100% }` plus `.project-meta { margin-top: auto }`.

  Hover is a cinematic stack inside `.project-thumb`: image `scale(1.07)`, `.project-scrim` gradient fading in, `.project-play` glyph scaling in, and `.project-overlay` (category + "Play film") rising from the bottom. It is purely visual — clicking still just opens YouTube. Gated behind `@media (hover: hover)` so taps on touch devices do not leave a card stuck hovered, mirrored by `:focus-visible` for keyboard, and neutralised under `prefers-reduced-motion`.
- **About**: the `.about-body` bio, then a `.resume-btn` capsule CTA (document icon + single `View My Resume` label) linking to the Google Drive resume. There is no `.about-statement` lede — it was removed; do not reintroduce one without being asked.

  `.resume-btn` deliberately mirrors the `.tool-chip` pill: same `border-radius: 999px`, same `1px solid var(--border)`, same `0.25s` border/color transition, and the icon follows the Tools icon conventions — bare `viewBox="0 0 24 24"`, `fill="currentColor"`, sized to match `.tool-icon` (18px desktop / 16px mobile), no forced `color` so it inherits `--text` and turns accent with the button on hover. The icon does need `fill-rule="evenodd"`: the glyph is a solid document silhouette with the folded corner and the two text rules knocked out as level-1 subpaths, so without evenodd the rules fill solid and vanish into the page. The label is `--font-sans` 14px uppercase (13px at 480px), unlike every other label on the site.
- **Tools**: grouped under `.tools-group` blocks (Adobe Creative Suite / Editing & Design Apps / AI Tools & Creative Workflow). Every entry uses the same component — a `.tool-chip` (icon + label) inside a flex-wrap `.tools-grid` — so all three groups read as one continuous list of pills. Each group is just a `.tools-cat` heading plus its chips; no descriptive paragraphs.

  **Group spacing and stagger must stay structural, not positional.** The Tools `<section>` also contains `.section-tag` and `.heading-rule` divs, so `:nth-of-type()` and `:first-of-type` count those and silently fail to match the groups — that bug shipped once already. Use sibling combinators instead: `.tools-group + .tools-group` for the 48px gap and the 0.1s delay, and `.tools-group + .tools-group + .tools-group` for 0.2s. The 480px override (36px gap) must stay **after** the base rule in source order, since equal-specificity later rules win.

  Icons are the official Simple Icons marks wherever one exists, in the monochrome Simple Icons convention: `viewBox="0 0 24 24"`, `fill="currentColor"`, no brand colour, no background tile. That covers the four Adobe apps, Canva, ChatGPT, Google Gemini, and Behance in Contact. Brand marks are deliberately *not* recoloured — the whole section inherits `--text` so it inverts with `prefers-color-scheme`.

  Where no official mark exists, use a hand-drawn monochrome glyph in the same bare style (no tile). Current ones: CapCut and VN Editor use `.tool-icon--stroke`; Google Flow, AI Video Generation, AI Image Generation and AI Social Media Content use solid `fill="currentColor"` glyphs. Google Flow has no official logo in any icon library (Simple Icons 404s), so these are deliberately generic — do not invent a fake "official" logo for them. Icons are `aria-hidden="true"` with the name as adjacent real text, so each pair is announced once.
- **Contact**: social links in `.contact-links` also carry official brand SVG icons (same Simple Icons convention) before the label. Edit the `.contact-link` anchors to update social links.
