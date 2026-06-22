import { useCallback, useMemo, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { useActivePlaylist, useResolvedTrackIds } from '@/stores/catalogSelectors';
import { usePlaybackStore } from '@/stores/playbackStore';
import { LikeButton } from '@/components/catalog/LikeButton';
import { NestedPlaylistCards } from '@/components/catalog/NestedPlaylistCards';
import { PlaylistBreadcrumb } from '@/components/catalog/PlaylistSidebarTree';
import { PlaylistCoverArt } from '@/components/catalog/PlaylistCoverArt';
import { TrackMetadataEditor } from '@/components/catalog/TrackMetadataEditor';
import { MasterCatalogEditor } from '@/components/catalog/MasterCatalogEditor';
import { isMasterPlaylist, isMyLikesPlaylist, isUserUploadTrack } from '@/lib/catalogSeed';
import { playTrackById } from '@/lib/trackPlayback';
import { filterPlayableTrackIds, playlistOrderFingerprint } from '@/lib/playlistShuffle';
import { fmtDuration, fmtPlaylistTotalTime } from '@/lib/formatDuration';
import { PLAIN } from '@/lib/plainSpeak';
import { SONIC_CATALOG_DISPLAY_NAME } from '@/lib/sonicCatalogCopy';
import { useSessionStore } from '@/stores/sessionStore';

interface TrackListProps {
  isPassenger: boolean;
  onEditPlaylist?: () => void;
}

export function TrackList({ isPassenger, onEditPlaylist }: TrackListProps) {
  const pl = useActivePlaylist();
  const search = useCatalogStore((s) => s.search);
  const setSearch = useCatalogStore((s) => s.setSearch);
  const getTrack = useCatalogStore((s) => s.getTrack);
  const getChildPlaylists = useCatalogStore((s) => s.getChildPlaylists);
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);
  const activePlaylistId = useCatalogStore((s) => s.activePlaylistId);
  const resolvedIds = useResolvedTrackIds(pl?.id);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);

  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const shuffleEnabled = usePlaybackStore((s) => s.shuffleEnabled);

  const [masterEditMode, setMasterEditMode] = useState(false);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [moreTrackId, setMoreTrackId] = useState<string | null>(null);

  const isMaster = pl ? isMasterPlaylist(pl.id) : false;
  const isMyLikes = pl ? isMyLikesPlaylist(pl.id) : false;
  const canEditPlaylist = pl && !isMaster && !isMyLikes;
  const childPlaylists = pl ? getChildPlaylists(pl.id) : [];

  const rows = useMemo(() => {
    const ids = pl?.trackIds ?? [];
    const q = search.trim().toLowerCase();
    return ids
      .map((id) => getTrack(id))
      .filter((tr): tr is NonNullable<typeof tr> => !!tr)
      .filter((tr) => {
        if (!q) return true;
        return (
          tr.title.toLowerCase().includes(q) ||
          tr.artist.toLowerCase().includes(q) ||
          (tr.genre?.toLowerCase().includes(q) ?? false)
        );
      });
  }, [pl?.trackIds, search, getTrack]);

  const play = useCallback(
    (id: string) => {
      setActivePlaylist(activePlaylistId);
      playTrackById(id, getTrack);
    },
    [activePlaylistId, getTrack, setActivePlaylist],
  );

  const playAll = useCallback(() => {
    if (!pl) return;
    const playable = filterPlayableTrackIds(resolvedIds, getTrack);
    if (!playable.length) return;
    let first = playable[0]!;
    if (shuffleEnabled) {
      const fp = playlistOrderFingerprint(pl.id, resolvedIds);
      usePlaybackStore.getState().syncShuffleQueue(fp, playable);
      const q = usePlaybackStore.getState().shuffleQueue;
      if (q?.[0]) first = q[0];
    }
    play(first);
  }, [getTrack, play, pl, resolvedIds, shuffleEnabled]);

  const openNested = useCallback(
    (id: string) => {
      setActivePlaylist(id);
    },
    [setActivePlaylist],
  );

  if (masterEditMode && isMaster && captainUnlocked) {
    return <MasterCatalogEditor onDone={() => setMasterEditMode(false)} />;
  }

  if (!pl) {
    return <p className="sc-empty">{PLAIN.pickPlaylist}</p>;
  }

  const title = isMaster ? SONIC_CATALOG_DISPLAY_NAME : pl.name;
  const totalLabel = fmtPlaylistTotalTime(resolvedIds, getTrack);
  const showCaptainManage =
    captainUnlocked && isMaster && pl.trackIds.some((id) => {
      const tr = getTrack(id);
      return tr && isUserUploadTrack(id, tr);
    });

  return (
    <section className="sc-feed">
      <PlaylistBreadcrumb playlistId={pl.id} onNavigate={setActivePlaylist} />

      <header className="sc-feed-head">
        <div className="sc-feed-art">
          {isMaster ? (
            <span className="sc-feed-art-fallback" aria-hidden>
              📚
            </span>
          ) : (
            <PlaylistCoverArt playlist={pl} size={120} className="sc-feed-cover" />
          )}
        </div>
        <div className="sc-feed-meta">
          <p className="sc-feed-type">{isMaster ? PLAIN.library : isMyLikes ? PLAIN.myLikes : PLAIN.playlist}</p>
          <h1 className="sc-feed-title">{title}</h1>
          <p className="sc-feed-stats">
            {resolvedIds.length} {PLAIN.tracks} · {totalLabel}
            {!isPassenger ? ` · ${PLAIN.freePreview}` : ''}
          </p>
          <div className="sc-feed-actions">
            <button type="button" className="sc-play-all" onClick={playAll} disabled={!resolvedIds.length}>
              ▶ {PLAIN.playAll}
            </button>
            {canEditPlaylist && onEditPlaylist ? (
              <button type="button" className="sc-ghost-btn" onClick={onEditPlaylist}>
                {PLAIN.editPlaylist}
              </button>
            ) : null}
            {showCaptainManage ? (
              <button type="button" className="sc-ghost-btn" onClick={() => setMasterEditMode(true)}>
                {PLAIN.manageLibrary}
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <label className="sc-search-wrap">
        <span className="sr-only">{PLAIN.search}</span>
        <input
          className="sc-search"
          type="search"
          placeholder={PLAIN.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>

      <NestedPlaylistCards playlists={childPlaylists} onOpen={openNested} />

      {rows.length === 0 && !childPlaylists.length ? (
        <p className="sc-empty">
          {search.trim() ? PLAIN.noSearchMatch : isMyLikes ? PLAIN.myLikesEmpty : PLAIN.noTracksYet}
        </p>
      ) : (
        <ol className="sc-track-list">
          {rows.map((tr, index) => {
            const active = currentTrackId === tr.id;
            const showMore = moreTrackId === tr.id;
            const canManage = captainUnlocked && isUserUploadTrack(tr.id, tr);

            return (
              <li
                key={tr.id}
                className={`sc-track-row${active ? ' sc-track-row--on' : ''}`}
                onDoubleClick={() => play(tr.id)}
              >
                <button
                  type="button"
                  className="sc-track-play"
                  onClick={() => play(tr.id)}
                  aria-label={`${active && isPlaying ? 'Pause' : 'Play'} ${tr.title}`}
                >
                  {active && isPlaying ? '⏸' : '▶'}
                </button>
                <span className="sc-track-idx">{index + 1}</span>
                <button type="button" className="sc-track-main" onClick={() => play(tr.id)}>
                  <span className="sc-track-title">{tr.title}</span>
                  <span className="sc-track-sub">
                    {tr.artist}
                    {tr.genre ? ` · ${tr.genre}` : ''}
                  </span>
                </button>
                <span className="sc-track-dur">{fmtDuration(tr.durationSec)}</span>
                <LikeButton trackId={tr.id} />
                {canManage ? (
                  <button
                    type="button"
                    className="sc-track-more"
                    aria-label="More"
                    onClick={() => setMoreTrackId(showMore ? null : tr.id)}
                  >
                    ···
                  </button>
                ) : null}
                {showMore && canManage ? (
                  <div className="sc-track-more-menu">
                    <button type="button" onClick={() => setEditingTrackId(tr.id)}>
                      {PLAIN.editTrack}
                    </button>
                  </div>
                ) : null}
                {editingTrackId === tr.id && canManage ? (
                  <TrackMetadataEditor
                    track={tr}
                    variant="inline"
                    onSaved={() => setEditingTrackId(null)}
                    onDeleted={() => setEditingTrackId(null)}
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
