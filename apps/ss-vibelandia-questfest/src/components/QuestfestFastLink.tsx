export const QUESTFEST_DECK_HREF = '/interfaces/vibelandia-questfest.html';

/** Always-visible escape hatch back to the QUESTFEST top deck. */
export function QuestfestFastLink() {
  return (
    <a className="qf-fast-link" href={QUESTFEST_DECK_HREF} title="Back to SS Vibelandia QUESTFEST top deck">
      ← QUESTFEST
    </a>
  );
}
