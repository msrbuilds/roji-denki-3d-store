# AGENTS.md — Roji Denki 路地電気

Project knowledge for coding agents (Claude Code, etc.). Read this before editing.

## What this is

A retro Japanese back-street electronics storefront. React 18 single-page app (Vite), three.js scenes for the 3D street / shop interiors / product turntable / map diorama, GSAP for UI motion. Front-end only: no backend, no real payments. Cart and settings persist in `localStorage`.

Visual direction: 90s Akihabara neon (pink/cyan/amber on near-black), with an optional "Cyberpunk" theme (heavier rain, holograms, CRT glitch). Bilingual EN/JP copy.

## Commands

```bash
npm install
npm run dev       # Vite dev server, http://localhost:5173
npm run build     # production build -> dist/
npm run preview   # serve dist/ locally
docker build -t roji-denki . && docker run -p 8080:80 roji-denki
```

Node 18+. No test suite or linter is configured; verify changes by running `npm run build` and clicking through every route in `npm run dev`.

## Deployment

- `Dockerfile`: multi-stage, `node:20-alpine` build → `nginx:1.27-alpine` serve on **port 80**.
- `nginx.conf`: SPA fallback (`try_files … /index.html`), gzip, `Cache-Control: immutable` for `/assets/`, `no-cache` for HTML.
- Hosted with **Dokploy** (Application → GitHub provider → Dockerfile build type → domain on port 80 with HTTPS). Pushing to `main` redeploys if Auto Deploy is on.
- Also deployable to **Netlify** (`netlify.toml`) and **Vercel** (`vercel.json`); both set `dist/` as output, a SPA fallback to `index.html` and immutable caching for `/assets/`. One-click deploy buttons are at the top of `README.md`.
- Any new top-level route works automatically thanks to the SPA fallbacks (nginx, Netlify, Vercel); don't add server routes.

## Routes

| Path | Page | Notes |
|---|---|---|
| `/` | `pages/Street.jsx` | Full-screen 3D alley. **Page scroll is locked**; wheel/touch/↑↓/W/S/Home/End move the walk position. Storefronts are clickable. |
| `/dept/:key` | `pages/Dept.jsx` | Shop interior for `audio`, `tv`, `camera`, `game`, `phone`. Products on shelves are clickable. |
| `/product/:id` | `pages/Product.jsx` | Turntable model + details. `location.state.from` (dept key) drives the back link. |
| `/shop` | `pages/Shop.jsx` | Split-flap arrivals board (`#arrivals`), vending-machine filter + grid (`#shop`). Category is `?cat=`. |
| `/checkout` | `pages/Checkout.jsx` | Ticket-machine flow: review → pay → paying (cash/ic/card/qr) → printing → done. Receipt PNG download via canvas. |
| `/map` | `pages/MapPage.jsx` | Top-down diorama; select shops/districts/buildings. |

The footer is hidden on `/` (the street is a single-screen view).

## Source layout

```
src/
  main.jsx             BrowserRouter + StrictMode
  App.jsx              routes, layout, cyberpunk overlay + heading glitch loop
  store.jsx            React context: settings, cart, cartOpen, thumbs, fontsReady, walkRef, badgeRef
  data.js              ALL catalogue/content data (see below)
  useBoard.js          split-flap board hook
  util.js              clamp, showTip (imperative tooltip), useViewport, hhmm
  styles.css           all styling (CSS variables + component classes)
  components/          Header (ticker, logo flicker), Footer, CartDrawer, Settings, Thumb
  pages/               one file per route
  scenes/street.js     three.js: alley, interior, turntable, thumbnails, buildModel (all product models)
  scenes/diorama.js    three.js: map diorama (older scene module; only `.diorama` is used)
```

## Data (`src/data.js`)

- `PRODUCTS` — 20 items, 4 per department. Fields: `id` (`p1`…`p20`), `name`, `jp`, `cat`, `price` (JPY int), `grade` (`A`/`A-`/`B+`/`B`), `from` (district name), `ph` (placeholder label), `model` (key into `buildModel`), `year`, `includes`, `desc`, `notes[]`.
- `DEPTS` — departments with `key`, `en`, `jp`, `col` (hex neon colour), `side` (−1 left / 1 right of the street), `z` (position along the street, negative = further), `blurb`.
- `CATEGORIES` — vending-machine filter (includes `all`). `CONDITION` — grade → text.
- `ARRIVAL_POOL`, `STATUS_COLORS`, `FLAP_CHARS` — arrivals board.
- `DISTRICTS`, `SHOP_BLURBS` — map panel copy. `PAY_METHODS`, `QR_CELLS` — checkout.
- `yen(n)` — `¥18,800` formatting.

**Adding a product:** append to `PRODUCTS` with an existing `cat`; `model` must be a case in `buildModel` (`scenes/street.js`) or it renders a grey cube. The dept interior shows the **first 4** products of a category on the shelf (`ctx.products.slice(0,4)`); others still appear in the side list and grid.

**Adding a department:** add to `DEPTS` (unique `key`, `col`, `side`, `z` spaced ~24 units apart within −10…−135), add a matching `CATEGORIES` entry and `SHOP_BLURBS` key. The street scene reserves a 9.2-unit-deep building for each dept automatically.

## Scene modules (`src/scenes/*.js`)

Plain JS (not React). Each factory takes a container element and a `ctx` object, appends its own `<canvas>`, runs its own rAF loop, and returns `{ destroy(), … }`. Always call `destroy()` in the React effect cleanup (StrictMode mounts twice in dev).

- `Scenes.alley(el, ctx)` — ctx: `depts`, `opts()` → `{theme, rain, flicker, autoWalk, active}`, `progress()` → 0..1 walk target, `visible()`, `onWalk(w)`, `onHover(info|null, x, y)`, `onEnter(key | 'all')`. Camera z = `10 - w*148`. Custom post-processing (bloom, chromatic aberration, vignette, grain) and a planar mirror for the wet road live in `makePost` / `makeMirror` / `mirrorMat`.
- `Scenes.interior(el, ctx)` — ctx: `dept`, `products[{id,name,priceFmt,grade,model}]`, `opts()`, `onHover`, `onPick(id)`.
- `Scenes.turntable(el, ctx)` — returns `setModel(key)`; drag to rotate.
- `Scenes.thumbnails(list)` — synchronous; renders each model offscreen and returns `{id: blobURL}`. Called once in `store.jsx` after fonts load.
- `Diorama.diorama(el, ctx)` — ctx: `opts()`, `onHover`, `onSelect(info)`; returns `reset()`, `focus(key)`.

Conventions:
- Scenes read live settings through `settingsRef.current` (passed as `opts`), so settings changes apply without rebuilding the scene. Don't pass changing values as effect deps unless the scene must be rebuilt.
- Canvas textures (signs, windows, tags, posters) use the web fonts, so scenes are created only after `fontsReady` is true. If you add new kanji/kana to a sign, add them to `FONT_SAMPLES` in `store.jsx` so the font subset is downloaded first.
- **three.js is pinned to 0.149.0.** Newer versions change colour management (sRGB output/texture colour spaces) and will wash out every canvas texture. Upgrading requires setting `texture.colorSpace = SRGBColorSpace` on canvas textures and re-tuning colours.
- Point-light budget in the alley is capped (`MAXL = 18`); more lights get expensive because the mirror pass renders the scene twice.
- Emissive "glow" materials use `MeshBasicMaterial` with `color.setScalar(>1)` so bloom picks them up; flicker multiplies that scalar.

## Styling

- Everything is in `src/styles.css`. CSS variables: `--ink`, `--panel`, `--paper`, `--muted`, `--dim`, `--pink`, `--pink-l`, `--cyan`, `--amber`, `--lcd`, fonts `--display` (Dela Gothic One), `--led` (DotGothic16), `--body` (Zen Kaku Gothic New), `--header-h` (95px sticky header).
- Accent colours are `oklch(...)` values sharing lightness/chroma; keep new accents in that family.
- Reusable classes: `.btn` + `.btn-pink` / `.btn-ghost` / `.btn-paper` / `.btn-sm`, `.card` + `.card-hover`, `.thumb`, `.eyebrow`, `.title`, `.lede`, `.price-led`, `.tip`, `.scanlines`.
- Headings that should glitch in the Cyberpunk theme get a `data-glitch` attribute; the loop in `App.jsx` restores their original `text-shadow` afterwards.
- Hero copy over the 3D street needs `.shadowed` / `.shadowed-sm` for legibility; keep the left-side gradient scrim (`.street-fade-h`).
- Custom neon scrollbars are global (WebKit pseudo-elements + Firefox `scrollbar-color`).
- The arrivals board is fluid (container queries, `cqi` units). Don't reintroduce fixed widths or horizontal scrolling.

## Behaviour details worth preserving

- Walk position lives in `walkRef` (store), so leaving a department returns you to the same spot in the street.
- On the street, the directory board only shows at viewport width ≥ 1100px; paragraph copy and hints hide below 680px height so captions never slide under the header.
- Split-flap: a new arrival is pushed to the top every 7s; only changed tiles flip, with per-row/per-column stagger.
- Checkout: `busy` ref blocks double-payment; receipt animation has a 3s fallback in case GSAP's `onComplete` doesn't fire (background tabs).
- Thumbnails are blob URLs, not data URLs (data URLs inside CSS `url()` break on the `;` in `data:image/jpeg;base64`).

## Content and copy

- Brand: **Roji Denki 路地電気**, a fictional shop at "3-2-1 Back Alley, Nakano, Tokyo", open 18:00–04:00, closed Tuesdays.
- Product names are generic. **Do not use real brand or model names** (e.g. no "Walkman", "Game Boy").
- Tone: plain and factual, a short sentence or two. JP strings are decorative and secondary; gate them behind `settings.japanese`.

## Known gaps / next steps

- Product images are rendered stand-ins. For real photos: add files to `public/products/`, add an `image` field to products, and prefer it over `thumbs[id]` in `Thumb` usages (Shop, Dept list, Product related, CartDrawer).
- No payment integration, order storage or email sign-up backend.
- No code splitting: three.js + scenes ship in the main bundle (~1 MB). If needed, lazy-load `scenes/*` with dynamic `import()` per page.
- No automated tests.
