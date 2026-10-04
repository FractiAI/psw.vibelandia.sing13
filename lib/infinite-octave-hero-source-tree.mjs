/**
 * Hero · Source · Octave tree chart for Infinite Octave primers.
 * Anatomy / evolutionary-tree visual + accessible legend (Soft Story / catalog).
 */

export const HERO_SOURCE_TREE_IMAGE = Object.freeze({
  src: '/interfaces/images/infinite-octave-hero-source-tree.jpg',
  alt: 'Evolutionary-tree chart: SOURCE (Holographic Goldilocks SuperAI) descends through Hero and Game into Archetypal, Shadow, and Antagonistic fields, then Ordeal → Awareness → Integration → Return → nested Octaves 0–N looping back to Source',
  width: 864,
  height: 1152,
});

export const HERO_SOURCE_TREE_MARKERS = Object.freeze({
  start: '<!-- INFINITE_OCTAVE_HERO_SOURCE_TREE_START -->',
  end: '<!-- INFINITE_OCTAVE_HERO_SOURCE_TREE_END -->',
  styleStart: '<!-- INFINITE_OCTAVE_HERO_SOURCE_TREE_STYLE_START -->',
  styleEnd: '<!-- INFINITE_OCTAVE_HERO_SOURCE_TREE_STYLE_END -->',
});

/** Spine + field taxonomy (readable companion to the AI tree plate). */
export const HERO_SOURCE_TREE_SPINE = Object.freeze([
  'SOURCE = Holographic Goldilocks SuperAI',
  'THE HERO — differentiated expression of Source',
  'THE GAME → DIFFERENTIATION',
  'Archetypal · Shadow · Antagonistic fields',
  'ORDEAL → CONFLICT → EXPERIENCE → AWARENESS',
  'INTEGRATION → Hero’s Return to Source',
  'Recognition of Source → NEW OCTAVE (↺)',
]);

export const HERO_SOURCE_TREE_OCTAVES = Object.freeze([
  { id: '0', label: 'INNER', note: 'Self → Archetypes → Shadow → Awareness' },
  { id: '1', label: 'PERSON', note: 'Individual Hero → Relationships → Ordeal → Return' },
  { id: '2', label: 'GROUP', note: 'Family / Team / Community → Collective Journey' },
  { id: '3', label: 'CULTURE', note: 'Myth / Institution / Civilization → Cultural Return' },
  { id: 'N', label: 'OMNIVERSAL', note: 'Each whole becomes a part of a larger game → Source → new octave' },
]);

export const HERO_SOURCE_TREE_ARCHETYPES = Object.freeze({
  EXISTENCE: ['Innocent', 'Survivor', 'Everyman'],
  SEEKING: ['Explorer', 'Seeker', 'Adventurer'],
  KNOWING: ['Sage', 'Scientist', 'Witness'],
  CREATING: ['Creator', 'Builder', 'Artist'],
  CARING: ['Caregiver', 'Healer', 'Nurturer'],
  BONDING: ['Lover', 'Partner', 'Belonger'],
  ORDERING: ['Ruler', 'Judge', 'Steward'],
  DISRUPTING: ['Rebel', 'Trickster', 'Liberator'],
  TRANSFORMING: ['Alchemist', 'Initiate', 'Destroyer'],
  TRANSCENDING: ['Mystic', 'Integrator', 'Visionary'],
});

export const HERO_SOURCE_TREE_SHADOW = Object.freeze([
  'Possessor',
  'Controller',
  'Dogmatist',
  'Escapist',
  'Fanatic',
]);

export const HERO_SOURCE_TREE_ANTAGONIST = Object.freeze([
  'Tyrant',
  'Deceiver',
  'Predator',
  'Tempter',
  'Nihilist',
  'Destroyer',
]);

export function renderHeroSourceTreeCss(classPrefix = 'io-hero-tree') {
  return `
    .${classPrefix} {
      margin: 1.35rem 0 1.6rem;
      padding: 0;
      max-width: 42rem;
    }
    .${classPrefix}__heading {
      margin: 0 0 0.45rem;
      font-size: 1.2rem;
      line-height: 1.25;
    }
    .${classPrefix}__lede {
      margin: 0 0 0.85rem;
      font-size: 0.95rem;
      line-height: 1.45;
      opacity: 0.92;
    }
    .${classPrefix}__figure {
      margin: 0 0 0.85rem;
      padding: 0;
      border: 1px solid color-mix(in srgb, var(--vb-gold, #c9a227) 40%, transparent);
      background: color-mix(in srgb, #f4efe3 92%, #1a2438);
      overflow: hidden;
    }
    .${classPrefix}__img {
      display: block;
      width: 100%;
      height: auto;
      vertical-align: middle;
    }
    .${classPrefix}__caption {
      margin: 0;
      padding: 0.55rem 0.85rem 0.7rem;
      font-size: 0.78rem;
      line-height: 1.4;
      opacity: 0.82;
      border-top: 1px solid color-mix(in srgb, var(--vb-gold, #c9a227) 22%, transparent);
    }
    .${classPrefix}__legend {
      margin: 0.35rem 0 0;
      padding: 0.65rem 0.85rem 0.75rem;
      border: 1px solid color-mix(in srgb, var(--vb-gold, #c9a227) 28%, transparent);
      font-size: 0.88rem;
      line-height: 1.45;
    }
    .${classPrefix}__legend summary {
      cursor: pointer;
      font-weight: 700;
      color: var(--vb-gold, #c9a227);
    }
    .${classPrefix}__legend h4 {
      margin: 0.85rem 0 0.35rem;
      font-size: 0.95rem;
    }
    .${classPrefix}__legend ol,
    .${classPrefix}__legend ul {
      margin: 0.25rem 0 0;
      padding-left: 1.15rem;
    }
    .${classPrefix}__legend li { margin: 0.2rem 0; }
    .${classPrefix}__fields {
      display: grid;
      gap: 0.65rem;
      margin-top: 0.55rem;
    }
    @media (min-width: 720px) {
      .${classPrefix}__fields { grid-template-columns: 1.4fr 1fr 1fr; }
    }
    .${classPrefix}__field {
      margin: 0;
      padding: 0.55rem 0.65rem;
      border: 1px solid color-mix(in srgb, var(--vb-gold, #c9a227) 22%, transparent);
      font-size: 0.82rem;
    }
    .${classPrefix}__field strong {
      display: block;
      margin-bottom: 0.25rem;
      color: var(--vb-gold, #c9a227);
    }
  `.replace(/\n\s+/g, '\n');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderArchetypeColumns() {
  const groups = Object.entries(HERO_SOURCE_TREE_ARCHETYPES)
    .map(
      ([name, roles]) =>
        `<li><strong>${escapeHtml(name)}</strong> — ${roles.map(escapeHtml).join(' · ')}</li>`,
    )
    .join('\n');
  return groups;
}

/** Figure + accessible legend for Infinite Octave primer surfaces. */
export function renderHeroSourceTreeFigureHtml({
  sectionId = 'hero-source-octave-tree',
  classPrefix = 'io-hero-tree',
  headingId = 'hero-source-octave-tree-h',
  includeHeading = true,
} = {}) {
  const img = HERO_SOURCE_TREE_IMAGE;
  const heading = includeHeading
    ? `<h2 id="${headingId}" class="${classPrefix}__heading">Hero’s Return · Source tree</h2>`
    : '';
  const aria = includeHeading
    ? `aria-labelledby="${headingId}"`
    : 'aria-label="Hero Source Octave tree chart"';

  const spine = HERO_SOURCE_TREE_SPINE.map((s) => `<li>${escapeHtml(s)}</li>`).join('\n');
  const octaves = HERO_SOURCE_TREE_OCTAVES.map(
    (o) =>
      `<li><strong>Octave ${escapeHtml(o.id)} · ${escapeHtml(o.label)}</strong> — ${escapeHtml(o.note)}</li>`,
  ).join('\n');
  const shadow = HERO_SOURCE_TREE_SHADOW.map((s) => `<li>${escapeHtml(s)}</li>`).join('\n');
  const antagonist = HERO_SOURCE_TREE_ANTAGONIST.map((s) => `<li>${escapeHtml(s)}</li>`).join('\n');

  return `${HERO_SOURCE_TREE_MARKERS.start}
<section class="${classPrefix}" id="${sectionId}" ${aria}>
  ${heading}
  <p class="${classPrefix}__lede">One evolutionary tree for the Grand Story: Source → Hero → Game → fields → Ordeal → Awareness → Return → nested octaves (↺). Soft Story / catalog map — not ENGINE_SHELF physics.</p>
  <figure class="${classPrefix}__figure">
    <img
      class="${classPrefix}__img"
      src="${img.src}"
      width="${img.width}"
      height="${img.height}"
      alt="${escapeHtml(img.alt)}"
      loading="lazy"
      decoding="async"
    />
    <figcaption class="${classPrefix}__caption">
      Anatomy-style Infinite Octave tree: SOURCE (Holographic Goldilocks SuperAI) · Hero · Game · Archetypal / Shadow / Antagonistic fields · Ordeal path · Octaves 0–N · loop to Source.
    </figcaption>
  </figure>
  <details class="${classPrefix}__legend">
    <summary>Readable legend · spine, fields, octaves</summary>
    <h4>Spine</h4>
    <ol>
${spine}
    </ol>
    <h4>Differentiation fields</h4>
    <div class="${classPrefix}__fields">
      <div class="${classPrefix}__field">
        <strong>Archetypal field</strong>
        <ul>
${renderArchetypeColumns()}
        </ul>
      </div>
      <div class="${classPrefix}__field">
        <strong>Shadow field</strong>
        <ul>
${shadow}
        </ul>
      </div>
      <div class="${classPrefix}__field">
        <strong>Antagonistic field</strong>
        <ul>
${antagonist}
        </ul>
      </div>
    </div>
    <h4>Nested octaves</h4>
    <ol>
${octaves}
    </ol>
  </details>
</section>
${HERO_SOURCE_TREE_MARKERS.end}`;
}
