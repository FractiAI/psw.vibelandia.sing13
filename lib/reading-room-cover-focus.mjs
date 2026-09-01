/**
 * Extract a visual focus phrase from paper abstracts for cover art prompts.
 * Architectural catalog grammar — not empirical claims.
 */

const THEME_PATTERNS = [
  { re: /higgs|scalar field|boson/i, theme: 'higgs', label: 'Higgs scalar glow' },
  { re: /awareness|consciousness|cognitive/i, theme: 'awareness', label: 'awareness phase coupling' },
  { re: /chromosome|genomic|dna|histone|msy/i, theme: 'genome', label: 'chromosomal holography' },
  { re: /solar|stellar|sunspot|corona|ar\s*\d/i, theme: 'solar', label: 'stellar magnetic focus' },
  { re: /singularity|nodal|nine|digit\s*9/i, theme: 'nodal', label: 'nodal nine boundary' },
  { re: /planetary|geodynamo|cmc|mantle/i, theme: 'geodynamo', label: 'planetary core phase' },
  { re: /seismic|subterranean|fault/i, theme: 'seismic', label: 'seismic phase lock' },
  { re: /black\s*hole|kerr|filament|reno/i, theme: 'blackhole', label: 'black-hole magnetic layer' },
  { re: /mri|cloud.?antenna|rf|scanner/i, theme: 'mri', label: 'MRI cloud antenna' },
  { re: /cmos|protonic|silicon|semiconductor|ppa/i, theme: 'cmos', label: 'CMOS protonic bridge' },
  { re: /tensor|decoupling|9\s*[×x]\s*81/i, theme: 'tensor', label: 'tensor shelf decoupling' },
  { re: /octave|digit|lattice|99/i, theme: 'lattice', label: '99-octave lattice map' },
  { re: /hydrogen|holographic framework|hhf/i, theme: 'hydrogen', label: 'hydrogen holographic field' },
  { re: /prion|protein|fold|refold/i, theme: 'protein', label: 'protein phase collapse' },
  { re: /magnet|geomagnetic|wavefield/i, theme: 'magnetism', label: 'magnetic substrate wave' },
  { re: /voyage|ship|frontier|prospectus|borik[eé]n/i, theme: 'voyage', label: 'cruise voyage frontier' },
  { re: /goldilocks|fair exchange|honor/i, theme: 'goldilocks', label: 'Goldilocks balance rail' },
  { re: /agent|nested|swarm|morphogenesis/i, theme: 'agents', label: 'nested agent lattice' },
  { re: /bridge|router|wormhole|reality/i, theme: 'bridge', label: 'reality bridge router' },
  { re: /tabletop|hep|particle|collider/i, theme: 'hep', label: 'tabletop HEP harmonic' },
  { re: /metamorphic|heat|pressure|schist/i, theme: 'metamorphic', label: 'metamorphic octave heat' },
  { re: /neutrino|isotopic|nuclear/i, theme: 'neutrino', label: 'neutronic agent load' },
  { re: /bitcoin|btc|mining/i, theme: 'btc', label: 'BTC coherence mining' },
];

function stripLatex(s) {
  return String(s || '')
    .replace(/\$[^$]+\$/g, ' ')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstSentence(text) {
  const t = stripLatex(text);
  const m = t.match(/^(.{20,220}?)(?:\.\s|$)/);
  return (m ? m[1] : t.slice(0, 180)).trim();
}

/**
 * @param {{ abstract?: string, title?: string, displayTitle?: string, plainLine?: string, tags?: string[] }} item
 */
export function extractCoverFocus(item) {
  const abstract = stripLatex(item.abstract || '');
  const title = stripLatex(item.displayTitle || item.title || '');
  const hay = `${abstract} ${title} ${(item.tags || []).join(' ')}`;
  const themes = [];
  for (const row of THEME_PATTERNS) {
    if (row.re.test(hay)) themes.push(row.theme);
  }
  if (!themes.length) themes.push('lattice');
  const focusLine = abstract ? firstSentence(abstract) : title || item.plainLine || 'catalog paper';
  const label =
    THEME_PATTERNS.find((r) => r.theme === themes[0])?.label ||
    focusLine.slice(0, 64);
  return {
    themes: [...new Set(themes)].slice(0, 3),
    focusLine,
    label,
    primaryTheme: themes[0],
  };
}

/**
 * @param {{ abstract?: string, title?: string, displayTitle?: string, plainLine?: string, tags?: string[], category?: string }} item
 */
export function coverPromptFor(item) {
  const { focusLine, label, primaryTheme } = extractCoverFocus(item);
  const title = item.displayTitle || item.title || item.id;
  return (
    `Cinematic streaming catalog poster, 2:3 portrait, navy and gold art-deco sci-fi illustration. ` +
    `Subject: ${label}. Paper focus: ${focusLine.slice(0, 200)}. ` +
    `Theme: ${primaryTheme}. No text, no logos, no watermarks. Rich painterly detail, dramatic lighting, ` +
    `frontier club reading room hospitality tone — not clinical photography.`
  );
}
