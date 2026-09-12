import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Catch mount/rehydrate throws so Lattice Chat does not white-screen the tab.
 * Player 1 can hard-refresh the edge without losing BYOK keys (separate storage).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[lattice-chat] render crash', error, info?.componentStack);
  }

  private hardRefresh = () => {
    try {
      // Drop corrupted chat cache only — BYOK keys stay in provider key slots.
      localStorage.removeItem('lattice-v1618-edge');
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
    if (!this.state.error) return this.props.children;
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
          The edge cache may be bloated after a heavy doodle wall. Refresh clears chat cache only —
          your API keys stay on-device.
        </p>
        <button
          type="button"
          onClick={this.hardRefresh}
          style={{
            justifySelf: 'center',
            padding: '0.65rem 1.25rem',
            borderRadius: '6px',
            border: '1px solid rgba(240, 215, 140, 0.45)',
            background: 'linear-gradient(180deg, #2a2218, #16120c)',
            color: '#f0d78c',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Refresh Lattice Chat
        </button>
      </div>
    );
  }
}
