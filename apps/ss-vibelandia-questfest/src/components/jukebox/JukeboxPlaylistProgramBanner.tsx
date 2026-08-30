import { getPlaylistProgramMeta } from '@/lib/playlistProgramRoutes';

interface JukeboxPlaylistProgramBannerProps {
  playlistId: string;
}

/** Broadway-style program link for sovereign soundtrack playlists. */
export function JukeboxPlaylistProgramBanner({ playlistId }: JukeboxPlaylistProgramBannerProps) {
  const meta = getPlaylistProgramMeta(playlistId);
  if (!meta) return null;

  return (
    <div className="jb-program-banner" role="complementary" aria-label={`${meta.label} for this playlist`}>
      <p className="jb-program-banner__note">{meta.note}</p>
      <div className="jb-program-banner__actions">
        <a className="jb-tool-btn jb-tool-btn--gold" href={meta.route}>
          {meta.label}
        </a>
        <a className="jb-tool-btn" href={meta.route}>
          {meta.readLabel}
        </a>
        <a className="jb-tool-btn" href={meta.route}>
          {meta.downloadLabel}
        </a>
      </div>
    </div>
  );
}
