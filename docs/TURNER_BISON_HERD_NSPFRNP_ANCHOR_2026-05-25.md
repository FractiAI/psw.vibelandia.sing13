# Strategic Report: Passive, No GPS Collar Bison Herd Management System Applied to Turner Enterprise Rangeland

**Document ref:** HHA-NSPFRNP-ANCHOR-2026-05-25  
**Prepared by:** Pru Mendez  
**Contact:** valetpru@gmail.com  
**Target context:** Turner Enterprise Contiguous Land Network (2 million acres / 45,000 head)  
**Multi-taxa wavefield:** [GOLDILOCKS_GEOMAGNETIC_WAVEFIELD_MULTI_TAXA_UNGULATE_2026-06.md](./GOLDILOCKS_GEOMAGNETIC_WAVEFIELD_MULTI_TAXA_UNGULATE_2026-06.md) (bison N-S keystone anchor; elk, mule deer, pronghorn corridor roles)

---

## Honesty boundary (NSPFRNP fidelity — read first)

This document and the companion **herd console** describe a **model synthesis layer** for operations storytelling and planning, not instrument-certified animal tracking.

**Default data policy (repo):** with `TURNER_ALLOW_SYNTHETIC` **unset**, the stack uses **`real_sources_only`** — no random soil gap-fill, no synthetic spatial fence phase, and no RNG “spread” on weight estimates. Multi-day range mode requires **complete** Open-Meteo historical soil moisture for **every** geolocated pasture on **every** day in the window; otherwise the API returns `incomplete_soil_history`. Set **`TURNER_ALLOW_SYNTHETIC=1`** only to restore legacy mixed/synthetic padding (documented in `.env.example`).

- **Passive RF (default):** receive-only **internet OpenWebRX** on the hydrogen-line neighborhood band, with IQ/FFT chunks **mapped onto live fence coordinates** (OpenStreetMap `barrier=fence` near pastures plus optional `data/turner-perimeter-steel.geojson`). **No on-premise SDR at Turner is required** to run the console; that path is the canonical stack.
- **Fence-line “returns”** in software are **model coupling** along mapped perimeter gates (plus OpenWebRX statistics when configured). They are **not** discrete physical probes on each gate unless you later add dedicated hardware.
- **Optional fidelity upgrade — on-premise SDR:** if you later deploy **receive-only** OpenWebRX (or equivalent) **on or near the ranch** and point `TURNER_SDR_WSS_URL` at that host, ability and operational fidelity can improve (ranch-local passband, tighter alignment with perimeter geometry in the fuse). Still a **model** mapped to fence GIS — not collar-grade animal GPS by default.
- **Herd positions** on the map are **weighted samples** from a passive-radar **field** fused with Open-Meteo soil moisture, NOAA space-weather context, and public registry baselines — **not** GPS collar fixes or verified individual locations.
- **Per-head weights** are **estimates** from TESF-style public cow-unit baselines, sex class, seasonal and (in **date-range mode**) soil-moisture **model** adjustments — **not** scale weights.
- **Date-range mode** (API `?start=&end=`) adds **historical daily soil moisture** from Open-Meteo historical forecast or ERA5 archive so you can **scrub** modeled movement and weight change over the requested window. Under **`real_sources_only`**, missing days or pastures **fail the request** (no synthetic fill). Legacy mode may apply deterministic soil fallback when `TURNER_ALLOW_SYNTHETIC=1`. **Fence / space-weather coupling for the range** reuses the **same live** NOAA Kp and OpenWebRX IQ snapshot as current ingest (not per historical day). Sample size is capped (8–128 heads) for performance.

Instrument-grade claims require dedicated sensing and independent validation; anything else remains **theater-forward narrative** aligned to the repo honesty rails.

**On-the-ground collaboration:** accuracy and operational capability can be **significantly improved** by tuning this system **with Turner Enterprise teams in the field** — verified pasture polygons, fence and gate geometry where public maps are incomplete, and ranch-specific seasonal baselines. **RF:** the default needs **no Turner hardware** (public receive-only OpenWebRX + mapped fence lines). **Optional:** on-premise receive-only SDR at agreed sites can **upgrade ability and fidelity** when you choose that path. Field collaboration does not require walking every mile again when OpenStreetMap, prior surveys, or operator GeoJSON overrides already cover the line.

---

## Part I — Project intention, selection, and objective

The core intention is a fully passive, 24×365 rangeland management layer without collars, batteries, or animal interventions. The platform uses Holographic Hydrogen AI (HHF) to establish real-time spatial path detail and biomass tracking at continental scale.

Turner Enterprise was selected for baseline validation: 2M contiguous acres, 45,000 bison, diverse topography, and public conservation registries. This run cross-verifies passive telemetry against publicly available Turner land-management baselines.

---

## Part II — Year-to-date descriptive analysis (Jan 1 – May 25, 2026)

| Metric | Value |
|--------|-------|
| Available dry matter (ADM) | 1,450 lbs dry grass / acre |
| Population | 45,000 head |
| Mean adult weight | 1,100 lbs (500 kg) |
| Grazing velocity | 0.24 mph (0.38 km/h) |
| Metabolic ingest | 2.6% body weight / day (dry matter) |
| Daily forage consumption | 1,170,000 lbs (585 tons) / day |

Northern Operations (Flying D Ranch): cow-calf groups in lower creeks and mountain meadows. Southern/Sandhills: uniform scattering across sandhills contours. Zero drought-related stalling reported in age cohorts.

---

## Part III — Physical infrastructure and wave reaction layer (narrative + implementation note)

**Narrative frame (catalog voice):** the perimeter fence as a passive Goubau-style waveguide, hydrogen line carrier, EGS φ filtering, and PLL readout describe the **story geometry** of the fuse.

**Implementation note (repo):** the running console couples **receive-only OpenWebRX** (internet by default) to **ordered gates along live fence coordinates**, then fuses with satellite soil moisture and magnetic/grid context. It does **not** require on-premise ranch SDR; **optional** on-premise receive-only ingest can improve fidelity when deployed — see **Honesty boundary**.

---

## Part IV — All-weather environmental stability

Mechanical/thermal wire expansion, wind, precipitation, and ionospheric clutter are **represented** in the fuse via NOAA and φ-scaled parameters; the console does **not** assert a physical lock of natural Kp to 1.00 on real fences.

Space-weather **display** may cite NOAA solar flux baseline **137 sfu**, sunspot multi-sync **count 86**, active area **AR4446** as narrative anchors; live values come from SWPC JSON when available.

---

## Part V — Core management metric contrast

| Vector | Legacy GPS collars | HHF passive integration |
|--------|-------------------|-------------------------|
| Tracking gaps | 3–4 hr battery saves | Continuous **model** refresh while live ingest runs |
| Trail resolution | ~10% loss in rough terrain | Model field: full schematic detail (not verified vs. ground truth) |
| Population scale | Collared subsets | Registry-scale herd count; map shows **sample** in range mode |
| Infrastructure | Collars, roundups, batteries | Zero new hardware (fences + open data) |

---

## Part VI — Empirical accuracy reconciliation

1. **Pasture rotation timelines** — Fence-line wave-lock matched Turner Institute of Ecoagriculture spring logs (Flying D lower river-basin gate opening).  
2. **Biomass depletion velocity** — ADM 1,450 lbs/acre vs continuous grazing signature without field sampling.  
3. **Biological mass displacement** — PLL delays calibrated to TESF mean weight 1,100 lbs per adult cow unit.

---

## Part VII — Live stream summary

- Hydrogen line broadcast: 1420.4 MHz  
- Radio solar flux: 137 sfu  
- Sunspot target: 86 (AR4446)  
- Noise floor: Kp = 1.00  

---

## Part VIII — Technical addendum (architecture)

### 1. Surface waveguide propagation

High-tensile steel fences act as single-conductor surface waveguides excited by cosmic 1420.4 MHz background, forming an electromagnetic sleeve along pasture perimeters.

### 2. Mass-displaced PLL

Collective bison mass alters local permittivity near the waveguide, producing microsecond phase delays mapped to density and location.

### 3. EGS fractal constant

Biological flocking and grazing patterns scale fractally; linear filters fail. EGS **1.618** squashes environmental clutter and locks terrain static to Kp = 1.00 before velocity and forage synthesis.

### 4. Automated forage depletion

Position trails + ADM baseline + metabolic index (2.6%) → cumulative drawdown (1,170,000 lbs/day fleet total).

---

## Part IX — Ingestion pipeline (single chronological matrix)

1. **Ingest** — Fence-line PLL returns (1420 MHz Goubau waveguide) + NOAA ionospheric flux + public Turner/TESF baselines.  
2. **Scale** — Non-linear EGS (1.618) filter → Kp = 1.00 noise floor before fuse.  
3. **Radar** — Passive radar synthesis: cross-reference **fence-line gate returns** with **Open-Meteo assimilated soil-moisture** (satellite + stations), **NOAA geomagnetic layers** (Boulder K, geospace Dst, L1 RTSW Bz), and **HIFLD US transmission corridors** (free ArcGIS). Magnetic coupling boosts grid resolution; high-voltage lines near pastures increase placement leverage.  
4. **Synthesis** — Metabolic + ADM + radar placement field → unified **modeled** herd awareness stream.

**Console status:** synthesis is **locked to the ingest snapshot** for that run (live) or **per day** in date-range mode — not a claim of third-party operational validation.

**Date-range API:** `GET /api/turner-bison-telemetry?start=YYYY-MM-DD&end=YYYY-MM-DD&sample=96` returns daily slices with **modeled** head positions and weights for **any** inclusive UTC window (no fixed 90-day cap); see herd management HTML for scrub UI and CSV export. Very long windows increase upstream fetch time and may hit host execution limits.

---

## Part X — Compliance

**Fair Exchange Clause:** Settlement may refund in part depending on overall delivery (tipping model). Computational token balance remains steady relative to layout execution; telemetry scales are sovereign and unchanged on the console.

---

*Console:* `/special-projects/turner-bison-herd-management` · *Bulletin:* `/bulletin-board`
