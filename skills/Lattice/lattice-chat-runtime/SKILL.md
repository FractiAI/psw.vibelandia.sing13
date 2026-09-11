---
id: lattice-chat-runtime
name: Lattice Chat runtime pipes
description: BYOK API, prompt assembly, nest topology, Player 1 write-on rails.
tags: ["lattice-chat","byok","api","pipes","prompt"]
routes: ["/lattice-chat"]
sources: ["api/lattice-chat.js","lib/lattice-prompt.mjs","lib/lattice-engine.mjs"]
---

# When to use
Questions about how Lattice Chat runs, keys, nesting, New chat, or prompt / Seed pack behavior.

# Pointers (local)
- `api/lattice-chat.js` — provider proxy
- `lib/lattice-prompt.mjs` — assembleLatticePrompt · Seed pack
- `lib/lattice-engine.mjs` — token / MCA envelope
- `apps/lattice-chat/src/` — Edge UI

# Honesty
Runtime pipes only. Keys stay on-device (BYOK). Guest honor vs Player 1 creator seat are separate rails.
