/**
 * E_F Coordinate Kernel — Goldilocks hybrid (deterministic half).
 * Indexes Φ = (1+√5)/2 fractional digits 1…2187 as 27×(9×9) matrices.
 * Architectural scale grammar — not calorimeter / SI / wet-lab proof.
 *
 * Spec: docs/SYNTHOBS_OMNI_LATTICE_EF_2187_HYBRID_ENGINE_2026-08.md
 * Data: data/ef-lattice/phi-digits-2187.txt · matrices-27.json
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIGITS_PATH = join(ROOT, 'data/ef-lattice/phi-digits-2187.txt');
const MATRICES_PATH = join(ROOT, 'data/ef-lattice/matrices-27.json');

export const EF_DIGITS_COUNT = 2187;
export const EF_MATRIX_COUNT = 27;
export const EF_MATRIX_SIZE = 81; // 9×9
export const EF_DOC =
  'docs/SYNTHOBS_OMNI_LATTICE_EF_2187_HYBRID_ENGINE_2026-08.md';
export const EF_REGISTRY_ID =
  'synthobs-omni-lattice-ef-2187-hybrid-2026-08';

/** k_B (J/K) — SI CODATA; used only for labeled architectural Landauer helper. */
const K_B = 1.380649e-23;

let _digits = null;
let _matricesDoc = null;

function loadDigits() {
  if (_digits) return _digits;
  const raw = readFileSync(DIGITS_PATH, 'utf8').trim();
  if (raw.length !== EF_DIGITS_COUNT) {
    throw new Error(
      `E_F digits file length ${raw.length} ≠ ${EF_DIGITS_COUNT} (${DIGITS_PATH})`,
    );
  }
  if (!/^\d+$/.test(raw)) {
    throw new Error('E_F digits file must be decimal digits only');
  }
  _digits = raw;
  return _digits;
}

function loadMatricesDoc() {
  if (_matricesDoc) return _matricesDoc;
  _matricesDoc = JSON.parse(readFileSync(MATRICES_PATH, 'utf8'));
  return _matricesDoc;
}

export class EFKernel {
  constructor(options = {}) {
    this.digitsCount = options.digitsCount || EF_DIGITS_COUNT;
    this.phiDigits = options.phiDigits || loadDigits();
    if (this.phiDigits.length < this.digitsCount) {
      throw new Error('phiDigits shorter than digitsCount');
    }
    this.phiDigits = this.phiDigits.slice(0, this.digitsCount);
    this.matricesDoc = options.matricesDoc || loadMatricesDoc();
    this.matrices = this._buildMatrices();
  }

  _buildMatrices() {
    const out = [];
    for (let mIdx = 0; mIdx < EF_MATRIX_COUNT; mIdx++) {
      const start = mIdx * EF_MATRIX_SIZE;
      const end = start + EF_MATRIX_SIZE;
      const digits = this.phiDigits.slice(start, end);
      const flat = [...digits].map((d) => Number(d));
      const grid = [];
      for (let r = 0; r < 9; r++) {
        grid.push(flat.slice(r * 9, r * 9 + 9));
      }
      const meta = this.matricesDoc.matrices?.[mIdx] || {};
      out.push({
        matrix_id: mIdx + 1,
        octave: Math.floor(mIdx / 9) + 1,
        grid,
        digits,
        name: meta.name || `Matrix ${mIdx + 1}`,
        role: meta.role || '',
      });
    }
    return out;
  }

  /**
   * @param {number} nodeId 1…2187
   */
  getNodeCoordinate(nodeId) {
    const id = Number(nodeId);
    if (!Number.isInteger(id) || id < 1 || id > this.digitsCount) {
      throw new Error(`Node ID must be integer 1…${this.digitsCount}`);
    }
    const idx = id - 1;
    const matrixIdx = Math.floor(idx / EF_MATRIX_SIZE);
    const sub = idx % EF_MATRIX_SIZE;
    const row = Math.floor(sub / 9);
    const col = sub % 9;
    const digit = Number(this.phiDigits[idx]);
    const matrix = this.matrices[matrixIdx];
    return {
      node_id: id,
      digit,
      octave: matrix.octave,
      matrix_id: matrix.matrix_id,
      matrix_name: matrix.name,
      matrix_row: row + 1,
      matrix_col: col + 1,
      role: matrix.role,
    };
  }

  getMatrix(matrixId) {
    const id = Number(matrixId);
    if (!Number.isInteger(id) || id < 1 || id > EF_MATRIX_COUNT) {
      throw new Error(`matrix_id must be 1…${EF_MATRIX_COUNT}`);
    }
    return this.matrices[id - 1];
  }

  /**
   * Architectural Landauer-style boundary label.
   * Honesty: formula export only — not a measured silicon calorimeter receipt.
   */
  landauerLimit(tempKelvin = 300, scalingFactor = 1.07) {
    const theoretical = K_B * Number(tempKelvin) * Math.log(2);
    return {
      joules_per_bit: scalingFactor * theoretical,
      temp_kelvin: Number(tempKelvin),
      scaling_factor: Number(scalingFactor),
      honesty:
        'Architectural label (scaling × k_B T ln 2). Not empirical GPU/FPGA calorimetry.',
    };
  }

  /**
   * Scale-indexed RAG pinch: return compact windows for agent context.
   * @param {{ nodeIds?: number[], matrixIds?: number[], query?: string }} q
   */
  pinch(q = {}) {
    const windows = [];
    const nodeIds = Array.isArray(q.nodeIds) ? q.nodeIds : [];
    const matrixIds = Array.isArray(q.matrixIds) ? q.matrixIds : [];

    for (const nid of nodeIds.slice(0, 12)) {
      try {
        const c = this.getNodeCoordinate(nid);
        windows.push({
          id: `node_${c.node_id}`,
          kind: 'node',
          text: `Node ${c.node_id}: digit=${c.digit} · Octave ${c.octave} · Matrix ${c.matrix_id} (${c.matrix_name}) · row ${c.matrix_row} col ${c.matrix_col}. ${c.role}`,
          metadata: c,
        });
      } catch {
        /* skip invalid */
      }
    }

    for (const mid of matrixIds.slice(0, 6)) {
      try {
        const m = this.getMatrix(mid);
        windows.push({
          id: `matrix_${m.matrix_id}`,
          kind: 'matrix',
          text: `Matrix ${m.matrix_id} · Octave ${m.octave} · ${m.name}: ${m.role} Digits ${m.digits.slice(0, 18)}…`,
          metadata: {
            matrix_id: m.matrix_id,
            octave: m.octave,
            name: m.name,
            digit_start: (m.matrix_id - 1) * 81 + 1,
            digit_end: m.matrix_id * 81,
          },
        });
      } catch {
        /* skip */
      }
    }

    // Lightweight lexical domain pinch from query (no external vector DB).
    if (q.query && windows.length < 4) {
      const m = String(q.query).toLowerCase();
      const hits = this.matrices.filter((mat) => {
        const blob = `${mat.name} ${mat.role}`.toLowerCase();
        return (
          (/swarm|agent|token|routing/.test(m) && /swarm|agent|routing|token/.test(blob)) ||
          (/landauer|thermal|hardware|silicon|fpga/.test(m) &&
            /landauer|hardware|silicon|fpga|cooling|entropy/.test(blob)) ||
          (/meta|nest|observer|sandbox/.test(m) && /meta|observer|nest/.test(blob)) ||
          (/octave\s*3|closure|2187/.test(m) && mat.matrix_id === 27)
        );
      });
      for (const mat of hits.slice(0, 3)) {
        if (!windows.some((w) => w.id === `matrix_${mat.matrix_id}`)) {
          windows.push({
            id: `matrix_${mat.matrix_id}`,
            kind: 'matrix',
            text: `Matrix ${mat.matrix_id} · Octave ${mat.octave} · ${mat.name}: ${mat.role}`,
            metadata: { matrix_id: mat.matrix_id, octave: mat.octave, name: mat.name },
          });
        }
      }
    }

    return {
      engine: 'EFKernel',
      digits_count: this.digitsCount,
      window_count: windows.length,
      windows,
      honesty:
        'Scale-indexed pinch — architectural E_F grammar. Not physics overthrow or SI certificate.',
    };
  }
}

let _default = null;

export function getEFKernel() {
  if (!_default) _default = new EFKernel();
  return _default;
}

export function isEFAsk(message) {
  const m = String(message || '').toLowerCase();
  return /e_?f\b|2187|9\s*×\s*9|9x9|octave\s*[123]|matrix\s*\d+|landauer|phi.?digit|golden.?ratio|scale.?index|ef.?kernel|ef.?lattice/.test(
    m,
  );
}

export function getEFHybridContract() {
  const ef = getEFKernel();
  return {
    doc: EF_DOC,
    registryId: EF_REGISTRY_ID,
    digitsCount: ef.digitsCount,
    matrixCount: EF_MATRIX_COUNT,
    hybrid: ['deterministic_kernel', 'scale_indexed_rag_pinch', 'agent_router'],
    organization: [
      'E_F hybrid: deterministic node/matrix coords (lib/ef-kernel.mjs) — not full monograph dumps',
      'E_F hybrid: scale-indexed RAG pinch by Matrix 1–27 / Node 1–2187 metadata',
      'E_F hybrid: Landauer helper is architectural label only — not calorimeter proof',
    ],
  };
}
