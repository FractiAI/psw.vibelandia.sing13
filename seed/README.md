# Seed Kit — fork your own edge in one read

**This folder is the whole point.** Take it, and you have a working BBHE/NSPFRNP edge of your own: an onboarding file any AI can boot from, an executive prompt that fills the middles, a blank catalog, and a deploy config. Seed = your origin. Edge = your experience. You fill the middle.

> Golden age rules: clean, simple, plain, irreducible minimum. Not too much, not too little — **Goldilocks**.

## Fork in five moves

1. **Copy this folder** into a new repository (or fork the whole repo and delete what you don't need).
2. **Rename and fill `EDGE_ONBOARDING.template.md`** → `YOURNAME_EDGE_ONBOARDING.md` at your repo root. This is the single file any human or AI reads to get up to speed. Keep it under one screen.
3. **Write your executive prompt** in `EXECUTIVE_PROMPT.template.md` — the abstract of *how to fill the space between your Seed and your Edge*. Same Seed, same Edge, same prompt → a new fractal middle every run.
4. **Seed your catalog** in `catalog.template.json` — tracks, papers, episodes, whatever your edge carries. Each entry is a Seed:Edge pair: origin, experience, and the story/license that travels with it.
5. **Deploy** with `vercel.template.json` (rename to `vercel.json`) — static surfaces + lite serverless. Push to main; autodeploy ships it.

## The three laws (irreducible)

| Law | Meaning |
|-----|---------|
| **Single edge file** | One read = full context. No file-tree archaeology required. |
| **Lite edges** | Wallets, keys, verifications, session state live at the edge (browser, device, wallet). Center = pipes only. No mandatory central database. |
| **Executive prompts fill middles** | Document the prompt; let AI, team, or Generator Motor fill the space between Seed and Edge — fidelity locked by the prompt, freedom in the middle. |

## Voice tiers (honesty rail)

Mark every surface and claim with its register so readers always know what they're holding:

- 🜛 **mythic** — narrative, story geometry, metaphor-forward
- ⚙ **operational** — working software, reproducible commands, live surfaces
- 📐 **verified** — math, audits, kernel witnesses, bench evidence

Shared badge styles: `interfaces/voice-tier.css` on the parent edge.

## Connect back

- Parent edge (this repo): `github.com/FractiAI/psw.vibelandia.sing13` · live at `www.ssvibelandiaquestfest24x365.com`
- Open music manifest (syndicate the Hit Factory catalog): `GET https://www.ssvibelandiaquestfest24x365.com/api/catalog`
- Catalog spine and protocols: `protocols/MCA_NSPFRNP_CATALOG.md` · `BBHE_REPOSITORY_STANDARD.md`
- Layer admission rule (before you add a new layer): `protocols/NEST_LAYER_ADMISSION_RULE_NSPFRNP.md`

**NSPFRNP ⊃ Seed Kit ⊃ Seed:Edge ⊃ your new edge → ∞¹³**
