import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Resets scroll position on every route change, since the browser otherwise
 * preserves scroll position across client-side navigations in a single-page app.
 * If the new URL has a hash, scrolls to that element instead of the top —
 * the target may not exist yet on first paint, so this retries briefly. */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = hash.slice(1);
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ block: 'start' });
      } else if (attempts < 10) {
        attempts += 1;
        window.setTimeout(tryScroll, 50);
      }
    };
    tryScroll();
  }, [pathname, hash]);

  return null;
};
