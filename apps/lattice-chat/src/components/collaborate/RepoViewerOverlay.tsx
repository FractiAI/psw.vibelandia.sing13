import type { MouseEvent as ReactMouseEvent } from 'react';
import { useUnifiedFeed } from '@/feed/store';
import type { RepoFileNode } from '@/feed/types';

export function RepoViewerOverlay({
  onClose,
  showDockHint = false,
}: {
  onClose?: () => void;
  showDockHint?: boolean;
}) {
  const repoName = useUnifiedFeed((s) => s.repoName);
  const files = useUnifiedFeed((s) => s.repoFiles);
  const active = useUnifiedFeed((s) => s.activeContextFile);
  const openRepoFile = useUnifiedFeed((s) => s.openRepoFile);
  const setContextMenu = useUnifiedFeed((s) => s.setContextMenu);
  const contextMenu = useUnifiedFeed((s) => s.contextMenu);
  const runContextAction = useUnifiedFeed((s) => s.runContextAction);

  function onSelect(file: RepoFileNode, e: ReactMouseEvent) {
    e.preventDefault();
    openRepoFile(file);
    if (e.detail === 2 || e.shiftKey) {
      setContextMenu({ x: e.clientX, y: e.clientY, file });
    }
  }

  function onContextMenu(file: RepoFileNode, e: ReactMouseEvent) {
    e.preventDefault();
    openRepoFile(file);
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  }

  function onLongPressStart(file: RepoFileNode) {
    const t = window.setTimeout(() => {
      openRepoFile(file);
      setContextMenu({
        x: Math.min(window.innerWidth - 180, 80),
        y: Math.min(window.innerHeight - 160, 180),
        file,
      });
    }, 480);
    const clear = () => window.clearTimeout(t);
    window.addEventListener('pointerup', clear, { once: true });
    window.addEventListener('pointercancel', clear, { once: true });
  }

  return (
    <section className="repo-viewer" aria-label="Repository viewer">
      <header className="repo-viewer__head">
        <div>
          <p className="repo-viewer__label">Repository</p>
          <h2>{repoName}</h2>
        </div>
        {onClose ? (
          <button type="button" className="repo-viewer__close" onClick={onClose}>
            Close
          </button>
        ) : null}
      </header>
      {showDockHint ? (
        <p className="repo-viewer__hint">Long-press a file · Open · Share to Chat · Convert to Task/Commit</p>
      ) : null}
      <ul className="repo-file-list">
        {files.map((file) => (
          <li key={file.id}>
            <button
              type="button"
              className={`repo-file${active?.id === file.id ? ' is-active' : ''}`}
              onClick={(e) => onSelect(file, e)}
              onContextMenu={(e) => onContextMenu(file, e)}
              onPointerDown={() => {
                if (file.kind === 'file') onLongPressStart(file);
              }}
            >
              <span className="repo-file__kind" aria-hidden>
                {file.kind === 'folder' ? '▸' : '·'}
              </span>
              <span className="repo-file__name">{file.name}</span>
              {file.presence?.map((p) => (
                <span key={p.peerId} className="repo-file__presence" data-hue={p.hue} title={p.peerId} />
              ))}
            </button>
          </li>
        ))}
      </ul>
      {active ? (
        <div className="repo-preview">
          <p className="repo-preview__path">{active.path}</p>
          <pre className="repo-preview__body">
            {active.kind === 'folder'
              ? `Directory · ${active.path}\nPeers may be active in nested files.`
              : `// Preview · ${active.name}\n// Presence-synced workspace context\n// Right-click or long-press → Convert to Task/Commit\n`}
          </pre>
        </div>
      ) : null}

      {contextMenu ? (
        <div
          className="repo-ctx-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          role="menu"
        >
          <button type="button" role="menuitem" onClick={() => runContextAction('open')}>
            Open
          </button>
          <button type="button" role="menuitem" onClick={() => runContextAction('share')}>
            Share to Chat
          </button>
          <button
            type="button"
            role="menuitem"
            className="is-emphasis"
            onClick={() => runContextAction('convert')}
          >
            Convert to Task/Commit
          </button>
          <button type="button" role="menuitem" onClick={() => runContextAction('ask_agent')}>
            Ask Agent
          </button>
          <button type="button" role="menuitem" onClick={() => setContextMenu(null)}>
            Cancel
          </button>
        </div>
      ) : null}
    </section>
  );
}
