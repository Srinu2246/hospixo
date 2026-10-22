/** ISO date and currency helpers for branch reports queries. */

export function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

/** Initial range: last 7 calendar days through today (inclusive). */
export function createDefaultReportsDateRange(reference = new Date()): {
  dateFrom: Date;
  dateTo: Date;
} {
  const dateTo = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const dateFrom = new Date(dateTo);
  dateFrom.setDate(dateTo.getDate() - 6);
  return { dateFrom, dateTo };
}

export function deriveComparisonRange(
  dateFrom: Date,
  dateTo: Date,
): {
  compareFrom: Date;
  compareTo: Date;
} {
  const dayCount = Math.round((dateTo.getTime() - dateFrom.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  const compareTo = new Date(dateFrom);
  compareTo.setDate(compareTo.getDate() - 1);
  const compareFrom = new Date(compareTo);
  compareFrom.setDate(compareFrom.getDate() - (dayCount - 1));
  return { compareFrom, compareTo };
}

function parseAmount(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatInrAmount(value: string | number, compact = false): string {
  const amount = typeof value === 'number' ? value : parseAmount(value);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(amount);
}
