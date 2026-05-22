/** Single shared <audio> — play() must run inside the user tap handler (iOS Safari). */

let audioEl: HTMLAudioElement | null = null;
let loadedUrl: string | null = null;

export function bindSimpleAudioElement(el: HTMLAudioElement | null): void {
  audioEl = el;
}

export function getSimpleAudioElement(): HTMLAudioElement | null {
  return audioEl;
}

/** Call synchronously from click/tap handlers. */
export function playAudioNow(url: string, volume = 1): Promise<void> {
  const el = audioEl;
  if (!el || !url) return Promise.reject(new Error('no_audio_or_url'));

  if (loadedUrl !== url) {
    loadedUrl = url;
    el.src = url;
  }
  el.volume = volume;

  return el.play();
}

export function pauseSimpleAudio(): void {
  audioEl?.pause();
}

export function syncLoadedUrl(url: string | null): void {
  loadedUrl = url;
}
