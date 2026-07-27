import { Link } from 'react-router-dom';
import { QUESTFEST_DECK_HREF } from '@/components/QuestfestFastLink';
import { JUKEBOX_LISTEN_PATH, JUKEBOX_NOW_PLAYING_PATH } from '@/lib/jukeboxRoutes';
import { SONIC_BRAND_NAME, SONIC_LISTEN_EYEBROW_PREFIX, SONIC_SINGULARITY_TAGLINE } from '@/lib/sonicCatalogCopy';

type JukeboxSiteNavProps = {
  mode: 'browse' | 'now';
};

export function JukeboxSiteNav({ mode }: JukeboxSiteNavProps) {
  const inJukeboxWindow = typeof window !== 'undefined' && window.name === 'qv-jukebox';

  return (
    <header className="jb-top jb-top--slim">
      <nav className="jb-nav" aria-label="Site">
        <a className="jb-nav__link" href={QUESTFEST_DECK_HREF} {...(inJukeboxWindow ? { target: '_blank', rel: 'noopener' } : {})}>
          ← QUESTFEST
        </a>
        <span aria-hidden="true">·</span>
        <Link to="/bridge" className="jb-nav__link">
          Bridge
        </Link>
        <span aria-hidden="true">·</span>
        {mode === 'browse' ? (
          <span className="jb-nav__here">Jukebox</span>
        ) : (
          <Link to={JUKEBOX_LISTEN_PATH}>Jukebox</Link>
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
      {inJukeboxWindow ? (
        <p className="jb-eyebrow jb-eyebrow--jukebox-window">
          Jukebox window — leave this open; browse the site in your other tab.
        </p>
      ) : null}
      <p className="jb-eyebrow">
        {SONIC_LISTEN_EYEBROW_PREFIX}{' '}
        <a className="jb-brand-selectable" href={QUESTFEST_DECK_HREF} {...(inJukeboxWindow ? { target: '_blank', rel: 'noopener' } : {})}>
          {SONIC_BRAND_NAME}
        </a>
      </p>
      <p className="jb-tagline jb-tagline--slim">{SONIC_SINGULARITY_TAGLINE}</p>
    </header>
  );
}
