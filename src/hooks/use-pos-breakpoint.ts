'use client';

import * as React from 'react';

export type PosBreakpoint = 'mobile' | 'tablet' | 'desktop';

function getBreakpoint(): PosBreakpoint {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

function subscribe(onStoreChange: () => void) {
  const queries = [
    window.matchMedia('(max-width: 767px)'),
    window.matchMedia('(min-width: 768px) and (max-width: 1023px)'),
    window.matchMedia('(min-width: 1024px)'),
  ];
  queries.forEach((mql) => mql.addEventListener('change', onStoreChange));
  return () => queries.forEach((mql) => mql.removeEventListener('change', onStoreChange));
}

function getServerSnapshot(): PosBreakpoint {
  return 'desktop';
}

export function usePosBreakpoint(): PosBreakpoint {
  return React.useSyncExternalStore(subscribe, getBreakpoint, getServerSnapshot);
}
