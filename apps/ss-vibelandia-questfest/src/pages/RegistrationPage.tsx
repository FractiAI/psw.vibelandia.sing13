import { Link } from 'react-router-dom';
import { useSessionStore } from '@/stores/sessionStore';
import { useEffect } from 'react';

export function RegistrationPage() {
  useEffect(() => {
    useSessionStore.getState().hydrateFromStorage();
  }, []);

  return (
    <div className="gate">
      <div className="gate-texture" aria-hidden />
      <div className="gate-inner">
        <p className="gate-kicker">Sovereign Gate</p>
        <h1 className="gate-title">SS Vibelandia QUESTFEST</h1>
        <p className="gate-lead">
          The whole Reno Swamp catalog is open — play anything for your first{' '}
          <strong>30 seconds</strong> free. No paywall at the door. When a track pauses, we will
          warmly invite you to the monthly pass for the full experience.
        </p>
        <ul className="gate-list">
          <li>Browse and play the full catalog — 30s preview on every track.</li>
          <li>The Libretto — scripted lines and short vocal discharges on the deck.</li>
          <li>Monthly pass unlocks uninterrupted playback when you are ready.</li>
        </ul>
        <div className="gate-actions">
          <Link className="voxel-btn voxel-btn--orange" to="/bridge">
            Gimme Some of That Reno Swamp Vibe
          </Link>
          <a
            className="voxel-btn voxel-btn--ghost"
            href="https://ssvibelandiaquestfest24x365.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Main site
          </a>
        </div>
        <p className="gate-fine">
          Full catalog at <code className="gate-code">…/interfaces/questfest-bridge/#/bridge</code>
        </p>
      </div>
    </div>
  );
}
