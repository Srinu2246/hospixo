import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { CurrentDayInfoCard } from '@/features/pos/day-close/close-business-day/current-day-info-card';
import {
  closeBusinessDayCardTitles,
  closeBusinessDayCurrentDay,
  closeBusinessDayStatLabels,
} from '@/features/pos/day-close/config/close-business-day';

describe('CurrentDayInfoCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders current day stats from config', () => {
    render(<CurrentDayInfoCard />);

    expect(
      screen.getByRole('heading', { name: closeBusinessDayCardTitles.currentDay }),
    ).toBeInTheDocument();
    expect(screen.getByText(closeBusinessDayStatLabels.businessDate)).toBeInTheDocument();
    expect(screen.getByText(closeBusinessDayCurrentDay.businessDate)).toBeInTheDocument();
    expect(screen.getByText(closeBusinessDayCurrentDay.totalShifts)).toBeInTheDocument();
    expect(screen.getByText(closeBusinessDayCurrentDay.totalHours)).toBeInTheDocument();
  });
});
