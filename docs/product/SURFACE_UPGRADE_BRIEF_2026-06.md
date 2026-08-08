# Surface Upgrade Brief · June 2026

**Scope:** All SING 13 public surfaces (`interfaces/` + QUESTFEST Bridge). **Not** the whitepaper reader body text in `docs/` — those stay technical.

**Player correction:** Capitan's Bridge is an **audio-first** music player (MP3/audio catalog). Not video-first. Upload lane accepts audio; legacy video rows may exist in metadata but playback is audio.

---

## Voice · plain speak for the working man

Surfaces sell trust and access in **irreducible minimums** — the fewest words that still get the job done.

| Do | Don't |
|----|-------|
| Short sentences. One idea per line. | Jargon stacks, acronyms without a plain hook |
| Say what you can **do today** (listen, pay on honor, upload, read receipt) | Simulation claims without a receipt link |
| Use **holographic code** as the plain hook for the stack (not “DPH-GPU cluster v2026.5” on decks) | Copy whitepaper abstract onto landing pages |
| Fair Exchange, old school, Venmo/PayPal/Cash App | Stripe, SaaS funnel, “enterprise” |
| Spanglish 80/20 where it fits QUESTFEST | Corporate press voice on the top deck |
| Honesty rail: **real · metaphor · not on site** when needed | Clinical or RF claims on surfaces |

**Template sentence:**  
*[What it is in one breath] — [what you do] — [what you get].*

Example: **Members pass** — follow Machote Moderno Magazine, send $16.18 on honor, get full play on this browser for 30 days.

**Holographic code** (allowed plain hook): the layered stack that turns catalog, schedule, and receipts into one ship — Bridge listens, hood proves, papers hold the math.

---

## Visual · Old School Goldilocks Golden Age

Rework images and heroes toward **Rat Pack / Howard Hughes / Sinatra / Marilyn Monroe / Machote Moderno** — not cyberpunk neon, not generic AI stock.

| Element | Direction |
|---------|-----------|
| **Palette** | Warm gold (#d4af37, champagne), cream, walnut, cigarette-glow amber, teal accent (foam) — velvet booth not LED wall |
| **Photography / illustration** | 1950s–60s Vegas-Reno glamour: tux lapels, marquee bulbs, desert highway, dressing-room mirror, beehive residency warmth |
| **Machote Moderno** | Magazine-cover confidence — followers-only, caliente, handshakes not funnels |
| **Typography** | Bebas / marquee headlines on decks; Inter body; Bridge keeps voxel player chrome but warms gold accents |
| **Maps & brochures** | Ticket-border amusement-park map (Frontier Guide) — hand-drawn carnival feel on accurate street bounds |
| **Avoid** | Purple gradient AI brains, chip/datacenter stock art without plain caption, cold blue “enterprise” UI |

**Asset pass (priority):** QUESTFEST hero, Frontier Guide cover/story, Machote campaign modal, press heroes, hood/sun decks, nest ladder thumbnails, Bridge empty states.

---

## Tier 1 · upgrade first

| Surface | Plain intention |
|---------|-----------------|
| **QUESTFEST top deck** `/` | Front door — who we are, what to tap, nesting ladder, Machote offer |
| **Capitan's Bridge** `/sovereign-gate` | Audio player + honor pass + playlists — the product |
| **Look Under the Hood** `/hood` | Proof it works today — listen, board, upload |
| **Frontier Guide** `/questfest-guide` | 5-page brochure — win, welcome, schedule, **Puerto Reno map** |
| **Whitepaper catalog** `/papers` | Index only — search papers; don't dumb down paper bodies |
| **Press index** `/press` | News wire list |
| **Goldilocks Beehive Residency** | Layer 9 invite — EcoReset, contact PL Taino |
| **FractiAI deck** | One-house map to projects |

## Tier 2 · Bridge routes

| Route | Plain intention |
|-------|-----------------|
| `#/listen` | Listen — pick songs, play audio |
| `#/playlists` | Your lists |
| `#/dj` | Upload audio |
| `#/register` | Quick gate before Bridge |

## Tier 3 · nesting guides (9)

Plain zoom-in from Base Mainnet → Beehive — one screen each, same golden-age card art.

## Tier 4 · secondary

Press articles, blogs, campaigns, special projects, bulletin board, onboarding, portal/goldilocks-os, mythos console — same voice + art rules; lower nav priority.

---

## Immediate fix log

| Item | Status |
|------|--------|
| Puerto Reno map not showing (Frontier Guide p.5) | Fixed: removed `<object>` embed; direct `<img>` + fetch inline fallback; min-height on map stage |
| README “video-first” | Fixed → audio-first |
| Honor box first-submit | Fixed in Bridge bundle (draft + backdrop guard) — rebuild deployed with `index-Pp69S2mt.js` |

## Wave 1 copy + style (June 2026) — shipped locally

| Surface | Changes |
|---------|---------|
| `vibelandia-questfest.html` | Golden-age palette (walnut/champagne), plain hero primers, Machote popup, chipless/frontier teasers |
| `interfaces/i18n/en.json` | Plain speak strings: hero, campaign, nest, hood |
| `questfest-2026-frontier-guide.html` | Pages 1–4 plain copy; golden palette; map fix (p.5) |
| `look-under-the-hood.html` | Holographic code lead; warm deck background |
| `deck-surfaces.css` | Golden-age deck-case styling |
| `sing13-edge-onboarding.html` | Audio player wording |
| `plainSpeak.ts` + `RegistrationPage.tsx` | Audio-first Bridge labels |

---

## Wave 2 — nests, press cards, catalog, heroes (June 2026) — shipped locally

| Surface | Changes |
|---------|---------|
| `lib/plain-surface-lines.mjs` + `whitepaper-catalog.mjs` | Per-id plain one-liners on catalog cards |
| `whitepaper-catalog.html` | Plain deck lead; `plainLine` first on cards; golden tint |
| `nesting/nesting-shell.css` | Golden-age warm tokens |
| All 9 `nest-*.html` guides | Plain speak; unified hood nav; audio-first member bars; DPH-GPU simplified |
| `i18n/en.json` | Press feature teasers + titles — wormhole, King Bee, Erdős, GLOS, Sun Spoke, clock-skew, Machote, 30-day PR |
| `vibelandia-questfest.html` | HTML fallbacks match plain press cards |
| `assets/questfest-hero-ss-vibelandia-puerto-reno.png` | Golden-age QUESTFEST hero background |
| `assets/machote-moderno-magazine-cover.png` | Machote magazine cover (modal + PR) |
| `assets/nesting/nest-*.png` (×9) | Golden-age nest ladder thumbnails |

## Next upgrade pass (Wave 3 — suggested)

1. **Secondary surfaces** — `look-at-the-sun.html`, `fractiai.html`, `press-releases.html`, `goldilocks-beehive-residency.html` plain speak  
2. **i18n** — extend plain strings to Spanish deck where `vbi18n` already runs  
3. **Nav unify** — one quicklinks bar audit; nest ladder CTAs on all Tier-1 surfaces  
4. **Press article bodies** — optional plain lead paragraphs only; technical PR bodies unchanged  

**NSPFRNP ⊃ MCA → ∞¹³**
