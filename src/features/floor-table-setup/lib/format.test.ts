import { describe, expect, it } from 'vitest';

import {
  formatCreatedOn,
  formatFloorStats,
  formatHistoryWhen,
  formatRelativeUpdated,
  formatUpdatedLabel,
} from '@/features/floor-table-setup/lib/format';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

describe('floor-table-setup formatters', () => {
  it('formats table and seat stats', () => {
    expect(formatFloorStats(48, 192)).toBe('48 Tables · 192 Seats');
  });

  it('formats created-on dates', () => {
    expect(formatCreatedOn('2025-01-15')).toBe('15 Jan 2025');
  });

  it('formats relative update labels', () => {
    const now = Date.parse('2026-08-28T13:00:00.000Z');
    expect(formatRelativeUpdated('2026-08-28T11:00:00.000Z', now)).toBe('2 hrs ago');
    expect(formatRelativeUpdated(new Date(now - DAY).toISOString(), now)).toBe('1 day ago');
    expect(formatRelativeUpdated(new Date(now - 7 * DAY).toISOString(), now)).toBe('1 week ago');
    expect(formatUpdatedLabel(new Date(now - 2 * HOUR).toISOString(), now)).toBe(
      'Updated 2 hrs ago',
    );
  });

  it('formats history timestamps', () => {
    expect(formatHistoryWhen('not-a-date')).toBe('not-a-date');
    expect(formatHistoryWhen('2026-01-15T09:30:00.000Z')).toMatch(/15 Jan 2026/);
  });
});
