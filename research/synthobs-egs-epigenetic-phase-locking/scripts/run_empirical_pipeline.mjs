import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PHI_EGS, TARGET_GENES, TISSUE_KEYS } from "../src/constants.mjs";
import {
  fetchGTExMedianExpression,
  fetchGTExReferenceBySymbol,
  searchEncodePancreasAtacExperiments,
  fetchEncodeExperiment,
  fetchEncodeBedFile,
} from "../src/fetch-public-data.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "data");
const OUT_JSON = path.join(OUT_DIR, "empirical_report.json");
const OUT_MD = path.join(OUT_DIR, "empirical_report.md");

function ratio(a, b) {
  if (b === 0) return null;
  return a / b;
}

function phiDistance(value) {
  if (!value || value <= 0) return null;
  return Math.abs(Math.log(value / PHI_EGS));
}

function pickTissueMedian(rows, tissueId) {
  const row = rows.find((r) => r.tissueSiteDetailId === tissueId);
  return row ? Number(row.median) : null;
}

function parseBedLine(line) {
  const c = line.split("\t");
  if (c.length < 3) return null;
  return {
    chrom: c[0],
    start: Number(c[1]),
    end: Number(c[2]),
    score: c[6] ? Number(c[6]) : null,
  };
}

function overlapsWindow(peak, chrom, start, end) {
  if (peak.chrom !== chrom) return false;
  return peak.end >= start && peak.start <= end;
}

function spacingRatios(peaks) {
  if (peaks.length < 3) return [];
  const centers = peaks
    .map((p) => (p.start + p.end) / 2)
    .sort((a, b) => a - b);
  const diffs = [];
  for (let i = 1; i < centers.length; i += 1) {
    diffs.push(centers[i] - centers[i - 1]);
  }
  const ratios = [];
  for (let i = 1; i < diffs.length; i += 1) {
    if (diffs[i - 1] > 0 && diffs[i] > 0) ratios.push(diffs[i] / diffs[i - 1]);
  }
  return ratios;
}

function summarizeRatios(values) {
  if (!values.length) return { n: 0, median: null, phiMatchPct: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const close = values.filter((v) => Math.abs(v - PHI_EGS) / PHI_EGS <= 0.15).length;
  return {
    n: values.length,
    median,
    phiMatchPct: (close / values.length) * 100,
  };
}

async function run() {
  const runAt = new Date().toISOString();

  const symbols = Object.keys(TARGET_GENES);
  const refs = {};
  const medians = {};
  for (const s of symbols) {
    refs[s] = await fetchGTExReferenceBySymbol(s);
    medians[s] = await fetchGTExMedianExpression(TARGET_GENES[s]);
  }

  const pomcHyp = pickTissueMedian(medians.POMC, TISSUE_KEYS.hypothalamus);
  const npyHyp = pickTissueMedian(medians.NPY, TISSUE_KEYS.hypothalamus);
  const pomcNpyRatio = ratio(pomcHyp, npyHyp);

  const insPan = pickTissueMedian(medians.INS, TISSUE_KEYS.pancreas);
  const pdx1Pan = pickTissueMedian(medians.PDX1, TISSUE_KEYS.pancreas);
  const insPdx1Ratio = ratio(insPan, pdx1Pan);

  const dnmt1Pan = pickTissueMedian(medians.DNMT1, TISSUE_KEYS.pancreas);
  const dnmt3aPan = pickTissueMedian(medians.DNMT3A, TISSUE_KEYS.pancreas);
  const dnmtRatio = ratio(dnmt1Pan, dnmt3aPan);

  const encodeSearch = await searchEncodePancreasAtacExperiments(5);
  const selectedAccession = encodeSearch[0]?.accession || null;
  const selectedExperiment = selectedAccession ? await fetchEncodeExperiment(selectedAccession) : null;

  const requestedAccession = await fetchEncodeExperiment("ENCSR493MWX");
  const requestedAccessionFound = Boolean(requestedAccession);

  let atacWindowStats = null;
  if (selectedExperiment) {
    const bedFile = (selectedExperiment.files || []).find(
      (f) =>
        f.file_format === "bed" &&
        f.output_type === "IDR thresholded peaks" &&
        f.assembly === "GRCh38",
    );
    if (bedFile?.href) {
      const text = await fetchEncodeBedFile(bedFile.href);
      const peaks = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map(parseBedLine)
        .filter(Boolean);

      const windows = {
        INS: {
          chrom: refs.INS.chromosome,
          start: Math.max(0, Number(refs.INS.start) - 50000),
          end: Number(refs.INS.end) + 50000,
        },
        PDX1: {
          chrom: refs.PDX1.chromosome,
          start: Math.max(0, Number(refs.PDX1.start) - 50000),
          end: Number(refs.PDX1.end) + 50000,
        },
      };

      const insPeaks = peaks.filter((p) =>
        overlapsWindow(p, windows.INS.chrom, windows.INS.start, windows.INS.end),
      );
      const pdx1Peaks = peaks.filter((p) =>
        overlapsWindow(p, windows.PDX1.chrom, windows.PDX1.start, windows.PDX1.end),
      );

      atacWindowStats = {
        experimentAccession: selectedAccession,
        bedAccession: bedFile.accession,
        insWindow: { ...windows.INS, peakCount: insPeaks.length },
        pdx1Window: { ...windows.PDX1, peakCount: pdx1Peaks.length },
        spacing: {
          INS: summarizeRatios(spacingRatios(insPeaks)),
          PDX1: summarizeRatios(spacingRatios(pdx1Peaks)),
        },
      };
    }
  }

  const report = {
    documentId: "WP-SYNTHOBS-EPI-PHASELOCK-2026-07",
    runAt,
    provenance: {
      gtexDatasetId: "gtex_v8",
      gtexApi: "https://gtexportal.org/api/v2",
      encodeApi: "https://www.encodeproject.org",
      requestedEncodeAccession: "ENCSR493MWX",
      requestedEncodeAccessionFound: requestedAccessionFound,
      selectedEncodePancreasAtacAccession: selectedAccession,
    },
    metrics: {
      hypothalamus: {
        POMC: pomcHyp,
        NPY: npyHyp,
        ratio_POMC_to_NPY: pomcNpyRatio,
        phiDistanceLog: phiDistance(pomcNpyRatio),
      },
      pancreas: {
        INS: insPan,
        PDX1: pdx1Pan,
        ratio_INS_to_PDX1: insPdx1Ratio,
        phiDistanceLog: phiDistance(insPdx1Ratio),
        DNMT1: dnmt1Pan,
        DNMT3A: dnmt3aPan,
        ratio_DNMT1_to_DNMT3A: dnmtRatio,
      },
      encodeAtacPromoterWindows: atacWindowStats,
    },
    findings: {
      F1_hypothalamus_ratio:
        pomcNpyRatio == null
          ? "inconclusive_no_data"
          : pomcNpyRatio > 1
            ? "support_directional_POMC_above_NPY"
            : "no_support_directional",
      F2_pancreas_ratio:
        insPdx1Ratio == null
          ? "inconclusive_no_data"
          : insPdx1Ratio > 1
            ? "support_INS_above_PDX1"
            : "no_support_INS_above_PDX1",
      F3_encode_accessibility:
        atacWindowStats &&
        atacWindowStats.insWindow.peakCount > 0 &&
        atacWindowStats.pdx1Window.peakCount > 0
          ? "support_open_peaks_near_INS_PDX1_windows"
          : "inconclusive_window_peaks",
      F4_phi_spacing:
        atacWindowStats &&
        atacWindowStats.spacing.INS.phiMatchPct >= 25 &&
        atacWindowStats.spacing.PDX1.phiMatchPct >= 25
          ? "moderate_phi_spacing_match"
          : "no_support_phi_spacing_strong",
    },
    honesty: {
      note: "These are public-data correlations and exploratory geometric summaries, not causal proof of epigenetic protection or clinical benefit.",
      notClaimed:
        "No in vivo phase-lock intervention, no patient-level causal inference, and no claim that high-glycemic risk is neutralized in real humans.",
    },
  };

  const md = [
    "# SYNTHOBS EGS Epigenetic Phase-Locking · Empirical Report",
    "",
    `- Run time: ${runAt}`,
    `- Document ID: ${report.documentId}`,
    `- GTEx dataset: ${report.provenance.gtexDatasetId}`,
    `- ENCODE requested accession present: ${report.provenance.requestedEncodeAccessionFound}`,
    `- ENCODE selected pancreas ATAC accession: ${report.provenance.selectedEncodePancreasAtacAccession || "none"}`,
    "",
    "## Core metrics",
    "",
    `- Hypothalamus POMC/NPY ratio: ${report.metrics.hypothalamus.ratio_POMC_to_NPY ?? "NA"}`,
    `- Pancreas INS/PDX1 ratio: ${report.metrics.pancreas.ratio_INS_to_PDX1 ?? "NA"}`,
    `- Pancreas DNMT1/DNMT3A ratio: ${report.metrics.pancreas.ratio_DNMT1_to_DNMT3A ?? "NA"}`,
    "",
    "## ENCODE ATAC promoter windows (±50kb)",
    "",
    report.metrics.encodeAtacPromoterWindows
      ? `- INS window peak count: ${report.metrics.encodeAtacPromoterWindows.insWindow.peakCount}`
      : "- INS window peak count: NA",
    report.metrics.encodeAtacPromoterWindows
      ? `- PDX1 window peak count: ${report.metrics.encodeAtacPromoterWindows.pdx1Window.peakCount}`
      : "- PDX1 window peak count: NA",
    report.metrics.encodeAtacPromoterWindows
      ? `- INS phi-spacing match (% within 15% tolerance): ${report.metrics.encodeAtacPromoterWindows.spacing.INS.phiMatchPct.toFixed(2)}`
      : "- INS phi-spacing match: NA",
    report.metrics.encodeAtacPromoterWindows
      ? `- PDX1 phi-spacing match (% within 15% tolerance): ${report.metrics.encodeAtacPromoterWindows.spacing.PDX1.phiMatchPct.toFixed(2)}`
      : "- PDX1 phi-spacing match: NA",
    "",
    "## Findings tier",
    "",
    `- F1: ${report.findings.F1_hypothalamus_ratio}`,
    `- F2: ${report.findings.F2_pancreas_ratio}`,
    `- F3: ${report.findings.F3_encode_accessibility}`,
    `- F4: ${report.findings.F4_phi_spacing}`,
    "",
    "## Honesty boundary",
    "",
    `- ${report.honesty.note}`,
    `- ${report.honesty.notClaimed}`,
    "",
  ].join("\n");

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await fs.writeFile(OUT_MD, `${md}\n`, "utf8");

  console.log(`Wrote: ${OUT_JSON}`);
  console.log(`Wrote: ${OUT_MD}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
