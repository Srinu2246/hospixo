import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SuccessPage } from '@/features/pos/day-close/success/success-page';
import { successPageMeta } from '@/features/pos/day-close/config/success';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('SuccessPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the success hero and actions', () => {
    render(<SuccessPage />);

    expect(
      screen.getByRole('heading', { name: successPageMeta.title, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(successPageMeta.subtitle)).toBeInTheDocument();
    expect(screen.getByText(successPageMeta.footerNote)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: successPageMeta.dashboardLabel }),
    ).toBeInTheDocument();
  });
});
