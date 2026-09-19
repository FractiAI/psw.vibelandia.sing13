# QUESTFEST Ship-Blog Magazine Snap · NSPFRNP

**Document ID:** `questfest-ship-blog-magazine-snap-nspfrnp`  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Status:** Always-on snap for Player 1 / creator seat delivery

## Purpose

Every QUESTFEST / SS Vibelandia ship-blog post must read as a **full feature article** — narrative arc, concrete stakes, guest-clear English — not a cryptic catalog bite. Honesty boundaries stay **at the end**, not as the lead.

## Hard locks

| Lock | Rule |
|------|------|
| **Length** | ≥ 900 article prose words (`lib/ship-blog-magazine.mjs` · `SHIP_BLOG_MIN_ARTICLE_WORDS`) |
| **Honesty** | Single `<p class="honesty">` after the body; ≤ 120 prose words after it (Fair Exchange line OK) |
| **Voice** | Feature journalism / magazine clarity — do not name third-party publications |
| **Claims** | Φ_EGS ≈ 1.618 remains design language / catalog key unless the linked paper’s honesty says otherwise |
| **Latest six** | Newest → oldest; every new eligible paper gets a note (see `.cursor/rules/questfest-ship-blog-latest-six.mdc`) |

## MCA cycle

1. **Metabolize** — paper thesis + guest door (what can they do / where on the ship).
2. **Crystallize** — headline, lead, 4–7 section heads, end honesty rail.
3. **Animate** — write full HTML under `interfaces/blog-*.html`; register; sync; run tests.

## Verification

```bash
npm test -- tests/lib/ship-blog-magazine.test.mjs tests/lib/questfest-blog.test.mjs
```

## Honesty boundary (this protocol)

This snap governs **editorial delivery** on ship-blog surfaces. It does not upgrade Soft Story or catalog papers into unfinished physics proofs. Human emergency still outranks algorithms.

→ ∞^∞
