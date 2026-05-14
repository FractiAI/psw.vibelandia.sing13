import { useCallback, useEffect, useRef, useState } from 'react';

const LONG_PRESS_MS = 420;

export function usePlaylistReorder(
  playlistId: string,
  enabled: boolean,
  reorder: (playlistId: string, fromIndex: number, toIndex: number) => void,
) {
  const listRef = useRef<HTMLOListElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const startYRef = useRef(0);

  const clearPress = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }, []);

  const resolveOverIndex = useCallback((clientY: number) => {
    const list = listRef.current;
    if (!list) return null;
    const rows = list.querySelectorAll<HTMLElement>('[data-reorder-idx]');
    for (let i = 0; i < rows.length; i++) {
      const rect = rows[i].getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) {
        return Number(rows[i].dataset.reorderIdx);
      }
    }
    if (rows.length) return Number(rows[rows.length - 1].dataset.reorderIdx);
    return null;
  }, []);

  const finishDrag = useCallback(
    (from: number, to: number | null) => {
      if (to !== null && from !== to) reorder(playlistId, from, to);
      setDragIndex(null);
      setOverIndex(null);
      dragIndexRef.current = null;
      pointerIdRef.current = null;
    },
    [playlistId, reorder],
  );

  useEffect(() => {
    if (dragIndex === null) return;

    const onMove = (e: PointerEvent) => {
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
      e.preventDefault();
      const over = resolveOverIndex(e.clientY);
      if (over !== null) setOverIndex(over);
    };

    const onUp = (e: PointerEvent) => {
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
      const from = dragIndexRef.current;
      const over = resolveOverIndex(e.clientY);
      if (from !== null) finishDrag(from, over ?? from);
      clearPress();
    };

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [dragIndex, clearPress, finishDrag, resolveOverIndex]);

  const onGripPointerDown = useCallback(
    (index: number, e: React.PointerEvent) => {
      if (!enabled) return;
      e.stopPropagation();
      pointerIdRef.current = e.pointerId;
      startYRef.current = e.clientY;
      clearPress();

      const startNow = e.pointerType === 'mouse' || e.pointerType === 'pen';
      if (startNow) {
        dragIndexRef.current = index;
        setDragIndex(index);
        setOverIndex(index);
        return;
      }

      pressTimerRef.current = setTimeout(() => {
        dragIndexRef.current = index;
        setDragIndex(index);
        setOverIndex(index);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(10);
        }
      }, LONG_PRESS_MS);
    },
    [clearPress, enabled],
  );

  const onGripPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (dragIndexRef.current !== null) return;
      if (!pressTimerRef.current) return;
      if (Math.abs(e.clientY - startYRef.current) > 10) clearPress();
    },
    [clearPress],
  );

  const onGripPointerUp = useCallback(
    (index: number, e: React.PointerEvent) => {
      e.stopPropagation();
      if (dragIndexRef.current === null) {
        clearPress();
        return;
      }
      const over = resolveOverIndex(e.clientY);
      finishDrag(dragIndexRef.current, over ?? index);
      clearPress();
    },
    [clearPress, finishDrag, resolveOverIndex],
  );

  return {
    listRef,
    dragIndex,
    overIndex,
    onGripPointerDown,
    onGripPointerMove,
    onGripPointerUp,
  };
}
