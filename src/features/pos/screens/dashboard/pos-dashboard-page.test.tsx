import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PosDashboardPage } from '@/features/pos/screens/dashboard/pos-dashboard-page';
import { dashboardSummaryCards, floorStatusLegend } from '@/features/pos/config/dashboard';

vi.mock('@/features/pos/hooks/use-pos-dashboard', () => ({
  usePosDashboard: () => ({
    summaryCards: dashboardSummaryCards,
    liveOrderQueue: [],
    floorTables: [],
    floorLegend: floorStatusLegend,
    onlineSummary: { totalSales: 0, orders: 0 },
    onlinePlatforms: [],
    readyOrders: [],
    recentTransactions: [],
    notifications: [],
    shift: { started: '09:00 AM', ordersHandled: 0, status: 'Shift Open' },
    isLoading: false,
    isError: false,
    loadError: null,
    isFetching: false,
    handleLiveOrderAction: vi.fn(),
  }),
}));

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
