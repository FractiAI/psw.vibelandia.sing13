import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    QVPageViews?: {
      record: (loc?: Location, extra?: string) => void;
      recordWithKey: (key: string) => void;
      pageKey: (loc?: Location, extra?: string) => string;
    };
    __qvPageViewsBoot?: boolean;
  }
}

function loadPageViewsScript(): Promise<void> {
  if (window.QVPageViews) return Promise.resolve();
  if (document.querySelector('script[data-qv-page-views]')) {
    return new Promise((resolve) => {
      const tick = () => {
        if (window.QVPageViews) resolve();
        else window.setTimeout(tick, 50);
      };
      tick();
    });
  }
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = '/interfaces/site-page-views.js';
    s.defer = true;
    s.setAttribute('data-qv-page-views', '1');
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

/** Record SPA route views and show per-page visit count bottom-right. */
export function usePageViews(extra?: string) {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    let cancelled = false;
    void loadPageViewsScript().then(() => {
      if (cancelled || !window.QVPageViews) return;
      const key = window.QVPageViews.pageKey(
        { pathname, search, hash } as Location,
        extra,
      );
      window.QVPageViews.recordWithKey(key);
    });
    return () => {
      cancelled = true;
    };
  }, [pathname, search, hash, extra]);
}
