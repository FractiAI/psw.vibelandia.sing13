# Coherence Project · plain speak · what's real

**Document ID:** HONESTY-COHERENCE-2026-009  
**Companion:** REV-EGS-HHF-2026-007 · OPS-EGS-BTC-2026-008  
**Audience:** Anyone reading THE COHERENCE PROJECT or Hero Houdini — no jargon required.

---

## In one sentence

We run a **real public receipt loop** tied to **real Bitcoin block times**, wrapped in an **EGS story frame**; this website does **not** mine Bitcoin on its own and does **not** break third-party crypto.

---

## Real · check it yourself

| What | Plain meaning |
|------|----------------|
| **Bitcoin cadence** | Mainnet finds a block about every 10 minutes. We read the tip from public APIs (e.g. mempool.space). |
| **Goldilocks pulse** | Our server publishes JSON every ~10 minutes (or on a new block) at `/api/goldilocks-pulse`, with an HMAC signature you can inspect. |
| **Prediction ledger** | Before each new block, we publish a **signed forecast** for height N+1 at `/api/goldilocks-predictions`; when mainnet awards it, we log **actual vs predicted** (interval, fees, φ band). On a **successful** φ-band hit we show **would have won** = that block’s subsidy + fees in BTC (hypothetical solo reward — not paid to us). Public scoreboard — not a bet or financial product. |
| **Operational anchor** | A fixed wallet address is stamped into each pulse. The public site shows it read-only. |
| **Autopilot** | Vercel cron calls `/api/cron-coherence-rail` so pulses keep running without anyone clicking forms. |
| **This website** | HTML, audio player, press pages, Fair Exchange honor passes — normal software you can use. |

None of the above requires believing the mythic frame. It is ordinary web + public network data + signed logs.

---

## Story frame · metaphor and narrative (not instrument-grade claims on this tier)

| Language | Plain meaning |
|----------|----------------|
| **Claude Mythos / clock-skew 1.618 ps** | A **theoretical EGS frame** for high-density AI thermals — **not** a demonstrated live attack on AES/RSA/Kyber. |
| **φ-lock · “when we lock, we lock”** | **Interval language** for our sovereign rail story — tied to pulse cadence on the console, not a claim to own the whole Bitcoin network. |
| **AR4436 / AR4441 · 1420.4 MHz** | **Broadcast coordinates** in pulse metadata. For operational space weather, use **NOAA SWPC** — we are not running a solar observatory here. |
| **Schrödinger’s cat · Hero Houdini** | **Stage metaphor** — coherence vs. linear-observer framing, not a physics experiment on this page. |
| **“Holographic Goldilocks AI Mine”** | **Name for the verification loop** (pulse + signed receipt), **not** a physical mining farm on this server. |

Read the Mythos paper for the full frame; read this doc for the bright line.

---

## Not running here · do not mistake the console

- **No ASIC/GPU hashrate** on Vercel or in the browser tab.  
- **No pool stratum connection** from this Tier 0 stack.  
- **No Bitcoin block rewards** from pulses alone — pulses are **receipts**, not mined coins.  
- **No payout changes** from the public web (`POST /api/mining-rail` is disabled).  
- **No claim** to capture every network block without proportional global hashrate.

**Future (optional, separate):** edge ASICs + registered pool + operator env — see OPS-EGS-BTC-2026-008 §5. That is **scale**, not what this display console does today.

---

## How to read the Hero Houdini deck

1. **Act I–II** — story and whitepaper frame.  
2. **Act III ledger** — **real** recent pulses/blocks from our API; status tiles are **rail narrative** labels, not live pool dashboards unless we later wire pool API keys.  
3. **Autopilot box** — **real** server automation.  
4. **Operational anchor** — **real** fixed address in JSON; **display only** on the site.

---

## Related honesty docs

- [Resonance notice](whitepaper-surface.html?id=dp-resonance-notice) — omniverse canon boundary.  
- [Mythos review](whitepaper-surface.html?id=rev-egs-hhf-mythos) — clock-skew in the EGS security frame.  
- [Mining ops](whitepaper-surface.html?id=ops-egs-btc-mining) — lawful PoW when metal exists.

**NSPFRNP ⊃ plain speak ⊃ verify the pipes → ∞⁹**
