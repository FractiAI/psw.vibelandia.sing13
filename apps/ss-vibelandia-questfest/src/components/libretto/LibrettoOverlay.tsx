import { useMemo, useState } from 'react';
import { useLibrettoStore } from '@/stores/librettoStore';

export function LibrettoOverlay() {
  const posts = useLibrettoStore((s) => s.posts);
  const addScript = useLibrettoStore((s) => s.addScriptLine);
  const addDischarge = useLibrettoStore((s) => s.addDischarge);
  const [author, setAuthor] = useState('Passenger');
  const [line, setLine] = useState('');

  const ordered = useMemo(
    () => [...posts].sort((a, b) => a.created - b.created),
    [posts],
  );

  return (
    <div className="libretto">
      <div className="voxel-panel libretto-compose">
        <h4>The Libretto</h4>
        <p className="libretto-hint">Script lines or ≤13s vocal discharges — chronological deck log.</p>
        <div className="libretto-row">
          <input
            className="libretto-input"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Callsign"
            aria-label="Callsign"
          />
          <input
            className="libretto-input libretto-input--grow"
            value={line}
            onChange={(e) => setLine(e.target.value)}
            placeholder="Scripted line…"
          />
          <button
            type="button"
            className="voxel-btn voxel-btn--orange"
            onClick={() => {
              if (!line.trim()) return;
              addScript(author.trim() || 'Passenger', line.trim());
              setLine('');
            }}
          >
            Cast line
          </button>
        </div>
        <div className="libretto-row">
          <input
            type="file"
            accept="audio/*"
            className="libretto-file"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const url = URL.createObjectURL(f);
              const audio = new Audio(url);
              await new Promise<void>((res, rej) => {
                audio.addEventListener('loadedmetadata', () => res(), { once: true });
                audio.addEventListener('error', () => rej(), { once: true });
              }).catch(() => {});
              const d = Math.min(13, audio.duration || 13);
              addDischarge(author.trim() || 'Passenger', f, d);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      <div className="voxel-panel libretto-feed" aria-live="polite">
        <h4 className="libretto-feed-title">Deck log</h4>
        <ul className="libretto-list">
          {ordered.map((p) => (
            <li key={p.id} className={`libretto-entry ${p.kind === 'discharge' ? 'libretto-entry--audio' : ''}`}>
              <div className="libretto-entry-meta">
                <span className="libretto-entry-author">{p.author}</span>
                <time className="libretto-entry-time" dateTime={new Date(p.created).toISOString()}>
                  {new Date(p.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>
              {p.kind === 'script' && <p className="libretto-entry-text">{p.text}</p>}
              {p.kind === 'discharge' && p.audioUrl && (
                <div className="libretto-entry-audio">
                  <span className="libretto-chip">{p.durationSec.toFixed(1)}s discharge</span>
                  <audio controls src={p.audioUrl} className="libretto-audio" />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
