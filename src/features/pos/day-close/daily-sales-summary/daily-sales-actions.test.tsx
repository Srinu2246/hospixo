import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DailySalesActions } from '@/features/pos/day-close/daily-sales-summary/daily-sales-actions';
import { dailySalesSummaryPageMeta } from '@/features/pos/day-close/config/daily-sales-summary';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe('DailySalesActions', () => {
  afterEach(() => {
    cleanup();
    pushMock.mockReset();
  });

  it('navigates on back and confirm actions', () => {
    render(<DailySalesActions />);

    fireEvent.click(screen.getByRole('button', { name: dailySalesSummaryPageMeta.backLabel }));
    expect(pushMock).toHaveBeenCalledWith(dailySalesSummaryPageMeta.backHref);

    fireEvent.click(screen.getByRole('button', { name: dailySalesSummaryPageMeta.confirmLabel }));
    expect(pushMock).toHaveBeenCalledWith(dailySalesSummaryPageMeta.confirmHref);
  });
});
