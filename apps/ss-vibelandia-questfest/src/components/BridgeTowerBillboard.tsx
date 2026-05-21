/** Bridge tower LCD — loops https://youtu.be/IRgS6QcPK8o */
const YOUTUBE_ID = 'IRgS6QcPK8o';
const EMBED_SRC =
  `https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_ID}&controls=0&modestbranding=1&playsinline=1&rel=0`;

export function BridgeTowerBillboard({ variant = 'bridge' }: { variant?: 'bridge' | 'hero' }) {
  const rootClass =
    variant === 'hero' ? 'qf-bridge-tower qf-bridge-tower--hero' : 'qf-bridge-tower';

  return (
    <aside className={rootClass} aria-label="Bridge tower announcement — holographic AI OS">
      <p className="qf-bridge-tower__label">BRIDGE TOWER · LIVE BILLBOARD</p>
      <div className="qf-bridge-tower__bezel">
        <div className="qf-bridge-tower__screen">
          <iframe
            className="qf-bridge-tower__embed"
            src={EMBED_SRC}
            title="Bridge tower live feed"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
          <div className="qf-bridge-tower__scan" aria-hidden />
          <div className="qf-bridge-tower__glow" aria-hidden />
        </div>
      </div>
    </aside>
  );
}
