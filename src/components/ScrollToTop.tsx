import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Resets scroll position to the top on every route change, since the browser otherwise
 * preserves scroll position across client-side navigations in a single-page app. */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
