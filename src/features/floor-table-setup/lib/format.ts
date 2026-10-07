import { floorTableSetupCopy, floorTypeSelectLabels } from '@/features/floor-table-setup/config';
import type {
  FloorTableStatus,
  FloorType,
  SetupStatus,
} from '@/features/floor-table-setup/types/floor-table-setup';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;

/** Maps wizard table operational status to setup status labels for card UI. */
export function floorTableStatusToSetup(status: FloorTableStatus): SetupStatus {
  if (status === 'available') return 'active';
  if (status === 'occupied') return 'inactive';
  return 'maintenance';
}

export function formatFloorStats(tableCount: number, seatCount: number) {
  return `${tableCount} ${floorTableSetupCopy.tablesSuffix}${floorTableSetupCopy.statsSeparator}${seatCount} ${floorTableSetupCopy.seatsSuffix}`;
}

export function formatFloorTypeDisplay(type: FloorType | null | undefined): string {
  if (!type) return floorTableSetupCopy.floorTypeNotSet;
  return floorTypeSelectLabels[type];
}

export function formatCreatedOn(isoDate: string) {
  const dateOnly = isoDate.slice(0, 10);
  const [year, month, day] = dateOnly.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatRelativeUpdated(isoDate: string, now = Date.now()): string {
  const diffMs = Math.max(0, now - new Date(isoDate).getTime());

  if (diffMs < HOUR) {
    const minutes = Math.max(1, Math.round(diffMs / MINUTE));
    return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  }

  if (diffMs < DAY) {
    const hours = Math.max(1, Math.round(diffMs / HOUR));
    return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  }

  if (diffMs < WEEK) {
    const days = Math.max(1, Math.round(diffMs / DAY));
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  if (diffMs < MONTH) {
    const weeks = Math.max(1, Math.round(diffMs / WEEK));
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }

  const months = Math.max(1, Math.round(diffMs / MONTH));
  return `${months} month${months === 1 ? '' : 's'} ago`;
}

export function formatUpdatedLabel(isoDate: string, now = Date.now()) {
  return `${floorTableSetupCopy.updatedPrefix} ${formatRelativeUpdated(isoDate, now)}`;
}

export function formatHistoryWhen(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
