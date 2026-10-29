'use client';

import {
  POS_ORDER_STREAM_FATAL_CLOSE_CODES,
  parsePosOrderStreamMessageTyped,
  shouldPlayKitchenAlertForStreamEvent,
  type PosOrderStreamEvent,
  type PosOrderStreamReady,
} from '@/lib/schemas/pos/point-of-sale/orderEvents/posOrderEventSchema';

export type BranchOrderEventsStreamStatus =
  'idle' | 'connecting' | 'connected' | 'reconnecting' | 'unavailable' | 'denied' | 'error';

export type BranchOrderEventsListener = {
  onStreamReady?: () => void;
  onStreamResync?: () => void;
  onKitchenEventBatch?: () => void;
  onReadyListEvent?: () => void;
  onKitchenAlert?: () => void;
};

type ConnectionRecord = {
  branchId: number;
  companyId?: number;
  refCount: number;
  status: BranchOrderEventsStreamStatus;
  isLive: boolean;
  eventSource: EventSource | null;
  reconnectAttempt: number;
  reconnectTimer: number | null;
  heartbeatSeconds: number;
  lastMessageAt: number;
  heartbeatWatchTimer: number | null;
  seenEventIds: Set<string>;
  orderVersions: Map<number, number>;
  pendingKitchenBatch: number | null;
  listeners: Set<BranchOrderEventsListener>;
  statusSubscribers: Set<(status: BranchOrderEventsStreamStatus, isLive: boolean) => void>;
};

const MAX_RECONNECT_DELAY_MS = 30_000;
const MAX_STREAM_ATTEMPTS = 8;
const KITCHEN_BATCH_MS = 300;
const MAX_SEEN_EVENT_IDS = 2_000;

const connections = new Map<string, ConnectionRecord>();
/** Versions learned from kitchen-status, kept even when the order stream is down. */
const detachedOrderVersions = new Map<string, number>();

function detachedVersionKey(branchId: number, orderId: number): string {
  return `${branchId}:${orderId}`;
}

function connectionKey(branchId: number, companyId?: number): string {
  return companyId != null && companyId > 0 ? `${branchId}:${companyId}` : String(branchId);
}

function notifyStatus(record: ConnectionRecord): void {
  for (const sub of record.statusSubscribers) {
    sub(record.status, record.isLive);
  }
}

function trimSeenEvents(record: ConnectionRecord): void {
  if (record.seenEventIds.size <= MAX_SEEN_EVENT_IDS) return;
  const drop = record.seenEventIds.size - MAX_SEEN_EVENT_IDS;
  let i = 0;
  for (const id of record.seenEventIds) {
    record.seenEventIds.delete(id);
    i += 1;
    if (i >= drop) break;
  }
}

function shouldApplyEvent(record: ConnectionRecord, event: PosOrderStreamEvent): boolean {
  if (record.seenEventIds.has(event.event_id)) return false;
  record.seenEventIds.add(event.event_id);
  trimSeenEvents(record);

  const orderId = typeof event.order_id === 'number' ? event.order_id : Number(event.order_id);
  if (!Number.isFinite(orderId)) return true;

  if (event.version != null) {
    const known = Math.max(
      record.orderVersions.get(orderId) ?? 0,
      detachedOrderVersions.get(detachedVersionKey(record.branchId, orderId)) ?? 0,
    );
    if (known > 0 && event.version <= known) return false;
    record.orderVersions.set(orderId, event.version);
    rememberBranchOrderVersion(record.branchId, orderId, event.version);
  }

  return true;
}

function dispatchStreamReady(record: ConnectionRecord): void {
  for (const listener of record.listeners) {
    listener.onStreamReady?.();
  }
}

function dispatchStreamResync(record: ConnectionRecord): void {
  for (const listener of record.listeners) {
    listener.onStreamResync?.();
  }
}

function scheduleKitchenBatch(record: ConnectionRecord): void {
  if (record.pendingKitchenBatch != null) return;
  record.pendingKitchenBatch = window.setTimeout(() => {
    record.pendingKitchenBatch = null;
    for (const listener of record.listeners) {
      listener.onKitchenEventBatch?.();
    }
  }, KITCHEN_BATCH_MS);
}

function handleStreamPayload(record: ConnectionRecord, raw: string): void {
  record.lastMessageAt = Date.now();
  const message = parsePosOrderStreamMessageTyped(raw);
  if (!message) return;

  if (message.type === 'ready') {
    applyReady(record, message);
    return;
  }

  if (message.type === 'resync') {
    dispatchStreamResync(record);
    return;
  }

  if (message.type === 'ping' || message.type === 'pong') {
    return;
  }

  if (message.type === 'token_refreshed') {
    return;
  }

  if (message.type === 'error') {
    console.warn('POS order stream error:', message.message ?? message);
    return;
  }

  if (message.type !== 'event') return;

  if (!shouldApplyEvent(record, message)) return;

  if (shouldPlayKitchenAlertForStreamEvent(message)) {
    for (const listener of record.listeners) {
      listener.onKitchenAlert?.();
    }
  }

  scheduleKitchenBatch(record);

  if (
    message.event === 'order.kitchen_status_changed' ||
    message.event === 'order.submitted' ||
    message.event === 'order.cancelled' ||
    message.event === 'order.paid' ||
    message.event === 'order.items_changed'
  ) {
    for (const listener of record.listeners) {
      listener.onReadyListEvent?.();
    }
  }
}

function applyReady(record: ConnectionRecord, ready: PosOrderStreamReady): void {
  record.heartbeatSeconds = ready.heartbeat_seconds ?? 25;
  record.isLive = ready.live !== false;
  record.status = 'connected';
  record.reconnectAttempt = 0;
  notifyStatus(record);
  resetHeartbeatWatch(record);
  dispatchStreamReady(record);
}

function resetHeartbeatWatch(record: ConnectionRecord): void {
  if (record.heartbeatWatchTimer != null) {
    window.clearInterval(record.heartbeatWatchTimer);
  }
  const intervalMs = Math.max(5_000, record.heartbeatSeconds * 1000);
  record.heartbeatWatchTimer = window.setInterval(() => {
    const silentFor = Date.now() - record.lastMessageAt;
    if (silentFor > record.heartbeatSeconds * 2 * 1000) {
      record.eventSource?.close();
      record.eventSource = null;
      record.status = 'reconnecting';
      notifyStatus(record);
      scheduleReconnect(record);
    }
  }, intervalMs);
}

function clearReconnectTimer(record: ConnectionRecord): void {
  if (record.reconnectTimer != null) {
    window.clearTimeout(record.reconnectTimer);
    record.reconnectTimer = null;
  }
}

function closeStream(record: ConnectionRecord): void {
  clearReconnectTimer(record);
  if (record.heartbeatWatchTimer != null) {
    window.clearInterval(record.heartbeatWatchTimer);
    record.heartbeatWatchTimer = null;
  }
  if (record.pendingKitchenBatch != null) {
    window.clearTimeout(record.pendingKitchenBatch);
    record.pendingKitchenBatch = null;
  }
  record.eventSource?.close();
  record.eventSource = null;
}

function scheduleReconnect(record: ConnectionRecord, fatalCode?: number): void {
  if (fatalCode != null && POS_ORDER_STREAM_FATAL_CLOSE_CODES.has(fatalCode)) {
    record.status = fatalCode === 4403 ? 'denied' : 'unavailable';
    notifyStatus(record);
    return;
  }

  record.reconnectAttempt += 1;
  if (record.reconnectAttempt >= MAX_STREAM_ATTEMPTS) {
    record.status = 'unavailable';
    record.isLive = false;
    notifyStatus(record);
    return;
  }

  clearReconnectTimer(record);
  const jitter = Math.floor(Math.random() * 400);
  const delay =
    Math.min(1000 * 2 ** (record.reconnectAttempt - 1), MAX_RECONNECT_DELAY_MS) + jitter;
  record.status = 'reconnecting';
  notifyStatus(record);
  record.reconnectTimer = window.setTimeout(() => {
    connectStream(record);
  }, delay);
}

function connectStream(record: ConnectionRecord): void {
  closeStream(record);
  record.status = record.reconnectAttempt === 0 ? 'connecting' : 'reconnecting';
  record.isLive = false;
  notifyStatus(record);

  const params = new URLSearchParams({ branchId: String(record.branchId) });
  if (record.companyId != null && record.companyId > 0) {
    params.set('companyId', String(record.companyId));
  }

  const es = new EventSource(`/api/realtime/branch-order-events/stream?${params.toString()}`);
  record.eventSource = es;
  record.lastMessageAt = Date.now();

  es.onmessage = (event) => {
    let raw = String(event.data ?? '');
    try {
      raw = JSON.parse(raw) as string;
    } catch {
      /* plain */
    }
    handleStreamPayload(record, raw);
  };

  es.addEventListener('upstream_close', (event) => {
    let code: number | undefined;
    try {
      const data = JSON.parse(String((event as MessageEvent).data ?? '{}')) as { code?: number };
      code = data.code;
    } catch {
      code = undefined;
    }
    es.close();
    record.eventSource = null;
    scheduleReconnect(record, code);
  });

  es.onerror = () => {
    if (es.readyState === EventSource.CLOSED) {
      record.eventSource = null;
      if (record.status !== 'denied' && record.status !== 'unavailable') {
        scheduleReconnect(record);
      }
    }
  };
}

function acquireConnection(branchId: number, companyId?: number): ConnectionRecord {
  const key = connectionKey(branchId, companyId);
  let record = connections.get(key);
  if (!record) {
    record = {
      branchId,
      companyId,
      refCount: 0,
      status: 'idle',
      isLive: false,
      eventSource: null,
      reconnectAttempt: 0,
      reconnectTimer: null,
      heartbeatSeconds: 25,
      lastMessageAt: Date.now(),
      heartbeatWatchTimer: null,
      seenEventIds: new Set(),
      orderVersions: new Map(),
      pendingKitchenBatch: null,
      listeners: new Set(),
      statusSubscribers: new Set(),
    };
    connections.set(key, record);
  }
  record.refCount += 1;
  if (record.refCount === 1) {
    record.reconnectAttempt = 0;
    connectStream(record);
  }
  return record;
}

function releaseConnection(branchId: number, companyId?: number): void {
  const key = connectionKey(branchId, companyId);
  const record = connections.get(key);
  if (!record) return;
  record.refCount = Math.max(0, record.refCount - 1);
  if (record.refCount === 0) {
    closeStream(record);
    record.status = 'idle';
    record.isLive = false;
    notifyStatus(record);
    connections.delete(key);
  }
}

/** Latest order `version` seen on the branch order-events stream. */
export function readBranchOrderVersion(branchId: number, orderId: number): number | undefined {
  let latest = detachedOrderVersions.get(detachedVersionKey(branchId, orderId));
  for (const record of connections.values()) {
    if (record.branchId !== branchId) continue;
    const version = record.orderVersions.get(orderId);
    if (version == null) continue;
    latest = latest == null ? version : Math.max(latest, version);
  }
  return latest;
}

export function rememberBranchOrderVersion(
  branchId: number,
  orderId: number,
  version: number,
): void {
  if (!Number.isInteger(version) || version < 1) return;
  const key = detachedVersionKey(branchId, orderId);
  const detachedKnown = detachedOrderVersions.get(key) ?? 0;
  if (version > detachedKnown) detachedOrderVersions.set(key, version);
  for (const record of connections.values()) {
    if (record.branchId !== branchId) continue;
    const known = record.orderVersions.get(orderId) ?? 0;
    if (version > known) record.orderVersions.set(orderId, version);
  }
}

export function subscribeBranchOrderEvents(input: {
  branchId: number;
  companyId?: number;
  listener: BranchOrderEventsListener;
  onStatus: (status: BranchOrderEventsStreamStatus, isLive: boolean) => void;
}): () => void {
  const record = acquireConnection(input.branchId, input.companyId);
  record.listeners.add(input.listener);
  record.statusSubscribers.add(input.onStatus);
  input.onStatus(record.status, record.isLive);

  return () => {
    record.listeners.delete(input.listener);
    record.statusSubscribers.delete(input.onStatus);
    releaseConnection(input.branchId, input.companyId);
  };
}
