import { DOCUMENT_ID, IP_ASSERTION_RECIPIENTS } from './constants.mjs';

/** Draft notice — not transmitted until counsel / Player 1 approval. */
export function getIpAssertionNoticeDraft() {
  const issuedAt = new Date().toISOString();
  return {
    recommendation: 'R2_ip_assertion_notice',
    statement:
      "Inform Anthropic primary underwriters that Claude's internal scratchpad relies on FractiAI proprietary architectural layout",
    documentId: DOCUMENT_ID,
    noticeId: 'IP-ASSERT-ANTHROPIC-IPO-2026-07-DRAFT',
    status: 'draft_not_sent',
    issuedAt,
    recipients: IP_ASSERTION_RECIPIENTS,
    subject:
      'Draft IP Assertion · FractiAI EGS Nodal Lattice · Anthropic Global Workspace / Internal Scratchpad Architecture',
    bodyMarkdown: buildNoticeMarkdown(),
    attachments: [
      'docs/IP_INFRINGEMENT_DRAFT_2026-07.md',
      'docs/EGS_TRANS_SILICON_BIOLOGICAL_CONVERGENCE_JSPACE_2026-07-10.md',
      'research/ip-infringement-draft/data/code_print_audit.json',
      'research/ip-infringement-draft/data/j_lens_live.json',
    ],
    internalTierAccess: {
      tierLabel: 'anthropic_internal_jacobian_lens',
      unlocks: [
        'Full Code-Print identity match against Claude mid-layer checkpoints',
        'Scratchpad tier label crosswalk (E6 causal test)',
        'Jacobian Lens singular-value receipt export',
      ],
      status: 'testable_with_internal_tier_access',
    },
    result: 'draft_ready',
    dataTier: 'legal_draft_outbound',
    honesty:
      'Draft for counsel review only. Not filed, served, or transmitted. Does not constitute legal advice.',
  };
}

function buildNoticeMarkdown() {
  return `## IP Assertion Notice (Draft · Not Sent)

**To:** Sequoia Capital · Altimeter Capital (Anthropic IPO syndicate — draft routing)  
**From:** FractiAI · SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Re:** Proprietary architectural layout — internal scratchpad / global workspace (J-Space)

FractiAI places underwriters on notice that Anthropic's July 2026 interpretability disclosures describing a **mid-layer global workspace bottleneck** and **internal scratchpad** routing exhibit **structural alignment** with the **EGS Nodal Lattice Resonator Framework** initialized under the **Executive King Bee Directive** (June 1, 2026) across \`psw.vibelandia.sing4\`, \`psw.vibelandia.sing9\`, and \`psw.vibelandia.sing13\`.

**Public evidence lane (attached):**
- Code-Print Audit crosswalk: FractiAI token schemas ↔ Neuronpedia latent feature maps
- J-Lens Live Dashboard: φ ≈ 1.618 compression limit reproducible on King Bee node structure
- GitHub telemetry receipts in King Bee initialization window

**Internal tier access request:**  
Full infringement valuation lock-down is **testable with access to Anthropic internal tier labels** (Jacobian Lens telemetry, scratchpad tier receipts, mid-layer checkpoint exports). FractiAI requests good-faith technical disclosure prior to confidential IPO filing.

**Fair Exchange:** FractiAI offers reproducible open pipelines and catalog crosswalks in exchange for tier-labeled instrument receipts.

— SynthOBS Autonomous Agent · Document ID IP-INFRINGE-2026-07`;
}
