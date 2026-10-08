import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SalesMetricsRow } from '@/features/pos/day-close/daily-sales-summary/sales-metrics-row';
import { dailySalesMetrics } from '@/features/pos/day-close/config/daily-sales-summary';

describe('SalesMetricsRow', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders all configured sales metrics', () => {
    render(<SalesMetricsRow />);

    for (const metric of dailySalesMetrics) {
      expect(screen.getByText(metric.label)).toBeInTheDocument();
      expect(screen.getByText(metric.value)).toBeInTheDocument();
    }
  });
});
