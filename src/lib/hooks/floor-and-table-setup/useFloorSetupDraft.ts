'use client';

import { useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import {
  floorStepHref,
  getFloorSetupServerSnapshot,
  getFloorSetupSnapshot,
  markFloorSetupHydrated,
  parseFloorRoute,
  subscribeFloorSetup,
  writeFloorSetup,
  type FloorRouteStep,
  type FloorSetupDraft,
} from '@/lib/helpers/floorAndTableSetup';

function subscribeHydration(onChange: () => void) {
  markFloorSetupHydrated();
  onChange();
  return () => {};
}

export function useFloorSetupDraft() {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const route = parseFloorRoute(pathname);
  const draft = useSyncExternalStore(
    subscribeFloorSetup,
    () => getFloorSetupSnapshot(route.base),
    getFloorSetupServerSnapshot,
  );
  const ready = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );

  function save(next: FloorSetupDraft) {
    writeFloorSetup(route.base, next);
  }

  function openStep(step: FloorRouteStep, next?: FloorSetupDraft) {
    if (next) writeFloorSetup(route.base, next);
    const href = floorStepHref(route.base, step);
    if (href === pathname) return;
    if (route.step === 'hub' && step !== 'hub') router.push(href);
    else router.replace(href);
  }

  return { route, draft, ready, save, openStep };
}
