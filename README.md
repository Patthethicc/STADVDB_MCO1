## Local multi-instance dev

This repository contains a Next.js frontend (`olap-app`) and an Express backend (`backend`) designed to work with a 3-node MySQL setup (MASTER + 2 SLAVES).

For local testing you can run three backend instances and three frontend instances so each frontend talks to a different backend:

Prerequisites:
- Node/npm installed
- MySQL nodes running locally (example ports: `3306` MASTER, `3307` SLAVE06, `3308` SLAVE07)

Quick start (from repo root):

1. Install dev helpers at repo root (adds `concurrently` + `cross-env`):
```pwsh
npm install
```

2. Start all backends and frontends (starts 6 processes):
```pwsh
npm run dev:all
```

Shorter commands:
- Start only backends: `npm run dev:backends`
- Start only frontends: `npm run dev:frontends`
- Start a single backend: `npm run dev:backend:1` (or `:2`, `:3`)
- Start a single frontend: `npm run dev:frontend:1` (or `:2`, `:3`)

Notes:
- Backend HTTP ports used by the scripts: `3001`, `3002`, `3003`.
- Frontend dev ports used by the scripts: `3000`, `3004`, `3005`.
- Each frontend instance is started with a `BACKEND_URL` env pointing to its matching backend.
- The backend uses env vars for DB node ports (see `backend/config/connect.js`): `NODE1_PORT`, `NODE2_PORT`, `NODE3_PORT`. Set these as appropriate for your local MySQL nodes.
- The scripts use `cross-env` so they work on Windows PowerShell.

If you prefer automatic backend reloads during development, run the backend dev script directly in the `backend` folder (`npm --prefix backend run dev`) which uses `nodemon`.
