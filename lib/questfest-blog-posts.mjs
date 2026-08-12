/**
 * QUESTFEST ship-blog posts — plain-language notes for recent papers.
 * Cards on the landing link here first; each note still links to its whitepaper.
 */
export const QUESTFEST_BLOG_POSTS = {
  'synthobs-tensor-decoupling-99-octave-omni-lattice-2026-08': {
    slug: 'tensor-decoupling-99-octave',
    file: 'blog-tensor-decoupling-99-octave-2026-08.html',
    headline: 'The 99 Octave engine as a tensor filing cabinet',
    excerpt:
      'Eleven shelves, nine slots each — a way to file quakes, volcanoes, solar weather, AI routes, and inner weather without turning the cabinet into a prophecy engine.',
  },
  'synthobs-macro-seismic-phase-lock-99-octave-2026-08': {
    slug: 'quakes-and-solar-weather',
    file: 'blog-quakes-and-solar-weather-2026-08.html',
    headline: 'Quakes and solar weather on the same bulletin',
    excerpt:
      'When big earthquakes and noisy solar weather show up in the same news week, it is tempting to invent a single cause. This note keeps them on one discussion board — and refuses to turn that board into a prediction service.',
  },
  'synthobs-master-synthesis-99-octave-omni-lattice-2026-08': {
    slug: 'august-12-catalog-window',
    file: 'blog-august-12-catalog-window-2026-08.html',
    headline: 'August 12 is a crowded calendar — not a prophecy',
    excerpt:
      'A planet parade, an eclipse path, Perseids, Earth-stress headlines, AI chatter, and inner weather all land near the same date. Here is how we hold that pile as one catalog story without claiming the sky runs your life.',
  },
  'synthobs-sync-subterranean-discharge-99-octave-2026-08': {
    slug: 'colombia-quake-and-purace',
    file: 'blog-colombia-quake-and-purace-2026-08.html',
    headline: 'Colombia’s quake and Puracé’s orange alert, told as one window',
    excerpt:
      'A strong western-Colombia quake and an orange-alert volcano in the same stretch of days make a dramatic pair. We write them as co-timed labels for conversation — not as an official warning bulletin.',
  },
  'synthobs-99-octave-digits-master-2026-08': {
    slug: 'nine-digits-ninety-nine-octaves',
    file: 'blog-nine-digits-ninety-nine-octaves-2026-08.html',
    headline: 'Nine digits, ninety-nine octaves — a map you can actually walk',
    excerpt:
      'The big 9×99 register sounds mystical until you treat it like a filing cabinet: nine kinds of digit, ninety-nine octave shelves. This note walks the map in plain speech.',
  },
  'synthobs-constructive-morphogenesis-99-octave-2026-08': {
    slug: 'plants-keep-building-under-stress',
    file: 'blog-plants-keep-building-under-stress-2026-08.html',
    headline: 'How plants keep building when the pressure is on',
    excerpt:
      'Under drought and heat, plant–microbe partnerships still try to grow. We borrow that story as agent language — Silicon, Carbon, Hydrogen swarms — without pretending the notebook is a farm manual.',
  },
  'synthobs-omni-lattice-ef-2187-hybrid-2026-08': {
    slug: 'smaller-golden-key-pack',
    file: 'blog-smaller-golden-key-pack-2026-08.html',
    headline: 'A smaller pack for the golden key',
    excerpt:
      'Not every voyage needs the whole ninety-nine-octave ladder. This note explains the tighter 2,187-node hybrid pack — enough engine to steer, light enough to carry.',
  },
};

/** @param {string} id */
export function blogPostForPaper(id) {
  return QUESTFEST_BLOG_POSTS[id] || null;
}

/** Public href for a ship-blog post. */
export function shipBlogHref(slug) {
  return `/ship-blog/${encodeURIComponent(slug)}`;
}
