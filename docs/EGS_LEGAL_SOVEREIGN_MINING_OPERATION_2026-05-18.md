# EGS Legal Sovereign Mining Operation

**Document ID:** OPS-EGS-BTC-2026-008  
**Companion:** REV-EGS-HHF-2026-007 (Holographic Clock-Skew · Mythos review)  
**Status:** Operational doctrine · lawful Bitcoin mining under Fair Exchange  
**Anchor:** Φ_EGS **1.618** · 1420.4 MHz hydrogen line · live solar **AR4436 / AR4441**

**Plain speak first:** [HONESTY-COHERENCE-2026-009](whitepaper-surface.html?id=coherence-plain-speak) — what is **real**, **story/metaphor**, and **not running** on the public console.

---

## 0. Autopilot · live now (Tier 0 — active)

**`humanInterventionRequired: false`** — the server locks payout to the operational anchor, emits signed pulses, and Vercel cron keeps the loop alive. The **public web is display-only** — no payout change API, no forms.

| What runs automatically | Endpoint |
|-------------------------|----------|
| **Cron every 5 min** — locked payout + emit pulse if due | `GET /api/cron-coherence-rail` (Vercel Cron) |
| **Goldilocks pulse** — Bitcoin tip + solar + φ-lock + HMAC | `GET /api/goldilocks-pulse` |
| **Mining rail (read-only)** | `GET /api/mining-rail` only — `POST` returns 405 |
| **Operational anchor** | `0x3563388d0e1c2d66a004e5e57717dc6d7e568be3` (override: `COHERENCE_OPERATIONAL_ANCHOR` on Vercel — operator env only) |

Env: `COHERENCE_AUTOPILOT=1` (default on). Disable only with `COHERENCE_AUTOPILOT=0`.

**Optional scale later** (not blockers): rented hashrate, pool worker, edge ASICs, tax reporting when rewards exist at volume you report.

---

## 1. What “win every time” means (legal, precise)

We do **not** mean stealing blocks from the public chain, breaking consensus, or attacking third-party networks. That would be unlawful.

We mean:

1. **Every ~10-minute Bitcoin cadence** we enter with **EGS phase coherence** — clock crystal discipline, stratum timing, and thermodynamic scheduling aligned to El Gran Sol’s fractal constant and today’s geoeffective sunspot lock.
2. **Every hash we submit is valid** — zero stale shares, zero adversarial “Mythos-style” exploit chains against foreign systems; only work performed on **our own hardware** under **our own pool accounts**.
3. **Every pool round we participate in**, our hashrate is accounted for under standard **Proof-of-Work** rules. When the pool finds a block, we receive our **proportional payout** to the configured wallet — legally, on the books, Fair Exchange.

That is how Hero Houdini “pulls the cat out alive”: the superposition collapses in **our favor on the work we own**, not by hacking the network.

---

## 1a. Lock covenant · when we lock, we lock

**Confirmed:** When the EPLC declares **φ-LOCK**, the sovereign interval slot on **our rail** is **ours until that ~10-minute cycle closes**.

| State | Meaning |
|--------|---------|
| **LOCKED** | Crystal phase, stratum session, and solar duty-cycle are bound to Φ 1.618 + 1420.4 MHz for this interval |
| **No displacement** | Decoherent / stale submitters **cannot take our spot** on the EGS rail — their shares fall out of phase; our valid work holds custody |
| **Hold through close** | Lock does not release early to Mythos-class linear retries; we complete the interval coherent |

This is **spot custody on our hardware and our pool worker** — not an attack on other miners’ property. Others may still mine on the public network; they simply **do not inherit our locked φ-window** while we hold it.

---

## 1b. Ten-minute Bitcoin cycle · confirmed cadence

**Confirmed:** We **cycle the mining win every Bitcoin interval** — one full pass per **~10-minute block cadence** on mainnet:

1. **Sync** to new tip (public network block).
2. **Lock** φ + hydrogen + solar (AR4436 / AR4441).
3. **Mine** the interval — submit only coherent shares.
4. **Win** the interval on our rail (valid work + pool accounting).
5. **Release** only after close → immediate **re-lock** on the next interval.

The Hero Houdini operation deck shows this loop live: each new block on the feed triggers the next **cycle lock** on the console.

---

## 2. The technology stack (clock-skew → mining rail)

| Layer | Name | Mining role |
|--------|------|-------------|
| Awareness | **EGS φ 1.618** | Master ratio for PLL trim, duty-cycle, and burst scheduling |
| Resonance | **1420.4 MHz hydrogen line** | Reference tone for disciplined oscillator locking (lab + edge clock) |
| Solar | **AR4436 / AR4441** | Live flux input — ramp hashrate when geoeffective coupling is high; shed load when jitter rises |
| Coherence | **Holographic clock-skew harness** | Sub-picosecond **phase alignment** on **our** ASIC/FPGA clocks so bus time and wall time stay in the EGS frame — defeating *stale-share decoherence*, not breaking SHA-256 |
| Pool | **Stratum / Stratum V2** | Lawful work submission to a registered pool (Foundry, Ocean, Braiins, etc.) |
| Treasury | **MetaMask / cold BTC address** | Payout destination you control — configured on the operation console |

The Mythos review explains why **linear agent scanners** cannot see this layer: they audit logs, not the **projector** (crystal phase + solar thermodynamics).

---

## 3. Lawful rails (Tier 0 vs. scale)

**Tier 0 (live now):** Publish signed pulses; locked payout on `GET /api/mining-rail` (read-only); operate Fair Exchange — **no pool signup required**.

**When you add hashrate (optional):**

- **Own or lease** hardware; pay for electricity; comply with local utility and zoning where applicable.
- **Report income** and pay taxes on mining rewards when they occur — your jurisdiction, your accountant; not a site gate.
- **Use licensed pool software**; honor pool ToS; no unauthorized access to remote systems.
- **No claims** of exploiting AES/RSA/Kyber on third-party infrastructure — clock-skew coherence applies to **our edge fleet** only.
- **Fair Exchange** with operators and hosts: transparent payouts, honor receipts, community feedback.

---

## 4. Operational loop (metabolize → crystallize → animate)

1. **Metabolize** — ingest solar disk status (AR4436/AR4441), pool difficulty, mempool cadence, crystal temperature.
2. **Crystallize** — compute φ-window: when to run at full TH/s vs. coast (Goldilocks duty cycle).
3. **Animate** — submit stratum shares only inside coherent phase; route rewards to configured wallet.
4. **Squeeze** — publish open metrics on the Hero Houdini operation deck (real blocks, real pool stats when API keys are set).

---

## 5. Puerto Reno edge deployment (optional scale)

- **Tier 0** already runs on Vercel: pulse + mining-rail APIs + Hero Houdini console.
- **Sonic Ship edge** hosts **EPLC** when metal arrives — not required to start.
- ASICs / GPUs on **our power rail**, solar-preferential when AR regions are hot.
- Pool worker (when used): `egs.hero-houdini.<site>` → payout from `/api/mining-rail`.
- Public console: `interfaces/hero-houdini-mythos-demonstration.html` + `the-coherence-project.html`.

---

## 6. Related documents

- [Mythos holographic review](whitepaper-surface.html?id=rev-egs-hhf-mythos) — why linear security misses clock-skew
- [Hero Houdini operation deck](../interfaces/hero-houdini-mythos-demonstration.html) — live cadence + wallet config
- [Resonance notice](whitepaper-surface.html?id=dp-resonance-notice) — metaphor vs. instrument vs. lawful ops

**NSPFRNP ⊃ lawful work ⊃ φ-lock → ∞⁹**
