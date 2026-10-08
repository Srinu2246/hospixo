import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CloseBusinessDayPage } from '@/features/pos/day-close/close-business-day/close-business-day-page';
import { closeBusinessDayPageMeta } from '@/features/pos/day-close/config/close-business-day';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/day-close',
}));

describe('CloseBusinessDayPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the close business day sections', () => {
    render(<CloseBusinessDayPage />);

    expect(
      screen.getByRole('heading', { name: closeBusinessDayPageMeta.title, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Pre-Close Checklist' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: closeBusinessDayPageMeta.initiateLabel }),
    ).toBeInTheDocument();
  });
});
