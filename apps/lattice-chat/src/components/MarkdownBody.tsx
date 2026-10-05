import Markdown from 'react-markdown';
import { Component, memo, useState, type ErrorInfo, type ReactNode } from 'react';
import remarkGfm from 'remark-gfm';
import {
  MAX_MARKDOWN_RENDER_CHARS,
  markdownRenderSlice,
} from '@/lib/messageContentCap';

type Props = { children: string; className?: string };

class MarkdownParseBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[lattice-chat] markdown render crash', error, info?.componentStack);
    this.props.onError();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

/**
 * Safe markdown — caps initial remark parse so mega agent dumps cannot
 * freeze or white-screen the session. Expand loads the full string on demand.
 */
export const MarkdownBody = memo(function MarkdownBody({ children, className }: Props) {
  const text = String(children ?? '');
  const [expanded, setExpanded] = useState(false);
  const [plainFallback, setPlainFallback] = useState(false);

  if (!text.trim()) return null;

  const slice = markdownRenderSlice(
    text,
    expanded ? Number.POSITIVE_INFINITY : MAX_MARKDOWN_RENDER_CHARS,
  );
  const visible = expanded ? text : slice.visible;

  if (plainFallback) {
    return (
      <div className={['md-body', 'md-body--plain', className].filter(Boolean).join(' ')}>
        <pre style={{ whiteSpace: 'pre-wrap', margin: 0, font: 'inherit' }}>{visible}</pre>
        {slice.truncated && !expanded ? (
          <button type="button" className="md-expand" onClick={() => setExpanded(true)}>
            Show full reply ({slice.totalChars.toLocaleString()} chars)
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={['md-body', className].filter(Boolean).join(' ')}>
      <MarkdownParseBoundary onError={() => setPlainFallback(true)}>
        <Markdown
          remarkPlugins={[remarkGfm]}
          disallowedElements={['script', 'style', 'iframe', 'object', 'embed']}
          unwrapDisallowed
          components={{
            a: ({ href, children: linkChildren }: { href?: string; children?: ReactNode }) => (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {linkChildren}
              </a>
            ),
          }}
        >
          {visible}
        </Markdown>
      </MarkdownParseBoundary>
      {slice.truncated && !expanded ? (
        <button type="button" className="md-expand" onClick={() => setExpanded(true)}>
          Show full reply ({slice.totalChars.toLocaleString()} chars)
        </button>
      ) : null}
    </div>
  );
});
