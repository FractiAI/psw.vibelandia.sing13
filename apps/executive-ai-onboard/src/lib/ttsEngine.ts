export type TtsMode = 'neural' | 'browser' | 'idle';

const audioCache = new Map<string, string>();
let activeAudio: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;

function textKey(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  }
  return `k${h}_${text.length}`;
}

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return Promise.resolve([]);
  }
  if (!voicesReady) {
    voicesReady = new Promise((resolve) => {
      const pick = () => resolve(window.speechSynthesis.getVoices());
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) return resolve(voices);
      window.speechSynthesis.onvoiceschanged = () => pick();
      window.setTimeout(pick, 250);
    });
  }
  return voicesReady;
}

const MALE_VOICE_HINTS = [
  'guy',
  'david',
  'mark',
  'james',
  'brian',
  'christopher',
  'eric',
  'steffan',
  'daniel',
  'alex',
  'fred',
  'male',
  'onyx',
  'echo',
];

export async function pickMaleVoice(): Promise<SpeechSynthesisVoice | null> {
  const voices = await loadVoices();
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  const ranked = en
    .map((v) => {
      const name = v.name.toLowerCase();
      let score = 0;
      if (name.includes('natural') || name.includes('neural')) score += 4;
      for (const hint of MALE_VOICE_HINTS) {
        if (name.includes(hint)) score += 3;
      }
      if (v.localService) score += 1;
      if (name.includes('female') || name.includes('zira') || name.includes('samantha')) score -= 6;
      return { v, score };
    })
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.v ?? en[0] ?? voices[0] ?? null;
}

export function stopSpeaking(): void {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = '';
    activeAudio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  activeUtterance = null;
}

async function fetchNeuralAudio(text: string): Promise<string | null> {
  const key = textKey(text);
  const cached = audioCache.get(key);
  if (cached) return cached;

  const res = await fetch('/api/executive-onboard-tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice: 'onyx' }),
  });

  if (!res.ok) return null;

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  audioCache.set(key, url);
  return url;
}

function speakBrowser(text: string, voice: SpeechSynthesisVoice | null): Promise<TtsMode> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('Speech synthesis unavailable'));
      return;
    }

    const utter = new SpeechSynthesisUtterance(text);
    activeUtterance = utter;
    if (voice) utter.voice = voice;
    utter.lang = voice?.lang ?? 'en-US';
    utter.rate = 0.92;
    utter.pitch = 0.88;

    utter.onend = () => {
      activeUtterance = null;
      resolve('browser');
    };
    utter.onerror = (e) => {
      activeUtterance = null;
      reject(e);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  });
}

function playAudioUrl(url: string): Promise<TtsMode> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    activeAudio = audio;
    audio.onended = () => {
      activeAudio = null;
      resolve('neural');
    };
    audio.onerror = () => {
      activeAudio = null;
      reject(new Error('Audio playback failed'));
    };
    void audio.play().catch(reject);
  });
}

export async function speak(text: string): Promise<TtsMode> {
  stopSpeaking();
  const trimmed = text.trim();
  if (!trimmed) return 'idle';

  try {
    const url = await fetchNeuralAudio(trimmed);
    if (url) return await playAudioUrl(url);
  } catch {
    /* fall through to browser */
  }

  const voice = await pickMaleVoice();
  return speakBrowser(trimmed, voice);
}

export async function probeTtsMode(): Promise<TtsMode> {
  try {
    const res = await fetch('/api/executive-onboard-tts');
    if (!res.ok) return 'browser';
    const data = (await res.json()) as { available?: boolean };
    return data.available ? 'neural' : 'browser';
  } catch {
    return 'browser';
  }
}
