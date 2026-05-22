/** Single shared <audio> — play() must run inside the user tap handler (iOS Safari). */

let audioEl: HTMLAudioElement | null = null;
let loadedUrl: string | null = null;

/** Keep the last mounted element — ignore ref(null) from Strict Mode remounts. */
export function bindSimpleAudioElement(el: HTMLAudioElement | null): void {
  if (el) audioEl = el;
}

export function getSimpleAudioElement(): HTMLAudioElement | null {
  return audioEl;
}

function readyEnough(el: HTMLAudioElement): boolean {
  return el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA;
}

/** Call synchronously from click/tap handlers. */
export function playAudioNow(url: string, volume = 1): Promise<void> {
  const el = audioEl;
  if (!el || !url) return Promise.reject(new Error('no_audio_or_url'));

  el.volume = Math.max(0, Math.min(1, volume));

  if (loadedUrl !== url) {
    loadedUrl = url;
    el.src = url;
  }

  const attempt = (): Promise<void> => el.play();

  if (readyEnough(el)) {
    return attempt();
  }

  // iOS: play() must be invoked in the gesture stack even when not ready yet.
  const gesturePlay = attempt();
  return gesturePlay.catch(() => {
    if (readyEnough(el) && loadedUrl === url) return attempt();
    return new Promise<void>((resolve, reject) => {
      const onReady = () => {
        cleanup();
        attempt().then(resolve).catch(reject);
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
  audioEl?.pause();
}

export function syncLoadedUrl(url: string | null): void {
  loadedUrl = url;
}
