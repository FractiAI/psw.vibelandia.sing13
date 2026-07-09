import { useEffect } from 'react';
import { useCourseStore } from '@/store/courseStore';

declare global {
  interface Window {
    QVPageViews?: {
      recordWithKey: (key: string) => void;
    };
    __qvPageViewsBoot?: boolean;
  }
}

function loadPageViewsScript(): Promise<void> {
  if (window.QVPageViews) return Promise.resolve();
  return new Promise((resolve) => {
    if (document.querySelector('script[data-qv-page-views]')) {
      const tick = () => {
        if (window.QVPageViews) resolve();
        else window.setTimeout(tick, 50);
      };
      tick();
      return;
    }
    const s = document.createElement('script');
    s.src = '/interfaces/site-page-views.js';
    s.defer = true;
    s.setAttribute('data-qv-page-views', '1');
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

export function usePageViews(moduleId?: string) {
  useEffect(() => {
    let cancelled = false;
    const key = `/executive-ai|module=${moduleId || 'welcome'}`;
    void loadPageViewsScript().then(() => {
      if (cancelled || !window.QVPageViews) return;
      window.QVPageViews.recordWithKey(key);
    });
    return () => {
      cancelled = true;
    };
  }, [moduleId]);
}
