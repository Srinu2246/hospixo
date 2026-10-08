import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CloseBusinessDayActions } from '@/features/pos/day-close/close-business-day/close-business-day-actions';
import { closeBusinessDayPageMeta } from '@/features/pos/day-close/config/close-business-day';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/day-close',
}));

describe('CloseBusinessDayActions', () => {
  afterEach(() => {
    cleanup();
    pushMock.mockReset();
  });

  it('navigates on cancel and initiate actions', () => {
    render(<CloseBusinessDayActions />);

    fireEvent.click(screen.getByRole('button', { name: closeBusinessDayPageMeta.cancelLabel }));
    expect(pushMock).toHaveBeenCalledWith('/cash-shift');

    fireEvent.click(screen.getByRole('button', { name: closeBusinessDayPageMeta.initiateLabel }));
    expect(pushMock).toHaveBeenCalledWith(closeBusinessDayPageMeta.initiateHref);
  });
});
