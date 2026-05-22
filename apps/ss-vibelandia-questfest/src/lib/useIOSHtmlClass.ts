import { useEffect } from 'react';
import { isIOSDevice } from '@/lib/devicePlayback';

/** Adds `html.ios` for mobile Safari–specific CSS (playback, layout). */
export function useIOSHtmlClass(): void {
  useEffect(() => {
    if (!isIOSDevice()) return;
    document.documentElement.classList.add('ios');
    return () => document.documentElement.classList.remove('ios');
  }, []);
}
