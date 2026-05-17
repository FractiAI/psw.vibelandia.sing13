import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlaybackStore } from '@/stores/playbackStore';

const CH = 'qv-vibelandia-stream';

export type KillReason = 'vessel_switch' | 'tab_preempt' | null;

interface StreamLockApi {
  beginSession: () => void;
  endSession: () => void;
  killReason: KillReason;
  clearKill: () => void;
}

/** Cross-tab only: pause if another tab starts playing. No server heartbeat polling. */
export function useStreamLock(): StreamLockApi {
  const [killReason, setKillReason] = useState<KillReason>(null);
  const deviceId = useRefStableDeviceId();

  const clearKill = useCallback(() => setKillReason(null), []);

  const sendPreempt = useCallback(() => {
    try {
      const bc = new BroadcastChannel(CH);
      bc.postMessage({ type: 'preempt', deviceId, ts: Date.now() });
      bc.close();
    } catch {
      /* ignore */
    }
  }, [deviceId]);

  const beginSession = useCallback(() => {
    sendPreempt();
  }, [sendPreempt]);

  const endSession = useCallback(() => {}, []);

  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(CH);
      bc.onmessage = (ev: MessageEvent) => {
        const d = ev.data as { type?: string; deviceId?: string };
        if (
          d?.type === 'preempt' &&
          d.deviceId &&
          d.deviceId !== deviceId &&
          document.visibilityState === 'visible'
        ) {
          setKillReason('tab_preempt');
          usePlaybackStore.getState().setPlaying(false);
          usePlaybackStore.getState().setGain(0);
        }
      };
    } catch {
      /* ignore */
    }
    return () => bc?.close();
  }, [deviceId]);

  return { beginSession, endSession, killReason, clearKill };
}

function useRefStableDeviceId(): string {
  const ref = useRef<string | null>(null);
  if (ref.current) return ref.current;
  const key = 'qv-device-id';
  try {
    let id = sessionStorage.getItem(key) ?? '';
    if (!id) {
      id = crypto.randomUUID?.() ?? `dev-${Date.now()}`;
      sessionStorage.setItem(key, id);
    }
    ref.current = id;
  } catch {
    ref.current = `dev-${Date.now()}`;
  }
  return ref.current;
}
