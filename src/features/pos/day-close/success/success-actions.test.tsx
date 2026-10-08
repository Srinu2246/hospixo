import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SuccessActions } from '@/features/pos/day-close/success/success-actions';
import { successPageMeta } from '@/features/pos/day-close/config/success';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe('SuccessActions', () => {
  afterEach(() => {
    cleanup();
    pushMock.mockReset();
  });

  it('navigates to pos dashboard and start new day routes', () => {
    render(<SuccessActions />);

    fireEvent.click(screen.getByRole('button', { name: successPageMeta.dashboardLabel }));
    expect(pushMock).toHaveBeenCalledWith(successPageMeta.dashboardHref);

    fireEvent.click(screen.getByRole('button', { name: successPageMeta.startNewDayLabel }));
    expect(pushMock).toHaveBeenCalledWith(successPageMeta.startNewDayHref);
  });
});
