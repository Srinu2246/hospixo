import type { DineInOrderLine } from '@/features/pos/config/dine-in';

export function mergeOrderLines(
  existing: readonly DineInOrderLine[],
  incoming: readonly DineInOrderLine[],
): DineInOrderLine[] {
  return [...existing, ...incoming.map((line) => ({ ...line, id: `${line.id}-${Date.now()}` }))];
}

export function computeLinesAmount(lines: readonly DineInOrderLine[]) {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

export function countLineItems(lines: readonly DineInOrderLine[]) {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function resolveLinesAmount(
  lines: readonly DineInOrderLine[] | undefined,
  fallback: number,
) {
  if (!lines?.length) return fallback;
  return computeLinesAmount(lines);
}
