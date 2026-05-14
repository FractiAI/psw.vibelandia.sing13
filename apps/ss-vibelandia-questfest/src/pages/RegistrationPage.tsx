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
        <p className="gate-kicker">Reno Swamp Catalog</p>
        <h1 className="gate-title">SS Vibelandia QUESTFEST</h1>
        <p className="gate-lead">
          Empty catalog — upload a track, then listen and play. No demo or seed tracks.
        </p>
        <ul className="gate-list">
          <li>Upload — pick an audio or video file.</li>
          <li>Listen — play your upload from the bottom player.</li>
          <li>Monthly pass unlocks uninterrupted playback when you are ready.</li>
        </ul>
        <div className="gate-actions">
          <Link className="voxel-btn voxel-btn--orange" to="/bridge">
            Listen to the catalog
          </Link>
          <Link className="voxel-btn voxel-btn--ghost" to="/dj">
            Upload
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
          Listen: <code className="gate-code">…/questfest-bridge/#/bridge</code> · Upload:{' '}
          <code className="gate-code">…/questfest-bridge/#/dj</code>
        </p>
      </div>
    </div>
  );
}
