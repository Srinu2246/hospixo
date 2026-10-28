'use client';

import { useEffect, useRef, useState } from 'react';

import { resolveBranchId } from '@/lib/helpers/resolveBranchId';
import {
  subscribeBranchOrderEvents,
  type BranchOrderEventsListener,
  type BranchOrderEventsStreamStatus,
} from '@/lib/hooks/pos/point-of-sale/order-events/branchOrderEventsConnection';
import { useSidebarStore } from '@/stores/sidebarStore';

export interface UseBranchOrderEventsStreamOptions {
  branchId: number | string | undefined;
  companyId?: number;
  enabled?: boolean;
  onStreamReady?: () => void;
  onStreamResync?: () => void;
  onKitchenEventBatch?: () => void;
  onReadyListEvent?: () => void;
  onKitchenAlert?: () => void;
}

function resolveCompanyId(prop?: number): number | undefined {
  if (prop != null && prop > 0) return prop;
  const { context, account } = useSidebarStore.getState();
  const raw = context.companyId ?? account?.company_id;
  if (raw == null) return undefined;
  const id = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(id) && id > 0 ? id : undefined;
}

/** Shared POS order-events stream (SSE relay → upstream WebSocket). */
export function useBranchOrderEventsStream({
  branchId,
  companyId: propCompanyId,
  enabled = true,
  onStreamReady,
  onStreamResync,
  onKitchenEventBatch,
  onReadyListEvent,
  onKitchenAlert,
}: UseBranchOrderEventsStreamOptions) {
  const [status, setStatus] = useState<BranchOrderEventsStreamStatus>('idle');
  const [isLive, setIsLive] = useState(false);

  const callbacksRef = useRef<BranchOrderEventsListener>({});

  useEffect(() => {
    callbacksRef.current = {
      onStreamReady,
      onStreamResync,
      onKitchenEventBatch,
      onReadyListEvent,
      onKitchenAlert,
    };
  }, [onStreamReady, onStreamResync, onKitchenEventBatch, onReadyListEvent, onKitchenAlert]);

  useEffect(() => {
    const resolvedBranchId = resolveBranchId(branchId);
    if (!enabled || resolvedBranchId == null) {
      setStatus('idle');
      setIsLive(false);
      return;
    }

    const companyId = resolveCompanyId(propCompanyId);

    const listener: BranchOrderEventsListener = {
      onStreamReady: () => callbacksRef.current.onStreamReady?.(),
      onStreamResync: () => callbacksRef.current.onStreamResync?.(),
      onKitchenEventBatch: () => callbacksRef.current.onKitchenEventBatch?.(),
      onReadyListEvent: () => callbacksRef.current.onReadyListEvent?.(),
      onKitchenAlert: () => callbacksRef.current.onKitchenAlert?.(),
    };

    const unsubscribe = subscribeBranchOrderEvents({
      branchId: resolvedBranchId,
      companyId,
      listener,
      onStatus: (nextStatus, live) => {
        setStatus(nextStatus);
        setIsLive(live);
      },
    });

    return unsubscribe;
  }, [branchId, enabled, propCompanyId]);

  const isConnected = status === 'connected' && isLive;

  return { status, isConnected, isLive };
}
