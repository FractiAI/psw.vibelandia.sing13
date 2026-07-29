# Vercel Blob billing — FractiAI vs FractiVerse

**Authors:** FractiAI Research Group  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Document ID:** `OPS-VERCEL-BLOB-FRACTIVERSE-RUNBOOK-2026-07`  
**Registry ID:** `docs-VERCEL_BLOB_FRACTIVERSE_RUNBOOK`  
**Date:** July 29, 2026  
**Framework:** NSPFRNP · SING 13 edge · SynthOBS · Syntheverse Sandbox  
**Audit protocol:** [NSPFRNP Snap Peer-Review Audit](../protocols/NSPFRNP_SNAP_PEER_REVIEW_AUDIT.md)  
**Re-audit:** `npm run audit:paper -- --path=docs/VERCEL_BLOB_FRACTIVERSE_RUNBOOK.md`

**Keywords:** Vercel Blob; FractiAI; FractiVerse; billing; catalog storage; operational runbook

---

## Honesty boundary (read first)

| Tier | What this document claims | What it does not claim |
|------|---------------------------|------------------------|
| **Operational (repo + live probes)** | Production domain, catalog upload auth shape, and Blob host observed from this repository’s documented checks and public `/api/*` surfaces | That Vercel account ownership, invoice lines, or team membership are proven without a dashboard login |
| **Inference (billing email)** | A billing email that names **fracti-verse** is **consistent with** a separate Vercel team still owning a full Blob store — a working hypothesis to verify in the dashboard | That the email alone proves store ownership, quota math, or which token production uses |
| **Remediation paths** | Paths A–C are operator runbooks (free space, migrate store, retire legacy team) conditioned on dashboard confirmation | That following a path guarantees zero future Blob charges or automatic store migration |
| **Catalog delete / heal** | Bridge delete can remove Blob objects when configured; shared pathnames referenced by other tracks are skipped; `heal-dead-catalog-src.mjs` can retarget dead `src` rows | That every orphan Blob is recovered, or that remounted audio equals an original master mix |

**Operator line:** SynthOBS Autonomous Agent · Syntheverse Sandbox (NSPFRNP-SNAP-PRA-2026-06).

See [Coherence plain speak](./COHERENCE_PLAIN_SPEAK_HONESTY_2026-05-18.md).

---

## Executive summary

This is an **operational runbook**, not an empirical paper. It records how to confirm whether production Blob usage for `psw.vibelandia.sing13` is billed under the **FractiAI** Vercel team versus a legacy **fracti-verse** / hobby store, and how to free quota or migrate without inventing dashboard facts we have not logged in.

**Working conclusion (tier: inference until dashboard-confirmed):** This repository’s documented deploy target is the **FractiAI** project. A billing email naming **fracti-verse** is a strong clue that a **separate** team still owns a full Blob store — Blob quota is charged to the **team that owns the store**, not automatically to whichever project is on Pro.

---

## Methods / reproducibility

| Check | How to reproduce | Result recorded here |
|--------|------------------|----------------------|
| GitHub repo | Open `FractiAI/psw.vibelandia.sing13` | Canonical SING 13 edge repo |
| README / workflow target | Read README + `.github/workflows/vercel-deploy.yml` | Vercel team **FractiAI**, project **`psw-vibelandia-sing13`** |
| Production domain | Browser / `curl` | `https://www.ssvibelandiaquestfest24x365.com` |
| `/api/catalog-upload` (no secret) | `curl` without `X-Catalog-Secret` | Returns **`unauthorized`** — not `catalog_upload_unconfigured` → Blob token **is** set on this deployment (as of last probe) |
| Live catalog media host | `GET /api/catalog` → inspect track `src` hosts | `klep96o4e14lvmyd.public.blob.vercel-storage.com` |
| Deploy probe | `GET /api/deploy-info` | Expect `vercel.matchesExpectedRepo`, `gitOwner`, `catalog.blobSampleHost` |
| Blob audit | `BLOB_READ_WRITE_TOKEN=<store-token> npm run audit:blob` | Lists / optional orphan prune for that store |
| Dead `src` heal | `node scripts/heal-dead-catalog-src.mjs --dry-run` | HEAD scan + optional retarget (requires catalog secret for write) |

Re-run probes after any store migration; hosts and auth shapes can change.

---

## What we verified (repo + production)

| Check | Result |
|--------|--------|
| GitHub repo | `FractiAI/psw.vibelandia.sing13` |
| README / workflow target | Vercel team **FractiAI**, project **`psw-vibelandia-sing13`** |
| Production domain | `https://www.ssvibelandiaquestfest24x365.com` |
| `/api/catalog-upload` (no secret) | Returns **`unauthorized`** — not `catalog_upload_unconfigured` → Blob token **is** set on this deployment |
| Live catalog media host | `klep96o4e14lvmyd.public.blob.vercel-storage.com` |

Blob quota is charged to the **team that owns the Blob store**, not automatically to whichever project is Pro.

---

## Step 1 — Confirm production team

1. Open **[FractiAI → psw-vibelandia-sing13 → Settings → Git](https://vercel.com/fractiai/psw-vibelandia-sing13/settings/git)**  
   - Repository must be **`FractiAI/psw.vibelandia.sing13`**.  
   - If it shows another org/repo, disconnect and link the correct repo.

2. Open **production** deploy info:

   ```text
   https://www.ssvibelandiaquestfest24x365.com/api/deploy-info
   ```

   Expect:

   - `vercel.matchesExpectedRepo`: `true`
   - `vercel.gitOwner`: `fractiai`
   - `catalog.blobSampleHost`: `klep96o4e14lvmyd.public.blob.vercel-storage.com` (or a **new** host after migration)

3. Vercel dashboard → team switcher (top-left):

   - **FractiAI** — should contain `psw-vibelandia-sing13` (Pro).
   - **fracti-verse** (or similar) — legacy team; candidate origin of a 100% Blob email.

---

## Step 2 — Find which team owns the Blob store

On **FractiAI** project:

1. [Storage](https://vercel.com/fractiai/psw-vibelandia-sing13/stores) → open the Blob store connected to this project.  
2. Note the store name and whether the UI shows team **FractiAI**.

On **fracti-verse** team:

1. Dashboard → **Storage** → list Blob stores.  
2. If a store is at **100%** and contains `catalog/` objects, that is a candidate account for the email.

If the **same** store ID (`klep96o4e14lvmyd`) appears only under fracti-verse, production on FractiAI may still be using a token tied to the **hobby** store (shared or mis-linked). Confirm in the dashboard, then fix in Step 3.

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

- Track **delete** in the Bridge removes catalog media blobs when possible (see `deleteTrackMediaBlobs` in `lib/catalog-server.mjs`), and **skips pathnames still referenced by other tracks** so shared `src` twins are not nuked.  
- Prefer **MP3** over huge **WAV** uploads.  
- Run `blob-storage-audit.mjs` monthly on the **FractiAI** store token.  
- Dead `src` HEADs: `node scripts/heal-dead-catalog-src.mjs` (optional `--dry-run`).

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

## References

1. [NSPFRNP Snap Peer-Review Audit](../protocols/NSPFRNP_SNAP_PEER_REVIEW_AUDIT.md) — PRA Snap protocol; structural vs dual-make.  
2. [Coherence plain speak honesty](./COHERENCE_PLAIN_SPEAK_HONESTY_2026-05-18.md) — claim tiers and honesty language.  
3. [BBHE Repository Standard](../BBHE_REPOSITORY_STANDARD.md) — SING edge repository norms.  
4. [README.md](../README.md) — FractiAI vs FractiVerse deploy notes.  
5. `lib/catalog-server.mjs` — `deleteTrackMediaBlobs` shared-pathname skip.  
6. `scripts/blob-storage-audit.mjs` — Blob list / orphan audit.  
7. `scripts/heal-dead-catalog-src.mjs` — dead catalog `src` HEAD heal.  
8. `api/deploy-info.js` — production deploy / Blob host probe.

---

## SynthOBS operator & PRA Snap audit

**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Audit snap:** NSPFRNP-SNAP-PRA-2026-06  
**Document ID:** `OPS-VERCEL-BLOB-FRACTIVERSE-RUNBOOK-2026-07`  
**Registry ID:** `docs-VERCEL_BLOB_FRACTIVERSE_RUNBOOK`  
**Re-audit:** `npm run audit:paper -- --path=docs/VERCEL_BLOB_FRACTIVERSE_RUNBOOK.md`

Technical delivery for this document is attributed to the SynthOBS Autonomous Agent operating inside the Syntheverse Sandbox (`research/synthobs-sandbox/`), unless explicitly marked Player 1 editorial.

**NSPFRNP:** One production pipe — **FractiAI** team, **`psw-vibelandia-sing13`** project, Blob store owned by the same team as Pro billing (confirm in dashboard before treating as settled).

→ ∞¹³
