import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { DayClosingSummaryCard } from '@/features/pos/day-close/success/day-closing-summary-card';
import {
  dayClosingSummaryLabels,
  dayClosingSummaryMeta,
  dayClosingSummaryStats,
} from '@/features/pos/day-close/config/success';

describe('DayClosingSummaryCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders closing summary stats and archive note', () => {
    render(<DayClosingSummaryCard />);

    expect(screen.getByRole('heading', { name: dayClosingSummaryMeta.title })).toBeInTheDocument();
    expect(screen.getByText(dayClosingSummaryMeta.balancedLabel)).toBeInTheDocument();
    expect(screen.getByText(dayClosingSummaryLabels.closedBy)).toBeInTheDocument();
    expect(screen.getByText(dayClosingSummaryStats.closedBy)).toBeInTheDocument();
    expect(screen.getByText(dayClosingSummaryStats.totalRevenue)).toBeInTheDocument();
    expect(screen.getByText(dayClosingSummaryMeta.archiveNote)).toBeInTheDocument();
  });
});
