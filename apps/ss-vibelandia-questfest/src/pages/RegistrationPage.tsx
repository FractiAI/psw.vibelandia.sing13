import { Link } from 'react-router-dom';
import { useSessionStore } from '@/stores/sessionStore';
import { useEffect } from 'react';
import { QUESTFEST_DECK_HREF } from '@/components/QuestfestFastLink';

export function RegistrationPage() {
  useEffect(() => {
    useSessionStore.getState().hydrateFromStorage();
  }, []);

  return (
    <div className="gate">
      <div className="gate-texture" aria-hidden />
      <div className="gate-inner">
        <p className="gate-kicker">Machote Moderno · swamp beats</p>
        <h1 className="gate-title">SS Vibelandia QUESTFEST</h1>
        <p className="gate-lead">
          Audio player for the full catalog. Stream from the server or download tracks to your device.
        </p>
        <ul className="gate-list">
          <li>Upload — pick an audio file (MP3 and friends).</li>
          <li>Listen — play from the bottom player dock.</li>
          <li>Members pass — full play and background audio on honor ($16.18/mo).</li>
        </ul>
        <div className="gate-actions">
          <Link className="voxel-btn voxel-btn--orange" to="/bridge">
            Open audio player
          </Link>
          <Link className="voxel-btn voxel-btn--ghost" to="/dj">
            Upload
          </Link>
          <a className="voxel-btn voxel-btn--ghost" href={QUESTFEST_DECK_HREF}>
            QUESTFEST top deck
          </a>
        </div>
        <p className="gate-fine">
          Listen: <code className="gate-code">…/questfest-bridge/#/listen</code> · Upload:{' '}
          <code className="gate-code">…/questfest-bridge/#/dj</code>
        </p>
      </div>
    </div>
  );
}
