# Vercel Blob billing — FractiAI vs FractiVerse

## What we verified (repo + production)

| Check | Result |
|--------|--------|
| GitHub repo | `FractiAI/psw.vibelandia.sing13` |
| README / workflow target | Vercel team **FractiAI**, project **`psw-vibelandia-sing13`** |
| Production domain | `https://www.ssvibelandiaquestfest24x365.com` |
| `/api/catalog-upload` (no secret) | Returns **`unauthorized`** — not `catalog_upload_unconfigured` → Blob token **is** set on this deployment |
| Live catalog media host | `klep96o4e14lvmyd.public.blob.vercel-storage.com` |

**Conclusion:** This repository deploys to the **FractiAI** project. The billing email naming **fracti-verse** almost certainly refers to a **separate Vercel team** (legacy hobby / `aiwona1`) that still owns a **full Blob store** — not the Pro plan on FractiAI.

Blob quota is charged to the **team that owns the Blob store**, not automatically to whichever project is Pro.

---

## Step 1 — Confirm production team (2 minutes)

1. Open **[FractiAI → psw-vibelandia-sing13 → Settings → Git](https://vercel.com/fractiai/psw-vibelandia-sing13/settings/git)**  
   - Repository must be **`FractiAI/psw.vibelandia.sing13`**.  
   - If it shows another org/repo, disconnect and link the correct repo.

2. Open **production** deploy info (after next deploy with `/api/deploy-info`):

   ```text
   https://www.ssvibelandiaquestfest24x365.com/api/deploy-info
   ```

   Expect:

   - `vercel.matchesExpectedRepo`: `true`
   - `vercel.gitOwner`: `fractiai`
   - `catalog.blobSampleHost`: `klep96o4e14lvmyd.public.blob.vercel-storage.com` (or a **new** host after migration)

3. Vercel dashboard → team switcher (top-left):

   - **FractiAI** — should contain `psw-vibelandia-sing13` (Pro).
   - **fracti-verse** (or similar) — legacy team; this is where the 100% Blob email originates.

---

## Step 2 — Find which team owns the Blob store

On **FractiAI** project:

1. [Storage](https://vercel.com/fractiai/psw-vibelandia-sing13/stores) → open the Blob store connected to this project.  
2. Note the store name and whether the UI shows team **FractiAI**.

On **fracti-verse** team:

1. Dashboard → **Storage** → list Blob stores.  
2. If a store is at **100%** and contains `catalog/` objects, that is the account triggering the email.

If the **same** store ID (`klep96o4e14lvmyd`) appears only under fracti-verse, production on FractiAI is still using a token tied to the **hobby** store (shared or mis-linked). Fix in Step 3.

---

## Step 3 — Fix (choose one path)

### Path A — Free space on fracti-verse (stops email; keeps current URLs)

Only if you accept Blob staying on the hobby team for now:

1. Team **fracti-verse** → Storage → Blob store → browse `catalog/`.  
2. Delete duplicate uploads, old `.wav` tests, abandoned `trk-srv-*` files, and old manifest copies.  
3. Locally (token from that store):

   ```bash
   BLOB_READ_WRITE_TOKEN=<fracti-verse-store-token> node scripts/blob-storage-audit.mjs
   BLOB_READ_WRITE_TOKEN=<token> node scripts/blob-storage-audit.mjs --orphans --dry-run
   BLOB_READ_WRITE_TOKEN=<token> node scripts/blob-storage-audit.mjs --orphans
   ```

4. Do **not** delete `catalog/dynamic-catalog-v1.json` unless you intend to reset the dynamic catalog.

### Path B — Move Blob to FractiAI Pro (recommended)

1. **FractiAI** → `psw-vibelandia-sing13` → **Storage** → **Connect Store** → create a **new** Blob store on team FractiAI.  
2. Vercel injects a new `BLOB_READ_WRITE_TOKEN` on the project (Production + Preview).  
3. **Redeploy** production.  
4. Confirm `/api/deploy-info` shows a **new** `blobSampleHost`.  
5. Re-upload critical tracks via Bridge **Upload** tab (or run a migration script with both tokens).  
6. On **fracti-verse**, delete the old store or empty it so hobby quota drops below 100%.

### Path C — Retire fracti-verse entirely

1. Ensure no domains point to fracti-verse projects.  
2. Remove Git integrations on fracti-verse for `psw.vibelandia.sing13`.  
3. Delete unused projects and Blob stores on that team.  
4. Do **not** recreate the duplicate project documented in [README.md](../README.md) (`aiwona1` / FractiVerse).

---

## Step 4 — GitHub Actions (manual deploy only)

If you use [.github/workflows/vercel-deploy.yml](../.github/workflows/vercel-deploy.yml), secrets must be **FractiAI** IDs:

| Secret | Source |
|--------|--------|
| `VERCEL_TOKEN` | FractiAI team token |
| `VERCEL_ORG_ID` | FractiAI team ID |
| `VERCEL_PROJECT_ID` | `psw-vibelandia-sing13` project ID |

Wrong IDs deploy to the wrong team and can create stray Blob usage.

---

## Step 5 — Prevent refill

- Track **delete** in the Bridge now removes catalog media blobs when possible (see `deleteTrackMediaBlobs` in `lib/catalog-server.mjs`).  
- Prefer **MP3** over huge **WAV** uploads.  
- Run `blob-storage-audit.mjs` monthly on the **FractiAI** store token.

---

## Quick reference

| Resource | URL |
|----------|-----|
| FractiAI project | https://vercel.com/fractiai/psw-vibelandia-sing13 |
| Domains | https://vercel.com/fractiai/psw-vibelandia-sing13/settings/domains |
| Blob / Storage | https://vercel.com/fractiai/psw-vibelandia-sing13/stores |
| Deploy probe | https://www.ssvibelandiaquestfest24x365.com/api/deploy-info |
| Catalog API | https://www.ssvibelandiaquestfest24x365.com/api/catalog |

---

**NSPFRNP:** One production pipe — **FractiAI** team, **`psw-vibelandia.sing13`** project, Blob store owned by the same team as Pro billing.
