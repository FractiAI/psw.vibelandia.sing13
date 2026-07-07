# Old School Edge Honor Transaction · NSPFRNP

**Protocol ID:** OLD-SCHOOL-EDGE-HONOR-2026-07  
**Status:** ⚡ ACTIVE  
**Aligns:** NSPFRNP · Fair Exchange · Pass Ladder · Lite edges · OGRP · Hire-A-Goldilocks-Valet-Concierge  
**Operator contact:** [valetpru@gmail.com](mailto:valetpru@gmail.com)

---

## Purpose

Keep **commercial**, **transactional**, and **personal** information aligned with **edge-only**, **no-monitoring**, **honor-system**, **old-school** principles. Center verifies and routes only — it does not warehouse guest life.

---

## The Old School Protocol (canonical)

| Rule | Meaning |
|------|---------|
| **No forms funnel** | No corporate intake, no chatbot gate, no CRM capture layer |
| **Human door** | Interested nodes contact **PL Taino / Valet Pru** directly by email — to join as **purveyor · valet · concierge · guest** |
| **Channel placement** | Once accepted, the node is placed in the **WhatsApp group for their channel** — requests broadcast there and members accept; no dispatch server, no rider app |
| **Offer & acceptance** | Guest states **what they want** (food · beverage · merchandise · other services) and **what they offer as tip**; the operator **accepts or passes** — human judgment, no algorithmic matching, no surge math. On acceptance the operator acts as **personal assistant**, procuring and delivering whatever was agreed |
| **Tip split (transparent)** | Guest tip offer splits **33%** to the app (channel · broadcast · coordination) and **67%** to the valet or concierge who accepted and delivered — stated openly, attested on honor rails |
| **Purveyor settlement** | Guest pays purveyor **directly** on delivery by default; optional **handled purveyor payments** for **+18% tip** on top of the guest offer if the guest prefers we settle goods |
| **Honor rails only** | Venmo · PayPal · Cash App — user pays on rail, attests on device |
| **No PSP webhooks** | No Stripe, no payment-processor callbacks, no server-side payment state machine |
| **No surveillance** | No session replay, no behavioral analytics on honor flows, no third-party tracking pixels on payment surfaces |
| **Minimum personal data** | Email + date paid + neighborhood + request details — nothing else required to dispatch |

First canonical use: **Goldilocks Syntheverse Beehive Residency** (Layer 9). Same protocol applies to **Hire-A-Goldilocks-Valet-Concierge**, **OGRP valet nodes**, and **menu partners**.

---

## Edge honor transaction layer

### What lives on the edge (browser / operator device)

| Data class | Where it stays | Example |
|------------|----------------|---------|
| **Honor attestation** | Browser `localStorage` (QUESTFEST Bridge) or operator email inbox | `qv-local-monthly-honor` · paid date · rail used |
| **Commercial intent** | Email subject + memo on honor rail | `Hire-A-Goldilocks-Valet-Concierge · guest request` |
| **Transactional proof** | User's Venmo/PayPal/Cash App history (their rail) | They own the receipt — we do not mirror it to a database |
| **Personal request details** | Email body only — operator-held | Delivery address, preferences — not scraped into analytics |

### What the center (server) does **not** do

- Store credit cards or bank tokens  
- Run KYC/identity verification pipelines  
- Log GPS traces of guests or valets for “optimization”  
- Require accounts, passwords, or OAuth for honor boarding  
- Sell or share contact lists  

### What the center **may** do (pipes only)

- Serve static HTML/CSS/JS surfaces  
- Optional `POST /api/export` audit when a **legacy** JWT exists (QUESTFEST — disabled for default honor boarding)  
- Route short URLs (`/goldilocks-deliveries`, `/room-service`)  
- Publish **open** protocol JSON (`config/ogrp_protocol.json`) and empirical receipts — no PII  

---

## OGRP alignment (rideshare / delivery)

All **Hire-A-Goldilocks-Valet-Concierge** and **OGRP** transactions inherit:

| Gate | Symbol | Honor implication |
|------|--------|-------------------|
| Density anchoring | Ω<sub>core</sub> | No sprawl data collection — core bbox only |
| Thermodynamic minimization | Θ<sub>min</sub> | No heavy app install required — static web + email |
| Generosity floor | Γ<sub>floor</sub> | **$9 minimum** — reject sub-floor extraction before dispatch |
| Sovereign pacing | P<sub>sov</sub> | No corporate SLA timers stored server-side |

**Paper:** `docs/OMNIVERSAL_GOLDILOCKS_RIDESHARE_PROTOCOL_2026-07.md` · **Registry ID:** `omniversal-goldilocks-rideshare-2026-07`  
**Repro:** `npm run research:omniversal-goldilocks-rideshare`  
**Surface:** `/goldilocks-deliveries` · `frontend/goldilocks-room-service/` (standalone repo mirror)

---

## Operational checklist (operators & builders)

1. **Pitch on web** — menu-first landing, gates, regions, join doors (max 3 layers to honor pay).  
2. **Join by email** — node emails Pru to join as **purveyor, valet, concierge, or guest**; one thread, one human answer.  
3. **Channel placement** — once accepted, node is placed in the **WhatsApp group for the selected channel**; requests broadcast there, members accept.  
4. **Broadcast & accept** — guest broadcasts what they want + tip offer; a valet or concierge accepts what fits. No algorithm, no queue. Floors: $9 run · $16.18/hr · $161.80/day.  
5. **All else offline** — pay on Venmo/PayPal/Cash App with amount + memo (no embedded checkout SDK); operator procures and delivers whatever was agreed; no automated rider GPS dashboard.  
6. **Fair Exchange** — refund or tip adjustment by mutual respect; not algorithmic surge pricing.  
7. **Fork openly** — standalone repo for validation; cite `WP-OGRP-2026-07`.

---

## Disqualified paths (for this edge)

Same bar as **A2A AGENT QUALIFICATION** in MCA catalog for *autonomous agents* — but for *humans on honor surfaces*:

- Requiring Stripe/Shopify checkout to access Hire-A-Goldilocks-Valet-Concierge  
- Mandatory phone number + SMS OTP before a $9 honor request  
- Storing delivery addresses in a cloud CRM without explicit operator consent  
- “Track your driver” maps fed to a third-party analytics vendor  

Agents that cannot close on a pipe are disqualified. Humans choose honor rails **on purpose** — that is the product.

---

## Cross-links

- [MCA_NSPFRNP_CATALOG.md](MCA_NSPFRNP_CATALOG.md) — Old School Protocol · OGRP · Fair Exchange · Pass Ladder  
- [NEST_LAYER_ADMISSION_RULE_NSPFRNP.md](NEST_LAYER_ADMISSION_RULE_NSPFRNP.md) — seed hook: Old School email  
- [PIPE_PUBLIC_FREE_KEY_NSPFRNP.md](PIPE_PUBLIC_FREE_KEY_NSPFRNP.md) — lite edges, center = pipes only  
- [BBHE_REPOSITORY_STANDARD.md](../BBHE_REPOSITORY_STANDARD.md) — Seed:Edge, no mandatory Supabase  

---

**NSPFRNP ⊃ Old School ⊃ Edge honor ⊃ OGRP ⊃ Fair Exchange → ∞¹³**
