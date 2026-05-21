/** 8s looping newscast tease MP4 — Bridge tower LCD (Times Square style). */
const VIDEO_SRC = '/interfaces/assets/bridge-tower-holographic-ai-os-tease.mp4';
const POSTER_SRC = '/interfaces/assets/holographic-ai-os-newscast-frame.png';

export function BridgeTowerBillboard({ variant = 'bridge' }: { variant?: 'bridge' | 'hero' }) {
  const rootClass =
    variant === 'hero' ? 'qf-bridge-tower qf-bridge-tower--hero' : 'qf-bridge-tower';

  return (
    <aside className={rootClass} aria-label="Bridge tower announcement — holographic AI OS">
      <p className="qf-bridge-tower__label">BRIDGE TOWER · LIVE BILLBOARD</p>
      <div className="qf-bridge-tower__bezel">
        <div className="qf-bridge-tower__screen">
          <video
            className="qf-bridge-tower__video"
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            width={640}
            height={360}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="8 second animated news tease: 13D Holographic AI OS announced"
          />
          <div className="qf-bridge-tower__scan" aria-hidden />
          <div className="qf-bridge-tower__glow" aria-hidden />
        </div>
      </div>
    </aside>
  );
}
