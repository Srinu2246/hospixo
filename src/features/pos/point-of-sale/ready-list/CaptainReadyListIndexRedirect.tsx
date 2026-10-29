'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { Loading } from '@/components/shared/ui/Loading';
import {
  captainReadyListHref,
  DEFAULT_CAPTAIN_READY_LIST_SEGMENT,
} from '@/lib/helpers/captainReadyListRoutes';

/** Sends `/ready-list` to `/ready-list/ready-to-serve` (keeps branch / role prefix). */
export function CaptainReadyListIndexRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    router.replace(captainReadyListHref(pathname, DEFAULT_CAPTAIN_READY_LIST_SEGMENT));
  }, [pathname, router]);

  return <Loading message="Opening ready list…" fullPage={false} />;
}
