/**
 * Metrological Overlap · live dual-clock + prime-ladder demo
 * Catalog viz for /metrological-overlap — not particle-mass QED.
 */
(function () {
  const PHI = (1 + Math.sqrt(5)) / 2;
  const H = 6.62607015e-34;
  const C = 299792458;
  const NU = 1420405751.768;
  const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

  function lambdaHi() {
    return C / NU;
  }
  function catalogMass(nTerms) {
    let sum = 0;
    for (let n = 0; n < nTerms; n++) sum += 1 / (PRIMES[n] * PHI ** n);
    return (H * NU * sum) / C ** 2;
  }
  function ladder(nTerms) {
    return PRIMES.slice(0, nTerms).map((p, n) => ({
      n,
      p,
      term: 1 / (p * PHI ** n),
      dE: H * NU * PHI ** n,
    }));
  }

  function fmt(x, digits) {
    if (!Number.isFinite(x)) return '—';
    if (Math.abs(x) > 0 && Math.abs(x) < 1e-3) return x.toExponential(digits);
    if (Math.abs(x) >= 1e4) return x.toExponential(digits);
    return x.toFixed(digits);
  }

  function render() {
    const root = document.getElementById('metro-overlap-app');
    if (!root) return;
    const slider = document.getElementById('metro-n-terms');
    const nLabel = document.getElementById('metro-n-label');
    const n = slider ? Number(slider.value) : 10;
    if (nLabel) nLabel.textContent = String(n);

    const lam = lambdaHi();
    const mass = catalogMass(n);
    const rows = ladder(n);
    const maxTerm = rows[0]?.term || 1;

    const clockEl = document.getElementById('metro-dual-clock');
    if (clockEl) {
      clockEl.innerHTML =
        '<dl class="metro-dl">' +
        '<div><dt>Wave clock ν<sub>HI</sub></dt><dd>' +
        fmt(NU / 1e9, 6) +
        ' GHz</dd></div>' +
        '<div><dt>Material clock c</dt><dd>' +
        C.toLocaleString() +
        ' m/s</dd></div>' +
        '<div><dt>λ<sub>HI</sub> = c/ν<sub>HI</sub></dt><dd>' +
        fmt(lam, 9) +
        ' m</dd></div>' +
        '<div><dt>m<sub>catalog</sub> (' +
        n +
        ' primes)</dt><dd>' +
        fmt(mass, 4) +
        ' kg</dd></div>' +
        '</dl>';
    }

    const ladderEl = document.getElementById('metro-prime-ladder');
    if (ladderEl) {
      ladderEl.innerHTML = rows
        .map(function (r) {
          const pct = Math.max(4, (r.term / maxTerm) * 100);
          return (
            '<div class="metro-rung" style="--w:' +
            pct +
            '%">' +
            '<span class="metro-rung__label">n=' +
            r.n +
            ' · p=' +
            r.p +
            '</span>' +
            '<span class="metro-rung__bar" aria-hidden="true"></span>' +
            '<span class="metro-rung__val">' +
            fmt(r.term, 5) +
            '</span>' +
            '</div>'
          );
        })
        .join('');
    }
  }

  function boot() {
    const slider = document.getElementById('metro-n-terms');
    if (slider) slider.addEventListener('input', render);
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
