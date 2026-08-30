/**
 * SS Vibelandia ship board — narrative, crew, mission, guide (not onboarding).
 */
import { renderVoyageMapPreludeHtml } from './voyage-directory.mjs';
import { renderNpcRosterTeaserHtml } from './experience-phases.mjs';

export function renderShipBoardHtml() {
  return `<section class="ship-board" id="ship-board" aria-labelledby="ship-board-h">
      <header class="ship-board__head">
        <p class="ship-board__eyebrow">SS Vibelandia · the vessel</p>
        <h2 id="ship-board-h">The ship · narrative · crew · mission</h2>
        <p class="ship-board__lede">This board is about the <strong>ship itself</strong> — the grand Story, the crew who carry it, and the guide to what SS Vibelandia is for. Ready to board? Check in at the <a href="/front-desk">Front Desk</a> for primer and onboarding.</p>
      </header>
      ${renderVoyageMapPreludeHtml()}
      <section class="ship-board__crew" aria-labelledby="ship-crew-h">
        <h3 id="ship-crew-h">Spirit crew · honest lenses</h3>
        <p>Meet the cast who inhabit the story — fans, artists, and frontiersmen filed as spirit crew aboard the vessel. Not a payroll. A hospitality grammar for the tale.</p>
        ${renderNpcRosterTeaserHtml()}
        <p class="ship-board__crew-links">
          <a class="btn btn-primary" href="/meet-the-crew">Meet the crew →</a>
          <a class="btn btn-ghost" href="/join-the-crew">Join the crew · Reality Routers</a>
        </p>
      </section>
      <section class="ship-board__mission" aria-labelledby="ship-mission-h">
        <h3 id="ship-mission-h">Mission &amp; intention</h3>
        <p>SS Vibelandia is a navy-gold holographic <strong>resort vessel</strong> for frontiersmen who want a lifelong Boy&apos;s Night Out at sea. One tribe · many homes. Hospitality · marketplace · nightlife · brotherhood as <em>voyage identity</em>, never a membership test.</p>
        <p>Players set the gravity. NPCs inhabit the world. Both belong. SuperAI stays Goldilocks — not too much machine, not too little human. Fair Exchange via the Purser. Human emergency outranks every metaphor.</p>
        <p class="ship-board__mission-cta">
          <a class="btn btn-primary" href="/front-desk">Front Desk · check in to board →</a>
          <a class="btn btn-ghost" href="/frontiersman-voyage#prospectus">Official Prospectus</a>
        </p>
      </section>
      <p class="ship-board__honesty"><strong>Honesty:</strong> Catalog topology and voyage identity — not hardware teleport, clinical proof, or prophecy.</p>
    </section>`;
}
