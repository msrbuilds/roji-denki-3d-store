# Roji Denki 路地電気

A retro Japanese back-street electronics shop, built as a React single-page app with three.js scenes and GSAP motion.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/msrbuilds/roji-denki-3d-store)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmsrbuilds%2Froji-denki-3d-store&project-name=roji-denki-3d-store&repository-name=roji-denki-3d-store)

- **Street** (`/`) — a full-screen 3D alley. Scroll, swipe or use ↑/↓ to walk; click a lit storefront to go inside.
- **Departments** (`/dept/:key`) — shop interiors with products on the shelves.
- **Product** (`/product/:id`) — turntable view with bench notes.
- **Shop** (`/shop`) — split-flap arrivals board, vending-machine category picker and the full product grid.
- **Checkout** (`/checkout`) — ticket-machine flow (cash, IC card, credit card, QR) with a printable receipt.
- **Map** (`/map`) — clickable top-down diorama of the alley and the districts stock comes from.

Display settings (theme, rain, neon flicker, auto-walk, Japanese text) live in the bottom-left Settings button and persist in `localStorage`, as does the cart.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the build locally
```

Requires Node 18+.

## Deploy to Netlify or Vercel

Use the buttons at the top of this README. Each one copies the repo to your GitHub account and deploys it; no environment variables are needed.

Both hosts are preconfigured:

- `netlify.toml`: build command, `dist/` publish directory, Node 20, single-page-app fallback and long-lived caching for hashed assets.
- `vercel.json`: Vite preset, `dist/` output, single-page-app rewrite and the same asset caching.

The single-page-app fallback is what lets deep links such as `/shop` or `/product/p3` load on refresh instead of returning 404.

## Deploy with Dokploy

The repo ships a multi-stage `Dockerfile` (Node build → nginx) and an `nginx.conf` with single-page-app fallback, gzip and long-lived caching for hashed assets.

1. In Dokploy, create a **Project → Application**.
2. **Provider:** GitHub → pick this repository and the `main` branch.
3. **Build type:** `Dockerfile` (path `./Dockerfile`, context `.`).
4. **Port:** the container listens on **80**.
5. **Domains:** add your domain (e.g. `shop.example.com`), container port `80`, enable HTTPS (Let's Encrypt).
6. Point your domain's DNS **A record** at the Dokploy server's IP.
7. Click **Deploy**. Enable *Auto Deploy* to rebuild on every push to `main`.

To test the image locally:

```bash
docker build -t roji-denki .
docker run -p 8080:80 roji-denki    # http://localhost:8080
```

## Notes

- three.js is pinned to `0.149.0` to keep the colour handling the scenes were tuned for.
- Fonts load from Google Fonts (Dela Gothic One, DotGothic16, Zen Kaku Gothic New).
- The checkout is a front-end demo; no payments are processed.
