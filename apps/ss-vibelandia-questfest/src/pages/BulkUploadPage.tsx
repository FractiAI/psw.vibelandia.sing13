import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BulkTrackUploader } from '@/components/catalog/BulkTrackUploader';
import { useCatalogStore } from '@/stores/catalogStore';
import { pauseSimpleAudio } from '@/lib/simplePlayback';
import { usePlaybackStore } from '@/stores/playbackStore';

/** Dedicated surface for 500+ track ingest — no listen player, no catalog preload hang. */
export function BulkUploadPage() {
  const syncLibraryFromServer = useCatalogStore((s) => s.syncLibraryFromServer);
  const deviceHydrated = useCatalogStore((s) => s.deviceHydrated);

  useEffect(() => {
    document.documentElement.classList.add('qf-bulk-upload-page');
    pauseSimpleAudio();
    usePlaybackStore.getState().setPlaying(false);
    return () => document.documentElement.classList.remove('qf-bulk-upload-page');
  }, []);

  useEffect(() => {
    const hydrate = () => useCatalogStore.getState().hydrateFromDevice();
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(hydrate, { timeout: 120 });
    } else {
      setTimeout(hydrate, 0);
    }
  }, []);

  useEffect(() => {
    if (!deviceHydrated) return;
    void syncLibraryFromServer();
  }, [deviceHydrated, syncLibraryFromServer]);

  return (
    <div className="sp-app bulk-upload-page">
      <header className="bulk-upload-top">
        <Link to="/bridge" className="bulk-upload-back">
          ← Bridge Listen
        </Link>
        <a href="/my-whiteboard" className="bulk-upload-back">
          Whiteboard
        </a>
      </header>
      <main className="bulk-upload-main">
        <BulkTrackUploader />
      </main>
    </div>
  );
}
