import { useCallback, useRef } from 'react';

const DOUBLE_TAP_MS = 320;
const SWIPE_THRESHOLD_PX = 72;
const SWIPE_REVEAL_PX = 84;

type RowGestureOpts = {
  enabled: boolean;
  onSwipeProgress?: (dx: number) => void;
  onSwipeReveal?: () => void;
  onSwipeReset?: () => void;
  onDoubleTap?: () => void;
  onLongPressDragStart?: (e: React.PointerEvent) => void;
  onLongPressDragMove?: (e: React.PointerEvent) => void;
  onLongPressDragEnd?: (e: React.PointerEvent) => void;
  suppressDrag?: boolean;
};

/** Handheld row gestures: left swipe reveal remove, double-tap menu, long-press drag. */
export function useJukeboxRowGestures({
  enabled,
  onSwipeProgress,
  onSwipeReveal,
  onSwipeReset,
  onDoubleTap,
  onLongPressDragStart,
  onLongPressDragMove,
  onLongPressDragEnd,
  suppressDrag = false,
}: RowGestureOpts) {
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const lastTapRef = useRef(0);
  const draggingRef = useRef(false);
  const swipeHandledRef = useRef(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled || e.button !== 0) return;
      pointerIdRef.current = e.pointerId;
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      draggingRef.current = false;
      swipeHandledRef.current = false;
      if (!suppressDrag) onLongPressDragStart?.(e);
    },
    [enabled, onLongPressDragStart, suppressDrag],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) return;
      if (!suppressDrag) onLongPressDragMove?.(e);
      const dy = Math.abs(e.clientY - startYRef.current);
      if (dy > 12) draggingRef.current = true;

      const dx = e.clientX - startXRef.current;
      if (!draggingRef.current && dy < 24 && dx < 0 && onSwipeProgress) {
        onSwipeProgress(Math.max(dx, -SWIPE_REVEAL_PX));
      }
    },
    [onLongPressDragMove, onSwipeProgress, suppressDrag],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) return;
      pointerIdRef.current = null;

      if (!suppressDrag) onLongPressDragEnd?.(e);

      const dx = e.clientX - startXRef.current;
      const dy = Math.abs(e.clientY - startYRef.current);

      if (!draggingRef.current && dy < 24 && dx < -SWIPE_THRESHOLD_PX) {
        swipeHandledRef.current = true;
        onSwipeReveal?.();
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(12);
        return;
      }

      if (!draggingRef.current && dy < 24 && Math.abs(dx) < 16) {
        onSwipeReset?.();
      }

      if (!draggingRef.current && dy < 24 && Math.abs(dx) < 16 && onDoubleTap) {
        const now = Date.now();
        if (now - lastTapRef.current < DOUBLE_TAP_MS) {
          lastTapRef.current = 0;
          swipeHandledRef.current = true;
          onDoubleTap();
        } else {
          lastTapRef.current = now;
        }
      } else if (Math.abs(dx) >= SWIPE_THRESHOLD_PX || dy >= 24) {
        onSwipeReset?.();
      }
    },
    [onDoubleTap, onLongPressDragEnd, onSwipeReveal, onSwipeReset, suppressDrag],
  );

  const onPointerCancel = useCallback(
    (e: React.PointerEvent) => {
      onPointerUp(e);
    },
    [onPointerUp],
  );

  return {
    rowGestureProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
    swipeHandledRef,
  };
}

export const JB_SWIPE_REVEAL_PX = SWIPE_REVEAL_PX;
