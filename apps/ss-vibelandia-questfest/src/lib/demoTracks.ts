/** Long-form demo track (MP3) — exercises the 30s solenoid gate in most browsers. */
export const DEMO_LONG_MP3 =
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

/** Shorter deck tone for quick tests (MDN sample). */
export const DEMO_SHORT_MP3 =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3';

export type PlaylistKind = 'open_deck' | 'sovereign';

export interface TrackDef {
  id: string;
  title: string;
  artist: string;
  src: string;
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
    channelHint: '13-channel lattice (Passenger)',
  },
  'trk-short': {
    id: 'trk-short',
    title: 'Proximity Ping',
    artist: 'Bridge Diagnostics',
    src: DEMO_SHORT_MP3,
    channelHint: 'Deck ping · short burst',
  },
  'trk-alt': {
    id: 'trk-alt',
    title: 'Alternate Bearing',
    artist: 'Sovereign Nest',
    src: DEMO_LONG_MP3,
    channelHint: 'Inherited from Sovereign Playlist',
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
