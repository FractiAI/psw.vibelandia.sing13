/**
 * Detect whether geomagnetic sensitivity appears recently activated.
 * Dual window: calendar-recent Kp (through today) + collar movement coupling when dates overlap.
 */

function addDays(dateStr, delta) {
  const t = new Date(`${dateStr}T12:00:00Z`);
  t.setUTCDate(t.getUTCDate() + delta);
  return t.toISOString().slice(0, 10);
}

export function calendarRecentWindow(endDate) {
  const end = endDate || new Date().toISOString().slice(0, 10);
  return {
    calendarEnd: end,
    calendarStart90: addDays(end, -89),
    calendarStart30: addDays(end, -29),
    calendarStart14: addDays(end, -13),
    baselineStart: addDays(end, -365 * 5),
  };
}

function filterKpRecent(kpDaily, start) {
  return (kpDaily || []).filter((k) => k.date >= start);
}

function stormDaysInWindow(kpDaily, start, end, threshold = 5) {
  return kpDaily.filter(
    (k) => k.date >= start && k.date <= end && (k.kpMax ?? k.kp ?? 0) >= threshold
  );
}

function meanMetric(rows, key) {
  const vals = rows.map((r) => r[key]).filter((v) => Number.isFinite(v));
  if (!vals.length) return null;
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}

function movementCoupling(herdRows, start, end) {
  const inWin = herdRows.filter((h) => h.date >= start && h.date <= end);
  if (inWin.length < 5) {
    return {
      testable: false,
      reason: 'insufficient herd days in window',
      nDays: inWin.length,
    };
  }
  const storm = inWin.filter((h) => (h.kpMax ?? 0) >= 5);
  const quiet = inWin.filter((h) => (h.kpMax ?? 0) < 4);
  if (!storm.length) {
    return {
      testable: true,
      couplingDetected: false,
      reason: 'no Kp≥5 days in window to test coupling',
      nStormDays: 0,
      nQuietDays: quiet.length,
    };
  }
  if (quiet.length < 3) {
    return {
      testable: true,
      couplingDetected: false,
      reason: 'too few quiet days for contrast',
      nStormDays: storm.length,
      nQuietDays: quiet.length,
    };
  }
  const stormStep = meanMetric(storm, 'meanStepKm');
  const quietStep = meanMetric(quiet, 'meanStepKm');
  const stormSpread = meanMetric(storm, 'herdSpreadKm');
  const quietSpread = meanMetric(quiet, 'herdSpreadKm');
  const stormDir = meanMetric(storm, 'directionalConsistency');
  const quietDir = meanMetric(quiet, 'directionalConsistency');
  const deltaStep =
    stormStep != null && quietStep != null ? stormStep - quietStep : null;
  const relDelta = quietStep ? Math.abs(deltaStep) / (Math.abs(quietStep) || 1) : 0;
  const couplingDetected =
    relDelta > 0.12 ||
    (stormDir != null &&
      quietDir != null &&
      Math.abs(stormDir - quietDir) > 0.08) ||
    (stormSpread != null &&
      quietSpread != null &&
      Math.abs(stormSpread - quietSpread) / (quietSpread || 1) > 0.12);

  return {
    testable: true,
    couplingDetected,
    nStormDays: storm.length,
    nQuietDays: quiet.length,
    stormMeanStepKm: stormStep,
    quietMeanStepKm: quietStep,
    deltaStepKm: deltaStep,
    relativeDelta: relDelta,
  };
}

/**
 * @param {object} opts
 * @param {Array} opts.kpDaily - daily Kp through calendarEnd (today)
 * @param {Array} opts.herdDaily - herd metrics (may be historical collar dates)
 * @param {string} opts.collarLast - ISO date last collar fix
 * @param {object} opts.historicalCoupling - from full collar+Kp record
 * @param {Array} opts.rankedAnomalies - recent z-score flags
 * @param {boolean} opts.collarOverlapsCalendarRecent
 */
export function assessSensitivityActivation(opts = {}) {
  const cal = calendarRecentWindow(opts.calendarEnd);
  const kp = opts.kpDaily || [];
  const herd = opts.herdDaily || [];

  const kp14 = filterKpRecent(kp, cal.calendarStart14);
  const kp30 = filterKpRecent(kp, cal.calendarStart30);
  const storms14 = stormDaysInWindow(kp, cal.calendarStart14, cal.calendarEnd, 5);
  const storms30 = stormDaysInWindow(kp, cal.calendarStart30, cal.calendarEnd, 5);
  const severe14 = stormDaysInWindow(kp, cal.calendarStart14, cal.calendarEnd, 7);
  const maxKp14 = kp14.length ? Math.max(...kp14.map((k) => k.kpMax ?? 0)) : 0;
  const maxKp30 = kp30.length ? Math.max(...kp30.map((k) => k.kpMax ?? 0)) : 0;

  const driverActive14d = storms14.length > 0;
  const driverActive30d = storms30.length > 0;

  const collarOverlaps =
    opts.collarOverlapsCalendarRecent ??
    (opts.collarLast && opts.collarLast >= cal.calendarStart14);

  const recentHerd = herd.filter(
    (h) => h.date >= cal.calendarStart30 && h.date <= cal.calendarEnd
  );
  const coupling14 = movementCoupling(herd, cal.calendarStart14, cal.calendarEnd);
  const coupling30 = movementCoupling(herd, cal.calendarStart30, cal.calendarEnd);
  const hist = opts.historicalCoupling || {};

  const recentAnomalies = (opts.rankedAnomalies || []).filter(
    (a) => a.date >= cal.calendarStart14 && Math.abs(a.zScore ?? 0) >= 1.5
  );
  const anomalyOnStormDay = recentAnomalies.some((a) => {
    const dayKp = kp.find((k) => k.date === a.date);
    return dayKp && (dayKp.kpMax ?? 0) >= 5;
  });

  let status = 'latent';
  let activated = false;
  let confidence = 0.35;
  let headline = 'No recent geomagnetic storm forcing detected (Kp≥5 in last 14 days).';
  const evidence = [];

  if (driverActive14d) {
    evidence.push(
      `${storms14.length} storm day(s) in last 14d (max Kp ${maxKp14.toFixed(1)}).`
    );
    if (severe14.length) {
      evidence.push(`${severe14.length} strong/severe interval(s) (Kp≥7) in last 14d.`);
    }
  }

  if (collarOverlaps && coupling14.testable && coupling14.couplingDetected) {
    status = 'active';
    activated = true;
    confidence = 0.78;
    headline =
      'Geomagnetic sensitivity appears RECENTLY ACTIVATED: live storms in the last 14 days coincide with measurable herd movement coupling on collar GPS.';
    evidence.push('Collar GPS overlaps calendar-recent window; storm vs quiet movement contrast detected.');
  } else if (collarOverlaps && coupling14.testable && anomalyOnStormDay) {
    status = 'active';
    activated = true;
    confidence = 0.68;
    headline =
      'Geomagnetic sensitivity likely RECENTLY ACTIVATED: movement anomalies align with recent Kp≥5 days (collar GPS).';
    evidence.push('Z-score movement anomaly on at least one recent storm day.');
  } else if (driverActive14d && !collarOverlaps) {
    if (hist.couplingDetected) {
      status = 'watch';
      activated = false;
      confidence = 0.55;
      headline =
        'Geomagnetic driver ACTIVE in last 14 days; historical collar record shows storm–movement coupling — sensitivity may be primed (no live collar overlap to confirm today).';
      evidence.push(
        `Historical coupling: Δ step ${hist.deltaStepKm?.toFixed(2) ?? '—'} km (storm vs quiet).`
      );
      evidence.push(`Last public collar fix: ${opts.collarLast || 'unknown'}.`);
    } else if (driverActive30d) {
      status = 'driver_active';
      activated = false;
      confidence = 0.5;
      headline =
        'Recent geomagnetic storms present (last 30d) but no testable movement coupling in public collar data — sensitivity activation not confirmed.';
      evidence.push(`${storms30.length} storm day(s) in last 30d (max Kp ${maxKp30.toFixed(1)}).`);
    } else {
      status = 'driver_active';
      confidence = 0.48;
      headline = 'Recent Kp≥5 forcing in last 14 days; collar data too stale to test herbivore response.';
    }
  } else if (driverActive30d && !driverActive14d) {
    status = 'elevated';
    confidence = 0.42;
    headline =
      'Elevated geomagnetic activity in last 30 days (not last 14) — monitor for sensitivity activation.';
    evidence.push(`${storms30.length} storm day(s) in last 30d.`);
  } else {
    status = 'latent';
    confidence = 0.4;
    headline = 'Geomagnetic sensitivity not recently activated: quiet Kp in last 14 days.';
  }

  if (collarOverlaps && coupling14.testable && !coupling14.couplingDetected && driverActive14d) {
    status = 'driver_only';
    confidence = 0.52;
    headline =
      'Recent storms present but collar GPS shows no storm–movement coupling in the last 14 days — sensitivity not activated (or masked by other drivers).';
    evidence.push('Storm forcing without measurable movement shift on available collar days.');
  }

  return {
    schema: 'geomagnetic-sensitivity-activation/v1',
    assessedAt: new Date().toISOString(),
    activated,
    status,
    confidence: Math.min(0.95, confidence),
    headline,
    evidence,
    calendarWindow: cal,
    recentGeomagnetic: {
      driverActive14d,
      driverActive30d,
      stormDays14d: storms14.length,
      stormDays30d: storms30.length,
      maxKp14d: maxKp14,
      maxKp30d: maxKp30,
      recentStormDates14d: storms14.map((s) => s.date),
    },
    recentMovementCoupling: {
      collarOverlapsCalendarRecent: collarOverlaps,
      collarLast: opts.collarLast || null,
      window14d: coupling14,
      window30d: coupling30,
      herdDaysInCalendar30d: recentHerd.length,
    },
    historicalCoupling: hist,
    recentAnomalyCount14d: recentAnomalies.length,
    anomalyOnStormDay,
  };
}
