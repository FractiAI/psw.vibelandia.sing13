/**
 * Downloadable 99 Octave × natal-hybrid chart PDFs.
 * Free = 1 page · Standard $29 = 10 pages · Deluxe $49 = 30 pages.
 *
 * Purpose: find oneself & purpose accurately and quickly; align into flow;
 * daily practices; architect life, relationships, family, career.
 *
 * Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox
 * Honesty: architectural Story map — not predictive astrology or medical advice.
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { buildChartReading } from './octave99-chart.mjs';
import {
  LIFE_PILLARS,
  analogForDigit,
  buildNatalHybridTrinity,
  storyForDigit,
} from './octave99-natal-hybrid.mjs';

export const CHART_PDF_PAGE_COUNTS = Object.freeze({
  free: 1,
  chart_standard: 10,
  chart_deluxe: 30,
});

export function pdfPageCountForTier(tier) {
  if (tier === 'chart_deluxe' || tier === 'chart-deluxe') return CHART_PDF_PAGE_COUNTS.chart_deluxe;
  if (tier === 'chart_standard' || tier === 'chart-standard') return CHART_PDF_PAGE_COUNTS.chart_standard;
  return CHART_PDF_PAGE_COUNTS.free;
}

function rankedBands(chart) {
  return [...chart.bands].sort((a, b) => b.intensity - a.intensity);
}

function strengthWord(intensity) {
  if (intensity >= 80) return 'very strong';
  if (intensity >= 65) return 'strong';
  if (intensity >= 50) return 'steady';
  if (intensity >= 40) return 'soft';
  return 'quiet';
}

function homeKeysParagraph(chart) {
  const sig = chart.signature;
  return `Home keys (gold): ${storyForDigit(sig.risingDigit).label}, ${storyForDigit(sig.sunDigit).label}, ${storyForDigit(sig.moonDigit).label}.`;
}

function pillarBlurb(chart, pillarId, ch) {
  const pillar = LIFE_PILLARS.find((p) => p.id === pillarId) || LIFE_PILLARS[0];
  const parts = pillar.digits.map((d) => `${storyForDigit(d).label} ${chart.bands[d].intensity}`);
  return `${pillar.title}: ${pillar.blurb} Dial scores: ${parts.join(' · ')}. As ${ch.title}, lead with the highest dial this week.`;
}

function suggestedPillar(chart) {
  return LIFE_PILLARS.map((pillar) => ({
    pillar,
    score: pillar.digits.reduce((s, d) => s + chart.bands[d].intensity, 0),
  })).sort((a, b) => b.score - a.score)[0].pillar.title;
}

/**
 * @returns {{ tier: string, pageCount: number, filename: string, pages: Array<{ title: string, lines: string[] }>, natal: object, reading: object }}
 */
export function buildChartPdfPages(chart, opts = {}) {
  const tier = opts.tier || 'free';
  const reading = opts.reading || buildChartReading(chart, opts);
  const natal = buildNatalHybridTrinity(chart);
  const gn = chart.grandNarrative || reading.grandNarrative;
  const name = chart.intake.name;
  const ranked = rankedBands(chart);
  const top = ranked.slice(0, 3);
  const quiet = ranked.slice(-2).reverse();
  const pageCount = pdfPageCountForTier(tier);
  const ch = gn.character;
  const place = gn.placement;
  const daily = gn.dailyPractices;
  const focus = String(opts.focus || '').trim();
  const season = String(opts.season || '').trim();
  const question = String(opts.question || '').trim();
  const lens = String(opts.lens || '').trim();
  const birthLine = `${chart.intake.birthDate || '—'} · ${chart.intake.birthTime || '12:00'} · ${chart.intake.birthPlace || '—'}`;
  const honesty =
    'Honesty: hybrid natal × 99 Octave architectural map for reflection and practice — not predictive astrology, ephemeris, fortune-telling, or medical/legal advice.';

  /** @type {Array<{ title: string, lines: string[] }>} */
  let pages = [];

  if (tier === 'free') {
    pages = [
      {
        title: `${name} · Free 99 Octave Chart · 1 page`,
        lines: [
          `Birth seed: ${birthLine}`,
          'Purpose of this chart: find yourself and your purpose quickly — then align into flow with one day’s practices.',
          natal.purposeLine,
          `Sun analog (${natal.sun.analog.signName} · Digit ${natal.sun.digit}): ${natal.sun.character.title} — ${natal.sun.analog.purposeHint}`,
          `Moon analog (${natal.moon.analog.signName} · Digit ${natal.moon.digit}): ${natal.moon.character.title} — ${natal.moon.story.plain}.`,
          `Rising analog (${natal.rising.analog.signName} · Digit ${natal.rising.digit}): ${natal.rising.character.title} — how you enter rooms and hard tasks.`,
          `Placement: ${place.depthLine}`,
          `Loudest life area now: ${storyForDigit(top[0].digit).label} (${strengthWord(top[0].intensity)}). Do this: ${storyForDigit(top[0].digit).doThis}`,
          `Daily flow — Morning: ${daily.morning}`,
          `Midday: ${daily.midday}`,
          `Evening: ${daily.evening}`,
          'Upgrade: $29 = downloadable 10-page overall PDF · $49 = downloadable 30-page deluxe PDF (life architecture for career, family, relationships, craft).',
          honesty,
        ],
      },
    ];
  } else if (tier === 'chart_standard') {
    pages = [
      {
        title: `Cover · ${name}`,
        lines: [
          'Your 99 Octave Chart · Overall · 10-page PDF',
          'Hybrid natal reading × 99 Octave Omni-Lattice',
          `For: ${name}`,
          `Birth seed: ${birthLine}`,
          gn.oneLiner,
          'Purpose: find yourself and your purpose accurately and quickly; align into flow; install daily practices; architect life — relationships, family, career, craft, and pace.',
          honesty,
        ],
      },
      {
        title: 'How to use this chart',
        lines: [
          'Read in this order: (1) natal trinity, (2) purpose lock, (3) loud life areas, (4) daily practices, (5) life architecture.',
          'Sun / Moon / Rising analogs are a fast compass — Story seeds from your intake, paired with Digits 0–9 — not a verdict.',
          'Loud slices = where attention pays off. Quiet slices = rest or unused capacity.',
          'Flow rule: one Morning / Midday / Evening practice beats ten unused insights.',
          'Architect rule: pick one pillar this week (self, relationships/family, career/craft, or body/pace).',
          ...reading.plainGuide,
        ],
      },
      {
        title: 'Natal hybrid trinity · Sun · Moon · Rising',
        lines: [
          natal.honesty,
          natal.purposeLine,
          `${natal.sun.role}: Digit ${natal.sun.digit} · ${natal.sun.analog.signName} (${natal.sun.analog.element}). ${natal.sun.analog.natalHouse}.`,
          `Character: ${natal.sun.character.title}. ${natal.sun.character.role} ${natal.sun.character.lifeApply}`,
          `${natal.moon.role}: Digit ${natal.moon.digit} · ${natal.moon.analog.signName}. ${natal.moon.analog.natalHouse}.`,
          `Inner need: ${natal.moon.character.title}. ${natal.moon.character.lifeApply}`,
          `${natal.rising.role}: Digit ${natal.rising.digit} · ${natal.rising.analog.signName}. ${natal.rising.analog.natalHouse}.`,
          `Approach: ${natal.rising.character.title}. ${natal.rising.character.vocation}`,
        ],
      },
      {
        title: 'Purpose · find yourself · quick alignment',
        lines: [
          `You are ${ch.title}. ${ch.role}`,
          `Vocation: ${ch.vocation}`,
          ch.lifeApply,
          place.act.plain,
          place.depthLine,
          ...natal.quickAlign,
          `Lead area: ${storyForDigit(top[0].digit).label} — ${storyForDigit(top[0].digit).doThis}`,
        ],
      },
      {
        title: 'Life architecture overview',
        lines: [
          'Four pillars for architecting a human life — Digits as dials:',
          ...LIFE_PILLARS.flatMap((pillar) => [
            `${pillar.title}: ${pillar.blurb}`,
            `Dials: ${pillar.digits.map((d) => `${storyForDigit(d).label} ${chart.bands[d].intensity}`).join(' · ')}`,
          ]),
          `This week’s suggested pillar: ${suggestedPillar(chart)}.`,
        ],
      },
      {
        title: 'Loud life areas · aim here',
        lines: top.flatMap((b) => {
          const story = storyForDigit(b.digit);
          const analog = analogForDigit(b.digit);
          return [
            `${story.label} · Digit ${b.digit} · ${strengthWord(b.intensity)} (${b.intensity}) · peak octave ${b.peakOctave}`,
            `Natal-house flavor: ${analog.natalHouse}. Octave sign: ${analog.signName}.`,
            `About: ${story.plain} Do this: ${story.doThis}`,
            `Purpose hint: ${analog.purposeHint}`,
          ];
        }),
      },
      {
        title: 'Supporting & quiet areas',
        lines: [
          ...ranked.slice(3, 8).map((b) => {
            const story = storyForDigit(b.digit);
            return `${story.label} · ${strengthWord(b.intensity)} (${b.intensity}) — ${story.doThis}`;
          }),
          `Soft / quiet: ${quiet.map((b) => storyForDigit(b.digit).label).join(' · ')}. Do not force unless intentional.`,
          homeKeysParagraph(chart),
        ],
      },
      {
        title: 'Daily practices · get into flow',
        lines: [
          `Live as ${ch.title}. Flow is practice rhythm, not mood.`,
          `Morning — ${daily.morning}`,
          `Midday — ${daily.midday}`,
          `Evening — ${daily.evening}`,
          daily.approachBoost,
          'Flow trigger: scattered → Sun practice · overexposed → Moon · stuck at the door → Rising.',
          ...reading.weeklyMoves.map((m, i) => `${i + 1}. ${m}`),
        ],
      },
      {
        title: 'Relationships · family · career map',
        lines: [
          pillarBlurb(chart, 'relationships', ch),
          pillarBlurb(chart, 'career', ch),
          pillarBlurb(chart, 'body', ch),
          'Family / household: one Bondweaver-style check-in (Digit 2 flavor) even if another digit is louder — homes run on rhythm.',
          `Career: treat ${storyForDigit(top[0].digit).label} as this season’s vocation lever; finish or pause one loop in ${storyForDigit(quiet[0].digit).label}.`,
        ],
      },
      {
        title: 'Weekly architecture plan · close',
        lines: [
          `Week theme: ${ch.title} in ${place.act.label} · octave ${place.octave}.`,
          `Monday: one purpose sentence as ${ch.title}.`,
          `Tue–Thu: Morning/Midday/Evening practices; advance ${storyForDigit(top[0].digit).label}.`,
          'Friday: review louder/quieter; keep one habit; drop one drain.',
          'Weekend: one relationship/family beat + one body reset.',
          honesty,
          'Fair Exchange · SynthOBS · SING13 · 99 Octave Omni-Lattice',
        ],
      },
    ];
  } else {
    // chart_deluxe — exactly 30
    pages = [
      {
        title: `Cover · ${name}`,
        lines: [
          'Your 99 Octave Chart · Deluxe · 30-page PDF',
          'Hybrid natal reading × 99 Octave Omni-Lattice',
          `For: ${name}`,
          `Birth seed: ${birthLine}`,
          gn.oneLiner,
          'Purpose: find yourself and your purpose accurately and quickly; align into flow; install daily practices; architect life — relationships, family, career, craft, and pace.',
          honesty,
        ],
      },
      {
        title: 'How to use · method',
        lines: [
          'Order: natal trinity → purpose → placement → ten life areas → pillars → practices → checklist.',
          'Standard natal language (Sun / Moon / Rising / houses) meets Digits 0–9 and octaves 01–99.',
          'Insight without practice is incomplete. Practice without purpose drifts. This PDF binds both.',
          ...reading.plainGuide,
          natal.honesty,
        ],
      },
      {
        title: 'Natal trinity overview',
        lines: [
          natal.purposeLine,
          `Sun: Digit ${natal.sun.digit} · ${natal.sun.analog.signName} · ${natal.sun.character.title}`,
          `Moon: Digit ${natal.moon.digit} · ${natal.moon.analog.signName} · ${natal.moon.character.title}`,
          `Rising: Digit ${natal.rising.digit} · ${natal.rising.analog.signName} · ${natal.rising.character.title}`,
          ...natal.quickAlign,
          homeKeysParagraph(chart),
        ],
      },
      {
        title: 'Sun analog deep dive · purpose',
        lines: [
          `Sun · Digit ${natal.sun.digit} · ${natal.sun.analog.signName} · ${natal.sun.character.title}`,
          natal.sun.analog.purposeHint,
          natal.sun.character.role,
          natal.sun.character.vocation,
          natal.sun.character.lifeApply,
          `House flavor: ${natal.sun.analog.natalHouse}`,
          `Life area: ${natal.sun.story.label} — ${natal.sun.story.plain}`,
          `Practice: ${natal.sun.character.morning}`,
          `Architect move: write a one-sentence purpose only ${natal.sun.character.title} would sign.`,
        ],
      },
      {
        title: 'Moon analog deep dive · inner fuel',
        lines: [
          `Moon · Digit ${natal.moon.digit} · ${natal.moon.analog.signName} · ${natal.moon.character.title}`,
          natal.moon.character.role,
          natal.moon.character.lifeApply,
          `House flavor: ${natal.moon.analog.natalHouse}`,
          `Restore via: ${natal.moon.story.doThis}`,
          `Evening refill: ${natal.moon.character.evening}`,
          'Family note: Moon sets household weather more than the calendar — protect refill time.',
        ],
      },
      {
        title: 'Rising analog deep dive · approach',
        lines: [
          `Rising · Digit ${natal.rising.digit} · ${natal.rising.analog.signName} · ${natal.rising.character.title}`,
          natal.rising.character.role,
          natal.rising.character.vocation,
          `House flavor: ${natal.rising.analog.natalHouse}`,
          `Doorway practice: ${natal.rising.character.morning}`,
          'Career note: Rising is interviews, first meetings, Monday mornings — rehearse approach.',
          daily.approachBoost,
        ],
      },
      {
        title: 'Purpose · placement · Story act',
        lines: [
          `You are ${ch.title}. ${ch.role}`,
          ch.lifeApply,
          place.depthLine,
          place.act.plain,
          place.mapLine,
          gn.applyToLife,
          season ? `Season you named: “${season}.”` : 'Name your season of life in one phrase; revisit monthly.',
          focus ? `Focus: “${focus}.” Ask how ${ch.title} handles it at octave ${place.octave}.` : null,
          lens ? `Lens: ${lens}.` : null,
        ].filter(Boolean),
      },
      {
        title: 'Life architecture · four pillars',
        lines: [
          ...LIFE_PILLARS.flatMap((pillar) => [
            `${pillar.title}: ${pillar.blurb}`,
            `Dials: ${pillar.digits.map((d) => `${storyForDigit(d).label} ${chart.bands[d].intensity}`).join(' · ')}`,
          ]),
          `Suggested pillar this week: ${suggestedPillar(chart)}.`,
        ],
      },
      // pages 9–18: digits 0–9
      ...chart.bands.map((band) => {
        const story = storyForDigit(band.digit);
        const analog = analogForDigit(band.digit);
        const narrative = reading.narratives?.find((n) => n.digit === band.digit);
        return {
          title: `Life area ${band.digit} · ${story.label}`,
          lines: [
            `Digit ${band.digit} · ${analog.signName} · ${strengthWord(band.intensity)} (${band.intensity}) · peak octave ${band.peakOctave}`,
            `Natal-house flavor: ${analog.natalHouse}`,
            `Pillar: ${analog.lifePillar}`,
            `About: ${story.plain}`,
            `Purpose hint: ${analog.purposeHint}`,
            narrative?.narrative || `${story.label} supports ${ch.title} on your map.`,
            `Do this: ${story.doThis}`,
            band.emphasis ? 'Home key (gold) — return here when the week frays.' : null,
            question && (band.emphasis || band.digit === top[0].digit)
              ? `Tied to your question (“${question}”): primary lever.`
              : null,
          ].filter(Boolean),
        };
      }),
      {
        title: 'Loud & quiet · this season’s aim',
        lines: [
          ...top.map((b) => {
            const s = storyForDigit(b.digit);
            return `Loud: ${s.label} (${b.intensity}) — ${s.doThis}`;
          }),
          `Quiet: ${quiet.map((b) => storyForDigit(b.digit).label).join(' · ')}.`,
          homeKeysParagraph(chart),
        ],
      },
      {
        title: 'Materials of your week',
        lines: [
          reading.materials?.plain ||
            'Lead with craft, body, spark, or stage — whichever material scores highest.',
          `Morphogenesis mix — craft ${chart.morphogenesis.silicon}, body ${chart.morphogenesis.carbon}, spark ${chart.morphogenesis.hydrogen}, stage ${chart.morphogenesis.theater}.`,
          'Architect tip: schedule the highest material first on Tuesday; protect the lowest as recovery, not failure.',
        ],
      },
      {
        title: 'Approach & inner characters',
        lines: [
          `Approach character: ${ch.approachTitle} (Rising digit ${chart.signature.risingDigit}).`,
          daily.approachBoost,
          `Inner character: ${ch.innerTitle} (Moon digit ${chart.signature.moonDigit}).`,
          daily.innerCare,
          'Use approach in public doors; use inner for private refill. Do not confuse the two.',
        ],
      },
      {
        title: 'Career architecture',
        lines: [
          pillarBlurb(chart, 'career', ch),
          `Craft (3): ${storyForDigit(3).doThis}`,
          `Stamina (8): ${storyForDigit(8).doThis}`,
          `Finishing (9): ${storyForDigit(9).doThis}`,
          `Season lever: ${storyForDigit(top[0].digit).label}.`,
          'Define “done for the week” in one sentence as your Sun character.',
        ],
      },
      {
        title: 'Relationships & family architecture',
        lines: [
          pillarBlurb(chart, 'relationships', ch),
          `Bond (2): ${storyForDigit(2).doThis}`,
          `Team/household (6): ${storyForDigit(6).doThis}`,
          `Boundaries (7): ${storyForDigit(7).doThis}`,
          'Family flow: one shared meal or walk without phones; one clear ask; one thank-you.',
          'Conflict: Rising for the first sentence, Moon for the repair.',
        ],
      },
      {
        title: 'Body · pace · mind · meaning',
        lines: [
          pillarBlurb(chart, 'body', ch),
          pillarBlurb(chart, 'self', ch),
          `Body (4): ${storyForDigit(4).doThis}`,
          `Mind (5): ${storyForDigit(5).doThis}`,
          `Reset (0): ${storyForDigit(0).doThis}`,
          'Flow depends on vessel capacity — purpose without pace collapses.',
        ],
      },
      {
        title: 'Your question · compass',
        lines: [
          question
            ? reading.answerBlock ||
              `Question: “${question}” As ${ch.title}, protect ${storyForDigit(top[0].digit).label} first.`
            : `Default compass as ${ch.title}: lead ${storyForDigit(top[0].digit).label}, support ${storyForDigit(top[1].digit).label}, rest in ${storyForDigit(quiet[0].digit).label}.`,
          'Write three lines answering the compass as your Sun character before Friday.',
          focus ? `Focus pin: “${focus}.”` : null,
          season ? `Season pin: “${season}.”` : null,
        ].filter(Boolean),
      },
      {
        title: 'Daily practice card',
        lines: [
          `Character: ${ch.title}`,
          `Morning: ${daily.morning}`,
          `Midday: ${daily.midday}`,
          `Evening: ${daily.evening}`,
          daily.approachBoost,
          daily.innerCare,
          ...natal.quickAlign,
          'Pin this page — practice is the product.',
        ],
      },
      {
        title: 'Weekly & monthly architecture',
        lines: [
          'Weekly: Mon purpose sentence · Tue–Thu loud-area work · Fri review · Weekend bond + body.',
          'Monthly: re-read Sun/Moon/Rising; update season/focus; retire one drain; renew one streak.',
          ...reading.weeklyMoves.map((m, i) => `Move ${i + 1}: ${m}`),
        ],
      },
      {
        title: 'Alignment checklist · flow triggers',
        lines: [
          '☐ Purpose sentence written as Sun character',
          '☐ Morning / Midday / Evening practices done 4+ days',
          '☐ One relationship/family beat completed',
          '☐ One career/craft notch shipped',
          '☐ One body reset protected',
          '☐ One boundary (no) named',
          '☐ One open loop finished or paused',
          'Triggers: scattered → Sun · overexposed → Moon · stuck → Rising · overbuilt → Digit 0 reset.',
        ],
      },
      {
        title: 'Written narrative spine',
        lines: reading.letter.split(/\n\n+/).slice(0, 8),
      },
      {
        title: 'Living the chart · close',
        lines: [
          `Thank you, ${name}. You are ${ch.title} at octave ${place.octave} (${place.act.label}).`,
          'The point is accurate self-finding, quick purpose lock, and a life you can architect in practice.',
          gn.applyToLife,
          honesty,
          'Fair Exchange honor rails · SynthOBS Autonomous Agent · Syntheverse Sandbox · SING13',
        ],
      },
    ];
  }

  while (pages.length < pageCount) {
    pages.push({
      title: `Notes · page ${pages.length + 1}`,
      lines: [
        'Handwritten alignment notes: purpose sentence, one ask, one boundary, one gratitude.',
        honesty,
      ],
    });
  }
  if (pages.length > pageCount) pages = pages.slice(0, pageCount);

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'chart';
  const filename =
    tier === 'chart_deluxe'
      ? `99-octave-chart-deluxe-30p-${slug}.pdf`
      : tier === 'chart_standard'
        ? `99-octave-chart-overall-10p-${slug}.pdf`
        : `99-octave-chart-free-1p-${slug}.pdf`;

  return { tier, pageCount, filename, pages, natal, reading };
}

export async function renderChartPdf(doc) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const fontBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const gold = rgb(0.55, 0.4, 0.08);
  const ink = rgb(0.08, 0.06, 0.04);
  const muted = rgb(0.35, 0.32, 0.28);

  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 54;
  const maxWidth = pageWidth - margin * 2;
  const titleSize = 15;
  const bodySize = 10.5;
  const lineGap = 13.5;

  for (let i = 0; i < doc.pages.length; i++) {
    const spec = doc.pages[i];
    const page = pdf.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    page.drawText('99 Octave Omni-Lattice · Hybrid Natal Chart', {
      x: margin,
      y,
      size: 9,
      font,
      color: gold,
    });
    y -= 18;

    for (const tl of wrapText(spec.title, fontBold, titleSize, maxWidth)) {
      page.drawText(tl, { x: margin, y, size: titleSize, font: fontBold, color: ink });
      y -= titleSize + 4;
    }
    y -= 8;

    for (const para of spec.lines) {
      for (const line of wrapText(para, font, bodySize, maxWidth)) {
        if (y < margin + 36) break;
        page.drawText(line, { x: margin, y, size: bodySize, font, color: ink });
        y -= lineGap;
      }
      y -= 5;
      if (y < margin + 36) break;
    }

    page.drawText(sanitizePdfText(`Page ${i + 1} of ${doc.pageCount}`), {
      x: margin,
      y: 28,
      size: 9,
      font,
      color: muted,
    });
  }

  return pdf.save();
}

export async function buildChartPdfBytes(chart, opts = {}) {
  const doc = buildChartPdfPages(chart, opts);
  const bytes = await renderChartPdf(doc);
  return { ...doc, bytes };
}

function sanitizePdfText(text) {
  return String(text || '')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u2190-\u21FF]/g, '->')
    .replace(/[\u2500-\u257F]/g, '-')
    .replace(/\u2610/g, '[ ]')
    .replace(/\u2611/g, '[x]')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '');
}

function wrapText(text, font, fontSize, maxWidth) {
  const words = sanitizePdfText(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const lines = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const trial = `${current} ${words[i]}`;
    if (font.widthOfTextAtSize(trial, fontSize) <= maxWidth) current = trial;
    else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}
