import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/context/auth', () => ({
  useAuth: () => ({
    user: {
      first_name: 'Asha',
      last_name: 'Kumar',
      roles: ['Counter 1'],
    },
  }),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/pos-dashboard',
}));

vi.mock('@/features/pos/hooks/use-pos-breakpoint', () => ({
  usePosBreakpoint: () => 'mobile',
}));

import { PosDashboardPage } from '@/features/pos/screens/dashboard/pos-dashboard-page';

describe('PosDashboardPage compact layout', () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = '';
  });

  it('opens the dashboard POS menu from the mobile header hamburger', () => {
    render(<PosDashboardPage />);

    expect(screen.getByRole('heading', { name: 'POS Dashboard' })).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'POS dashboard navigation' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Staff' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Open navigation/i }));

    expect(screen.getByLabelText('POS operations navigation')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'All Orders' })).toBeInTheDocument();
  });
});
