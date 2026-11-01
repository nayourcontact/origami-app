# Origami Alfredo

A bilingual (Hungarian/English) portfolio and event website for origami artist **Origami Alfredo**. The application combines a public media gallery, event listings and an authenticated admin interface with automated deployment to a DigitalOcean droplet.

**Live website:** https://origamialfredo.hu

## Stack

- **Frontend:** Vue 3, Vite, Vue Router, GSAP, Tailwind CSS
- **Backend:** Node.js, Express 5, MongoDB / Mongoose
- **Operations:** Nginx reverse proxy, PM2, GitHub Actions CI/CD, `mongodump`/`mongorestore`

## Features

- Hungarian and English public pages (home, gallery, events and tutorials)
- Instagram-backed photo gallery and background media, with pagination/lazy loading
- Admin-only dashboard, authenticated sessions, CSRF protection and event management
- Reduced-motion support and performance-aware animation controls
- Media upload validation and restricted public media directories
- Liveness and MongoDB-backed readiness endpoints

## Project structure

```text
client/               Vue/Vite application
  src/views/          Route views
  src/components/     Shared UI
  src/composables/    UI state, performance and gallery logic
server/               Express API
  routes/             API endpoints
  controllers/        HTTP handlers
  services/           Domain and integration logic
  models/             Mongoose models
  tests/              Node test runner tests
ops/                  Deployment smoke and database backup/restore scripts
.github/workflows/    CI quality gate and production deployment
```

## Requirements

- Node.js **22** (matches the CI workflow); npm
- A locally accessible MongoDB database (production uses MongoDB 7)
- Optional integration credentials for Instagram and email features

## Local development

```bash
# In separate terminals:
cd server
npm ci
cp .env.example .env    # configure your own local values
node server.js

cd client
npm ci
cp .env.example .env  # adjust public VITE_* settings if needed
npm run dev
```

The frontend development server normally runs at `http://localhost:5173`. The backend port comes from `server/.env` (the production configuration uses `5000`). **Never commit real `.env` files, tokens or database exports.** Client-side `VITE_*` variables are public and must never contain secrets.

See [`server/.env.example`](server/.env.example) and [`client/.env.example`](client/.env.example) for configuration examples. A strong `JWT_SECRET`, `MONGO_URI` and `CLIENT_ORIGIN` are required at startup.

## Quality checks

```bash
cd server
npm test
npm audit --omit=dev --audit-level=high

cd ../client
npm run build
npm audit --omit=dev --audit-level=high
```

GitHub Actions runs the backend tests, production dependency audits and frontend build before allowing the production deployment job. The test suite covers core auth/session/CSRF behavior, API endpoints, upload checks and health endpoints. **Browser-driven end-to-end coverage is not claimed.**

## Deployment and operations

Production runs behind Nginx and PM2. Merges to `main` trigger the GitHub Actions deployment workflow; after restart it checks HTTP readiness/liveness and attempts a code rollback if health checks fail. Environment secrets are configured on the server and in GitHub Actions, not committed to this repository.

```bash
curl -fsS http://127.0.0.1:5000/health/live
curl -fsS http://127.0.0.1:5000/health/ready
pm2 status
```

Health endpoints respond with `alive` (process serving HTTP) and `ready` (MongoDB available and not draining), respectively. The database is intended to bind to localhost only. Backups and restore operations are documented in [Production operations](docs/PRODUCTION.md).

## Security notes

- Admin routes use authenticated sessions and permission checks; login has rate limiting.
- Express uses Helmet, restricted CORS origins, and upload type/size verification.
- Only explicitly designated public media directories should be served under `/uploads`.
- External Instagram media and credentials require operational maintenance; cached media can remain visible even if a token has expired.
- Malware scanning is **not guaranteed to be enabled** in production. Treat uploaded files and backups as sensitive.

## Scope and maintenance

This is a focused portfolio application, not a general-purpose CMS or multi-tenant SaaS. Keep changes small, run the CI checks before merging, and verify health and public media after deployment. See [Production operations](docs/PRODUCTION.md) for the small runbook and known limitations.

## License

No open-source license is currently declared at repository level. Do not assume reuse rights for source code, images or artwork without permission.
