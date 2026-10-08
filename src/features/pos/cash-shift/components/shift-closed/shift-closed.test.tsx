import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ShiftClosed } from '@/features/pos/cash-shift/components/shift-closed/shift-closed';
import { cashShiftCopy } from '@/features/pos/cash-shift/config';
import { routes } from '@/config/routes';
import type { ShiftClosedResult } from '@/features/pos/types/cash-shift';

vi.mock('next/navigation', () => ({
  usePathname: () => '/branch/cash-shift',
}));

const baseResult: ShiftClosedResult = {
  shiftNumber: '1042',
  openedBy: 'Ravi Kumar',
  startTimeLabel: '9:00 AM',
  endTimeLabel: '5:15 PM',
  closedAtLabel: 'October 24, 2024 at 05:15 PM',
  durationLabel: '8h 15m',
  totalSales: 3890,
  transactions: 47,
  cashDifference: 0,
  balanceStatus: 'balanced',
  reportPrinted: false,
  managerEmailMasked: 'm***@hotelmayukha.com',
};

describe('ShiftClosed', () => {
  afterEach(cleanup);

  it('renders balanced status and summary fields', () => {
    render(<ShiftClosed result={baseResult} onStartNewShift={vi.fn()} />);

    expect(
      screen.getByRole('heading', {
        name: cashShiftCopy.closed.title(baseResult.shiftNumber),
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(cashShiftCopy.closed.balanced)).toBeInTheDocument();
    expect(screen.getByText('Ravi Kumar')).toBeInTheDocument();
    expect(screen.getByText('₹3,890.00')).toBeInTheDocument();
    expect(screen.getByText('47')).toBeInTheDocument();
  });

  it('renders variance status when the drawer was not balanced', () => {
    render(
      <ShiftClosed
        result={{ ...baseResult, balanceStatus: 'variance', cashDifference: -12.5 }}
        onStartNewShift={vi.fn()}
      />,
    );

    expect(screen.getByText(cashShiftCopy.closed.variance)).toBeInTheDocument();
    expect(screen.getByText('-₹12.50')).toBeInTheDocument();
  });

  it('shows the printed banner only when reportPrinted is true', () => {
    const { rerender } = render(<ShiftClosed result={baseResult} onStartNewShift={vi.fn()} />);

    expect(screen.queryByText(cashShiftCopy.closed.reportPrinted)).not.toBeInTheDocument();

    rerender(
      <ShiftClosed result={{ ...baseResult, reportPrinted: true }} onStartNewShift={vi.fn()} />,
    );

    expect(screen.getByText(cashShiftCopy.closed.reportPrinted)).toBeInTheDocument();
  });

  it('links to pos dashboard and calls onStartNewShift', () => {
    const onStartNewShift = vi.fn();
    render(<ShiftClosed result={baseResult} onStartNewShift={onStartNewShift} />);

    expect(
      screen.queryByRole('link', { name: cashShiftCopy.closed.continueDayClose }),
    ).not.toBeInTheDocument();

    expect(screen.getByRole('link', { name: cashShiftCopy.closed.goCashCounter })).toHaveAttribute(
      'href',
      routes.platform.pos.dashboard,
    );

    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.closed.startNewShift }));
    expect(onStartNewShift).toHaveBeenCalledTimes(1);
  });

  it('shows the masked manager email note', () => {
    render(<ShiftClosed result={baseResult} onStartNewShift={vi.fn()} />);

    expect(
      screen.getByText(cashShiftCopy.closed.emailNote(baseResult.managerEmailMasked)),
    ).toBeInTheDocument();
  });
});
