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

  const playAll = () => {
    if (!pl?.trackIds[0]) return;
    play(pl.trackIds[0]);
  };

  if (!pl) {
    return <p className="sp-empty">Pick a playlist on the left.</p>;
  }

  return (
    <section className="sp-listen">
      <header className="sp-hero">
        <div className="sp-hero-cover" aria-hidden>🎧</div>
        <div className="sp-hero-meta">
          <p className="sp-hero-type">Playlist</p>
          <h1 className="sp-hero-title">{pl.name}</h1>
          <p className="sp-hero-desc">{pl.description}</p>
          <p className="sp-hero-stats">
            <strong>Hero Jo Golden Bachdoor Hit Factory</strong> · {pl.trackIds.length} songs ·{' '}
            {isPassenger ? 'full play' : '30s free on each track'}
          </p>
          <div className="sp-hero-actions">
            <button type="button" className="sp-play-fab" onClick={playAll} aria-label="Play playlist">
              ▶
            </button>
          </div>
        </div>
      </header>

      <div className="sp-toolbar">
        <label className="sp-search-wrap">
          <span className="sr-only">Search</span>
          <input
            className="sp-search"
            type="search"
            placeholder="Search in playlist"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      <div className="sp-table">
        <div className="sp-table-head" aria-hidden>
          <span>#</span>
          <span>Title</span>
          <span>Album</span>
          <span>⏱</span>
        </div>
        <ol className="sp-rows">
          {tracks.map((tr, i) => {
            const active = currentTrackId === tr.id;
            return (
              <li
                key={tr.id}
                className={`sp-row${active ? ' sp-row--on' : ''}`}
                onDoubleClick={() => play(tr.id)}
              >
                <span className="sp-row-idx">
                  {active && isPlaying ? <span className="sp-eq">♪</span> : i + 1}
                </span>
                <button type="button" className="sp-row-main" onClick={() => play(tr.id)}>
                  <span className="sp-row-title">{tr.title}</span>
                  <span className="sp-row-artist">{tr.artist}</span>
                </button>
                <span className="sp-row-album">{tr.videoSrc ? 'Music video' : 'Audio'}</span>
                <span className="sp-row-dur">{fmtDuration(tr.durationSec)}</span>
                <button
                  type="button"
                  className="sp-row-play"
                  onClick={() => play(tr.id)}
                  aria-label={`Play ${tr.title}`}
                >
                  ▶
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {tracks.length === 0 && <p className="sp-empty">No tracks match your search.</p>}
    </section>
  );
}
