import { Link } from 'react-router-dom';
import { useSessionStore } from '@/stores/sessionStore';
import { useEffect } from 'react';

export function RegistrationPage() {
  const hydrate = useSessionStore((s) => s.hydrateFromStorage);
  const isPassenger = useSessionStore((s) => s.isPassenger);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="gate">
      <div className="gate-texture" aria-hidden />
      <div className="gate-inner">
        <p className="gate-kicker">Sovereign Gate</p>
        <h1 className="gate-title">SS Vibelandia QUESTFEST</h1>
        <p className="gate-lead">
          Passenger registration for the sonic ship. The Solenoid holds anonymous ears to{' '}
          <strong>30 seconds</strong> on the Sovereign Master Playlist until Fair Exchange clears.
        </p>
        <ul className="gate-list">
          <li>Single active stream — heartbeat lock across devices.</li>
          <li>The Libretto — 13s vocal discharges &amp; scripted lines over the deck.</li>
          <li>
            EGS constant <strong>$16.18/mo</strong> unlocks full playback + 13-channel access.
          </li>
        </ul>
        <div className="gate-actions">
          <Link className="voxel-btn voxel-btn--orange" to="/bridge">
            {isPassenger ? 'Enter Bridge' : 'Enter Bridge (preview)'}
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
          Marketing sites can deep-link straight to checkout:
          <code className="gate-code">…/interfaces/questfest-bridge/#/bridge?checkout=1</code>
        </p>
      </div>
    </div>
  );
}
