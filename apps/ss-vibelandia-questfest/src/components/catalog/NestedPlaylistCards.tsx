import { PlaylistCoverArt } from '@/components/catalog/PlaylistCoverArt';
import { useCatalogStore } from '@/stores/catalogStore';
import { fmtPlaylistTotalTime } from '@/lib/formatDuration';
import { PLAIN } from '@/lib/plainSpeak';
import type { PlaylistDef } from '@/lib/catalogTypes';

interface NestedPlaylistCardsProps {
  playlists: PlaylistDef[];
  onOpen: (id: string) => void;
}

export function NestedPlaylistCards({ playlists, onOpen }: NestedPlaylistCardsProps) {
  const getTrack = useCatalogStore((s) => s.getTrack);
  const getResolvedTrackIds = useCatalogStore((s) => s.getResolvedTrackIds);

  if (!playlists.length) return null;

  return (
    <div className="sc-nested-playlists">
      <p className="sc-nested-label">{PLAIN.nestedPlaylists}</p>
      <ul className="sc-nested-grid">
        {playlists.map((child) => {
          const ids = getResolvedTrackIds(child.id);
          const meta =
            ids.length > 0
              ? `${ids.length} ${PLAIN.tracks} · ${fmtPlaylistTotalTime(ids, getTrack)}`
              : PLAIN.emptyPlaylist;
          return (
            <li key={child.id}>
              <button type="button" className="sc-nested-card" onClick={() => onOpen(child.id)}>
                <PlaylistCoverArt playlist={child} size={48} className="sc-nested-cover" />
                <span className="sc-nested-name">{child.name}</span>
                <span className="sc-nested-meta">{meta}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
