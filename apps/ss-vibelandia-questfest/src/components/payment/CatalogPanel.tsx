import { BOOKING_EMAIL, CATALOG_EMAIL } from '@/lib/paymentRails';
import { TRACKS } from '@/lib/demoTracks';
import { usePlaybackStore } from '@/stores/playbackStore';
import { LikeButton } from '@/components/catalog/LikeButton';
import { usePlaylistStore } from '@/stores/playlistStore';

interface CatalogPanelProps {
  isPassenger: boolean;
}

export function CatalogPanel({ isPassenger }: CatalogPanelProps) {
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
      <h3 className="catalog-title">Machote Moderno · Caliente Catalog</h3>
      <p className="catalog-lede">
        The whole deck is open — pick anything and ride the first <strong>30 seconds</strong> on
        us. No signup, no paywall at the door. If the vibe lands, follow{' '}
        <strong>Machote Moderno Magazine</strong> and grab the members-only pass after your free taste.
      </p>

      <ul className="catalog-tracks" aria-label="Catalog tracks">
        {tracks.map((tr) => (
          <li key={tr.id} className="catalog-track-row">
            <div className="catalog-track-info">
              <span className="catalog-track-title">{tr.title}</span>
              <span className="catalog-track-artist">{tr.artist}</span>
              {!isPassenger && <span className="catalog-free-pill">Free · 30s preview</span>}
              {isPassenger && <span className="catalog-pass-pill">Member · full play</span>}
            </div>
            <LikeButton trackId={tr.id} />
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

      <p className="catalog-footnote">
        Bookings &amp; licensing:{' '}
        <a href={`mailto:${BOOKING_EMAIL}?subject=QUESTFEST%20Booking`}>{BOOKING_EMAIL}</a>
        {' · '}
        <a href={`mailto:${CATALOG_EMAIL}?subject=Catalog%20%2F%20Licensing`}>{CATALOG_EMAIL}</a>
      </p>
    </section>
  );
}
