import { Component, type ErrorInfo, type ReactNode } from 'react';
import { LATTICE_EDGE_STORAGE_KEY, prunePersistedEdgeBlob } from '@/lib/edgeStorage';

type Props = { children: ReactNode };
type State = { error: Error | null; recoverKey: number };

/**
 * Catch mount/rehydrate throws so Lattice Chat does not white-screen the tab.
 * Soft recover remounts in-place (composer draft lives in sessionStorage).
 * Hard refresh clears chat cache only — BYOK keys stay in provider key slots.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, recoverKey: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[lattice-chat] render crash', error, info?.componentStack);
  }

  private softRecover = () => {
    try {
      const raw = localStorage.getItem(LATTICE_EDGE_STORAGE_KEY);
      if (raw && raw.length > 800_000) {
        const pruned = prunePersistedEdgeBlob(raw, 6);
        if (pruned) localStorage.setItem(LATTICE_EDGE_STORAGE_KEY, pruned);
        else localStorage.removeItem(LATTICE_EDGE_STORAGE_KEY);
      }
    } catch {
      try {
        localStorage.removeItem(LATTICE_EDGE_STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
    this.setState((s) => ({ error: null, recoverKey: s.recoverKey + 1 }));
  };

  private hardRefresh = () => {
    try {
      // Drop corrupted chat cache only — BYOK keys stay in provider key slots.
      localStorage.removeItem(LATTICE_EDGE_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('_r', String(Date.now()));
      window.location.replace(url.toString());
    } catch {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.error) {
      return <div key={this.state.recoverKey}>{this.props.children}</div>;
    }
    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeContent: 'center',
          padding: '2rem',
          background: '#0a0806',
          color: '#f0e6d2',
          fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
          textAlign: 'center',
          gap: '1rem',
        }}
      >
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 600, margin: 0 }}>
          Lattice Chat hit a snag
        </h1>
        <p style={{ margin: 0, maxWidth: '28rem', opacity: 0.85, lineHeight: 1.5 }}>
          Usually a bloated on-device chat cache (heavy sessions share browser storage with the doodle
          wall). Try Continue first — your typed draft is kept in this tab. Full refresh only if
          Continue fails; API keys stay on-device either way.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={this.softRecover}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '6px',
              border: '1px solid rgba(240, 215, 140, 0.45)',
              background: 'linear-gradient(180deg, #2a2218, #16120c)',
              color: '#f0d78c',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Continue (keep draft)
          </button>
          <button
            type="button"
            onClick={this.hardRefresh}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '6px',
              border: '1px solid rgba(240, 230, 210, 0.25)',
              background: 'transparent',
              color: '#f0e6d2',
              fontWeight: 500,
              cursor: 'pointer',
              opacity: 0.9,
            }}
          >
            Clear cache &amp; reload
          </button>
        </div>
      </div>
    );
  }
}
