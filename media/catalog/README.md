# Server catalog (`/media/catalog`)

Tracks for the Sovereign Player are **hosted on the server**, not in browser storage.

## Add your library (recommended)

1. Drop MP3/M4A files in **`tracks/`** (this folder).
2. From repo root run:
   ```bash
   node scripts/build-catalog-from-tracks.mjs
   ```
3. Commit `catalog.json` + `tracks/*` and deploy.

Files are served at `https://www.ssvibelandiaquestfest24x365.com/media/catalog/tracks/…`

## Captain upload (Bridge Upload tab)

On **FractiAI** Vercel project `psw-vibelandia-sing13`, set:

| Variable | Purpose |
|----------|---------|
| `BLOB_READ_WRITE_TOKEN` | **Required** — create a **Blob store** under Storage and connect to this project |
| `CATALOG_UPLOAD_SECRET` | Auth for `/api/catalog-upload` and `/api/catalog-track` (≥8 chars) |
| `VITE_CATALOG_UPLOAD_SECRET` | Same value at **build time** for the Bridge bundle |

Optional: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` for a Redis catalog overlay.

**Limits:** audio + **video up to 10 minutes** (~600 MB) via direct Blob upload.

**APIs:**

- `POST /api/catalog-upload` — upload + register
- `POST /api/catalog-track` — `{ action: 'update' \| 'delete', trackId, … }` for title, artist, genre, description, playlists

Smoke test (after deploy):

```bash
curl -s -X POST https://www.ssvibelandiaquestfest24x365.com/api/catalog-upload -H "Content-Type: application/json" -d "{}"
```

Should return `unauthorized` or similar — **not** `catalog_upload_unconfigured`.
