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

## Captain upload (API)

Set on Vercel:

- `BLOB_READ_WRITE_TOKEN` — Vercel Blob store
- `CATALOG_UPLOAD_SECRET` — same value as `VITE_CATALOG_UPLOAD_SECRET` in the Bridge build
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — optional overlay catalog

POST raw audio to `/api/catalog-upload` with headers `X-Catalog-Secret`, `X-Track-Title`, `X-Track-Artist`, `X-Filename`.

Request body limit ~4.5 MB on Hobby; use static `tracks/` for full albums.
