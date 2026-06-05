# Turner Enterprise — Response to Dr. Carter Kruse (one-pager + email draft)

**From:** Pru Mendez · valetpru@gmail.com  
**Re:** Passive bison herd console · honesty · security · optional collaboration  
**Companion:** [TURNER_BISON_HERD_NSPFRNP_ANCHOR_2026-05-25.md](./TURNER_BISON_HERD_NSPFRNP_ANCHOR_2026-05-25.md) · [GOLDILOCKS_GEOMAGNETIC_WAVEFIELD_MULTI_TAXA_UNGULATE_2026-06.md](./GOLDILOCKS_GEOMAGNETIC_WAVEFIELD_MULTI_TAXA_UNGULATE_2026-06.md) · live console (see below)

---

## Email draft (send as-is or trim)

**Subject:** Passive rangeland console — what it is today, what it is not, optional pilot

Dr. Kruse,

Thank you for the candid note. Your skepticism is appropriate: **we are not offering live GPS on every animal without collars**, and **we do not require you to install hardware on Turner land to evaluate the idea.**

**What we built** is a **receive-only, public-data fusion layer** for operations planning and storytelling: pasture-scale soil and surface signals (Open-Meteo, NASA POWER), space-weather context (NOAA SWPC), mapped **fence geometry** (OpenStreetMap near pastures, with optional operator corrections), and **receive-only radio** on the hydrogen-line neighborhood band via **internet OpenWebRX** — spectral statistics **mapped along your perimeter in software**, not a discrete sensor on each gate. Herd dots on the map are a **weighted field** over pastures, cross-checked across those families. They are **not** collar fixes, scale weights, or certified individual locations.

**What we do not claim today**

- Per-animal, 24×365 GPS replacement without animal-borne tech  
- “No guessing” or instrument-grade tracking without independent validation  
- That a public internet receiver is physically on your fence wire (it is **coupled to your mapped fence lines in the model**)

**What can improve accuracy with Turner collaboration (no hardware required to start)**

- Verified pasture polygons and fence/gate GIS where public maps are thin  
- Ranch-specific seasonal baselines and which signals to weight per unit  
- Optional **receive-only radios on the ranch** (same software path as today) only if you later want **higher RF fidelity** — an upgrade, not a prerequisite  

**Security**

- You do not need to click unfamiliar links to discuss this. I can send this summary as **PDF**, walk through it on a **scheduled call**, or meet through a channel Turner prefers.  
- The public demo URL is optional; treat it like any external site until your IT/security team is comfortable.

**Minimal pilot (if useful)**

- One agreed pasture or management unit  
- 30 days: compare modeled pasture stress / placement narrative to your ground truth (rotation notes, visual range checks, or a **small collared subset** if you already have one — collars are for **calibration**, not required to run the console)  
- Pass/fail on usefulness for planning, not on replacing your herd program  

I am happy to correct any overstatement in prior mail. The honest frame is: **public remote sensing + mapped fence + passive RF statistics → fused model**; instrument-grade herd tracking would require dedicated sensing and validation we have not claimed.

Respectfully,  
Pru Mendez  
valetpru@gmail.com

**Optional live reference (external):**  
https://www.ssvibelandiaquestfest24x365.com/special-projects/turner-bison-herd-management

---

## At a glance

| Topic | Today (default) | With Turner collaboration | Optional upgrade |
|--------|-----------------|---------------------------|------------------|
| Animal position | Modeled field over pastures; sample on map in range mode | Better polygons, fence truth, seasonal weights | Collar subset for calibration studies only |
| Weights | Public registry + model adjustments | Ranch baselines | Scale weights if you provide validation windows |
| RF / “fence listen” | Internet **receive-only** OpenWebRX + **live fence coordinates** | Fence/gate GIS corrections | **On-premise receive-only SDR** → higher ability/fidelity (same ingest URL) |
| Hardware on Turner land | **Not required** | Geo + operational data | Receive-only SDR only if you choose |
| Data policy | `real_sources_only` (no synthetic soil fill by default) | Same + your overrides | Same |

---

## Passive RF (plain language)

1. **Default:** A public **receive-only** online radio feed (~1420 MHz neighborhood) supplies real FFT/IQ statistics. The server **maps** those statistics onto **ordered gates** along **your fence lines** from OpenStreetMap (and optional GeoJSON overrides). **No ranch radio box is required.**

2. **Fence coordinates:** Improve **where** coupling applies on the map. They do not magically move the internet receiver onto your wire; they align the **model** to your perimeter.

3. **Optional on-premise SDR:** If Turner later places **receive-only** OpenWebRX (or equivalent) **on or near the ranch** and shares a `wss://` ingest endpoint, **ability and operational fidelity can improve** (ranch-local passband). Still a **model** fused to fence GIS — not automatic collar-grade GPS.

---

## Fidelity labels on the console (do not confuse)

- **Fuse %** — How complete the **feed channels** are (can reach 100%). Not “we know where every animal is.”  
- **Collar proximity %** — Honest **operational grade toward collar GPS** (capped in software without collars).  
- **Individual animal proximity %** — Even lower cap without per-head sensing.

---

## Irreducible minimum pilot

1. One pasture / unit name Turner recognizes  
2. Your fence or pasture outline (existing GIS, walk, or OSM + corrections)  
3. 30-day window: your notes vs. console pasture-level narrative  
4. Optional: small collared comparison set in that unit only  

**Success criterion:** Useful for **planning and rotation conversation**, not certified inventory or legal traceability.

---

## What we are not asking you to do

- Install collars for us  
- Install SDR hardware to **start** the conversation  
- Click unvetted links without IT review  
- Accept “live feed of every bison” language from earlier drafts  

---

## Internal reference (repo)

- Honesty anchor: `docs/TURNER_BISON_HERD_NSPFRNP_ANCHOR_2026-05-25.md`  
- Console: `interfaces/special-projects/turner-bison-herd-management.html`  
- Env: `.env.example` (`TURNER_SDR_*`, `TURNER_ALLOW_SYNTHETIC`)  

---

*NSPFRNP fidelity · default = internet OpenWebRX + mapped fence · optional on-premise receive-only SDR upgrades ability when deployed · → ∞¹³*
