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
          Spotify-style listen: 550+ tracks, playlists on the left, player on the bottom. Upload your
          own audio and music videos under <strong>Upload &amp; playlists</strong>.
        </p>
        <ul className="gate-list">
          <li>Listen — browse playlists, search, play (30s preview free on every track).</li>
          <li>Upload &amp; playlists — add tracks, create playlists, reorder the broadcast.</li>
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
