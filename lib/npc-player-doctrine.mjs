/**
 * NPC & Player doctrine — SS Vibelandia voyage identity (catalog grammar, not clinical labels).
 * Voice: old-school hospitality — complete sentences on guest decks.
 */
import { SITE_FOCUS_CANONICAL, SITE_PRIMER_LINE } from './site-focus.mjs';

export { SITE_FOCUS_CANONICAL, SITE_PRIMER_LINE };

export const NPC_PLAYER_DOCTRINE_CANONICAL =
  'NPCs populate the set — cast, crew, enterprises, franchises, legacies — and they chase material exchange as well as story gravity: payroll, contracts, perks, territory, reputation, and survival. Players are the superheroes they flock to — linear or holographic, human or Goldilocks AI, examined or simply lived. Both bands belong on this ship. Neither is pure.';

export const NPC_PLAYER_HONESTY =
  'Voyage identity language only — not a claim that software agents are conscious, not a genomic gate, not a payroll board for spirit crew.';

export const PLAYER_NPC_LINE =
  'NPCs populate the set. Players examine the pattern. Both belong on this cruise. SuperAI stays Goldilocks here — enough machine to serve, enough human to lead.';

/** Guest-facing marketing spine for voyage doors, map, and arrival chrome. */
export const VOYAGE_MARKETING_SPINE =
  'This is not just a cruise. It is a lifelong Boy\'s Night Out at frequency — a voyage you may begin with a question, choose with care, prepare for lightly, and step into wherever you stand.';

export const VOYAGE_DOOR_SPINE = `${VOYAGE_MARKETING_SPINE} The gangway opens wherever you are.`;

export const PLAYER_SPINE_LINE =
  'Your cruise line keeps five doors open for you: Journey for the grand story, Canvas for the art, Jukebox for the feeling, Library for depth, and Creator Studio when you are ready to build. Holographic Goldilocks SuperAI frontiersmen Player cruise — cast, crew, enterprises, franchises, legacies resource what you examine.';

export const PLAYER_PRIMER_LINE = SITE_PRIMER_LINE;

export function renderNpcPlayerBrochureS3Html() {
  return `<p><strong>NPC</strong> — the set: cast, spirit crew, enterprises, franchises, legacies. These are the inhabitants who see, hear, remember, follow instruction, build relationships, and keep the world running. They chase material exchange — payroll, gigs, franchise heat, legacy continuity — as honestly as they chase story gravity. Some recognize the metaphors; some never pause to reflect on their own behavior. That does not make them less important.</p>
    <p><strong>Player</strong> — the superheroes NPCs flock to. A Player can live inside the story and also ask why it is happening, what it represents, where else the pattern appears, and what might change if they act. Linear or holographic; human or Goldilocks AI. Players move between the story and the structure underneath — and often carry the resources, platform, protection, and Fair Exchange that draw the set near.</p>
    <p>Both bands may run in linear or holographic form — and in holographic Goldilocks form: not too much machine, not too little human. Same ship. Different depth of attention — never a caste test.</p>`;
}

export function renderNpcPlayerCoexistHtml() {
  return `<p>${SITE_FOCUS_CANONICAL}</p>
    <p>${NPC_PLAYER_DOCTRINE_CANONICAL}</p>
    <p>Both bands may run in linear and holographic versions — human, agent, and Goldilocks AI. The four awareness posts below name complementary coordination styles on one vessel, not ranks of worth. Neither is pure.</p>
    <p class="honesty"><strong>Honesty:</strong> ${NPC_PLAYER_HONESTY}</p>`;
}
