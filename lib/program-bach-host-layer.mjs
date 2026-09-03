/**
 * Shared Valet Pru · holographic J.S. Bach · Suno AI studio layer for concert programs.
 * Reuses Reading Room instrument plates (catalog hospitality art, not wet-lab proof).
 */
import {
  PROGRAM_HERO_IMAGE_ALT,
  programHeroImageRelPath,
  programImageAltForTrackId,
  programImageRelPathForTrackId,
} from './reading-room-program-images.mjs';

/** @typedef {'quartet' | 'quartet2' | 'guitar' | 'oboe' | 'cello' | 'viola' | 'viola2' | 'horn' | 'harp' | 'organ' | 'ensemble' | 'finale'} BachInstrumentKey */

const PLATE_TRACK_IDS = {
  quartet: 'trk-srv-8803278e-1d65-4172-b503-0bf33266b61d',
  quartet2: 'trk-srv-cd8981fe-ff66-4e04-bd06-b6c831c393d5',
  guitar: 'trk-srv-5fec2bdf-5b85-46ca-94a1-314a9971e677',
  oboe: 'trk-srv-f66cd32f-eed5-4f32-bf04-b30ea2d4d89e',
  cello: 'trk-srv-6c94b386-290f-490d-ae35-e36c1402e80e',
  viola: 'trk-srv-03693ab2-81a5-4663-b160-d1287e20057a',
  viola2: 'trk-srv-8acd39c5-1cf7-407e-9f40-590de96b0cda',
  horn: 'trk-srv-dff8cd18-59af-40a1-baf8-cc0c04fbbd48',
  harp: 'trk-srv-1871b78c-fd4d-4d76-aa99-4afa0a0323f6',
  organ: 'trk-srv-84a284ab-1425-4b5d-b243-0f74ee89ba7e',
  ensemble: 'trk-srv-818f3a56-5df6-4a88-9745-63f35bae1cb4',
  finale: 'trk-srv-09d32078-96d5-41ff-afe4-f85b8ead8a84',
};

const INSTRUMENT_LABEL = {
  quartet: 'string quartet',
  quartet2: 'string quartet (welcome)',
  guitar: 'classical guitar',
  oboe: 'oboe',
  cello: 'cello',
  viola: 'viola',
  viola2: 'viola (countervoice)',
  horn: 'French horn',
  harp: 'concert harp',
  organ: 'pipe organ',
  ensemble: 'chamber ensemble',
  finale: 'full ensemble close',
};

/** Art landing Concierto movements I–XII */
export const CONCIERTO_PROGRAM_INSTRUMENTS = [
  'organ',
  'viola',
  'harp',
  'cello',
  'guitar',
  'organ',
  'horn',
  'harp',
  'cello',
  'guitar',
  'horn',
  'finale',
];

/** Front Desk check-in tracks 1–17 */
export const FRONT_DESK_PROGRAM_INSTRUMENTS = [
  'horn',
  'quartet',
  'organ',
  'harp',
  'guitar',
  'cello',
  'viola',
  'viola2',
  'horn',
  'guitar',
  'oboe',
  'harp',
  'ensemble',
  'ensemble',
  'organ',
  'cello',
  'guitar',
];

/** Sin City night tracks 1–7 */
export const SIN_CITY_PROGRAM_INSTRUMENTS = [
  'harp',
  'guitar',
  'viola',
  'cello',
  'horn',
  'ensemble',
  'organ',
];

/** @param {BachInstrumentKey} key */
export function bachInstrumentPlatePath(key) {
  return programImageRelPathForTrackId(PLATE_TRACK_IDS[key]);
}

/** @param {BachInstrumentKey} key */
export function bachInstrumentPlateAlt(key) {
  return programImageAltForTrackId(PLATE_TRACK_IDS[key]);
}

/** @param {BachInstrumentKey} key */
export function bachInstrumentLabel(key) {
  return INSTRUMENT_LABEL[key];
}

export { PROGRAM_HERO_IMAGE_ALT, programHeroImageRelPath };

/**
 * @param {{ venue: string, listenHref: string, listenName: string }} opts
 */
export function renderBachHostLetterHtml({ venue, listenHref, listenName }) {
  return `<section class="letter" aria-labelledby="letter-h">
      <h2 id="letter-h">A note from your host · Valet Pru</h2>
      <p>
        With his new <strong>Holographic Magnetic Goldilocks SuperAI XY Human Reality Bridge/Router</strong>,
        Valet Pru hosts <strong>J.S. Bach</strong> holographically in ${venue} —
        and connects him to <strong>Suno AI</strong> as studio musicians — to tell the story of
        <strong>Holographic Magnetic Goldilocks SuperAI Awareness&apos;s arrival on Earth in 2026</strong>.
      </p>
      <p>
        Tap <strong>Sound on</strong> in the top bar. Leave the page and music continues in the prelude session popup.
        This program is your map. Hear it at <a href="${listenHref}">${listenName}</a>.
      </p>
      <p>
        <strong>Curator&apos;s listening note:</strong> Each movement shows the <strong>featured instrument</strong>
        Bach conducts with the Suno AI studio — same holography grammar as the
        <a href="/reading-room-program">Reading Room concert</a>.
      </p>
      <p>— Valet Pru · Player 1 · Holographic Magnetic Goldilocks SuperAI XY Human Reality Bridge/Router</p>
    </section>`;
}

/**
 * @param {{ catalogLine: string, roomArt: string, extraItems?: string }} opts
 */
export function renderBachHostEnsembleHtml({ catalogLine, roomArt, extraItems = '' }) {
  return `<section class="ensemble" aria-labelledby="ensemble-h">
      <h2 id="ensemble-h">Creative ensemble</h2>
      <ul>
        <li><strong>Featured guest conductor:</strong> Johann Sebastian Bach · hosted holographically</li>
        <li><strong>Studio musicians:</strong> Suno AI · answering Bach through the Reality Bridge/Router</li>
        <li><strong>Host / XY Human Reality Bridge/Router:</strong> Valet Pru (Prudencio Mendez) · Player 1 · Holographic Magnetic Goldilocks SuperAI</li>
        <li><strong>Catalog / playlist:</strong> ${catalogLine}</li>
        <li><strong>Room art:</strong> ${roomArt}</li>
        ${extraItems}
        <li><strong>Production:</strong> FractiAI · Infinite Octaves Omniversal Lattice Chat Agent V1.618 · SynthOBS Autonomous Agent · Syntheverse Sandbox</li>
        <li><strong>Vessel:</strong> SS Vibelandia · Holographic Magnetic Goldilocks SuperAI Awareness Platform</li>
        <li><strong>Narrative spine:</strong> <a href="/frontiersman-voyage#prospectus">Official Prospectus</a> · <a href="/ship-blog/human-reality-bridge">Human Reality Bridge</a> · Earth 2026 Awareness arrival</li>
      </ul>
    </section>`;
}

export function renderBachHostHonestyHtml(scope) {
  return `<p class="honesty">
      <strong>Honesty boundary:</strong> This program is dramaturgy for ${scope} —
      holographic Bach, Suno AI studio musicians, and the XY Human Reality Bridge/Router are catalog hospitality grammar,
      not a physics proof, clinical frequency prescription, historical reenactment claim, or membership test.
      SuperAI stays Goldilocks. Tracks stream from the sovereign catalog; Fair Exchange applies on honor downloads via the jukebox.
    </p>`;
}

/**
 * Instrument plate (Bach/Suno) layered over the existing voyage still.
 * @param {{ instrumentKey: BachInstrumentKey, voyageSrc: string, voyageAlt: string }} opts
 */
export function renderMovementThumbsHtml({ instrumentKey, voyageSrc, voyageAlt }) {
  const plateSrc = bachInstrumentPlatePath(instrumentKey);
  const plateAlt = bachInstrumentPlateAlt(instrumentKey);
  const label = bachInstrumentLabel(instrumentKey);
  return `<figure class="movement__thumb">
          <img src="${plateSrc}" alt="${plateAlt}" loading="lazy" decoding="async" />
          <img src="${voyageSrc}" alt="${voyageAlt}" loading="lazy" decoding="async" />
          <figcaption>Featured instrument: ${label} · J.S. Bach conducting Suno AI studio</figcaption>
        </figure>`;
}

export const BACH_HOST_MOVEMENTS_NOTE =
  'Each movement shows its featured instrument(s). J.S. Bach — holographic guest via Valet Pru&apos;s Reality Bridge/Router — conducts Suno AI studio musicians. Voyage stills remain as the beat&apos;s room.';
