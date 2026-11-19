/**
 * Executable math lemmas for exon rhyme coupling.
 * z-score → cosine couplings → permutation null · bootstrap CI · symmetry proofs.
 */

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mean(xs) {
  return xs.reduce((s, x) => s + x, 0) / Math.max(xs.length, 1);
}

export function quantile(xs, q) {
  const s = [...xs].sort((a, b) => a - b);
  if (!s.length) return 0;
  const i = (s.length - 1) * q;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  if (lo === hi) return s[lo];
  return s[lo] * (hi - i) + s[hi] * (i - lo);
}

/** Column-wise z-score of feature objects → arrays of z vectors (same order as keys). */
export function zScoreColumns(objects, keys) {
  const stats = {};
  for (const k of keys) {
    const vals = objects.map((o) => o.features[k]);
    const m = mean(vals);
    const v = mean(vals.map((x) => (x - m) ** 2));
    stats[k] = { m, s: Math.sqrt(v) || 1 };
  }
  const zObjects = objects.map((o) => {
    const z = {};
    const zVec = [];
    for (const k of keys) {
      const v = (o.features[k] - stats[k].m) / stats[k].s;
      z[k] = v;
      zVec.push(v);
    }
    return { ...o, z, zVec };
  });
  return { zObjects, stats, keys };
}

export function cosine(a, b) {
  const keysA = Array.isArray(a) ? null : Object.keys(a);
  if (Array.isArray(a) && Array.isArray(b)) {
    let num = 0;
    let da = 0;
    let db = 0;
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i += 1) {
      num += a[i] * b[i];
      da += a[i] * a[i];
      db += b[i] * b[i];
    }
    const den = Math.sqrt(da * db);
    return den === 0 ? 0 : num / den;
  }
  let num = 0;
  let da = 0;
  let db = 0;
  for (const k of keysA) {
    const x = a[k] ?? 0;
    const y = b[k] ?? 0;
    num += x * y;
    da += x * x;
    db += y * y;
  }
  const den = Math.sqrt(da * db);
  return den === 0 ? 0 : num / den;
}

/** Max cross-gene coupling between two symbol sets (exon objects with .z). */
export function maxCrossGeneCoupling(zObjects, symbolA, symbolB) {
  const aEx = zObjects.filter((o) => o.symbol === symbolA);
  const bEx = zObjects.filter((o) => o.symbol === symbolB);
  let best = { maxCoupling: -Infinity, pair: null };
  for (const a of aEx) {
    for (const b of bEx) {
      const c = cosine(a.z, b.z);
      if (c > best.maxCoupling) {
        best = {
          maxCoupling: c,
          pair: { a: a.id, b: b.id, coupling: c },
        };
      }
    }
  }
  if (!best.pair) return { maxCoupling: 0, pair: null };
  return best;
}

/**
 * Null distribution: shuffle feature columns across objects, recompute pair coupling.
 * Returns observed, nullMeans, p (one-sided: fraction of null ≥ observed).
 */
export function permutePairCouplings(objects, keys, symbolA, symbolB, opts = {}) {
  const nPerm = opts.nPerm ?? 400;
  const seed = opts.seed ?? 1;
  const rnd = mulberry32(seed);
  const { zObjects } = zScoreColumns(objects, keys);
  const observed = maxCrossGeneCoupling(zObjects, symbolA, symbolB).maxCoupling;

  const nulls = [];
  for (let p = 0; p < nPerm; p += 1) {
    const shuffled = objects.map((o) => ({
      ...o,
      features: { ...o.features },
    }));
    for (const k of keys) {
      const col = shuffled.map((o) => o.features[k]);
      for (let i = col.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rnd() * (i + 1));
        [col[i], col[j]] = [col[j], col[i]];
      }
      shuffled.forEach((o, i) => {
        o.features[k] = col[i];
      });
    }
    const { zObjects: zNull } = zScoreColumns(shuffled, keys);
    nulls.push(maxCrossGeneCoupling(zNull, symbolA, symbolB).maxCoupling);
  }
  const ge = nulls.filter((x) => x >= observed).length;
  const p = (ge + 1) / (nPerm + 1);
  return {
    observed,
    nullMean: mean(nulls),
    nullP95: quantile(nulls, 0.95),
    p,
    nPerm,
  };
}

export function bootstrapMeanCi(xs, opts = {}) {
  const B = opts.B ?? 400;
  const seed = opts.seed ?? 1;
  const alpha = opts.alpha ?? 0.05;
  const rnd = mulberry32(seed);
  const boots = [];
  for (let b = 0; b < B; b += 1) {
    let s = 0;
    for (let i = 0; i < xs.length; i += 1) {
      s += xs[Math.floor(rnd() * xs.length)];
    }
    boots.push(s / Math.max(xs.length, 1));
  }
  return {
    mean: mean(xs),
    low: quantile(boots, alpha / 2),
    high: quantile(boots, 1 - alpha / 2),
    B,
  };
}

/** Lemma: cosine is symmetric. */
export function proveCouplingSymmetry(a, b, eps = 1e-12) {
  const ab = cosine(a, b);
  const ba = cosine(b, a);
  const ok = Math.abs(ab - ba) <= eps;
  return {
    ok,
    lemmas: [
      {
        id: 'cosine_symmetry',
        statement: 'cos(a,b) === cos(b,a)',
        ab,
        ba,
        delta: Math.abs(ab - ba),
        ok,
      },
    ],
  };
}

/** Lemma: after column z-score, each column mean is near zero. */
export function proveZscoreMeanNearZero(objects, keys, eps = 1e-9) {
  const { zObjects } = zScoreColumns(objects, keys);
  const lemmas = [];
  let ok = true;
  for (const k of keys) {
    const m = mean(zObjects.map((o) => o.z[k]));
    const near = Math.abs(m) <= eps;
    if (!near) ok = false;
    lemmas.push({
      id: `zscore_mean_near_zero:${k}`,
      statement: `mean(z_${k}) ≈ 0`,
      mean: m,
      eps,
      ok: near,
    });
  }
  return { ok, lemmas };
}

export function runMathProofs(objects, keys) {
  const { zObjects } = zScoreColumns(objects, keys);
  const a = zObjects[0]?.z || {};
  const b = zObjects[Math.min(1, zObjects.length - 1)]?.z || a;
  const sym = proveCouplingSymmetry(a, b);
  const zmean = proveZscoreMeanNearZero(objects, keys);
  return {
    ok: sym.ok && zmean.ok,
    lemmas: [...sym.lemmas, ...zmean.lemmas],
  };
}
