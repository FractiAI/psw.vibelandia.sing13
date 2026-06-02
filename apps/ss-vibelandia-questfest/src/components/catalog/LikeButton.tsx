import { useCatalogStore } from '@/stores/catalogStore';

interface LikeButtonProps {
  trackId: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function LikeButton({ trackId, className = '', size = 'sm' }: LikeButtonProps) {
  const liked = useCatalogStore((s) => s.isTrackLiked(trackId));
  const toggleLike = useCatalogStore((s) => s.toggleTrackLike);

  return (
    <button
      type="button"
      className={`sp-like-btn sp-like-btn--${size}${liked ? ' sp-like-btn--on' : ''}${className ? ` ${className}` : ''}`}
      aria-pressed={liked}
      aria-label={liked ? 'Unlike track' : 'Like track'}
      title={liked ? 'Unlike' : 'Like'}
      onClick={(e) => {
        e.stopPropagation();
        toggleLike(trackId);
      }}
    >
      <span className="sp-like-btn__icon" aria-hidden>
        {liked ? '♥' : '♡'}
      </span>
    </button>
  );
}
