# Hire-A-Goldilocks-Valet-Concierge · Reference frontend

Static HTML reference implementation for **OGRP** guest, valet, and menu-partner flows.

**Depth contract (3 layers max):**

1. `index.html` — **menu-first landing**: bookable service menu + Old School join cards (guest · delivery &amp; personal valet · food &amp; beverage purveyor)  
2. `pay.html` directly from the menu · `valet.html` / `partner.html` detail pages · `guest.html` (standalone picker deep link)  
3. `pay.html` — service-aware honor rails (Γ<sub>floor</sub> = $9)

Sign-up is Old School Protocol on every door: no forms funnel, no chatbot gate, no CRM — one email to PL Taino / Valet Pru to join as **purveyor, valet, concierge, or guest**. Once accepted, the node is placed in the **WhatsApp group for the selected channel**, where requests broadcast (want + tip offer) and members accept. All else — procurement, delivery, payment — is handled offline through the established honor rails (Venmo · PayPal · Cash App).

**Bookable services (guest picker → pay):**

| Service | Rate | Pay param |
|---------|------|-----------|
| Food delivery | $9 delivery floor | `?role=guest&service=food` |
| Personal shopping | $9 run floor | `?role=guest&service=shopping` |
| Personal assistance · hourly | $16.18/hr (1–8 hrs) | `?role=guest&service=assist&unit=hour` |
| Personal assistance · full day | $161.80/day (1–7 days) | `?role=guest&service=assist&unit=day` |
| EcoReset · home, estate, or business | Old School email — no payment layer | mailto PL Taino |

Rates encode EGS φ (16.18 → 161.80, the Pass Ladder ×10 geometry).

## Run locally

From repository root:

```bash
npm run serve:frontend
```

Or:

```bash
cd frontend/goldilocks-room-service
python -m http.server 5190
```

## Look and feel

Pages ship with the **SS Vibelandia deck skin** (`ss-vibelandia-deck-skin.css`) — gold / foam / Puerto Reno night-sky gradient — so the reference frontend matches the live SS Vibelandia QUESTFEST surfaces. Remove the `ss-vibelandia-deck` class on `<html>` and the skin stylesheet to de-brand a fork.

The landing is a **rich illustrated menu**: each service card carries AI-generated golden-age art-deco poster art (`assets/grs-menu-*.jpg`), and the page sits on a deco night-sky background (`assets/grs-bg-deco-night.jpg`, applied via the `grs-deco-bg` body class). Swap the JPEGs in `assets/` to re-theme a fork; keep the 4:3 card ratio (21:9 for the wide EcoReset card).

## Fork notes

- Update honor handles in `pay.html` for your operator node  
- Align regions with `data/reno_core_bbox.json` or add a new city bbox  
- Schema for dispatch filters: `config/ogrp_protocol.json`  

Parent README: [`../README.md`](../README.md)
