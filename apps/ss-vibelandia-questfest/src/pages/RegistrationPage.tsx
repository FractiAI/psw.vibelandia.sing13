import { Link } from 'react-router-dom';
import { useSessionStore } from '@/stores/sessionStore';
import { useEffect } from 'react';
import { useCaptain } from '@/hooks/useCaptain';

export function RegistrationPage() {
  const isCapitan = useCaptain();
  useEffect(() => {
    useSessionStore.getState().hydrateFromStorage();
  }, []);

  return (
    <div className="gate">
      <div className="gate-texture" aria-hidden />
      <div className="gate-inner">
        <p className="gate-kicker">Reno Swamp Catalog</p>
        <h1 className="gate-title">SS Vibelandia QUESTFEST</h1>
        <p className="gate-lead">
          Listen to Capitan&apos;s catalog. Upload is only on Capitan&apos;s devices (laptop and iPhone).
        </p>
        <ul className="gate-list">
          <li>Listen — browse and play tracks.</li>
          {isCapitan && <li>Capitan — upload audio or video from this device.</li>}
          <li>Monthly pass unlocks uninterrupted playback when you are ready.</li>
        </ul>
        <div className="gate-actions">
          <Link className="voxel-btn voxel-btn--orange" to="/bridge">
            Listen to the catalog
          </Link>
          {isCapitan ? (
            <Link className="voxel-btn voxel-btn--ghost" to="/dj">
              Upload (Capitan)
            </Link>
          ) : (
            <Link className="voxel-btn voxel-btn--ghost" to="/capitan">
              Capitan unlock
            </Link>
          )}
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
          Listen: <code className="gate-code">…/questfest-bridge/#/bridge</code>
          {isCapitan ? (
            <>
              {' '}
              · Capitan upload: <code className="gate-code">…/questfest-bridge/#/dj</code>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
