import { useEffect } from 'react';
import { flushPlaybackSession } from '@/hooks/usePlaybackSessionPersistence';
import { resumeOrPlayTrack, resumePlaybackIfNeeded } from '@/lib/trackPlayback';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';

/**
 * Keep playback running across in-app navigation and tab backgrounding.
 * Only explicit pause or closing the tab should stop audio.
 */
export function usePersistentPlayback() {
  const trackId = usePlaybackStore((s) => s.currentTrackId);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const getTrack = useCatalogStore((s) => s.getTrack);
  const track = trackId ? getTrack(trackId) : undefined;

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flushPlaybackSession();
        return;
      }
      const resume = () => resumePlaybackIfNeeded();
      resume();
      window.setTimeout(resume, 50);
      window.setTimeout(resume, 250);
    };

    const onPageShow = (ev: PageTransitionEvent) => {
      if (ev.persisted || document.visibilityState === 'visible') {
        resumePlaybackIfNeeded();
        window.setTimeout(() => resumePlaybackIfNeeded(), 50);
      }
    };

    const onFocus = () => {
      if (document.hidden) return;
      resumePlaybackIfNeeded();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  useEffect(() => {
    if (!track || typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    try {
      const artwork = track.posterSrc
        ? [{ src: track.posterSrc, sizes: '512x512', type: 'image/jpeg' }]
        : [];
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: 'SS Vibelandia QUESTFEST',
        artwork,
      });
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      navigator.mediaSession.setActionHandler('play', () => {
        const pb = usePlaybackStore.getState();
        const tr = pb.currentTrackId ? getTrack(pb.currentTrackId) : undefined;
        pb.setPlaying(true);
        if (tr) resumeOrPlayTrack(tr);
        else resumePlaybackIfNeeded();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        usePlaybackStore.getState().setPlaying(false);
        const el = document.querySelector<HTMLAudioElement>('audio.sp-global-audio');
        el?.pause();
      });
    } catch {
      /* unsupported */
    }

    return () => {
      try {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
      } catch {
        /* ignore */
      }
    };
  }, [isPlaying, track?.artist, track?.id, track?.posterSrc, track?.title]);
}
