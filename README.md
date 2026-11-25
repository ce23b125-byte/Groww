# PitchDay — Game Day Cricket Organizer

A minimal, zero-dependency end-to-end web app for organizing a single turf/gully cricket game day across **Before**, **During**, and **After**.

## Quick Start

```bash
node server.js
```

Open `http://localhost:3456` in your browser.

## Project Structure

- `server.js` — Lightweight Node.js HTTP server & JSON persistence (`/api/state`, `/api/reset`, `/api/support`, `/api/health`)
- `public/index.html` — App shell & navigation
- `public/styles.css` — Minimalist 4-color UI styling
- `public/app.js` — Client state, 3-phase workflows, live scorer, and minimized debt settlement
- `data/gameday.json` — Local game-day state (auto-created on first run)
