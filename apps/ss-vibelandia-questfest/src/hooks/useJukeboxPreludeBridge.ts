import { useEffect } from 'react';
import { CONCIERTO_PRELUDE_PLAYLIST_ID } from '@/lib/conciertoPreludePlaylist';
import { pausePlayback, playTrackById, resumePlaybackIfNeeded } from '@/lib/trackPlayback';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';

export const JUKEBOX_PRELUDE_CHANNEL = 'qv-jukebox-prelude';

function firstPlayableTrackId(playlistId: string): string | null {
  const { playlists, getTrack } = useCatalogStore.getState();
  const pl = playlists.find((p) => p.id === playlistId);
  if (!pl) return null;
  for (const id of pl.trackIds) {
    if (getTrack(id)) return id;
  }
  return null;
}

/** Landing hero ↔ jukebox now-playing session (BroadcastChannel). */
export function useJukeboxPreludeBridge() {
  const getTrack = useCatalogStore((s) => s.getTrack);
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(JUKEBOX_PRELUDE_CHANNEL);
    } catch {
      return;
    }

    const broadcastState = () => {
      if (!channel) return;
      const pb = usePlaybackStore.getState();
      const track = pb.currentTrackId ? getTrack(pb.currentTrackId) : undefined;
      channel.postMessage({
        type: 'state',
        playing: pb.isPlaying,
        playlistId: pb.playbackPlaylistId,
        trackId: pb.currentTrackId,
        trackTitle: track?.title ?? null,
      });
    };

    const onMessage = (ev: MessageEvent) => {
      const msg = ev.data as {
        type?: string;
        playlistId?: string;
      };
      if (!msg?.type) return;

      if (msg.type === 'ping') {
        broadcastState();
        return;
      }

      if (msg.type === 'pause') {
        pausePlayback();
        broadcastState();
        return;
      }

      if (msg.type === 'play') {
        const playlistId = msg.playlistId || CONCIERTO_PRELUDE_PLAYLIST_ID;
        setActivePlaylist(playlistId);
        const pb = usePlaybackStore.getState();
        if (
          pb.playbackPlaylistId === playlistId &&
          pb.currentTrackId &&
          getTrack(pb.currentTrackId)
        ) {
          void resumePlaybackIfNeeded();
          broadcastState();
          return;
        }
        const firstId = firstPlayableTrackId(playlistId);
        if (firstId) {
          playTrackById(firstId, getTrack, { playbackPlaylistId: playlistId });
        }
        broadcastState();
      }
    };

    channel.addEventListener('message', onMessage);
    const unsub = usePlaybackStore.subscribe(broadcastState);
    broadcastState();

    return () => {
      unsub();
      channel?.removeEventListener('message', onMessage);
      channel?.close();
    };
  }, [getTrack, setActivePlaylist]);
}
