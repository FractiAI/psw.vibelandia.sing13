import type { TokenCompare } from '@/types';

const NAIVE_CORPUS_DUMP_TOKENS = 72_000;
const LATTICE_RAG_POINTER_TOKENS = 1_800;
const LATTICE_NEST_OVERHEAD_TOKENS = 420;

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(String(text || '').length / 4));
}

/** Client-side fallback when the API omits tokens. */
export function estimateTokenCompare(args: {
  message: string;
  history?: { role?: string; content?: string }[];
  reply?: string;
  resumed?: boolean;
  usageTokens?: number | null;
}): TokenCompare {
  const history = Array.isArray(args.history) ? args.history.slice(-16) : [];
  const historyText = history.map((m) => `${m.role || ''}: ${m.content || ''}`).join('\n');
  const msgTok = estimateTokens(args.message);
  const histTok = estimateTokens(historyText);
  const replyTok = args.reply ? estimateTokens(args.reply) : 0;
  const naiveHistory = estimateTokens(
    history.map((m) => `${m.role}: ${m.content}`).join('\n'),
  );
  const naiveTokens = naiveHistory + NAIVE_CORPUS_DUMP_TOKENS + msgTok + Math.max(replyTok, 400);
  const resumeDiscount = args.resumed ? Math.floor(histTok * 0.55) : 0;
  let latticeTokens =
    histTok +
    msgTok +
    LATTICE_RAG_POINTER_TOKENS +
    LATTICE_NEST_OVERHEAD_TOKENS +
    replyTok -
    resumeDiscount;
  if (typeof args.usageTokens === 'number' && args.usageTokens > 0) {
    latticeTokens = Math.min(latticeTokens, args.usageTokens);
  }
  latticeTokens = Math.max(msgTok + 200, Math.round(latticeTokens));
  const savedTokens = Math.max(0, naiveTokens - latticeTokens);
  const savedPercent = naiveTokens > 0 ? Math.round((savedTokens / naiveTokens) * 1000) / 10 : 0;
  return {
    naiveTokens,
    latticeTokens,
    savedTokens,
    savedPercent,
    standardLabel: 'Standard agentic (est.)',
    latticeLabel: 'Lattice (est.)',
    method: 'Estimate chars÷4 · standard corpus dump vs Lattice RAG pointers',
  };
}

export function TokenCompareFooter({ tokens }: { tokens: TokenCompare }) {
  const standard = tokens.standardLabel || 'Standard agentic (est.)';
  const lattice = tokens.latticeLabel || 'Lattice (est.)';
  return (
    <div className="token-compare" aria-label="Token estimate">
      <p className="token-compare-row">
        <span className="token-compare-label">Tokens</span>
        <span className="token-compare-text">
          {standard} ~{tokens.naiveTokens.toLocaleString()}
          <span className="token-compare-dot">·</span>
          {lattice} ~{tokens.latticeTokens.toLocaleString()}
          <span className="token-compare-dot">·</span>
          saved ~{tokens.savedTokens.toLocaleString()} (−{tokens.savedPercent}%)
        </span>
      </p>
      <p className="token-compare-honesty">
        Estimate only (not a vendor bill). Same idea as the{' '}
        <a href="/lattice/proof">public Lattice token-reduction proof</a>.
      </p>
    </div>
  );
}
