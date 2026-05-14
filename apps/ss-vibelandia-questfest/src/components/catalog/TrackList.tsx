import { useMemo } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';

function fmtDuration(sec?: number) {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface TrackListProps {
  isPassenger: boolean;
}

export function TrackList({ isPassenger }: TrackListProps) {
  const pl = useCatalogStore((s) => s.getActivePlaylist());
  const search = useCatalogStore((s) => s.search);
  const setSearch = useCatalogStore((s) => s.setSearch);
  const getTrack = useCatalogStore((s) => s.getTrack);
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);
  const activePlaylistId = useCatalogStore((s) => s.activePlaylistId);

  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const setTrack = usePlaybackStore((s) => s.setTrack);
  const setPlaying = usePlaybackStore((s) => s.setPlaying);

  const tracks = useMemo(() => {
    const q = search.trim().toLowerCase();
    const ids = pl?.trackIds ?? [];
    return ids
      .map((id) => getTrack(id))
      .filter(Boolean)
      .filter((tr) => {
        if (!q) return true;
        return tr!.title.toLowerCase().includes(q) || tr!.artist.toLowerCase().includes(q);
      }) as NonNullable<ReturnType<typeof getTrack>>[];
  }, [pl, search, getTrack]);

  const play = (id: string) => {
    setActivePlaylist(activePlaylistId);
    setTrack(id);
    setPlaying(true);
  };

  if (!pl) {
    return <p className="spotify-empty">Pick a playlist on the left.</p>;
  }

  return (
    <section className="spotify-main-panel">
      <header className="spotify-main-head">
        <div>
          <p className="spotify-main-eyebrow">Playlist</p>
          <h2 className="spotify-main-title">{pl.name}</h2>
          <p className="spotify-main-desc">{pl.description}</p>
          <p className="spotify-main-meta">
            {pl.trackIds.length} tracks ·{' '}
            {isPassenger ? 'Full play (passenger)' : '30s free preview each'}
          </p>
        </div>
        <label className="spotify-search-wrap">
          <span className="sr-only">Search tracks</span>
          <input
            className="spotify-search"
            type="search"
            placeholder="Search this playlist…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </header>

      <div className="spotify-table-head" aria-hidden>
        <span>#</span>
        <span>Title</span>
        <span>Artist</span>
        <span>Type</span>
        <span>Time</span>
      </div>

      <ol className="spotify-track-list" aria-label={`Tracks in ${pl.name}`}>
        {tracks.map((tr, i) => {
          const active = currentTrackId === tr.id;
          return (
            <li key={tr.id} className={`spotify-track-row${active ? ' spotify-track-row--on' : ''}`}>
              <span className="spotify-track-idx">
                {active && isPlaying ? (
                  <span className="spotify-eq" aria-label="Playing">
                    ♪
                  </span>
                ) : (
                  i + 1
                )}
              </span>
              <button type="button" className="spotify-track-playcell" onClick={() => play(tr.id)}>
                <span className="spotify-track-title">{tr.title}</span>
                {tr.uploadedAt && <span className="spotify-upload-badge">New upload</span>}
              </button>
              <span className="spotify-track-artist">{tr.artist}</span>
              <span className="spotify-track-type">{tr.videoSrc ? 'Video' : 'Audio'}</span>
              <span className="spotify-track-dur">{fmtDuration(tr.durationSec)}</span>
              <button
                type="button"
                className="spotify-row-play"
                onClick={() => play(tr.id)}
                aria-label={active && isPlaying ? `Pause ${tr.title}` : `Play ${tr.title}`}
              >
                {active && isPlaying ? 'Pause' : 'Play'}
              </button>
            </li>
          );
        })}
      </ol>

      {tracks.length === 0 && (
        <p className="spotify-empty">No tracks match your search.</p>
      )}
    </section>
  );
}
