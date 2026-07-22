import { useState } from 'react';
import type { TranscriptItem } from '@/types';

function ThinkingBlock({ text, durationMs }: { text: string; durationMs?: number }) {
  const [open, setOpen] = useState(false);
  const label =
    typeof durationMs === 'number' && durationMs > 0
      ? `Thought for ${Math.max(1, Math.round(durationMs / 1000))}s`
      : 'Thinking';

  return (
    <div className="cx-block cx-thinking">
      <button
        type="button"
        className="cx-thinking-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="cx-chevron" data-open={open ? '1' : '0'}>
          ▸
        </span>
        {label}
      </button>
      {open && text.trim() ? <pre className="cx-thinking-body">{text}</pre> : null}
    </div>
  );
}

function ToolCallBlock({
  name,
  status,
  argsPreview,
  resultPreview,
}: {
  name: string;
  status: string;
  argsPreview?: string;
  resultPreview?: string;
}) {
  const [open, setOpen] = useState(false);
  const hasDetail = Boolean(argsPreview || resultPreview);
  const statusLabel = status === 'completed' ? 'Done' : status === 'error' ? 'Error' : 'Running';

  return (
    <div className={`cx-block cx-tool cx-tool-${status}`}>
      <button
        type="button"
        className="cx-tool-toggle"
        aria-expanded={open}
        disabled={!hasDetail}
        onClick={() => hasDetail && setOpen((v) => !v)}
      >
        {hasDetail ? (
          <span className="cx-chevron" data-open={open ? '1' : '0'}>
            ▸
          </span>
        ) : (
          <span className="cx-tool-dot" />
        )}
        <span className="cx-tool-name">{name}</span>
        <span className="cx-tool-status">{statusLabel}</span>
      </button>
      {open ? (
        <div className="cx-tool-detail">
          {argsPreview ? (
            <>
              <div className="cx-tool-label">Args</div>
              <pre>{argsPreview}</pre>
            </>
          ) : null}
          {resultPreview ? (
            <>
              <div className="cx-tool-label">Result</div>
              <pre>{resultPreview}</pre>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function AgentTranscript({ items }: { items: TranscriptItem[] }) {
  if (!items.length) return null;

  return (
    <div className="cx-transcript" aria-label="Agent output">
      {items.map((item, i) => {
        const key = `${item.type}-${i}`;
        if (item.type === 'thinking') {
          return <ThinkingBlock key={key} text={item.text} durationMs={item.durationMs} />;
        }
        if (item.type === 'tool_call') {
          return (
            <ToolCallBlock
              key={key}
              name={item.name}
              status={item.status}
              argsPreview={item.argsPreview}
              resultPreview={item.resultPreview}
            />
          );
        }
        if (item.type === 'assistant') {
          return (
            <div key={key} className="cx-block cx-assistant-text">
              {item.text}
            </div>
          );
        }
        if (item.type === 'status') {
          return (
            <div key={key} className="cx-block cx-status">
              {item.message || item.status}
            </div>
          );
        }
        if (item.type === 'task') {
          const line = [item.status, item.text].filter(Boolean).join(' · ');
          return line ? (
            <div key={key} className="cx-block cx-status">
              {line}
            </div>
          ) : null;
        }
        return null;
      })}
    </div>
  );
}
