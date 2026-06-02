import { useMemo } from 'react';
import type { PlaylistDef } from '@/lib/catalogTypes';
import { TRACK_GENRE_SUGGESTIONS } from '@/lib/catalogTypes';
import {
  DEFAULT_MASTER_FILTER,
  type MasterCatalogFilterState,
  type MasterSortKey,
  type SortDir,
  collectGenreOptions,
  isMasterFilterActive,
  sortLabel,
  userPlaylistsForFilter,
} from '@/lib/masterCatalogFilter';
import { PLAIN } from '@/lib/plainSpeak';
import type { TrackDef } from '@/lib/catalogTypes';

interface MasterCatalogFiltersProps {
  filter: MasterCatalogFilterState;
  onChange: (next: MasterCatalogFilterState) => void;
  trackIds: string[];
  playlists: PlaylistDef[];
  getTrack: (id: string) => TrackDef | undefined;
  shownCount: number;
  totalCount: number;
}

export function MasterCatalogFilters({
  filter,
  onChange,
  trackIds,
  playlists,
  getTrack,
  shownCount,
  totalCount,
}: MasterCatalogFiltersProps) {
  const genreOptions = useMemo(() => {
    const fromTracks = collectGenreOptions(trackIds, getTrack);
    const merged = new Set<string>([...TRACK_GENRE_SUGGESTIONS, ...fromTracks]);
    return [...merged].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [trackIds, getTrack]);

  const playlistOptions = useMemo(() => userPlaylistsForFilter(playlists), [playlists]);

  const patch = (partial: Partial<MasterCatalogFilterState>) => onChange({ ...filter, ...partial });

  const setSort = (sortKey: MasterSortKey) => {
    if (sortKey === 'playlistOrder') {
      patch({ sortKey: 'playlistOrder', sortDir: 'asc' });
      return;
    }
    if (filter.sortKey === sortKey) {
      patch({ sortDir: filter.sortDir === 'asc' ? 'desc' : 'asc' });
    } else {
      patch({
        sortKey,
        sortDir: sortKey === 'uploadedAt' ? 'desc' : 'asc',
      });
    }
  };

  const toggleDir = () => {
    if (filter.sortKey === 'playlistOrder') return;
    patch({ sortDir: filter.sortDir === 'asc' ? 'desc' : 'asc' });
  };

  const clearFilters = () => onChange({ ...DEFAULT_MASTER_FILTER });

  const filtersActive = isMasterFilterActive(filter);

  return (
    <div className="sp-master-filters" role="search" aria-label="Filter and sort master catalog">
      <div className="sp-master-filters__row">
        <label className="sp-master-filters__field sp-master-filters__field--grow">
          <span className="sp-master-filters__label">{PLAIN.filterTitle}</span>
          <input
            className="sp-search"
            type="search"
            value={filter.titleQuery}
            onChange={(e) => patch({ titleQuery: e.target.value })}
            placeholder={PLAIN.filterTitlePlaceholder}
            autoComplete="off"
          />
        </label>
        <label className="sp-master-filters__field">
          <span className="sp-master-filters__label">{PLAIN.filterGenre}</span>
          <select
            className="sp-master-filters__select"
            value={filter.genre}
            onChange={(e) => patch({ genre: e.target.value })}
          >
            <option value="">{PLAIN.filterAnyGenre}</option>
            {genreOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="sp-master-filters__row">
        <label className="sp-master-filters__field">
          <span className="sp-master-filters__label">{PLAIN.filterPlaylist}</span>
          <select
            className="sp-master-filters__select"
            value={filter.playlistMode}
            onChange={(e) => {
              const mode = e.target.value as MasterCatalogFilterState['playlistMode'];
              patch({
                playlistMode: mode,
                playlistId: mode === 'all' ? '' : filter.playlistId || playlistOptions[0]?.id || '',
              });
            }}
          >
            <option value="all">{PLAIN.filterAnyPlaylist}</option>
            <option value="in">{PLAIN.filterInPlaylist}</option>
            <option value="notIn">{PLAIN.filterNotInPlaylist}</option>
          </select>
        </label>
        {filter.playlistMode !== 'all' && (
          <label className="sp-master-filters__field sp-master-filters__field--grow">
            <span className="sp-master-filters__label">{PLAIN.filterPlaylistName}</span>
            <select
              className="sp-master-filters__select"
              value={filter.playlistId}
              onChange={(e) => patch({ playlistId: e.target.value })}
            >
              {playlistOptions.length === 0 ? (
                <option value="">{PLAIN.filterNoPlaylists}</option>
              ) : (
                playlistOptions.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.name}
                  </option>
                ))
              )}
            </select>
          </label>
        )}
      </div>

      <div className="sp-master-filters__row sp-master-filters__row--sort">
        <span className="sp-master-filters__label sp-master-filters__label--inline">{PLAIN.sortBy}</span>
        <div className="sp-master-filters__sort-keys" role="group" aria-label="Sort field">
          {(['playlistOrder', 'title', 'artist', 'genre', 'uploadedAt'] as const).map((key) => (
            <button
              key={key}
              type="button"
              className={`sp-master-filters__sort-btn${filter.sortKey === key ? ' sp-master-filters__sort-btn--on' : ''}`}
              onClick={() => setSort(key)}
              aria-pressed={filter.sortKey === key}
            >
              {sortLabel(key)}
              {filter.sortKey === key && (
                <span className="sp-master-filters__dir" aria-hidden>
                  {filter.sortDir === 'asc' ? ' ↑' : ' ↓'}
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="sp-master-filters__dir-toggle"
          onClick={toggleDir}
          disabled={filter.sortKey === 'playlistOrder'}
          title={filter.sortDir === 'asc' ? 'Ascending' : 'Descending'}
          aria-label={filter.sortDir === 'asc' ? PLAIN.sortAscending : PLAIN.sortDescending}
        >
          {filter.sortDir === 'asc' ? '↑ A→Z' : '↓ Z→A'}
        </button>
        {filtersActive && (
          <button type="button" className="sp-master-filters__clear" onClick={clearFilters}>
            {PLAIN.clearFilters}
          </button>
        )}
        <span className="sp-toolbar-total" aria-live="polite">
          {shownCount === totalCount
            ? `${totalCount} ${PLAIN.tracks}`
            : `${shownCount} of ${totalCount} ${PLAIN.tracks}`}
        </span>
      </div>
    </div>
  );
}
