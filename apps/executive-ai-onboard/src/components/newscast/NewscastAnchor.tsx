import { motion } from 'framer-motion';

interface Props {
  speaking: boolean;
  name?: string;
  title?: string;
}

export function NewscastAnchor({ speaking, name = 'Marcus Hale', title = 'Executive AI Desk' }: Props) {
  return (
    <div className="newscast-anchor-frame relative aspect-video w-full overflow-hidden rounded-xl bg-[#0a1628]">
      <div className="newscast-studio-bg absolute inset-0" aria-hidden />
      <div className="newscast-scanlines pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden />

      <div className="relative flex h-full items-end justify-center pb-6 pt-8">
        <svg viewBox="0 0 200 220" className="h-[78%] w-auto drop-shadow-2xl" aria-hidden>
          <defs>
            <linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4a574" />
              <stop offset="100%" stopColor="#b8956a" />
            </linearGradient>
          </defs>

          <ellipse cx="100" cy="205" rx="70" ry="12" fill="rgba(0,0,0,0.35)" />

          <path d="M45 220 L155 220 L140 155 L60 155 Z" fill="url(#suitGrad)" />
          <path d="M78 155 L100 175 L122 155" fill="#1e3a5f" />
          <rect x="92" y="168" width="16" height="22" rx="2" fill="#f8fafc" />
          <path d="M92 175 L108 175 L100 185 Z" fill="#dc2626" />

          <motion.g
            animate={speaking ? { y: [0, -1.2, 0] } : { y: 0 }}
            transition={{ duration: 0.35, repeat: speaking ? Infinity : 0, ease: 'easeInOut' }}
          >
            <ellipse cx="100" cy="88" rx="42" ry="50" fill="url(#skinGrad)" />
            <path d="M58 78 Q100 58 142 78" fill="#3d2918" opacity="0.85" />
            <ellipse cx="78" cy="92" rx="5" ry="3.5" fill="#2d1f14" />
            <ellipse cx="122" cy="92" rx="5" ry="3.5" fill="#2d1f14" />
            <ellipse cx="78" cy="91" rx="1.8" ry="1.8" fill="#fafafa" />
            <ellipse cx="122" cy="91" rx="1.8" ry="1.8" fill="#fafafa" />

            <motion.ellipse
              cx="100"
              cy="108"
              rx="6"
              animate={
                speaking
                  ? { ry: [2.5, 7, 3, 8, 2.5], opacity: 1 }
                  : { ry: 2.5, opacity: 0.9 }
              }
              transition={{ duration: 0.22, repeat: speaking ? Infinity : 0 }}
              fill="#6b4423"
            />

            <path d="M72 118 Q100 128 128 118" stroke="#9a6b4a" strokeWidth="2" fill="none" opacity="0.5" />
          </motion.g>
        </svg>
      </div>

      <div className="absolute left-3 top-3 flex items-center gap-2">
        <span className="newscast-live-badge flex items-center gap-1.5 rounded px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white">
          <span className="newscast-live-dot h-1.5 w-1.5 rounded-full bg-white" />
          Live
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10">
        <p className="text-sm font-semibold text-white">{name}</p>
        <p className="text-[0.65rem] uppercase tracking-widest text-white/70">{title}</p>
      </div>
    </div>
  );
}
