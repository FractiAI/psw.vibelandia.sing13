import type { ModulePresentation } from '@/content/presentations';

export type SegmentKind = 'opening' | 'section' | 'card' | 'insight' | 'closing';

export interface NarrationSegment {
  id: string;
  kind: SegmentKind;
  headline: string;
  text: string;
  sectionId?: string;
  cardId?: string;
}

export function buildNarrationScript(presentation: ModulePresentation): NarrationSegment[] {
  const segments: NarrationSegment[] = [];

  segments.push({
    id: `${presentation.moduleId}-opening`,
    kind: 'opening',
    headline: 'Tonight on Executive AI Briefing',
    text: presentation.opening,
  });

  for (const section of presentation.sections) {
    segments.push({
      id: `${section.id}-lead`,
      kind: 'section',
      sectionId: section.id,
      headline: section.title,
      text: `${section.title}. ${section.narrative}`,
    });

    for (const card of section.cards) {
      segments.push({
        id: card.id,
        kind: 'card',
        sectionId: section.id,
        cardId: card.id,
        headline: card.title,
        text: `Digging deeper — ${card.title}. ${card.summary}`,
      });
    }

    if (section.insight) {
      segments.push({
        id: `${section.id}-insight`,
        kind: 'insight',
        sectionId: section.id,
        headline: 'Key insight',
        text: `Here's the takeaway. ${section.insight}`,
      });
    }
  }

  segments.push({
    id: `${presentation.moduleId}-closing`,
    kind: 'closing',
    headline: 'Coming up next',
    text: presentation.closing,
  });

  return segments;
}
