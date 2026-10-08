<div align="center">

# Roji Denki 路地電気

**Salvaged electronics from Tokyo's back streets, in a walkable 3D neon alley.**

A retro Japanese back-street electronics shop, built as a React single-page app with three.js scenes and GSAP motion.

<p>
  <img alt="React 18" src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=61DAFB&labelColor=0c0a0f" />
  <img alt="three.js r149" src="https://img.shields.io/badge/three.js-r149-049EF4?style=for-the-badge&logo=threedotjs&logoColor=white&labelColor=0c0a0f" />
  <img alt="GSAP 3" src="https://img.shields.io/badge/GSAP-3-88CE02?style=for-the-badge&logo=greensock&logoColor=88CE02&labelColor=0c0a0f" />
  <img alt="Vite 5" src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E&labelColor=0c0a0f" />
  <img alt="React Router 6" src="https://img.shields.io/badge/React%20Router-6-CA4245?style=for-the-badge&logo=reactrouter&logoColor=CA4245&labelColor=0c0a0f" />
</p>

<p>
  <img alt="Theme: Akihabara neon" src="https://img.shields.io/badge/%E2%97%86%20theme-Akihabara%20neon-ff4f9a?style=flat-square&labelColor=0c0a0f" />
  <img alt="Mode: Cyberpunk" src="https://img.shields.io/badge/%E2%97%86%20mode-Cyberpunk-2fd3e0?style=flat-square&labelColor=0c0a0f" />
  <img alt="Open 18:00 to 04:00" src="https://img.shields.io/badge/%E5%96%B6%E6%A5%AD%E4%B8%AD-18%3A00%E2%80%9304%3A00-f0a030?style=flat-square&labelColor=0c0a0f" />
  <img alt="Languages: English and Japanese" src="https://img.shields.io/badge/lang-EN%20%2F%20%E6%97%A5%E6%9C%AC%E8%AA%9E-7cff6b?style=flat-square&labelColor=0c0a0f" />
  <img alt="Checkout: demo only" src="https://img.shields.io/badge/checkout-demo%20only-b06bff?style=flat-square&labelColor=0c0a0f" />
</p>

</div>

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

## Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/msrbuilds/roji-denki-3d-store)

The button copies the repo to your GitHub account and deploys it; no environment variables are needed. `netlify.toml` sets the build command, the `dist/` publish directory, Node 20, a single-page-app fallback and long-lived caching for hashed assets.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmsrbuilds%2Froji-denki-3d-store&project-name=roji-denki-3d-store&repository-name=roji-denki-3d-store)

The button copies the repo to your GitHub account and deploys it; no environment variables are needed. `vercel.json` sets the Vite preset, the `dist/` output, a single-page-app rewrite and the same asset caching.

On both hosts, the single-page-app fallback is what lets deep links such as `/shop` or `/product/p3` load on refresh instead of returning 404.

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
