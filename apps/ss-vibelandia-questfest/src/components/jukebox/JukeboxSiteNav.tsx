import { Link } from 'react-router-dom';
import { JUKEBOX_LISTEN_PATH, JUKEBOX_NOW_PLAYING_PATH } from '@/lib/jukeboxRoutes';
import { SONIC_LISTEN_EYEBROW, SONIC_SINGULARITY_TAGLINE } from '@/lib/sonicCatalogCopy';

type JukeboxSiteNavProps = {
  mode: 'browse' | 'now';
};

export function JukeboxSiteNav({ mode }: JukeboxSiteNavProps) {
  return (
    <header className="jb-top jb-top--slim">
      <nav className="jb-nav" aria-label="Site">
        <Link to="/bridge" className="jb-nav__link">
          Bridge
        </Link>
        <span aria-hidden="true">·</span>
        {mode === 'browse' ? (
          <span className="jb-nav__here">Listen</span>
        ) : (
          <Link to={JUKEBOX_LISTEN_PATH}>Listen</Link>
        )}
        <span aria-hidden="true">·</span>
        {mode === 'now' ? (
          <span className="jb-nav__here">Now playing</span>
        ) : (
          <Link to={JUKEBOX_NOW_PLAYING_PATH}>Now playing</Link>
        )}
        <span aria-hidden="true">·</span>
        <Link to="/dj">DJ</Link>
      </nav>
      <p className="jb-eyebrow">{SONIC_LISTEN_EYEBROW}</p>
      <p className="jb-tagline jb-tagline--slim">{SONIC_SINGULARITY_TAGLINE}</p>
    </header>
  );
}
