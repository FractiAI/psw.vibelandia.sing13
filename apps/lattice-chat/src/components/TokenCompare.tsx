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
  balanceBefore?: number | null;
  balanceAfter?: number | null;
  nestTopology?: 'single' | 'multi' | 'goldilocks';
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
  const nestOverhead =
    args.nestTopology === 'single' ? 0 : LATTICE_NEST_OVERHEAD_TOKENS;
  const estimatedLatticeTokens = Math.max(
    msgTok + 200,
    Math.round(
      histTok + msgTok + LATTICE_RAG_POINTER_TOKENS + nestOverhead + replyTok - resumeDiscount,
    ),
  );

  const balanceBefore =
    typeof args.balanceBefore === 'number' ? args.balanceBefore : null;
  const balanceAfter = typeof args.balanceAfter === 'number' ? args.balanceAfter : null;
  const balanceDelta =
    balanceBefore != null && balanceAfter != null
      ? Math.max(0, Math.round(balanceAfter - balanceBefore))
      : null;
  const measuredTokens =
    balanceDelta != null && balanceDelta > 0
      ? balanceDelta
      : typeof args.usageTokens === 'number' && args.usageTokens > 0
        ? Math.round(args.usageTokens)
        : null;

  const latticeTokens = measuredTokens != null ? measuredTokens : estimatedLatticeTokens;
  const savedTokens = Math.max(0, naiveTokens - latticeTokens);
  const savedPercent = naiveTokens > 0 ? Math.round((savedTokens / naiveTokens) * 1000) / 10 : 0;
  const measured = measuredTokens != null;

  return {
    naiveTokens,
    latticeTokens,
    estimatedLatticeTokens,
    measuredTokens,
    balanceBefore,
    balanceAfter,
    balanceDelta,
    savedTokens,
    savedPercent,
    standardLabel: 'Standard agentic (est.)',
    latticeLabel: measured
      ? 'Lattice (measured)'
      : args.nestTopology === 'single'
        ? 'Lattice single (est.)'
        : 'Lattice (est.)',
    method: measured
      ? balanceBefore != null && balanceAfter != null
        ? 'Measured from provider token balances (before → after delta)'
        : 'Measured from provider run usage'
      : 'Estimate chars÷4 · standard corpus dump vs Lattice RAG pointers',
  };
}

export function TokenCompareFooter({ tokens }: { tokens: TokenCompare }) {
  const standard = tokens.standardLabel || 'Standard agentic (est.)';
  const lattice = tokens.latticeLabel || 'Lattice (est.)';
  const measured = typeof tokens.measuredTokens === 'number' && tokens.measuredTokens > 0;
  const hasBalances =
    typeof tokens.balanceBefore === 'number' && typeof tokens.balanceAfter === 'number';

  return (
    <div className="token-compare" aria-label={measured ? 'Token usage' : 'Token estimate'}>
      <p className="token-compare-row">
        <span className="token-compare-label">Tokens</span>
        <span className="token-compare-text">
          {standard} ~{tokens.naiveTokens.toLocaleString()}
          <span className="token-compare-dot">·</span>
          {lattice} {measured ? '' : '~'}
          {tokens.latticeTokens.toLocaleString()}
        </span>
      </p>
      {hasBalances ? (
        <p className="token-compare-row">
          <span className="token-compare-label">Balance</span>
          <span className="token-compare-text">
            {tokens.balanceBefore!.toLocaleString()} → {tokens.balanceAfter!.toLocaleString()}
            <span className="token-compare-dot">·</span>
            used {(tokens.balanceDelta ?? tokens.latticeTokens).toLocaleString()}
          </span>
        </p>
      ) : null}
      <p className="token-compare-honesty">
        {measured
          ? 'Actual provider balance/usage for this run (not an estimate). Standard column remains a structural context-load comparison. '
          : 'Structural estimate only (chars÷4 · not a vendor bill). '}
        Method: <a href="/lattice/proof">nested + pointer context load</a>.
      </p>
    </div>
  );
}
