import { useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { JukeboxPlaylistMenu } from '@/components/jukebox/JukeboxPlaylistMenu';
import { JukeboxTrackPanel } from '@/components/jukebox/JukeboxTrackPanel';
import { JukeboxSiteNav } from '@/components/jukebox/JukeboxSiteNav';
import { HgaiOsDefinitionBlock } from '@/components/HgaiOsDefinitionBlock';
import { useJukeboxListenSetup } from '@/hooks/useJukeboxListenSetup';
import { useCatalogStore } from '@/stores/catalogStore';
import { useMediaChromeStore } from '@/stores/mediaChromeStore';
import { useSessionStore } from '@/stores/sessionStore';
import { MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { JUKEBOX_NOW_PLAYING_PATH } from '@/lib/jukeboxRoutes';
import { setSharedTrackAutoplaySeed } from '@/lib/sharedTrackPlayback';
import { playTrackById } from '@/lib/trackPlayback';
import {
  SONIC_SINGULARITY_DESCRIPTION,
  JUKEBOX_WELCOME,
  JUKEBOX_WELCOME_TITLE,
  JUKEBOX_MEMBER_INVITE_TITLE,
  JUKEBOX_MEMBER_INVITE_BODY,
  JUKEBOX_MEMBER_INVITE_CTA_UPLOAD,
  JUKEBOX_MEMBER_INVITE_CTA_PASS,
} from '@/lib/sonicCatalogCopy';

export const JUKEBOX_HERO_SRC = '/interfaces/assets/jukebox-golden-era-1940s.png';

export function JukeboxListenPage() {
  useJukeboxListenSetup();

  const navigate = useNavigate();
  const activePlaylistId = useCatalogStore((s) => s.activePlaylistId);
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);
  const deviceHydrated = useCatalogStore((s) => s.deviceHydrated);
  const trackCount = useCatalogStore((s) => Object.keys(s.tracks).length);
  const getTrack = useCatalogStore((s) => s.getTrack);
  const setBoardingOpen = useMediaChromeStore((s) => s.setBoardingOpen);
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);
  const memberUnlocked = isPassenger || captainUnlocked;
  const [searchParams, setSearchParams] = useSearchParams();
  const sharedTrackHandled = useRef(false);

  const openNowPlaying = () => navigate(JUKEBOX_NOW_PLAYING_PATH);

  useEffect(() => {
    if (!activePlaylistId) setActivePlaylist(MASTER_PLAYLIST_ID);
  }, [activePlaylistId, setActivePlaylist]);

  useEffect(() => {
    const trackId = searchParams.get('track');
    if (!trackId || !deviceHydrated || sharedTrackHandled.current) return;
    const tr = getTrack(trackId);
    if (!tr) return;
    sharedTrackHandled.current = true;
    setActivePlaylist(MASTER_PLAYLIST_ID);
    setSharedTrackAutoplaySeed(trackId);
    playTrackById(trackId, getTrack);
    setSearchParams({}, { replace: true });
    navigate(JUKEBOX_NOW_PLAYING_PATH, { replace: true });
  }, [deviceHydrated, getTrack, navigate, searchParams, setActivePlaylist, setSearchParams, trackCount]);

  const playlistId = activePlaylistId || MASTER_PLAYLIST_ID;

  return (
    <div className="jb-app jb-app--browse">
      <JukeboxSiteNav mode="browse" />

      <div className="jb-stage" aria-label="Jukebox selector">
        <div className="jb-stage__hero">
          <img
            className="jb-stage__photo"
            src={JUKEBOX_HERO_SRC}
            alt="1940s golden era jukebox"
            width={640}
            height={960}
            decoding="async"
          />
        </div>
        <JukeboxPlaylistMenu activeId={playlistId} onSelect={setActivePlaylist} />
        <div className="jb-stage__tracks" aria-label="Selected playlist tracks">
          {trackCount === 0 ? (
            <div className="jb-empty jb-empty--stage">
              <p>No tracks on the Sonic Ship yet.</p>
              <Link to="/dj" className="jb-link-btn">
                Upload on DJ tab — feed the hydrogen Y line
              </Link>
            </div>
          ) : (
            <JukeboxTrackPanel playlistId={playlistId} onOpenNowPlaying={openNowPlaying} />
          )}
        </div>
      </div>

      <main className="jb-body jb-body--footer">
        <section className="jb-welcome jb-welcome--compact" aria-label="Welcome">
          <p className="jb-welcome__title">{JUKEBOX_WELCOME_TITLE}</p>
          <p className="jb-welcome__body">{JUKEBOX_WELCOME}</p>
        </section>
        <HgaiOsDefinitionBlock variant="compact" />
        <section className="jb-member-invite" aria-label="Member upload invitation">
          <p className="jb-member-invite__title">{JUKEBOX_MEMBER_INVITE_TITLE}</p>
          <p className="jb-member-invite__body">{JUKEBOX_MEMBER_INVITE_BODY}</p>
          <div className="jb-member-invite__actions">
            <Link to="/dj" className="jb-link-btn">
              {JUKEBOX_MEMBER_INVITE_CTA_UPLOAD}
            </Link>
            {!memberUnlocked ? (
              <button type="button" className="jb-link-btn jb-link-btn--ghost" onClick={() => setBoardingOpen(true)}>
                {JUKEBOX_MEMBER_INVITE_CTA_PASS}
              </button>
            ) : null}
          </div>
        </section>
        <p className="jb-master-blurb">{SONIC_SINGULARITY_DESCRIPTION}</p>
      </main>
    </div>
  );
}
