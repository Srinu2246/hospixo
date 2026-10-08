import { menusCopy } from '../config/copy';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;

export type FormatRelativeTimeOptions = Readonly<{
  prefix?: string;
  now?: number;
}>;

export function formatRelativeTime(isoDate: string, options?: FormatRelativeTimeOptions): string {
  const now = options?.now ?? Date.now();
  const diffMs = Math.max(0, now - new Date(isoDate).getTime());

  let relative = '';
  if (diffMs < HOUR) {
    const minutes = Math.max(1, Math.round(diffMs / MINUTE));
    relative = `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  } else if (diffMs < DAY) {
    const hours = Math.max(1, Math.round(diffMs / HOUR));
    relative = `${hours} hr${hours === 1 ? '' : 's'} ago`;
  } else if (diffMs < WEEK) {
    const days = Math.max(1, Math.round(diffMs / DAY));
    relative = `${days} day${days === 1 ? '' : 's'} ago`;
  } else if (diffMs < MONTH) {
    const weeks = Math.max(1, Math.round(diffMs / WEEK));
    relative = `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  } else {
    const months = Math.max(1, Math.round(diffMs / MONTH));
    relative = `${months} month${months === 1 ? '' : 's'} ago`;
  }

  return options?.prefix ? `${options.prefix} ${relative}` : relative;
}

export function formatUpdatedAt(iso: string, now?: number): string {
  return formatRelativeTime(iso, { prefix: menusCopy.updatedPrefix, now });
}

export function formatPrice(value: number): string {
  return `₹${value}`;
}

export function categoryChipLabel(name: string): string {
  if (name === 'Main Course') return 'Mains';
  return name;
}
