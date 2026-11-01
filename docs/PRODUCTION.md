# Production operations — Origami Alfredo

This runbook documents the deployment shape visible in the repository and operational checks performed against the DigitalOcean droplet. It is not a guarantee that every infrastructure setting remains unchanged.

## Topology

Browser → HTTPS/Nginx → Vue static build and `/api`, `/uploads` reverse proxy → Express on `127.0.0.1:5000` → MongoDB on `127.0.0.1:27017`.

Production application root: `/home/app/app`. PM2 process: `origami-app`. Uploaded media and MongoDB backups are runtime data; do not replace or erase them during deployment.

## CI/CD and rollback

`.github/workflows/deploy-production.yml` runs after pushes/PRs to `main`. The `build` job installs dependencies with `npm ci`, executes backend tests and production-only audits, and builds the client. The `deploy` job only runs after a successful build and outside PR events; it deploys over SSH and performs `ops/deploy-smoke.sh` after PM2 restart.

The workflow attempts a Git-revision rollback if readiness fails. This is **not** an atomic deployment, nor a database rollback. It currently uses `git reset --hard` on the deployment working tree; never make uncommitted edits in that directory. Review the Actions logs to confirm that the smoke check ran; a green local HTTP test alone does not prove the workflow executed.

Check after deployment:

```bash
pm2 status
curl -fsS http://127.0.0.1:5000/health/live
curl -fsS http://127.0.0.1:5000/health/ready
pm2 logs origami-app --lines 80 --nostream
```

Also verify the public home/gallery/events pages and one authenticated admin flow.

## Environment and secrets

Store `server/.env` on the server with restrictive permissions. Minimum required settings: `MONGO_URI`, `JWT_SECRET` (at least 32 characters) and `CLIENT_ORIGIN`. `PORT` and `HOST` control the HTTP bind. Copy `server/.env.example` and provide appropriate integration credentials. Never paste raw database URIs, passwords or access tokens into tickets, CI logs or public documentation. Rotate any credential that has previously been exposed.

## MongoDB network and backups

The observed production MongoDB instance listened on `127.0.0.1:27017`, with UFW denying inbound traffic by default and permitting SSH/HTTP/HTTPS only. Recheck after infrastructure changes.

A manual `mongodump --gzip --archive` backup was restored successfully to **a separate temporary MongoDB instance on port 27018**: 8 collections and 197 documents, with no restore failures at the time of testing. That verified one snapshot, not future backup health.

The operational cron entry is currently:

```cron
30 2 * * * /home/app/backups/mongodb-backup.sh >> /home/app/backups/mongodb-backup.log 2>&1
```

The host uses UTC, so this executes at **02:30 UTC**, not 02:30 Budapest time. The server-side script retains the 7 newest `daily-*.archive.gz` files; manually created `manual-*` archives are outside that cleanup rule. These server-side settings are **not provisioned automatically by the GitHub deployment**. The separate repository scripts in `ops/` are operational examples and may use different naming or retention policies.

Verify cron and recent backups:

```bash
systemctl is-active cron
crontab -l
ls -lh /home/app/backups/mongodb/
tail -n 30 /home/app/backups/mongodb-backup.log
```

**Important remaining risk:** backups stored only on the same droplet do not survive complete machine/disk loss. Arrange a separate encrypted off-host copy (for example object storage with restricted credentials, versioning and retention), then validate a restore from that copy. Limit access: the database backup contains admin and integration information.

For any restore rehearsal, use a **separate isolated MongoDB instance**. Never use `--drop` or a production connection string for an unreviewed restore. Stop and remove only the temporary test instance after checking collection and document counts.

## Monitoring and incident notes

- `/health/live`: process responding; does **not** prove DB health.
- `/health/ready`: returns 503 if database is disconnected or shutdown is in progress.
- PM2 `↺` is cumulative. Investigate an increasing counter, not merely a nonzero one.
- Instagram startup sync can report `fromCache=true`; that does **not** prove fresh external media downloads or token validity.
- Old Instagram authorization errors in logs should be tracked separately from deployment success.
- Host security updates and a reboot should be applied in a planned maintenance window with backup and post-restart health checks.

## Known limitations / deliberate scope

- Production malware scanning (ClamAV) is not established as active.
- The repository currently does not demonstrate a browser-driven admin E2E test suite.
- The backup schedule and credentials are currently managed outside Git; no automatic off-site backup is demonstrated.
- Some client performance enhancements (e.g. route-level dynamic imports) should be verified against the current source before claiming they are implemented.
