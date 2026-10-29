import type { BranchOrderDetail } from '@/lib/schemas/pos/point-of-sale/all-orders/branchOrderDetailSchema';
import type {
  BranchOrdersListQuery,
  PosOrderListItem,
  PosOrderListLine,
} from '@/lib/schemas/pos/point-of-sale/all-orders/posOrdersSchema';
import type {
  ReadyOrderItem,
  ReadyOrderQueue,
} from '@/lib/schemas/pos/point-of-sale/ready-list/readyListSchema';

/** GET /v1/branches/{branch_id}/orders query for each captain ready-list tab. */
export function branchOrdersQueryForReadyQueue(queue: ReadyOrderQueue): BranchOrdersListQuery {
  if (queue === 'active') {
    return { kitchen_badge: 'ready' };
  }
  if (queue === 'pending') {
    return { kitchen_badge: 'preparing' };
  }
  return { kitchen_badge: 'all', status: 'completed' };
}

function formatTableLabel(tableName?: string | null, tableId?: number | null): string {
  if (tableName?.trim()) {
    const trimmed = tableName.trim();
    return /^table\b/i.test(trimmed) ? trimmed : `Table ${trimmed}`;
  }
  if (tableId != null && tableId > 0) return `Table T-${tableId}`;
  return 'Table —';
}

function formatToken(orderNumber?: string | null): string {
  const raw = (orderNumber ?? '').trim();
  if (!raw) return 'Token —';
  const num = raw.startsWith('#') ? raw : `#${raw}`;
  return `Token ${num}`;
}

function relativeTimeLabel(timestamp?: string | null, prefix?: string): string {
  if (!timestamp) return prefix ? `${prefix} just now` : 'Just now';
  const diffMs = Math.max(0, Date.now() - new Date(timestamp).getTime());
  const diffSec = Math.floor(diffMs / 1000);
  const minutes = Math.floor(diffSec / 60);
  const seconds = diffSec % 60;
  let label: string;
  if (minutes === 0) label = seconds <= 20 ? 'Just now' : `${seconds} sec ago`;
  else if (minutes === 1) label = '1 min ago';
  else label = `${minutes} min ago`;
  return prefix ? `${prefix} ${label}` : label;
}

function formatClockTime(timestamp?: string | null): string | undefined {
  if (!timestamp) return undefined;
  const at = new Date(timestamp);
  if (Number.isNaN(at.getTime())) return undefined;
  return at.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function dishSummaryFromLines(names: readonly string[]): string {
  return names.slice(0, 3).join(', ') || 'Order items';
}

function mapListLines(lines: readonly PosOrderListLine[]): ReadyOrderItem['lines'] {
  return lines.map((line) => ({
    lineId: line.id != null ? String(line.id) : undefined,
    name: line.name,
    quantity: line.quantity,
  }));
}

function latestTimestamp(
  lines: readonly PosOrderListLine[],
  pick: (line: PosOrderListLine) => string | null | undefined,
): string | undefined {
  let latest: string | undefined;
  for (const line of lines) {
    const value = pick(line);
    if (!value) continue;
    if (!latest || Date.parse(value) > Date.parse(latest)) latest = value;
  }
  return latest;
}

function listPaymentStatus(item: PosOrderListItem): ReadyOrderItem['paymentStatus'] {
  if (item.payment_status === 'paid') return 'PAID';
  return 'PENDING';
}

function isReadyLineStatus(status?: string | null): boolean {
  return status === 'ready';
}

function isServedLineStatus(status?: string | null): boolean {
  return status === 'served' || status === 'completed';
}

function isPreparingLineStatus(status?: string | null): boolean {
  return (
    status === 'preparing' ||
    status === 'submitted' ||
    status === 'kot_sent' ||
    status === 'open' ||
    status === 'draft'
  );
}

/** GET order detail → ready-list card (drawer refresh or served tab with lines). */
export function branchOrderDetailToReadyOrder(
  order: BranchOrderDetail,
  queue: ReadyOrderQueue,
): ReadyOrderItem {
  const readyLines = order.items
    .filter((line) => isReadyLineStatus(line.item_status))
    .map((line) => ({ lineId: String(line.id), name: line.name, quantity: line.quantity }));

  const preparingLines = order.items
    .filter(
      (line) =>
        isPreparingLineStatus(line.item_status) ||
        (queue === 'pending' && line.item_status === 'ready'),
    )
    .map((line) => ({ lineId: String(line.id), name: line.name, quantity: line.quantity }));

  const servedLines = order.items
    .filter((line) => isServedLineStatus(line.item_status))
    .map((line) => ({ lineId: String(line.id), name: line.name, quantity: line.quantity }));

  const lines =
    queue === 'active' ? readyLines : queue === 'pending' ? preparingLines : servedLines;

  const servedCount = order.items.filter((line) => isServedLineStatus(line.item_status)).length;
  const totalCount = order.items.length;
  const paymentStatus =
    order.payment_status === 'paid'
      ? 'PAID'
      : order.payment_status === 'partial'
        ? 'PENDING'
        : 'PENDING';

  const timestamp =
    queue === 'history'
      ? order.opened_at
      : queue === 'active'
        ? (order.items.find((line) => line.ready_at)?.ready_at ?? order.opened_at)
        : (order.items.find((line) => line.preparing_at)?.preparing_at ?? order.opened_at);

  return {
    id: String(order.id),
    table: formatTableLabel(order.table_name, order.table_id),
    readyTimeAgo:
      queue === 'history'
        ? relativeTimeLabel(order.opened_at, 'Served')
        : relativeTimeLabel(timestamp),
    token: formatToken(order.order_number),
    priority: order.items.some((line) => line.tags?.includes('HIGH')) ? 'HIGH' : 'NORMAL',
    itemsCount: lines.length || totalCount,
    status: 'Ready',
    dishSummary: dishSummaryFromLines(lines.map((line) => line.name)),
    paymentStatus,
    queue,
    servedCount,
    totalCount,
    lines,
    servedClock: queue === 'history' ? formatClockTime(order.opened_at) : undefined,
    orderVersion: order.version != null && order.version >= 1 ? order.version : undefined,
  };
}

/** GET /v1/branches/{branch_id}/orders row → captain ready-list card. */
export function branchOrderListItemToReadyOrder(
  item: PosOrderListItem,
  queue: ReadyOrderQueue,
): ReadyOrderItem {
  const rawLines = item.listLines ?? [];
  const lines = mapListLines(rawLines);
  const lineCount = lines.length;
  const servedLineCount = rawLines.filter((line) => isServedLineStatus(line.kitchenStatus)).length;
  const totalCount = lineCount || 1;
  const isHigh = rawLines.some((line) => line.tags?.includes('HIGH'));

  const activityAt =
    queue === 'history'
      ? (item.closed_at ?? item.opened_at)
      : queue === 'active'
        ? (latestTimestamp(rawLines, (line) => line.readyAt) ?? item.opened_at)
        : (latestTimestamp(rawLines, (line) => line.preparingAt ?? line.submittedAt) ??
          item.opened_at);

  return {
    id: String(item.id),
    table: formatTableLabel(item.table_name, item.table_id),
    readyTimeAgo:
      queue === 'history' ? relativeTimeLabel(activityAt, 'Served') : relativeTimeLabel(activityAt),
    token: formatToken(item.order_number),
    priority: isHigh ? 'HIGH' : 'NORMAL',
    itemsCount: lineCount || totalCount,
    status: 'Ready',
    dishSummary:
      lineCount > 0
        ? dishSummaryFromLines(lines.map((line) => line.name))
        : `Order ${item.order_number}`,
    paymentStatus: listPaymentStatus(item),
    queue,
    servedCount: queue === 'active' ? servedLineCount : queue === 'history' ? totalCount : 0,
    totalCount,
    lines,
    servedClock: queue === 'history' ? formatClockTime(activityAt) : undefined,
    orderVersion: item.version != null && item.version >= 1 ? item.version : undefined,
  };
}
