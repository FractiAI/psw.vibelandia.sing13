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
          Your real tracks only — playlists on the left, player on the bottom. As creator, open{' '}
          <strong>Upload &amp; playlists</strong> to scan your device and manage the catalog.
        </p>
        <ul className="gate-list">
          <li>Listen — browse playlists and play (30s preview free on each track).</li>
          <li>Creator — scan device for audio/video, upload, create and edit playlists.</li>
          <li>Monthly pass unlocks uninterrupted playback when you are ready.</li>
        </ul>
        <div className="gate-actions">
          <Link className="voxel-btn voxel-btn--orange" to="/bridge">
            Listen to the catalog
          </Link>
          <Link className="voxel-btn voxel-btn--ghost" to="/dj">
            Upload &amp; playlists
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
