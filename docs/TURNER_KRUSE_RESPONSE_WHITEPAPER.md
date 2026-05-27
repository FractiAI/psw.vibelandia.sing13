# White Paper: Passive, No-Collar Bison Herd Awareness Layer for Turner Enterprise Rangelands

**Document:** HHA-TURNER-WP-2026-05-26  
**Prepared for:** Dr. Carter Kruse and Turner Enterprise leadership  
**Prepared by:** Pru Mendez  
**Contact:** valetpru@gmail.com  
**Classification:** External — technical background and honesty disclosure  

---

## Executive summary

Turner Enterprise operates roughly **two million contiguous acres** and on the order of **45,000 bison** across diverse rangeland. Conventional herd awareness at that scale has historically depended on **GPS collars**, **roundups**, **batteries**, and **collared subsets**—all costly, invasive, and incomplete at full-population scale.

We have built a **passive, receive-only fusion console** that combines **public remote sensing**, **space-weather context**, **mapped perimeter geometry**, and **internet radio statistics** in the hydrogen-line neighborhood band (~1420 MHz) to produce a **continuous modeled awareness layer** for **pasture-scale planning**—not instrument-certified per-animal tracking.

**Important honesty points up front:**

- This is a **model synthesis system**, not a replacement for collars, scales, or Turner’s operational ground truth unless independently validated.
- **No hardware on Turner land is required** to run or evaluate the default stack.
- **Optional** receive-only radios on the ranch can **upgrade RF fidelity** later; they are not a prerequisite.
- Prior language implying “live GPS on every animal without technology” was **overstated**; this document corrects that record.

Optional public demo (treat as any external site until IT review):  
https://www.ssvibelandiaquestfest24x365.com/special-projects/turner-bison-herd-management

---

## 1. Why Turner, why now

Turner was selected as a reference landscape because of:

- Scale and continuity of operations (continental rangeland network)  
- Public conservation and land-management registries usable as **baselines**, not as live animal telemetry  
- Existing high-tensile perimeter infrastructure that can be **represented** in a passive “fence-line” fuse  
- Operational need for **24×365 pasture awareness** without adding animal-borne devices at full herd scale  

The goal is not to discredit Turner’s existing programs. The goal is to offer an **additional planning layer** built only from **open or receive-only inputs**, with explicit limits on what can be inferred without collars or ranch-private data.

---

## 2. The problem we address

| Challenge at Turner scale | Conventional approach | Limitation |
|---------------------------|----------------------|------------|
| Full-herd position | GPS collars on subsets | Batteries, loss, handling, incomplete coverage |
| Pasture stress / forage | Spot surveys, models | Lag, labor, weather gaps |
| Perimeter awareness | Riders, gates, notes | Not continuous at 2M acres |
| Weight / condition | Scale, visual class | Sparse, episodic |

Our layer targets **pasture-scale continuity** and **cross-source agreement** (soil surface, RF statistics mapped to fence, magnetic/grid context, registry baselines)—while **not** claiming collar-grade fixes on every head.

---

## 3. What the solution is (one paragraph)

The **Passive, No GPS Collar Bison Herd Management System** is a **server-side fusion pipeline** and **web console** that:

1. Ingests **live public feeds** (NOAA space weather, Open-Meteo soil moisture and optional leaf-area index, NASA POWER land-surface temperature proxy, geomagnetic indices, HIFLD transmission context where relevant).  
2. Pulls **receive-only OpenWebRX** IQ/FFT/demod buffers from the **internet** (~1420 MHz neighborhood), chunks spectral energy, and **maps** it onto **ordered gates** along **live fence coordinates** (OpenStreetMap `barrier=fence` near each pasture, plus optional operator GeoJSON overrides).  
3. Runs a **passive radar-style fuse** that weights plausible herd placement within pastures when multiple families agree.  
4. Displays **registry-scale population context** (published baselines) with **sampled** map dots in long date-range mode for performance—not all 45,000 individuals rendered at once.  

Everything dynamic is **remote API or receive-only radio** under default policy **`real_sources_only`**: no random soil gap-fill, no fabricated spatial “sin phase” on gates, no random spread on weight estimates unless legacy mode is explicitly enabled on the server.

---

## 4. What the solution is not

We do **not** claim:

- Per-animal, 24×365 GPS locations without animal-borne sensors  
- Scale-accurate weights without scale validation  
- That a public internet receiver is physically installed on Turner’s fence wire  
- “No guessing” or legal/traceability-grade inventory  
- That **fuse completeness %** equals **animal truth %** (see Section 8)  

Instrument-grade herd tracking would require **dedicated sensing**, **Turner-private operational data**, and **independent validation**—a path we describe as collaboration, not as today’s default deliverable.

---

## 5. Architecture (plain language)

### 5.1 Data flow

```
Public APIs (NOAA, Open-Meteo, NASA POWER, geomagnetic, HIFLD)
        +
Internet receive-only OpenWebRX (~1420 MHz band statistics)
        +
Mapped fence lines (OSM + optional Turner GeoJSON)
        ↓
Passive radar fuse + multi-source cross-reference
        ↓
Pasture-level placement field + registry-based weight estimates
        ↓
Herd management console (map, metrics, optional date-range scrub)
```

### 5.2 Pipeline stages (chronological)

| Stage | Function |
|--------|----------|
| **Ingest** | Snapshot live remote feeds; optional OpenWebRX WebSocket URL on server (no browser CORS). |
| **Scale / filter** | Normalize space-weather and coupling parameters for fuse stability. |
| **Radar fuse** | Combine fence-gate coupling shape, soil moisture surface, magnetic/grid leverage, optional LST/LAI. |
| **Cross-source fidelity** | Boost placement only where families agree; cap “collar proximity” and “individual animal proximity” scores honestly. |
| **Synthesis** | Metabolic/forage narrative from public ADM and registry baselines + modeled placement sample. |

### 5.3 Passive RF and the fence line

**Default (no Turner hardware):**

- A **public receive-only** online SDR feed provides real spectral statistics.  
- The server divides the passband into RMS chunks and **assigns** them to **gates in order** along the **mapped fence polyline** for each pasture.  
- This is **software coupling** between **band activity** and **known perimeter geometry**—useful for lock-in and fuse weighting, not a claim of a transducer on every post.

**Fence coordinates:**

- Sourced from **OpenStreetMap** near pasture centroids (often incomplete on private ranchland) and/or **`turner-perimeter-steel.geojson`** overrides.  
- Improve **where** the model thinks the waveguide path lies; they do not relocate the internet receiver onto Montana wire.

**Optional upgrade — on-premise receive-only SDR:**

- If Turner later deploys **receive-only** OpenWebRX (or equivalent) **on or near the ranch** and provides a `wss://` ingest endpoint, **ability and operational fidelity can improve** (ranch-local passband, tighter operational alignment).  
- Same software path as today; **not required** to evaluate the console.

### 5.4 Narrative frame vs implementation

The catalog describes perimeter fence as a passive waveguide, hydrogen-line carrier, and phase readout. That language describes the **geometry of the fuse**. The **implementation** is explicit: strengths along the line are **computed and mapped** from remote feeds unless and until dedicated hardware is added under the optional upgrade path above.

---

## 6. Data sources (default stack)

| Source | What it contributes | Animal-level? |
|--------|---------------------|---------------|
| NOAA SWPC | Kp, space-weather context for coupling | No |
| Open-Meteo | Soil moisture, optional LAI, ET₀ (optional cal) | Pasture |
| NASA POWER | Skin temperature (IR proxy) | Pasture |
| OpenWebRX (internet) | Real IQ/FFT → per-gate coupling shape | No |
| OpenStreetMap / GeoJSON | Fence lines, schematic gates | Infrastructure |
| Geomagnetic / HIFLD | Grid and field context in fuse | No |
| Public Turner/TESF registry | Head count, ADM, mean weight baselines | Statistical |

**Default policy:** `real_sources_only` — incomplete historical soil in date-range mode **fails the request** rather than inventing data.

---

## 7. Console capabilities

- **Live mode:** Current ingest snapshot across geolocated Turner pastures in the model.  
- **Date-range mode:** UTC start/end scrub with daily soil history; **8–128 head sample** on map for performance; full-window **text export** for reports.  
- **Metrics:** Fuse completeness, honest collar-proximity and individual-proximity caps, cross-source matrix.  
- **Downloads:** Pipe-delimited text exports for herd and range.  

**Registry numbers** (e.g. 45,000 head, ADM 1,450 lb/acre) come from **static published baselines** in the repository, not live Turner telemetry.

---

## 8. How to read the fidelity metrics

| Metric | Meaning | Common mistake |
|--------|---------|----------------|
| **Fuse %** | Channel completeness of live feeds | “We know where every bison is” |
| **Collar proximity %** | Honest operational grade *toward* collar GPS (software-capped without collars) | Treating as actual collar accuracy |
| **Individual animal proximity %** | Even lower cap without per-head sensing | Assuming per-animal tracking |

When multiple sources agree, placement weights adjust; when they disagree, the system does not pretend high individual certainty.

---

## 9. Comparison: collars vs this layer

| Dimension | GPS collars (legacy) | Passive fusion layer (this system) |
|-----------|-------------------|-------------------------------------|
| Coverage | Subset of herd | Full registry context; map **sample** in range mode |
| Animal handling | Roundups, batteries | None required (default) |
| Position truth | Measured (subset) | **Modeled** field |
| Infrastructure | Collars, chargers | Fences (mapped) + open data + receive-only RF |
| Best use | Animal-level ops | Pasture-scale planning, rotation narrative, stress fusion |
| Validation | Ranch ground truth | Requires pilot + optional collar subset for calibration |

---

## 10. What improves with Turner collaboration

**No hardware required to start:**

- Verified pasture polygons  
- Fence and gate corrections where OSM is thin  
- Ranch-specific seasonal baselines and weight-class assumptions  
- Agreement on which pastures/units to score in a pilot  

**Optional later:**

- Receive-only ranch SDR (fidelity upgrade)  
- Small collared comparison set in one unit (calibration only)  
- Commercial very-high-resolution imagery pilots (validation, not default)  

---

## 11. Proposed minimal pilot (30 days)

1. **Unit:** One pasture or management area Turner names.  
2. **Inputs:** Existing GIS or OSM + your corrections; your rotation/grazing notes for the window.  
3. **Comparison:** Pasture-level modeled stress/placement vs your ground truth.  
4. **Optional:** Collared animals you already have—in that unit only—for error bands, not dependency.  
5. **Success:** Useful for **planning conversation**; fail if marketed as certified inventory or collar replacement.  

---

## 12. Security and how to engage

- This white paper can be read **without visiting any website**.  
- We can provide a **PDF**, a **scheduled call**, or materials through **Turner’s preferred channel**.  
- Any demo URL should pass your **IT/security review** like any external link.  
- We do not require installation of executable software on Turner systems for this background review.  

---

## 13. Corrections to earlier messaging

If prior correspondence implied:

- “Live feed of every bison” without collars → **incorrect**; the map shows a **fused model**, not continuous verified fixes.  
- “No guessing” → **overstated**; we use **public models and fusion**, with explicit caps on collar-grade claims.  
- Mandatory on-site radios → **incorrect**; **optional** for fidelity upgrade only.  

This document supersedes informal marketing language on those points.

---

## 14. Contact and references

**Pru Mendez**  
valetpru@gmail.com  

**Technical honesty anchor (internal/public repo):** HHA-NSPFRNP-ANCHOR-2026-05-25  
**Optional demo:** https://www.ssvibelandiaquestfest24x365.com/special-projects/turner-bison-herd-management  

---

## Appendix A — Cover email (optional, paste above white paper)

**Subject:** White paper — passive rangeland fusion layer (background, limits, optional pilot)

Dr. Kruse,

Following your questions about links and whether live animal feeds are possible without on-animal technology, I am attaching background that states plainly **what our system is, what it is not, and how we would propose a small pilot if useful**.

The short version: we fuse **public remote sensing**, **mapped fence geometry**, and **receive-only radio statistics** into a **pasture-scale planning model**. We do **not** claim collar-grade GPS on every head, and we do **not** require hardware on Turner land to review the approach. Optional receive-only radios on the ranch can improve RF fidelity later if you choose that path.

I am happy to discuss on a call or send a PDF; no link click is required to read the attached text.

Respectfully,  
Pru Mendez

---

*End of white paper · HHA-TURNER-WP-2026-05-26*
