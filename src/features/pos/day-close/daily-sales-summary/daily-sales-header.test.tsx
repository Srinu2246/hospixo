import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { DailySalesHeader } from '@/features/pos/day-close/daily-sales-summary/daily-sales-header';
import { dailySalesSummaryPageMeta } from '@/features/pos/day-close/config/daily-sales-summary';

describe('DailySalesHeader', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders title and subtitle from config', () => {
    render(<DailySalesHeader />);

    expect(
      screen.getByRole('heading', { name: dailySalesSummaryPageMeta.title, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(dailySalesSummaryPageMeta.subtitle)).toBeInTheDocument();
  });
});
