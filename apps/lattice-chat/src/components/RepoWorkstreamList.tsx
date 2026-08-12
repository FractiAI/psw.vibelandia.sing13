import { useEffect, useState } from 'react';
import {
  DEFAULT_REPO_ID,
  LATTICE_REPOSITORIES_FALLBACK,
  type LatticeRepository,
} from '@/repositories';
import { useLatticeStore } from '@/store';
import { isRememberedEmailFresh } from '@/access';
import { loadLatticeRepositories } from '@/api';

export function RepoWorkstreamList({ onSwitched }: { onSwitched?: () => void } = {}) {
  const activeRepoId = useLatticeStore((s) => s.activeRepoId);
  const repositories = useLatticeStore((s) => s.repositories);
  const setRepositories = useLatticeStore((s) => s.setRepositories);
  const switchRepositoryWorkstream = useLatticeStore((s) => s.switchRepositoryWorkstream);
  const userEmail = useLatticeStore((s) => s.userEmail);
  const emailRememberedAt = useLatticeStore((s) => s.emailRememberedAt);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const signedIn = isRememberedEmailFresh(userEmail, emailRememberedAt);
  const list = repositories.length ? repositories : LATTICE_REPOSITORIES_FALLBACK;

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const rows = await loadLatticeRepositories();
        if (cancelled) return;
        if (rows.length) setRepositories(rows);
        else if (!repositories.length) setRepositories(LATTICE_REPOSITORIES_FALLBACK);
      } catch {
        if (!cancelled && !repositories.length) {
          setRepositories(LATTICE_REPOSITORIES_FALLBACK);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn, userEmail, setRepositories]);

  const q = filter.trim().toLowerCase();
  const shown = q
    ? list.filter(
        (r) =>
          r.label.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          (r.blurb || '').toLowerCase().includes(q) ||
          (r.tags || []).some((t) => t.toLowerCase().includes(q)),
      )
    : list;

  function onSelect(repo: LatticeRepository) {
    if (!signedIn) return;
    switchRepositoryWorkstream(repo.id);
    onSwitched?.();
  }

  return (
    <div className="rail-section repo-workstreams">
      <h2 className="rail-section-title">Repositories</h2>
      <p className="repo-workstreams__hint">
        Currently available · tap to switch workstream
        {loading ? ' · refreshing…' : ''}
      </p>
      <label className="sr-only" htmlFor="repo-filter">
        Filter repositories
      </label>
      <input
        id="repo-filter"
        className="repo-filter"
        type="search"
        placeholder="Filter projects…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        disabled={!signedIn}
      />
      <ul className="repo-list" aria-label="Available repositories">
        {!signedIn ? (
          <li className="thread-empty">Sign in to select a repository workstream</li>
        ) : shown.length === 0 ? (
          <li className="thread-empty">No repositories match</li>
        ) : (
          shown.map((repo) => {
            const active = (activeRepoId || DEFAULT_REPO_ID) === repo.id;
            return (
              <li key={repo.id} className={active ? 'active' : undefined}>
                <button
                  type="button"
                  className="repo-select"
                  onClick={() => onSelect(repo)}
                  title={repo.blurb || repo.url}
                  aria-current={active ? 'true' : undefined}
                >
                  <span className="repo-select__label">{repo.label}</span>
                  <span className="repo-select__name">{repo.name}</span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
