import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { TopSellingItemsTable } from '@/features/pos/day-close/daily-sales-summary/top-selling-items-table';
import {
  dailySalesTopItems,
  dailySalesTopItemsMeta,
  formatDailySalesRevenue,
} from '@/features/pos/day-close/config/daily-sales-summary';

describe('TopSellingItemsTable', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders top selling items from config', () => {
    render(<TopSellingItemsTable />);

    expect(screen.getByRole('heading', { name: dailySalesTopItemsMeta.title })).toBeInTheDocument();
    expect(screen.getByText(dailySalesTopItemsMeta.columns.item)).toBeInTheDocument();
    expect(screen.getByText(dailySalesTopItemsMeta.columns.qty)).toBeInTheDocument();
    expect(screen.getByText(dailySalesTopItemsMeta.columns.revenue)).toBeInTheDocument();

    for (const item of dailySalesTopItems) {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByText(String(item.qty))).toBeInTheDocument();
      expect(screen.getByText(formatDailySalesRevenue(item.revenue))).toBeInTheDocument();
    }
  });
});
