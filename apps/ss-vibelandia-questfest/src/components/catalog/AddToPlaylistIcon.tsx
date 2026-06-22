import { PLAIN } from '@/lib/plainSpeak';

interface AddToPlaylistIconProps {
  onClick: () => void;
  className?: string;
}

/** List + plus — add track to playlist. */
export function AddToPlaylistIcon({ onClick, className = '' }: AddToPlaylistIconProps) {
  return (
    <button
      type="button"
      className={`sc-track-add-pl${className ? ` ${className}` : ''}`}
      aria-label={PLAIN.addToPlaylist}
      title={PLAIN.addToPlaylist}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <svg className="sc-track-add-pl__svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden>
        <path
          fill="currentColor"
          d="M2 2.5h10v1H2v-1zm0 3h7v1H2v-1zm0 3h9v1H2v-1zm9 3.5h1.5v1.5H16V12h-1.5V10.5H13V9h1.5V7.5H16V6h-1.5V4.5H13V3h1.5V1.5H16V0h-1.5v1.5H13v1.5h1.5V6H13v1.5h1.5V9H13v1.5h1.5V12H13v1.5h1.5V15H16v1h-1.5v-1.5H13V13h1.5z"
        />
      </svg>
      <span className="sc-track-add-pl__label">{PLAIN.addToPlaylist}</span>
    </button>
  );
}
