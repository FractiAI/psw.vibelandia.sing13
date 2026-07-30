import Markdown from 'react-markdown';
import type React from 'react';
import remarkGfm from 'remark-gfm';

export function MarkdownBody({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const text = String(children ?? '');
  if (!text.trim()) return null;

  return (
    <div className={['md-body', className].filter(Boolean).join(' ')}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        disallowedElements={['script', 'style', 'iframe', 'object', 'embed']}
        unwrapDisallowed
        components={{
          a: ({ href, children: linkChildren }: { href?: string; children?: React.ReactNode }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {linkChildren}
            </a>
          ),
        }}
      >
        {text}
      </Markdown>
    </div>
  );
}
