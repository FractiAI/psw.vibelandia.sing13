/**
 * PRA Snap dual-make LLM lanes — independent makes for author vs reviewer (meta-audit trail).
 *
 * Canonical pairing (complementarity):
 * - Author (Make A · OpenAI): technical revision, IMRaD structure, repo-path fidelity
 * - Reviewer (Make B · Anthropic): falsification-first critique, honesty boundaries, blocker detection
 */
export const LANE_DEFAULTS = {
  author: {
    make: 'OpenAI',
    provider: 'openai',
    model: 'gpt-4o',
    modelVersion: 'gpt-4o-2024-08-06',
    role: 'author_revision',
    rationale: 'Structured technical revision · JSON discipline · repository command fidelity',
  },
  reviewer: {
    make: 'Anthropic',
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    modelVersion: 'claude-sonnet-4-20250514',
    role: 'independent_reviewer',
    rationale: 'Independent falsification-first peer review · honesty tier enforcement · blocker surfacing',
  },
  structural: {
    make: 'SynthOBS',
    provider: 'deterministic',
    engine: 'structural-rubric/v1',
    role: 'baseline_rubric',
    rationale: 'Always-on deterministic rubric — fails closed on missing honesty/doc ID/attribution',
  },
};

export function resolveLlmLanes() {
  const author = {
    ...LANE_DEFAULTS.author,
    model: process.env.SYNTHOBS_AUDIT_AUTHOR_MODEL || LANE_DEFAULTS.author.model,
    modelVersion:
      process.env.SYNTHOBS_AUDIT_AUTHOR_MODEL_VERSION ||
      process.env.SYNTHOBS_AUDIT_AUTHOR_MODEL ||
      LANE_DEFAULTS.author.modelVersion,
  };
  const reviewer = {
    ...LANE_DEFAULTS.reviewer,
    model: process.env.SYNTHOBS_AUDIT_REVIEWER_MODEL || LANE_DEFAULTS.reviewer.model,
    modelVersion:
      process.env.SYNTHOBS_AUDIT_REVIEWER_MODEL_VERSION ||
      process.env.SYNTHOBS_AUDIT_REVIEWER_MODEL ||
      LANE_DEFAULTS.reviewer.modelVersion,
  };

  const hasOpenAi = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const llmRequested = process.env.SYNTHOBS_AUDIT_LLM_ENABLED === '1';

  const dualMakeReady = llmRequested && hasOpenAi && hasAnthropic;
  const singleMakeFallback =
    llmRequested && hasOpenAi && !hasAnthropic && process.env.SYNTHOBS_AUDIT_ALLOW_SINGLE_MAKE === '1';

  return {
    author,
    reviewer,
    structural: LANE_DEFAULTS.structural,
    complementarity:
      'OpenAI author synthesis (Make A) + Anthropic independent reviewer (Make B) — distinct training families reduce shared blind spots',
    dualMakeConfirmed: dualMakeReady && author.make !== reviewer.make,
    llmEnabled: dualMakeReady || singleMakeFallback,
    mode: dualMakeReady
      ? 'dual_make'
      : singleMakeFallback
        ? 'single_make_fallback'
        : 'structural_only',
    keysPresent: { openai: hasOpenAi, anthropic: hasAnthropic },
  };
}

async function callOpenAi({ model, system, user }) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '{}';
  return {
    parsed: JSON.parse(text),
    meta: {
      make: 'OpenAI',
      model: data.model || model,
      modelVersion: data.model || model,
      provider: 'openai',
      usage: data.usage || null,
    },
  };
}

async function callAnthropic({ model, system, user }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      temperature: 0.2,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const data = await res.json();
  const text = (data.content || []).map((c) => c.text || '').join('') || '{}';
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    parsed = m ? JSON.parse(m[0]) : { summary: text.slice(0, 500) };
  }
  return {
    parsed,
    meta: {
      make: 'Anthropic',
      model: data.model || model,
      modelVersion: data.model || model,
      provider: 'anthropic',
      usage: data.usage || null,
    },
  };
}

export async function invokeReviewerLane({ paperText, iteration, prior, lane }) {
  const system = `You are an independent peer reviewer (Make B) for a technical whitepaper. Score each dimension 0-1. Return JSON only:
{"scores":{"honestyBoundary":0-1,"methodsRepro":0-1,"claimsProportionate":0-1,"structure":0-1,"references":0-1,"abstractTitle":0-1,"synthobsAttribution":0-1,"technicalPrecision":0-1},"criticalBlockers":[],"suggestions":[],"summary":"one paragraph"}`;
  const user = `Iteration ${iteration}. Prior score: ${prior?.overallScore ?? 'n/a'}.
Review for peer-review journal submission quality. Require SynthOBS Autonomous Agent sandbox attribution and honesty boundaries.

PAPER:
${paperText.slice(0, 120000)}`;

  if (lane.provider === 'anthropic') {
    const out = await callAnthropic({ model: lane.model, system, user });
    return { ...out.parsed, _metaAudit: { ...out.meta, role: lane.role, invokedAt: new Date().toISOString() } };
  }
  const out = await callOpenAi({ model: lane.model, system, user });
  return { ...out.parsed, _metaAudit: { ...out.meta, role: lane.role, invokedAt: new Date().toISOString() } };
}

export async function invokeAuthorLane({ paperText, review, lane }) {
  const system = `You are the author revising a technical whitepaper (Make A) toward peer-review submission quality. Return JSON only:
{"revisedExcerpt":"markdown patch guidance — sections to add/fix","appliedSuggestions":[]}`;
  const user = `Apply reviewer feedback. Keep SynthOBS Autonomous Agent · Syntheverse Sandbox attribution.

REVIEW: ${JSON.stringify(review)}

PAPER (excerpt): ${paperText.slice(0, 80000)}`;

  if (lane.provider === 'openai') {
    const out = await callOpenAi({ model: lane.model, system, user });
    return { ...out.parsed, _metaAudit: { ...out.meta, role: lane.role, invokedAt: new Date().toISOString() } };
  }
  const out = await callAnthropic({ model: lane.model, system, user });
  return { ...out.parsed, _metaAudit: { ...out.meta, role: lane.role, invokedAt: new Date().toISOString() } };
}

export function buildMetaAuditTrail({ lanes, mode, iterationLogs, structuralOnly }) {
  const base = {
    schema: 'synthobs-meta-audit/v1',
    dualMakePolicy: 'OpenAI author (Make A) + Anthropic reviewer (Make B)',
    dualMakeConfirmed: lanes.dualMakeConfirmed && !structuralOnly,
    complementarity: lanes.complementarity,
    lanesPlanned: {
      author: {
        make: lanes.author.make,
        model: lanes.author.model,
        modelVersion: lanes.author.modelVersion,
        role: lanes.author.role,
      },
      reviewer: {
        make: lanes.reviewer.make,
        model: lanes.reviewer.model,
        modelVersion: lanes.reviewer.modelVersion,
        role: lanes.reviewer.role,
      },
      structural: lanes.structural,
    },
    mode: structuralOnly ? 'structural_only' : lanes.mode,
    keysPresent: lanes.keysPresent,
    iterationLogs: iterationLogs || [],
  };
  if (structuralOnly) {
    base.note =
      'Structural rubric only. Full dual-make trail requires SYNTHOBS_AUDIT_LLM_ENABLED=1, OPENAI_API_KEY, and ANTHROPIC_API_KEY.';
  }
  return base;
}
