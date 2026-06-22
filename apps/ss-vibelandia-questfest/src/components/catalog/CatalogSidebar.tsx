import { useCatalogStore } from '@/stores/catalogStore';
import { PlaylistSidebarTree } from '@/components/catalog/PlaylistSidebarTree';
import { PLAIN } from '@/lib/plainSpeak';
import { useLocation, useNavigate } from 'react-router-dom';
import { QUESTFEST_DECK_HREF } from '@/components/QuestfestFastLink';

interface CatalogSidebarProps {
  onUploadClick: () => void;
}

export function CatalogSidebar({ onUploadClick }: CatalogSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeId = useCatalogStore((s) => s.activePlaylistId);
  const setActive = useCatalogStore((s) => s.setActivePlaylist);
  const createPlaylist = useCatalogStore((s) => s.createPlaylist);
  const djMode = useCatalogStore((s) => s.djMode);
  const setDjMode = useCatalogStore((s) => s.setDjMode);
  const trackCount = useCatalogStore((s) => Object.keys(s.tracks).length);

  const openPlaylist = (id: string) => {
    setDjMode(false);
    setActive(id);
    if (location.pathname !== '/bridge') navigate('/bridge', { replace: true });
  };

  const goLibrary = () => {
    setDjMode(false);
    if (location.pathname !== '/bridge') navigate('/bridge', { replace: true });
  };

  const handleCreate = (parentId?: string) => {
    createPlaylist(PLAIN.newPlaylist, parentId);
    setDjMode(false);
    if (location.pathname !== '/bridge') navigate('/bridge', { replace: true });
  };

  return (
    <aside className="sc-side">
      <div className="sc-side-brand">
        <span className="sc-side-logo" aria-hidden>
          ♪
        </span>
        <div>
          <strong>Machote Moderno</strong>
          <span className="sc-side-sub">
            {trackCount} {PLAIN.tracks}
          </span>
        </div>
      </div>

      <nav className="sc-side-nav">
        <button type="button" className={`sc-nav-btn${!djMode ? ' sc-nav-btn--on' : ''}`} onClick={goLibrary}>
          {PLAIN.library}
        </button>
        <button type="button" className={`sc-nav-btn${djMode ? ' sc-nav-btn--on' : ''}`} onClick={onUploadClick}>
          {PLAIN.upload}
        </button>
        <a className="sc-nav-link" href={QUESTFEST_DECK_HREF}>
          {PLAIN.questfest}
        </a>
      </nav>

      <PlaylistSidebarTree
        activeId={activeId}
        djMode={djMode}
        onSelect={openPlaylist}
        onCreate={handleCreate}
      />
    </aside>
  );
}
