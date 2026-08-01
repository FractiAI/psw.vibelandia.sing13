import type { PlaylistDef } from '@/lib/catalogTypes';
import { resolvePlaylistCoverSrc } from '@/lib/sonicCatalogCopy';

type PlaylistCoverSource = Pick<PlaylistDef, 'id' | 'posterSrc'>;

interface PlaylistCoverArtProps {
  playlist: PlaylistCoverSource;
  className?: string;
  size?: number;
}

export function PlaylistCoverArt({ playlist, className = 'sp-pl-cover', size = 48 }: PlaylistCoverArtProps) {
  const src = resolvePlaylistCoverSrc(playlist.posterSrc);
  return (
    <img
      className={`${className} sp-pl-cover--img`}
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
    />
  );
}
