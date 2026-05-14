/** Long-form demo track (MP3) — exercises the 30s solenoid gate in most browsers. */
export const DEMO_LONG_MP3 =
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

/** Shorter deck tone for quick tests (MDN sample). */
export const DEMO_SHORT_MP3 =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3';

/** CC0 sample video — video-first deck unit (Big Buck Bunny excerpt bucket). */
export const DEMO_VIDEO_MP4 =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const PHI = 1.618;
export const HYDROGEN_LINE_GHZ = 1.42;

export type PlaylistKind = 'open_deck' | 'sovereign';

export interface TrackDef {
  id: string;
  title: string;
  artist: string;
  src: string;
  videoSrc?: string;
  posterSrc?: string;
  lyrics?: string;
  egsPhi: number;
  hydrogenLineGhz: number;
  channelIndex: number;
  /** Shown when Passenger — “13-channel” metaphor */
  channelHint: string;
}

export interface PlaylistDef {
  id: string;
  name: string;
  kind: PlaylistKind;
  description: string;
  trackIds: string[];
}

export const TRACKS: Record<string, TrackDef> = {
  'trk-long': {
    id: 'trk-long',
    title: 'Overture (Deck Calibration)',
    artist: 'Master Playlist',
    src: DEMO_LONG_MP3,
    videoSrc: DEMO_VIDEO_MP4,
    lyrics: 'φ-bearing over Reno swamp holograph — hydrogen line locked at 1.420 GHz metaphor.',
    egsPhi: PHI,
    hydrogenLineGhz: HYDROGEN_LINE_GHZ,
    channelIndex: 1,
    channelHint: 'Ch 1 · φ lattice (Passenger)',
  },
  'trk-short': {
    id: 'trk-short',
    title: 'Proximity Ping',
    artist: 'Bridge Diagnostics',
    src: DEMO_SHORT_MP3,
    egsPhi: PHI,
    hydrogenLineGhz: HYDROGEN_LINE_GHZ,
    channelIndex: 13,
    channelHint: 'Ch 13 · deck ping · short burst',
  },
  'trk-alt': {
    id: 'trk-alt',
    title: 'Alternate Bearing',
    artist: 'Sovereign Nest',
    src: DEMO_LONG_MP3,
    videoSrc: DEMO_VIDEO_MP4,
    lyrics: 'Wrong side of town bearing — caliente swamp sync for advertising cuts.',
    egsPhi: PHI,
    hydrogenLineGhz: HYDROGEN_LINE_GHZ,
    channelIndex: 8,
    channelHint: 'Ch 8 · inherited Sovereign Playlist',
  },
};

export const INITIAL_PLAYLISTS: PlaylistDef[] = [
  {
    id: 'pl-open',
    name: 'Open Deck Broadcast',
    kind: 'open_deck',
    description: 'Public relay — full preview for anonymous crew (no solenoid).',
    trackIds: ['trk-short'],
  },
  {
    id: 'pl-sovereign',
    name: 'Sovereign Master Playlist',
    kind: 'sovereign',
    description: 'All tracks inherit the Solenoid Gate until Passenger status is active.',
    trackIds: ['trk-long', 'trk-alt'],
  },
];
