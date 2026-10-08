'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { resolvePosFlowPaths, type PosFlowPaths } from '@/features/pos/lib/pos-flow-paths';

/** Active-flow POS URLs derived from the current pathname. */
export function usePosFlowPaths(): PosFlowPaths {
  const pathname = usePathname() ?? '';
  return useMemo(() => resolvePosFlowPaths(pathname), [pathname]);
}
