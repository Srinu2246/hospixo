import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CashShift } from '@/features/pos/cash-shift/components/cash-shift';
import { cashShiftCopy } from '@/features/pos/cash-shift/config';
import {
  cashShiftPreviewActive,
  cashShiftPreviewClose,
  cashShiftPreviewDate,
  cashShiftPreviewMetrics,
  cashShiftPreviewStart,
  cashShiftPreviewTransactions,
} from '@/features/pos/cash-shift/config/fixture';
import * as cashShiftLib from '@/features/pos/cash-shift/lib';

vi.mock('@/features/pos/cash-shift/lib', async (importOriginal) => {
  const actual = await importOriginal<typeof cashShiftLib>();
  return {
    ...actual,
    submitCloseShift: vi.fn(),
  };
});

const submitCloseShiftMock = vi.mocked(cashShiftLib.submitCloseShift);

const defaultProps = {
  metrics: cashShiftPreviewMetrics,
  activeShift: cashShiftPreviewActive,
  transactions: cashShiftPreviewTransactions,
  dateFilter: cashShiftPreviewDate,
  closePreview: cashShiftPreviewClose,
  startDraft: cashShiftPreviewStart,
};

function getDialog() {
  return screen.getByRole('dialog');
}

async function confirmCloseShift(options?: { actualCash?: string; printFirst?: boolean }) {
  fireEvent.change(screen.getByLabelText(cashShiftCopy.close.reconciliation.managerPin), {
    target: { value: '5678' },
  });

  if (options?.actualCash) {
    fireEvent.change(screen.getByLabelText(cashShiftCopy.close.reconciliation.actualCashCount), {
      target: { value: options.actualCash },
    });
    fireEvent.blur(screen.getByLabelText(cashShiftCopy.close.reconciliation.actualCashCount));
  }

  if (options?.printFirst) {
    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.close.actions.print }));
  }

  fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.close.actions.confirm }));

  await waitFor(() => {
    expect(submitCloseShiftMock).toHaveBeenCalled();
  });

  // Flush post-submit React state: successful closes leave the closing form.
  await waitFor(() => {
    const stillClosing = screen.queryByRole('heading', { name: cashShiftCopy.close.title });
    const closedHeading = screen.queryByRole('heading', {
      name: /Closed Successfully/i,
    });
    const errorDialog = screen.queryByRole('dialog');
    expect(closedHeading ?? errorDialog ?? !stillClosing).toBeTruthy();
  });
}

async function openCloseShiftFlow() {
  fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.actions.closeShift }));
  fireEvent.click(within(getDialog()).getByRole('button', { name: cashShiftCopy.dialogs.confirm }));
}

describe('CashShift', () => {
  afterEach(() => {
    cleanup();
    submitCloseShiftMock.mockReset();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.stubGlobal('print', vi.fn());
  });

  it('renders header, metrics, active shift, history, and footer', () => {
    render(<CashShift {...defaultProps} />);

    expect(screen.getByRole('heading', { name: cashShiftCopy.title })).toBeInTheDocument();
    expect(screen.getByText(cashShiftCopy.subtitle)).toBeInTheDocument();
    expect(screen.getByText(cashShiftCopy.metrics.active)).toBeInTheDocument();
    expect(screen.getByText('Shift #1042')).toBeInTheDocument();
    expect(screen.getByText(cashShiftCopy.history.title)).toBeInTheDocument();
    expect(screen.getByText('Refund for Order #8429 - Overcooked meal')).toBeInTheDocument();
    expect(screen.getByText(cashShiftCopy.footer.syncNote)).toBeInTheDocument();
  });

  it('appends a cash-in row when a valid amount is entered', async () => {
    render(<CashShift {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.actions.cashIn }));

    const dialog = getDialog();
    fireEvent.change(within(dialog).getByPlaceholderText(cashShiftCopy.dialogs.amountPlaceholder), {
      target: { value: '50' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: cashShiftCopy.dialogs.cashInSubmit }),
    );

    expect(screen.getByText(cashShiftCopy.prompts.cashInDescription)).toBeInTheDocument();
    expect(screen.getByText('+₹50.00')).toBeInTheDocument();
    expect(screen.getAllByText('₹1,295.50').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('48')).toBeInTheDocument();
  });

  it('appends a cash-out row when a valid amount is entered', () => {
    render(<CashShift {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.actions.cashOut }));

    const dialog = getDialog();
    fireEvent.change(within(dialog).getByPlaceholderText(cashShiftCopy.dialogs.amountPlaceholder), {
      target: { value: '25' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: cashShiftCopy.dialogs.cashOutSubmit }),
    );
    expect(screen.getByText('-₹25.00')).toBeInTheDocument();
  });

  it('ignores cash movement when the amount dialog is cancelled', () => {
    render(<CashShift {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.actions.cashIn }));

    fireEvent.click(
      within(getDialog()).getByRole('button', { name: cashShiftCopy.dialogs.cancel }),
    );

    expect(screen.queryByText(cashShiftCopy.prompts.cashInDescription)).not.toBeInTheDocument();
  });

  it('shows an inline error when the entered amount is invalid', () => {
    render(<CashShift {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.actions.cashIn }));

    const dialog = getDialog();
    fireEvent.change(within(dialog).getByPlaceholderText(cashShiftCopy.dialogs.amountPlaceholder), {
      target: { value: '0' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: cashShiftCopy.dialogs.cashInSubmit }),
    );

    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      cashShiftCopy.prompts.invalidAmount,
    );
  });

  it('opens close-shift flow when close is confirmed', () => {
    render(<CashShift {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.actions.closeShift }));

    const confirmDialog = getDialog();
    expect(
      within(confirmDialog).getByText(cashShiftCopy.preview.closeShiftConfirm),
    ).toBeInTheDocument();
    fireEvent.click(
      within(confirmDialog).getByRole('button', { name: cashShiftCopy.dialogs.confirm }),
    );

    expect(screen.getByRole('heading', { name: cashShiftCopy.close.title })).toBeInTheDocument();
  });

  it('shows the shift-closed screen after a successful close', async () => {
    submitCloseShiftMock.mockResolvedValue(undefined);
    render(<CashShift {...defaultProps} />);
    await openCloseShiftFlow();

    fireEvent.change(screen.getByPlaceholderText(cashShiftCopy.close.notes.placeholder), {
      target: { value: 'Drawer balanced' },
    });
    await confirmCloseShift({ actualCash: '1300' });

    expect(submitCloseShiftMock).toHaveBeenCalledWith({
      shiftId: cashShiftPreviewActive.id,
      notes: 'Drawer balanced',
      actualCash: 1300,
      pin: '5678',
    });
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: cashShiftCopy.closed.title(cashShiftPreviewActive.number),
        }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        cashShiftCopy.closed.emailNote(cashShiftLib.maskEmail(cashShiftPreviewActive.managerEmail)),
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(cashShiftCopy.closed.reportPrinted)).not.toBeInTheDocument();
  });

  it('shows the printed banner only when print was used before closing', async () => {
    submitCloseShiftMock.mockResolvedValue(undefined);
    render(<CashShift {...defaultProps} />);
    await openCloseShiftFlow();
    await confirmCloseShift({ printFirst: true });

    await waitFor(() => {
      expect(screen.getByText(cashShiftCopy.closed.reportPrinted)).toBeInTheDocument();
    });
  });

  it('shows variance status when actual cash differs from expected', async () => {
    submitCloseShiftMock.mockResolvedValue(undefined);
    render(<CashShift {...defaultProps} />);
    await openCloseShiftFlow();
    await confirmCloseShift({ actualCash: '1000' });

    await waitFor(() => {
      expect(screen.getByText(cashShiftCopy.closed.variance)).toBeInTheDocument();
    });
  });

  it('returns to the main view when close shift is cancelled via back', async () => {
    render(<CashShift {...defaultProps} />);
    await openCloseShiftFlow();

    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.close.actions.back }));

    expect(screen.getByRole('heading', { name: cashShiftCopy.title })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: cashShiftCopy.close.title }),
    ).not.toBeInTheDocument();
  });

  it('opens the start-shift form on load when the shift is already closed', () => {
    render(
      <CashShift {...defaultProps} metrics={{ ...cashShiftPreviewMetrics, status: 'closed' }} />,
    );

    expect(screen.getByRole('heading', { name: cashShiftCopy.start.title })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: cashShiftCopy.start.cancel }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: cashShiftCopy.title })).not.toBeInTheDocument();
  });

  it('opens the start-shift form and starts a fresh shift after close', async () => {
    submitCloseShiftMock.mockResolvedValue(undefined);
    render(<CashShift {...defaultProps} />);
    await openCloseShiftFlow();
    await confirmCloseShift();

    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.closed.startNewShift }));

    expect(screen.getByRole('heading', { name: cashShiftCopy.start.title })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.start.confirm }));

    expect(screen.getByText('Shift #1043')).toBeInTheDocument();
    expect(screen.getByText(cashShiftCopy.metrics.active)).toBeInTheDocument();
  });

  it('returns to the closed screen when start-shift is cancelled', async () => {
    submitCloseShiftMock.mockResolvedValue(undefined);
    render(<CashShift {...defaultProps} />);
    await openCloseShiftFlow();
    await confirmCloseShift();

    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.closed.startNewShift }));
    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.start.cancel }));

    expect(
      screen.getByRole('heading', {
        name: cashShiftCopy.closed.title(cashShiftPreviewActive.number),
      }),
    ).toBeInTheDocument();
  });

  it('uses a safe next shift number when the closed shift number is not numeric', async () => {
    submitCloseShiftMock.mockResolvedValue(undefined);
    render(
      <CashShift
        {...defaultProps}
        activeShift={{ ...cashShiftPreviewActive, number: 'SH-1042' }}
        startDraft={{ ...cashShiftPreviewStart, nextShiftNumber: 'SH-1042-next' }}
      />,
    );
    await openCloseShiftFlow();
    await confirmCloseShift();

    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.closed.startNewShift }));

    expect(screen.getByDisplayValue('#SH-1042-next')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.start.confirm }));

    expect(screen.getByText('Shift #SH-1042-next')).toBeInTheDocument();
  });

  it('shows an error and keeps the close flow open when submit fails', async () => {
    submitCloseShiftMock.mockRejectedValue(new Error('Invalid PIN'));
    render(<CashShift {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.actions.closeShift }));
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    fireEvent.click(
      within(getDialog()).getByRole('button', { name: cashShiftCopy.dialogs.confirm }),
    );

    fireEvent.change(screen.getByLabelText(cashShiftCopy.close.reconciliation.managerPin), {
      target: { value: '5678' },
    });
    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.close.actions.confirm }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toHaveTextContent('Invalid PIN');
    });
    expect(screen.queryByText(cashShiftCopy.close.closedToast)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: cashShiftCopy.close.actions.confirm, hidden: true }),
    ).toBeInTheDocument();
  });

  it('ignores duplicate close submits while a close request is in flight', async () => {
    let resolveClose!: () => void;
    submitCloseShiftMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveClose = resolve;
        }),
    );

    render(<CashShift {...defaultProps} />);
    await openCloseShiftFlow();

    fireEvent.change(screen.getByLabelText(cashShiftCopy.close.reconciliation.managerPin), {
      target: { value: '5678' },
    });

    const confirm = screen.getByRole('button', { name: cashShiftCopy.close.actions.confirm });
    fireEvent.click(confirm);
    fireEvent.click(confirm);

    await waitFor(() => {
      expect(submitCloseShiftMock).toHaveBeenCalledOnce();
    });

    resolveClose();
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: cashShiftCopy.closed.title(cashShiftPreviewActive.number),
        }),
      ).toBeInTheDocument();
    });
  });

  it('reflects session cash movements on the close-shift reconciliation screen', () => {
    render(<CashShift {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.actions.cashIn }));

    const amountDialog = getDialog();
    fireEvent.change(
      within(amountDialog).getByPlaceholderText(cashShiftCopy.dialogs.amountPlaceholder),
      {
        target: { value: '50' },
      },
    );
    fireEvent.click(
      within(amountDialog).getByRole('button', { name: cashShiftCopy.dialogs.cashInSubmit }),
    );

    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.actions.closeShift }));
    fireEvent.click(
      within(getDialog()).getByRole('button', { name: cashShiftCopy.dialogs.confirm }),
    );

    const actualCashInput = screen.getByLabelText(
      cashShiftCopy.close.reconciliation.actualCashCount,
    );
    expect(actualCashInput).toHaveValue('₹1,295.50');
    expect(screen.getAllByText('₹1,795.50').length).toBeGreaterThanOrEqual(1);
  });

  it('skips close-shift flow when cancelled', () => {
    render(<CashShift {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.actions.closeShift }));

    fireEvent.click(
      within(getDialog()).getByRole('button', { name: cashShiftCopy.dialogs.cancel }),
    );

    expect(
      screen.queryByRole('heading', { name: cashShiftCopy.close.title }),
    ).not.toBeInTheDocument();
  });

  it('shows view-all preview from transaction history', () => {
    render(<CashShift {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.actions.viewAll }));

    expect(within(getDialog()).getByText(cashShiftCopy.preview.viewAll)).toBeInTheDocument();
  });
});
