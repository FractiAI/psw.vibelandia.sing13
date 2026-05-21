import { useEffect, useState } from 'react';

/** Bridge tower LCD — loops https://youtu.be/IRgS6QcPK8o */
const YOUTUBE_ID = 'IRgS6QcPK8o';

function buildEmbedSrc(origin: string) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    playsinline: '1',
    loop: '1',
    playlist: YOUTUBE_ID,
    controls: '0',
    modestbranding: '1',
    rel: '0',
    enablejsapi: '1',
    iv_load_policy: '3',
  });
  if (origin) params.set('origin', origin);
  return `https://www.youtube.com/embed/${YOUTUBE_ID}?${params.toString()}`;
}

export function BridgeTowerBillboard({ variant = 'bridge' }: { variant?: 'bridge' | 'hero' }) {
  const [embedSrc, setEmbedSrc] = useState('');

  useEffect(() => {
    setEmbedSrc(buildEmbedSrc(window.location.origin));
  }, []);

  const rootClass =
    variant === 'hero' ? 'qf-bridge-tower qf-bridge-tower--hero' : 'qf-bridge-tower';

  return (
    <aside className={rootClass} aria-label="Bridge tower announcement — holographic AI OS">
      <p className="qf-bridge-tower__label">BRIDGE TOWER · LIVE BILLBOARD</p>
      <a className="qf-bridge-tower__product-cta" href="/holographic-goldilocks-ai-os">
        Open Holographic Goldilocks AI OS demo →
      </a>
      <div className="qf-bridge-tower__bezel">
        <div className="qf-bridge-tower__screen">
          {embedSrc ? (
            <iframe
              className="qf-bridge-tower__embed"
              src={embedSrc}
              title="Bridge tower live feed"
              allow="autoplay; encrypted-media; picture-in-picture; accelerometer; gyroscope; clipboard-write; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <div className="qf-bridge-tower__embed qf-bridge-tower__embed--loading" aria-hidden />
          )}
          <div className="qf-bridge-tower__scan" aria-hidden />
          <div className="qf-bridge-tower__glow" aria-hidden />
        </div>
      </div>
    </aside>
  );
}
