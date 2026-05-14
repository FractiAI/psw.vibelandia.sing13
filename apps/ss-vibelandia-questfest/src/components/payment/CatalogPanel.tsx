import { EGS_MONTHLY_USD, BOOKING_EMAIL, CATALOG_EMAIL, EGS_EXPORT_USD } from '@/lib/paymentRails';
import { TRACKS } from '@/lib/demoTracks';
import { usePlaybackStore } from '@/stores/playbackStore';
import { usePlaylistStore } from '@/stores/playlistStore';

interface CatalogPanelProps {
  onExport: () => void;
  onBoard: () => void;
  isPassenger: boolean;
}

export function CatalogPanel({ onExport, onBoard, isPassenger }: CatalogPanelProps) {
  const setTrack = usePlaybackStore((s) => s.setTrack);
  const setPlaying = usePlaybackStore((s) => s.setPlaying);
  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);
  const setActivePlaylist = usePlaylistStore((s) => s.setActivePlaylist);

  const playTrack = (id: string) => {
    setActivePlaylist('pl-sovereign');
    setTrack(id);
    setPlaying(true);
  };

  const tracks = Object.values(TRACKS);

  return (
    <section className="voxel-panel catalog-panel catalog-panel--warm">
      <p className="catalog-eyebrow">Welcome in · no card required</p>
      <h3 className="catalog-title">Reno Swamp · Caliente Catalog</h3>
      <p className="catalog-lede">
        Everything on the deck is <strong>free to taste</strong> — hit play and ride the first{' '}
        <strong>30 seconds</strong> on us. When the music pauses, that is your cue: the monthly pass
        keeps the swamp open all month long.
      </p>

      <ul className="catalog-tracks" aria-label="Catalog tracks">
        {tracks.map((tr) => (
          <li key={tr.id} className="catalog-track-row">
            <div className="catalog-track-info">
              <span className="catalog-track-title">{tr.title}</span>
              <span className="catalog-track-artist">{tr.artist}</span>
              {!isPassenger && <span className="catalog-free-pill">Free · 30s preview</span>}
              {isPassenger && <span className="catalog-pass-pill">Passenger · full play</span>}
            </div>
            <button
              type="button"
              className={`voxel-btn voxel-btn--warm${currentTrackId === tr.id ? ' catalog-track--active' : ''}`}
              onClick={() => playTrack(tr.id)}
            >
              {currentTrackId === tr.id ? 'Playing' : 'Play'}
            </button>
          </li>
        ))}
      </ul>

      <p className="catalog-pass-offer">
        {!isPassenger ? (
          <>
            Love what you heard? <strong>${EGS_MONTHLY_USD.toFixed(2)}/month</strong> unlocks the full
            catalog — swamp beats, holographic cuts, and project-ready exports. Warm Fair Exchange via
            Venmo, PayPal, or Cash App.
          </>
        ) : (
          <>You are aboard — full deck, exports, and single-stream lock are live. Thank you for riding with us.</>
        )}
      </p>

      <div className="catalog-actions">
        {!isPassenger && (
          <button type="button" className="voxel-btn voxel-btn--swamp-gold" onClick={onBoard}>
            Get the monthly pass · ${EGS_MONTHLY_USD.toFixed(2)}
          </button>
        )}
        <button type="button" className="voxel-btn voxel-btn--warm-teal" onClick={onExport}>
          Export a track · ${EGS_EXPORT_USD.toFixed(2)}
        </button>
        <a className="voxel-btn voxel-btn--ghost-warm" href={`mailto:${BOOKING_EMAIL}?subject=QUESTFEST%20Booking`}>
          Bookings
        </a>
        <a
          className="voxel-btn voxel-btn--ghost-warm"
          href={`mailto:${CATALOG_EMAIL}?subject=Catalog%20%2F%20Licensing%20(500%2B)`}
        >
          Catalog / licensing
        </a>
      </div>
    </section>
  );
}
