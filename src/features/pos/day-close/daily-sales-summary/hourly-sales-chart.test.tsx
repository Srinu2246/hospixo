import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { HourlySalesChart } from '@/features/pos/day-close/daily-sales-summary/hourly-sales-chart';
import { dailySalesHourlyTrend } from '@/features/pos/day-close/config/daily-sales-summary';

describe('HourlySalesChart', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders hourly sales bars from config', () => {
    render(<HourlySalesChart />);

    expect(screen.getByRole('heading', { name: 'Hourly Sales Trend' })).toBeInTheDocument();

    for (const point of dailySalesHourlyTrend) {
      expect(screen.getByText(point.label)).toBeInTheDocument();
    }
  });
});
