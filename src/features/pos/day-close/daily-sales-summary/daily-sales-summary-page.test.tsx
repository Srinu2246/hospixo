import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DailySalesSummaryPage } from '@/features/pos/day-close/daily-sales-summary/daily-sales-summary-page';
import { dailySalesSummaryPageMeta } from '@/features/pos/day-close/config/daily-sales-summary';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('DailySalesSummaryPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the daily sales summary sections', () => {
    render(<DailySalesSummaryPage />);

    expect(
      screen.getByRole('heading', { name: dailySalesSummaryPageMeta.title, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hourly Sales Trend' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: dailySalesSummaryPageMeta.confirmLabel }),
    ).toBeInTheDocument();
  });
});
