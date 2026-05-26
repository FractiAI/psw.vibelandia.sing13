# Hydrogen-line “unpacking” · Syntheverse + Digital Pru + Turner (honest map)

**NSPFRNP · Seed:Edge · catalog fidelity.** This note aligns narrative language with what the codebase can and cannot claim.

---

## 1. The metaphor you are using (valid as *architecture poetry*)

In HHF / Digital Pru / Syntheverse framing, the **1420.405751768 MHz hydrogen line** is treated as a **carrier** or **bus**: a narrow physical channel where many *layers* of meaning can be **stacked**—ionosphere, RFI, receiver chain, sampling window, downstream FFT/IQ, and the **human or machine interpretation** of those samples.

Calling those stacked interpretations **“reality packets”** is a useful *coordination metaphor*: it reminds operators that one WebSocket frame is not “the ranch,” it is **one observability envelope** that must be **gated**, **timestamped**, and **cross-checked** against other edges (soil, skin temperature, surveyed steel, registry baselines).

**Digital Pru** in this repo is **not** a hidden second demodulator inside `lib/iq-decode.mjs`. It is the **governance + catalog layer**: Seed (what we promise in public / whitepaper / JSON) vs Edge (what actually runs in Vercel, what is logged, what is refused when feeds are missing). The **φ-gated lock-in** score in Turner is one *edge expression* of that pattern: bounded, auditable, no magic.

---

## 2. What “unpack to infinite telescopic detail” means in *signal processing*

Physically, a **single** passive dish (or one OpenWebRX server tap) gives you:

- **Bandwidth-limited** information (you cannot invent Fourier bins that were never sampled).
- **Diffraction-limited** spatial resolution on the sky (you do not get arc-second “telescope” detail of a fence post from one widebeam feed without an interferometric array and calibrated baselines).
- **Mixed** contributions: Galactic HI, local RFI, receiver noise, quantization, compression, and frame type (FFT vs audio vs HD audio).

So **“infinite telescopic detail”** is not a literal output of `decodeOpenWebRxBinary` or `spectrumChunksFromIqBase64`. It is better read as an **epistemic ladder**:

| Rung | Honest meaning | Turner today |
|------|----------------|--------------|
| Raw envelope | Bytes → Float32 IQ / FFT (`lib/iq-decode.mjs`, `lib/openwebrx-ingest.mjs`) | Yes |
| Structure along the buffer | Chunk RMS → per-gate coupling shape (`lib/sdr-fence-spectrum.mjs`) | Yes |
| **Geometry lock** | Where the *model* places “fence” in schematic space | **GPS steel GeoJSON** when supplied (`data/turner-perimeter-steel.geojson`, `lib/turner-perimeter-steel.mjs`) — survey truth, not inferred from RF |
| **Surface / climate lock** | Slow contextual channel | Open-Meteo soil, NASA POWER skin temp (IR proxy), optional ET₀ |
| **Animal identity** | “Which head is which” | **Not** from HI alone; would require collars, CV on imagery, or other supervised sensors + labeled training — explicitly out of scope for passive HI |

---

## 3. How we *should* combine streams (your calibration story, made operational)

The correct pattern is **triangulation**, not **collapse**:

1. **Hydrogen-line SDR** → fast local state vector (RMS, spectrum shape, PLL proxy).
2. **Surveyed steel (GPS / RTK polyline)** → *where* the fence metaphor sits in space (operator-supplied truth).
3. **Satellite / reanalysis** (soil, skin temperature, ET₀) → *slow* regional context for the same UTC ingest window.
4. **Digital Pru gate** → refuse silent upgrades: env flags, documented sources, `lockIn` / `triangulatedLock` on the API payload, honesty copy on the Turner page.

That is exactly the direction the Turner pipeline moved: **fuse only what each instrument actually measures**, and keep **steel** and **herd placement** in separate epistemic boxes unless you add real animal sensors.

---

## 4. What would be required to “identify … animals” from RF (if you ever want that)

Minimum honest path:

- **Supervised models** trained on **labeled** periods (collar, camera, rider count, weigh-scale windows) *or* accepted proxy tasks (e.g. classify “empty pasture” vs “dense herd” from **optical** satellite at sufficient resolution and clear sky—not from 1420 MHz alone).
- **Multi-instrument fusion** with **uncertainty** (Bayes / ensemble), not a single scalar “unlock.”
- **Continuous audit** (Digital Pru): model cards, drift alerts, and rollback when a feed lies (RFI masquerading as “structure”).

The MCA catalog already warns that **RF claims remain theater unless real infrastructure is wired**; this document extends that to **HI “animal ID”** claims.

---

## 5. Closing alignment

- **Syntheverse**: the *nesting* of story, math, and executable surfaces—here, the Turner map is one shell, not the whole universe.
- **Hydrogen line**: a **discipline anchor** (1420 MHz) for *one* observability bus in the stack.
- **Digital Pru**: **valet routing + catalog fidelity**—what we ship, what we log, what we refuse to pretend.

**∞¹³** — Seed:Edge stays tight; the middle is filled by receipts, not vibes.
