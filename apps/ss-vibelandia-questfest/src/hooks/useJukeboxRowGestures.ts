import { useCallback, useRef } from 'react';

const DOUBLE_TAP_MS = 320;
const SWIPE_THRESHOLD_PX = 72;

type RowGestureOpts = {
  enabled: boolean;
  onSwipeLeft?: () => void;
  onDoubleTap?: () => void;
  onLongPressDragStart?: (e: React.PointerEvent) => void;
  onLongPressDragMove?: (e: React.PointerEvent) => void;
  onLongPressDragEnd?: (e: React.PointerEvent) => void;
  suppressDrag?: boolean;
};

/** Handheld row gestures: left swipe remove, double-tap menu, long-press drag on row body. */
export function useJukeboxRowGestures({
  enabled,
  onSwipeLeft,
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
      if (Math.abs(e.clientY - startYRef.current) > 12) draggingRef.current = true;
    },
    [onLongPressDragMove, suppressDrag],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) return;
      pointerIdRef.current = null;

      if (!suppressDrag) onLongPressDragEnd?.(e);

      const dx = e.clientX - startXRef.current;
      const dy = Math.abs(e.clientY - startYRef.current);

      if (!draggingRef.current && dy < 24 && dx < -SWIPE_THRESHOLD_PX && onSwipeLeft) {
        swipeHandledRef.current = true;
        onSwipeLeft();
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(12);
        return;
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
      }
    },
    [onDoubleTap, onLongPressDragEnd, onSwipeLeft, suppressDrag],
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
