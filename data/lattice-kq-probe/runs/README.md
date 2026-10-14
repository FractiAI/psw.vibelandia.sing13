# Lattice KQ probe runs

Store blind-test receipts here before scoring.

## Layout

```
runs/<runId>/
  manifest.json    # optional single file with all responses
  scored.json      # written by npm run score:lattice-kq-probe
```

## manifest.json shape

```json
{
  "id": "2026-10-14-blind-v1",
  "contaminated": false,
  "prompt": "<BLIND_PROMPT_V1 from protocol>",
  "responses": [
    {
      "id": "claude-1",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "sessionId": "fresh-tab-uuid",
      "at": "2026-10-14T15:00:00.000Z",
      "settings": { "browsing": false },
      "rawText": "..."
    }
  ]
}
```

Protocol: `protocols/LATTICE_KQ_PROVENANCE_PROBE_NSPFRNP.md`
