'use client';

import { useEffect, useState } from 'react';

/**
 * Detects whether the user is viewing the app within an installed/native mobile application:
 * - PWA installed standalone mode (iOS `navigator.standalone` or `display-mode: standalone`)
 * - Native App WebViews / Bridges (`Capacitor`, `ReactNativeWebView`, Android/iOS bridge)
 * - WebView user agent tokens (`wv`, `WebView`, `HospixoApp`)
 * - Explicit app query parameter (`?app=true`, `?platform=app`, `?isApp=true`)
 * - Explicit localStorage override (`isApp=true`, `platform=app`)
 *
 * Returns `false` on standard mobile web browsers (mweb).
 */
export function useIsApplication(): boolean {
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // 1. Check URL query parameters (e.g. ?app=true, ?platform=app)
      const params = new URLSearchParams(window.location.search);
      const appParam = params.get('app') || params.get('platform') || params.get('isApp');
      if (appParam === 'true' || appParam === 'app') {
        setIsApp(true);
        return;
      }

      // 2. Check localStorage override
      if (
        window.localStorage?.getItem('isApp') === 'true' ||
        window.localStorage?.getItem('platform') === 'app'
      ) {
        setIsApp(true);
        return;
      }

      // 3. PWA standalone mode
      const isStandaloneMedia = window.matchMedia?.('(display-mode: standalone)')?.matches;
      const isIosStandalone =
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      if (isStandaloneMedia || isIosStandalone) {
        setIsApp(true);
        return;
      }

      // 4. Native App WebView globals & bridges
      const win = window as unknown as Record<string, unknown>;
      if (
        win.Capacitor !== undefined ||
        win.ReactNativeWebView !== undefined ||
        win.Android !== undefined ||
        Boolean((win.webkit as { messageHandlers?: unknown } | undefined)?.messageHandlers)
      ) {
        setIsApp(true);
        return;
      }

      // 5. User agent WebView check (Android WebView contains "wv", iOS UIWebView / embedded Safari)
      const ua = window.navigator.userAgent || '';
      if (/; wv|WebView|HospixoApp|MobileApp/i.test(ua)) {
        setIsApp(true);
        return;
      }
    } catch {
      // Ignore security errors in restricted iframes
    }
  }, []);

  return isApp;
}
