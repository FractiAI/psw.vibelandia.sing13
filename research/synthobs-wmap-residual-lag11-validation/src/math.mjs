/**
 * Executable math lemmas for residual lag correlation symmetry / lag definition.
 */
import { pearson } from '../../synthobs-cosmic-rhyme-expedition/src/stats.mjs';

/** Lemma: Pearson correlation is symmetric. */
export function proveCorrelationSymmetry(xs, ys, eps = 1e-12) {
  const ab = pearson(xs, ys);
  const ba = pearson(ys, xs);
  const ok = Number.isFinite(ab) && Number.isFinite(ba) && Math.abs(ab - ba) <= eps;
  return {
    ok,
    lemmas: [
      {
        id: 'residual_correlation_symmetry',
        statement: 'corr(x,y) === corr(y,x)',
        ab,
        ba,
        delta: Math.abs(ab - ba),
        ok,
      },
    ],
  };
}

/**
 * Lemma: lag-k series definition — xs[i] paired with ys[i]=series[i+k]
 * and reverse pairing yields the same absolute correlation magnitude.
 */
export function proveLagDefinition(series, lag, eps = 1e-12) {
  const xs = [];
  const ys = [];
  for (let i = 0; i + lag < series.length; i += 1) {
    xs.push(series[i]);
    ys.push(series[i + lag]);
  }
  const forward = Math.abs(pearson(xs, ys));
  const reverse = Math.abs(pearson(ys, xs));
  const ok =
    Number.isFinite(forward) &&
    Number.isFinite(reverse) &&
    Math.abs(forward - reverse) <= eps &&
    lag >= 1 &&
    Number.isInteger(lag);
  return {
    ok,
    lemmas: [
      {
        id: `lag_definition:lag-${lag}`,
        statement: `|corr(s[i], s[i+${lag}])| === |corr(s[i+${lag}], s[i])| and lag is positive integer`,
        lag,
        forward,
        reverse,
        delta: Math.abs(forward - reverse),
        ok,
      },
    ],
  };
}

export function runMathProofs(residualSeries, focusLags = [11, 14]) {
  const n = residualSeries.length;
  const mid = Math.floor(n / 2);
  const xs = residualSeries.slice(0, mid);
  const ys = residualSeries.slice(n - mid);
  const len = Math.min(xs.length, ys.length);
  const sym = proveCorrelationSymmetry(xs.slice(0, len), ys.slice(0, len));
  const lagLemmas = focusLags.map((lag) => proveLagDefinition(residualSeries, lag));
  const lemmas = [...sym.lemmas, ...lagLemmas.flatMap((L) => L.lemmas)];
  const ok = sym.ok && lagLemmas.every((L) => L.ok);
  return { ok, lemmas };
}
