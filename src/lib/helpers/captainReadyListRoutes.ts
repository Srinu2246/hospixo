import type { ReadyOrderQueue } from '@/lib/schemas/pos/point-of-sale/ready-list/readyListSchema';

export const CAPTAIN_READY_LIST_SEGMENTS = ['ready-to-serve', 'preparing', 'served'] as const;

export type CaptainReadyListSegment = (typeof CAPTAIN_READY_LIST_SEGMENTS)[number];

export const DEFAULT_CAPTAIN_READY_LIST_SEGMENT: CaptainReadyListSegment = 'ready-to-serve';

const SEGMENT_TO_QUEUE: Record<CaptainReadyListSegment, ReadyOrderQueue> = {
  'ready-to-serve': 'active',
  preparing: 'pending',
  served: 'history',
};

const QUEUE_TO_SEGMENT: Record<ReadyOrderQueue, CaptainReadyListSegment> = {
  active: 'ready-to-serve',
  pending: 'preparing',
  history: 'served',
};

export function isCaptainReadyListSegment(value: string): value is CaptainReadyListSegment {
  return (CAPTAIN_READY_LIST_SEGMENTS as readonly string[]).includes(value);
}

export function readyListQueueFromSegment(segment: string): ReadyOrderQueue | undefined {
  if (!isCaptainReadyListSegment(segment)) return undefined;
  return SEGMENT_TO_QUEUE[segment];
}

export function readyListSegmentFromQueue(queue: ReadyOrderQueue): CaptainReadyListSegment {
  return QUEUE_TO_SEGMENT[queue];
}

/** `/…/ready-list/{segment}` using the same prefix as the current pathname. */
export function captainReadyListHref(
  pathname: string,
  segment: CaptainReadyListSegment = DEFAULT_CAPTAIN_READY_LIST_SEGMENT,
): string {
  const normalized = pathname.replace(/\/+$/, '');
  const marker = '/ready-list';
  const index = normalized.indexOf(marker);
  const base = index >= 0 ? normalized.slice(0, index + marker.length) : `${normalized}${marker}`;
  return `${base}/${segment}`;
}
