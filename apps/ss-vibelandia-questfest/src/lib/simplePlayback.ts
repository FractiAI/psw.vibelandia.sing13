/** Single shared <audio> — play() must run inside the user tap handler (iOS Safari). */

let audioEl: HTMLAudioElement | null = null;
let loadedUrl: string | null = null;
let bindGeneration = 0;
const bindSubscribers = new Set<() => void>();

export type PlaybackEngineHooks = {
  onTime: (currentTime: number) => void;
  onEnded: () => void;
  onError: () => void;
};

let engineHooks: PlaybackEngineHooks | null = null;
let wiredEl: HTMLAudioElement | null = null;
let onTimeUpdate: (() => void) | null = null;
let onEndedHandler: (() => void) | null = null;
let onErrorHandler: (() => void) | null = null;
let onPlayingHandler: (() => void) | null = null;

function notifyBind(): void {
  bindGeneration += 1;
  bindSubscribers.forEach((fn) => fn());
}

function unwireElement(el: HTMLAudioElement): void {
  if (onTimeUpdate) el.removeEventListener('timeupdate', onTimeUpdate);
  if (onEndedHandler) el.removeEventListener('ended', onEndedHandler);
  if (onErrorHandler) el.removeEventListener('error', onErrorHandler);
  if (onPlayingHandler) el.removeEventListener('playing', onPlayingHandler);
  if (wiredEl === el) wiredEl = null;
}

function wireElement(el: HTMLAudioElement): void {
  if (wiredEl && wiredEl !== el) unwireElement(wiredEl);
  if (wiredEl === el) return;

  onTimeUpdate = () => {
    engineHooks?.onTime(el.currentTime);
  };
  onEndedHandler = () => engineHooks?.onEnded();
  onErrorHandler = () => engineHooks?.onError();
  onPlayingHandler = () => {
    engineHooks?.onTime(el.currentTime);
  };

  el.addEventListener('timeupdate', onTimeUpdate);
  el.addEventListener('ended', onEndedHandler);
  el.addEventListener('error', onErrorHandler);
  el.addEventListener('playing', onPlayingHandler);
  wiredEl = el;
}

/** Register time/ended/error handlers; re-wires when <audio> binds or remounts. */
export function registerPlaybackEngine(hooks: PlaybackEngineHooks): void {
  engineHooks = hooks;
  const el = getSimpleAudioElement();
  if (el) wireElement(el);
}

export function subscribeAudioBind(fn: () => void): () => void {
  bindSubscribers.add(fn);
  return () => bindSubscribers.delete(fn);
}

export function getAudioBindGeneration(): number {
  return bindGeneration;
}

/** Keep the mounted element; drop stale nodes left after Strict Mode unmount. */
export function bindSimpleAudioElement(el: HTMLAudioElement | null): void {
  if (el) {
    audioEl = el;
    notifyBind();
    wireElement(el);
    return;
  }
  if (audioEl && !audioEl.isConnected) {
    if (wiredEl === audioEl) unwireElement(audioEl);
    audioEl = null;
  }
}

export function getSimpleAudioElement(): HTMLAudioElement | null {
  if (!audioEl) return null;
  if (!audioEl.isConnected) return null;
  return audioEl;
}

function readyEnough(el: HTMLAudioElement): boolean {
  return el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA;
}

/** Call synchronously from click/tap handlers. */
export function playAudioNow(url: string, volume = 1): Promise<void> {
  const el = getSimpleAudioElement();
  if (!el || !url) return Promise.reject(new Error('no_audio_or_url'));

  el.volume = Math.max(0, Math.min(1, volume));

  if (loadedUrl !== url) {
    loadedUrl = url;
    el.src = url;
  }

  const attempt = (): Promise<void> => el.play();

  if (readyEnough(el)) {
    return attempt().then(() => {
      engineHooks?.onTime(el.currentTime);
    });
  }

  const gesturePlay = attempt();
  return gesturePlay.catch(() => {
    if (readyEnough(el) && loadedUrl === url) {
      return attempt().then(() => {
        engineHooks?.onTime(el.currentTime);
      });
    }
    return new Promise<void>((resolve, reject) => {
      const onReady = () => {
        cleanup();
        attempt()
          .then(() => {
            engineHooks?.onTime(el.currentTime);
            resolve();
          })
          .catch(reject);
      };
      const onFail = () => {
        cleanup();
        reject(new Error('media_error'));
      };
      const cleanup = () => {
        el.removeEventListener('canplay', onReady);
        el.removeEventListener('error', onFail);
      };
      el.addEventListener('canplay', onReady, { once: true });
      el.addEventListener('error', onFail, { once: true });
      if (readyEnough(el)) onReady();
    });
  });
}

export function pauseSimpleAudio(): void {
  const el = getSimpleAudioElement();
  el?.pause();
}

export function syncLoadedUrl(url: string | null): void {
  loadedUrl = url;
}

export function getLoadedUrl(): string | null {
  return loadedUrl;
}

/** Compare track URL to element src (browser resolves to absolute href). */
export function urlMatchesElement(el: HTMLAudioElement, url: string): boolean {
  if (!url) return !el.src;
  try {
    return new URL(el.src || '', window.location.href).href === new URL(url, window.location.href).href;
  } catch {
    return el.src === url;
  }
}
