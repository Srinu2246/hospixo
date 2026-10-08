import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PosDashboardPage } from '@/features/pos/screens/dashboard/pos-dashboard-page';
import { dashboardSummaryCards } from '@/features/pos/config/dashboard';

vi.mock('next/navigation', () => ({
  usePathname: () => '/pos-dashboard',
}));

vi.mock('@/context/auth', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test User', email: 'test@example.com' },
    isLoading: false,
  }),
}));

describe('PosDashboardPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the POS dashboard shell and summary cards', () => {
    render(<PosDashboardPage />);

    expect(screen.getByLabelText('POS operations navigation')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tables' })).toHaveAttribute('href', '/tables');
    expect(screen.getAllByText(dashboardSummaryCards[0]?.label ?? '').length).toBeGreaterThan(0);
  });
});
