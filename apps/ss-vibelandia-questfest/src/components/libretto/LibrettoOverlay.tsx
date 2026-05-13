import { useState } from 'react';
import { useLibrettoStore } from '@/stores/librettoStore';

export function LibrettoOverlay() {
  const posts = useLibrettoStore((s) => s.posts);
  const addScript = useLibrettoStore((s) => s.addScriptLine);
  const addDischarge = useLibrettoStore((s) => s.addDischarge);
  const [author, setAuthor] = useState('Passenger');
  const [line, setLine] = useState('');

  return (
    <div className="libretto">
      <div className="libretto-bubbles" aria-live="polite">
        {posts.map((p) => (
          <div
            key={p.id}
            className={`libretto-bubble ${p.kind === 'discharge' ? 'libretto-bubble--audio' : ''}`}
            style={{ left: `${p.xPct}%`, top: `${p.yPct}%` }}
          >
            <div className="libretto-bubble-author">{p.author}</div>
            {p.kind === 'script' && <div className="libretto-bubble-text">{p.text}</div>}
            {p.kind === 'discharge' && p.audioUrl && (
              <div className="libretto-bubble-audio">
                <span className="libretto-chip">{p.durationSec.toFixed(1)}s</span>
                <audio controls src={p.audioUrl} className="libretto-audio" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="voxel-panel libretto-compose">
        <h4>The Libretto</h4>
        <p className="libretto-hint">Script lines or ≤13s vocal discharges — bubbles float over the deck.</p>
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
    </div>
  );
}
