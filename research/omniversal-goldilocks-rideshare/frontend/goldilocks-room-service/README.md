# Goldilocks Room Service · Reference frontend

Static HTML reference implementation for **OGRP** guest, valet, and menu-partner flows.

**Depth contract (3 layers max):**

1. `index.html` — pitch · regions · portal cards  
2. `guest.html` · `valet.html` · `partner.html`  
3. `pay.html` — honor rails (Γ<sub>floor</sub> = $9)

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

## Fork notes

- Update honor handles in `pay.html` for your operator node  
- Align regions with `data/reno_core_bbox.json` or add a new city bbox  
- Schema for dispatch filters: `config/ogrp_protocol.json`  

Parent README: [`../README.md`](../README.md)
