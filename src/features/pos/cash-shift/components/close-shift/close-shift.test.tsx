import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CloseShift } from '@/features/pos/cash-shift/components/close-shift';
import { cashShiftCopy } from '@/features/pos/cash-shift/config';
import { cashShiftPreviewClose } from '@/features/pos/cash-shift/config/fixture';

const onBack = vi.fn();
const onConfirm = vi.fn();

const defaultProps = {
  preview: cashShiftPreviewClose,
  shiftNumber: '1042',
  onBack,
  onConfirm,
};

describe('CloseShift', () => {
  afterEach(() => {
    cleanup();
    onBack.mockReset();
    onConfirm.mockReset();
  });

  it('renders summary, payments, notes, and reconciliation sections', () => {
    render(<CloseShift {...defaultProps} />);

    expect(screen.getByRole('heading', { name: cashShiftCopy.close.title })).toBeInTheDocument();
    expect(screen.getByText(cashShiftCopy.close.summary.title)).toBeInTheDocument();
    expect(screen.getByText('#1042')).toBeInTheDocument();
    expect(screen.getByText('Sodexo')).toBeInTheDocument();
    expect(screen.getByText('Cash')).toBeInTheDocument();
    expect(screen.getByText('Card')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(cashShiftCopy.close.notes.placeholder)).toBeInTheDocument();
    expect(screen.getByText(cashShiftCopy.close.reconciliation.title)).toBeInTheDocument();
  });

  it('calls onBack from the footer back button', () => {
    render(<CloseShift {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.close.actions.back }));

    expect(onBack).toHaveBeenCalledOnce();
  });

  it('keeps confirm disabled until the manager pin has at least four digits', () => {
    render(<CloseShift {...defaultProps} />);

    const confirm = screen.getByRole('button', { name: cashShiftCopy.close.actions.confirm });
    expect(confirm).toBeDisabled();

    fireEvent.change(screen.getByLabelText(cashShiftCopy.close.reconciliation.managerPin), {
      target: { value: '1234' },
    });

    expect(confirm).not.toBeDisabled();
  });

  it('calls onConfirm with notes, actual cash, and pin', () => {
    render(<CloseShift {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText(cashShiftCopy.close.notes.placeholder), {
      target: { value: 'Balanced drawer' },
    });
    fireEvent.change(screen.getByLabelText(cashShiftCopy.close.reconciliation.managerPin), {
      target: { value: '5678' },
    });
    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.close.actions.confirm }));

    expect(onConfirm).toHaveBeenCalledWith({
      notes: 'Balanced drawer',
      actualCash: 2245.5,
      pin: '5678',
    });
  });

  it('normalizes actual cash input on blur', () => {
    render(<CloseShift {...defaultProps} />);

    const input = screen.getByLabelText(cashShiftCopy.close.reconciliation.actualCashCount);
    fireEvent.change(input, { target: { value: '2000' } });
    fireEvent.blur(input);

    expect(input).toHaveValue('₹2,000.00');
  });

  it('calls onPrint from the print button when provided', () => {
    const onPrint = vi.fn();

    render(<CloseShift {...defaultProps} onPrint={onPrint} />);
    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.close.actions.print }));

    expect(onPrint).toHaveBeenCalledOnce();
  });

  it('disables the print button when onPrint is not provided', () => {
    render(<CloseShift {...defaultProps} />);

    expect(screen.getByRole('button', { name: cashShiftCopy.close.actions.print })).toBeDisabled();
  });

  it('does not throw when onConfirm rejects', async () => {
    onConfirm.mockRejectedValueOnce(new Error('Close failed'));

    render(<CloseShift {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(cashShiftCopy.close.reconciliation.managerPin), {
      target: { value: '1234' },
    });
    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.close.actions.confirm }));

    await vi.waitFor(() => {
      expect(onConfirm).toHaveBeenCalledOnce();
    });
  });
});
