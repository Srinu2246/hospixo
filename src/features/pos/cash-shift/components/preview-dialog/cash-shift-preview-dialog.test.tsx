import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CashShiftPreviewDialog } from '@/features/pos/cash-shift/components/preview-dialog/cash-shift-preview-dialog';
import { cashShiftCopy } from '@/features/pos/cash-shift/config';

describe('CashShiftPreviewDialog', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <CashShiftPreviewDialog state={{ kind: 'closed' }} onClose={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows an info dialog and closes from the OK button', () => {
    const onClose = vi.fn();

    render(
      <CashShiftPreviewDialog
        state={{ kind: 'info', message: 'View all history is coming soon.' }}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('View all history is coming soon.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.dialogs.ok }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('runs confirm action from the confirm button', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <CashShiftPreviewDialog
        state={{
          kind: 'confirm',
          message: cashShiftCopy.preview.closeShiftConfirm,
          onConfirm,
        }}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.dialogs.confirm }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('closes on cancel (Escape)', () => {
    const onClose = vi.fn();

    render(
      <CashShiftPreviewDialog state={{ kind: 'info', message: 'Dismiss me' }} onClose={onClose} />,
    );

    const dialog = screen.getByRole('dialog');
    fireEvent(dialog, new Event('cancel', { bubbles: true, cancelable: true }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes from the dismiss icon when shown', () => {
    const onClose = vi.fn();

    render(
      <CashShiftPreviewDialog state={{ kind: 'info', message: 'Dismiss me' }} onClose={onClose} />,
    );

    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.dialogs.close }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('submits a valid cash-in amount on Enter', () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();

    render(
      <CashShiftPreviewDialog
        state={{
          kind: 'amount',
          title: cashShiftCopy.prompts.cashInAmount,
          variant: 'cash_in',
          onSubmit,
        }}
        onClose={onClose}
      />,
    );

    const input = screen.getByLabelText(cashShiftCopy.dialogs.amountLabel);
    fireEvent.change(input, { target: { value: '250' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSubmit).toHaveBeenCalledWith(250);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows an error for invalid amount input', () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();

    render(
      <CashShiftPreviewDialog
        state={{
          kind: 'amount',
          title: cashShiftCopy.prompts.cashOutAmount,
          variant: 'cash_out',
          onSubmit,
        }}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.dialogs.cashOutSubmit }));

    expect(screen.getByRole('alert')).toHaveTextContent(cashShiftCopy.prompts.invalidAmount);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
