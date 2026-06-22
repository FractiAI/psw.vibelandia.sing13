import { isMasterPlaylist, isMyLikesPlaylist } from '@/lib/catalogSeed';
import type { PlaylistDef } from '@/lib/catalogTypes';
import { SONIC_SINGULARITY_HERO_SRC } from '@/lib/sonicCatalogCopy';

type PlaylistCoverSource = Pick<PlaylistDef, 'id' | 'posterSrc'>;

export function playlistCoverFallback(pl: PlaylistCoverSource): string {
  if (isMyLikesPlaylist(pl.id)) return '♥';
  return '🎵';
}

export function isMasterSonicCover(pl: PlaylistCoverSource): boolean {
  return isMasterPlaylist(pl.id) && !pl.posterSrc;
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
  if (isMasterSonicCover(playlist)) {
    return (
      <img
        className={`${className} sp-pl-cover--img`}
        src={SONIC_SINGULARITY_HERO_SRC}
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
