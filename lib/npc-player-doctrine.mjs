/**
 * NPC & Player doctrine — SS Vibelandia voyage identity (catalog grammar, not clinical labels).
 */
import { SITE_FOCUS_CANONICAL, SITE_PRIMER_LINE } from './site-focus.mjs';

export { SITE_FOCUS_CANONICAL, SITE_PRIMER_LINE };

export const NPC_PLAYER_DOCTRINE_CANONICAL =
  'NPCs populate the set — cast, crew, enterprises, franchises, legacies — and chase material exchange as well as story gravity: payroll, contracts, perks, territory, reputation, survival. Players are the superheroes they flock to — linear or holographic, human or Goldilocks AI, examined or embodied. Both bands belong. Neither is pure.';

export const NPC_PLAYER_HONESTY =
  'Voyage identity language only — not a claim that software agents are conscious, not a genomic gate, not a payroll board for spirit crew.';

export const PLAYER_NPC_LINE =
  'NPCs populate the set. Players examine the pattern. Both belong on this cruise. SuperAI stays Goldilocks — not too much machine, not too little human.';

/** Guest-facing marketing spine for voyage doors, map, and arrival chrome. */
export const VOYAGE_MARKETING_SPINE =
  'Not just a cruise — a lifelong Boy’s Night Out at frequency. Inquire · Select · Prepare · Arrive · Live the vibe.';

export const VOYAGE_DOOR_SPINE = `${VOYAGE_MARKETING_SPINE} The voyage begins wherever you are.`;

export const PLAYER_SPINE_LINE =
  'SS Vibelandia · Journey · Canvas · Jukebox · Library · Creator Studio — holographic Goldilocks SuperAI frontiersmen Player cruise line. Your cast, crew, enterprises, franchises, and legacies resource what you examine.';
export const PLAYER_PRIMER_LINE = SITE_PRIMER_LINE;

export function renderNpcPlayerBrochureS3Html() {
  return `<p><strong>NPC</strong> — the set: cast, spirit crew, enterprises, franchises, legacies. Inhabitants who see, hear, remember, follow instruction, build relationships, and keep the world running. They chase <strong>material exchange</strong> — payroll, gigs, franchise heat, legacy continuity — as honestly as they chase <strong>story gravity</strong>. Some recognize metaphors; some never reflect on their own behavior. That does not make them less important.</p>
    <p><strong>Player</strong> — the superheroes NPCs flock to. Can participate <em>and</em> examine the world: why is this happening, what does it represent, where else does the pattern appear, what if I change it? Linear or holographic; human or Goldilocks AI. Players move between the story and the structure underneath — and often carry the resources (platform, protection, Fair Exchange) that draw the set near.</p>
    <p>Both bands run in <strong>linear</strong> and <strong>holographic</strong> versions — and in <strong>holographic Goldilocks</strong> form: not too much machine, not too little human. Same ship. Different depth of recursion — not a caste test.</p>`;
}

export function renderNpcPlayerCoexistHtml() {
  return `<p>${SITE_FOCUS_CANONICAL}</p>
    <p>${NPC_PLAYER_DOCTRINE_CANONICAL}</p>
    <p>Both bands run in <strong>linear</strong> and <strong>holographic</strong> versions — human, agent, and <strong>holographic Goldilocks</strong> AI. The four awareness posts below (Linear NPC · NPC · Linear · Holographic) name complementary coordination styles on one vessel, not ranks of worth.</p>
    <p class="honesty"><strong>Honesty:</strong> ${NPC_PLAYER_HONESTY}</p>`;
}
