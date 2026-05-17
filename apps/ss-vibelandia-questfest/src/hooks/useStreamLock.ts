import { useCallback, useEffect, useRef, useState } from 'react';
import { getOrCreateDeviceId } from '@/lib/mockJwt';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useSessionStore } from '@/stores/sessionStore';

const CH = 'qv-vibelandia-stream';

export type KillReason = 'vessel_switch' | 'tab_preempt' | null;

interface StreamLockApi {
  beginSession: () => void;
  endSession: () => void;
  killReason: KillReason;
  clearKill: () => void;
}

/** Cross-tab + best-effort cross-device (warm serverless) stream lock */
export function useStreamLock(): StreamLockApi {
  const jti = useSessionStore((s) => s.jti);
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);
  const fullPlay = isPassenger || captainUnlocked;
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const [killReason, setKillReason] = useState<KillReason>(null);

  const clearKill = useCallback(() => setKillReason(null), []);

  const deviceId = useRef(getOrCreateDeviceId()).current;

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
    if (!fullPlay) return;
    sendPreempt();
    if (isPassenger && jti) void postHeartbeat(jti, deviceId);
  }, [deviceId, fullPlay, isPassenger, jti, sendPreempt]);

  const endSession = useCallback(() => {
    /* polling tied to isPlaying */
  }, []);

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
    return () => {
      bc?.close();
    };
  }, [deviceId]);

  useEffect(() => {
    if (!isPlaying || !isPassenger || !jti || captainUnlocked) return;

    sendPreempt();

    const poll = () => {
      if (document.hidden) return;
      void postHeartbeat(jti, deviceId);
      void getHeartbeat(jti, deviceId).then((res) => {
        if (res?.kill) {
          setKillReason('vessel_switch');
          usePlaybackStore.getState().setPlaying(false);
          usePlaybackStore.getState().setGain(0);
        }
      });
    };

    poll();
    const id = window.setInterval(poll, 4000);

    return () => window.clearInterval(id);
  }, [captainUnlocked, deviceId, isPassenger, isPlaying, jti, sendPreempt]);

  return { beginSession, endSession, killReason, clearKill };
}

async function postHeartbeat(jti: string, deviceId: string) {
  try {
    const token = useSessionStore.getState().passToken ?? '';
    await fetch('/api/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jti, deviceId, token }),
    });
  } catch {
    /* offline / local dev */
  }
}

async function getHeartbeat(
  jti: string,
  deviceId: string,
): Promise<{ kill: boolean; activeDeviceId?: string | null } | null> {
  try {
    const u = new URL('/api/heartbeat', window.location.origin);
    u.searchParams.set('jti', jti);
    u.searchParams.set('deviceId', deviceId);
    const r = await fetch(u.toString(), { method: 'GET' });
    if (!r.ok) return null;
    return r.json() as Promise<{ kill: boolean; activeDeviceId?: string | null }>;
  } catch {
    return null;
  }
}
