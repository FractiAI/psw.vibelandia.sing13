import { isMasterPlaylist, isMyLikesPlaylist } from '@/lib/catalogSeed';
import type { PlaylistDef } from '@/lib/catalogTypes';

type PlaylistCoverSource = Pick<PlaylistDef, 'id' | 'posterSrc'>;

export function playlistCoverFallback(pl: PlaylistCoverSource): string {
  if (isMasterPlaylist(pl.id)) return '📚';
  if (isMyLikesPlaylist(pl.id)) return '♥';
  return '🎵';
}

interface PlaylistCoverArtProps {
  playlist: PlaylistCoverSource;
  className?: string;
  size?: number;
}

export function PlaylistCoverArt({ playlist, className = 'sp-pl-cover', size = 48 }: PlaylistCoverArtProps) {
  if (playlist.posterSrc) {
    return (
      <img
        className={`${className} sp-pl-cover--img`}
        src={playlist.posterSrc}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
      />
    );
  }
  return (
    <span className={className} aria-hidden>
      {playlistCoverFallback(playlist)}
    </span>
  );
}
