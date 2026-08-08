import type { TokenCompare } from '@/types';

/** True when the payload has real provider usage (balance delta or run usage). */
export function hasMeasuredTokens(tokens?: TokenCompare | null): boolean {
  if (!tokens) return false;
  if (typeof tokens.measuredTokens === 'number' && tokens.measuredTokens > 0) return true;
  if (
    typeof tokens.balanceBefore === 'number' &&
    typeof tokens.balanceAfter === 'number'
  ) {
    return true;
  }
  return false;
}

/** Prefer API-measured balances; never invent chars÷4 estimates for the chat meter. */
export function buildMeasuredTokenCompare(args: {
  usageTokens?: number | null;
  balanceBefore?: number | null;
  balanceAfter?: number | null;
}): TokenCompare | undefined {
  const balanceBefore =
    typeof args.balanceBefore === 'number' && Number.isFinite(args.balanceBefore)
      ? args.balanceBefore
      : null;
  const balanceAfter =
    typeof args.balanceAfter === 'number' && Number.isFinite(args.balanceAfter)
      ? args.balanceAfter
      : null;
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

  if (measuredTokens == null && balanceBefore == null && balanceAfter == null) {
    return undefined;
  }

  const used = measuredTokens ?? balanceDelta ?? 0;
  return {
    naiveTokens: 0,
    latticeTokens: used,
    estimatedLatticeTokens: null,
    measuredTokens: measuredTokens,
    balanceBefore,
    balanceAfter,
    balanceDelta,
    savedTokens: 0,
    savedPercent: 0,
    standardLabel: undefined,
    latticeLabel: 'Tokens used',
    method:
      balanceBefore != null && balanceAfter != null
        ? 'Measured from provider token balances (before → after delta)'
        : 'Measured from provider run usage',
  };
}

/** @deprecated Use buildMeasuredTokenCompare — estimates removed from chat meter. */
export function estimateTokenCompare(args: {
  usageTokens?: number | null;
  balanceBefore?: number | null;
  balanceAfter?: number | null;
  message?: string;
  history?: { role?: string; content?: string }[];
  reply?: string;
  resumed?: boolean;
  nestTopology?: 'none' | 'single' | 'multi' | 'goldilocks';
}): TokenCompare | undefined {
  return buildMeasuredTokenCompare(args);
}

export function TokenCompareFooter({ tokens }: { tokens: TokenCompare }) {
  if (!hasMeasuredTokens(tokens)) return null;

  const hasBalances =
    typeof tokens.balanceBefore === 'number' && typeof tokens.balanceAfter === 'number';
  const used =
    (typeof tokens.measuredTokens === 'number' && tokens.measuredTokens > 0
      ? tokens.measuredTokens
      : null) ??
    (typeof tokens.balanceDelta === 'number' ? tokens.balanceDelta : null) ??
    tokens.latticeTokens;

  return (
    <div className="token-compare token-compare--measured" aria-label="Measured token usage">
      <p className="token-compare-row">
        <span className="token-compare-label">Measured</span>
        <span className="token-compare-text">
          {hasBalances ? (
            <>
              balance {tokens.balanceBefore!.toLocaleString()} →{' '}
              {tokens.balanceAfter!.toLocaleString()}
              <span className="token-compare-dot">·</span>
              used {used.toLocaleString()}
            </>
          ) : (
            <>used {used.toLocaleString()} tokens</>
          )}
        </span>
      </p>
      <p className="token-compare-honesty">
        Actual provider ledger for this run — estimates removed from chat.
      </p>
    </div>
  );
}
