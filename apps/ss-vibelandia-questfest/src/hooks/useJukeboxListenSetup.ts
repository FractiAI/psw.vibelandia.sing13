import { useEffect } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';

/** Shared hydrate + jukebox html class for Listen routes. */
export function useJukeboxListenSetup(extraClass?: 'qf-jukebox-now-page') {
  const setDjMode = useCatalogStore((s) => s.setDjMode);
  const setPlaylistTab = useCatalogStore((s) => s.setPlaylistTab);
  const syncLibraryFromServer = useCatalogStore((s) => s.syncLibraryFromServer);
  const deviceHydrated = useCatalogStore((s) => s.deviceHydrated);

  useEffect(() => {
    document.documentElement.classList.add('qf-jukebox-page');
    if (extraClass) document.documentElement.classList.add(extraClass);
    setDjMode(false);
    setPlaylistTab(false);
    const hydrate = () => useCatalogStore.getState().hydrateFromDevice();
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(hydrate, { timeout: 120 });
    } else {
      setTimeout(hydrate, 0);
    }
    return () => {
      document.documentElement.classList.remove('qf-jukebox-page');
      if (extraClass) document.documentElement.classList.remove(extraClass);
    };
  }, [extraClass, setDjMode, setPlaylistTab]);

  useEffect(() => {
    if (!deviceHydrated) return;
    void syncLibraryFromServer();
  }, [deviceHydrated, syncLibraryFromServer]);
}
