import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { StartShift } from '@/features/pos/cash-shift/components/start-shift';
import { cashShiftCopy } from '@/features/pos/cash-shift/config';
import { cashShiftPreviewStart } from '@/features/pos/cash-shift/config/fixture';

const onCancel = vi.fn();
const onStart = vi.fn();

const defaultProps = {
  draft: cashShiftPreviewStart,
  onCancel,
  onStart,
};

describe('StartShift', () => {
  afterEach(() => {
    cleanup();
    onCancel.mockReset();
    onStart.mockReset();
  });

  it('renders the start-shift form with draft defaults', () => {
    render(<StartShift {...defaultProps} />);

    expect(screen.getByRole('heading', { name: cashShiftCopy.start.title })).toBeInTheDocument();
    expect(screen.getByDisplayValue('#1043')).toBeInTheDocument();
    expect(screen.getByLabelText(cashShiftCopy.start.operator)).toHaveValue('op-ravi');
    expect(screen.getByLabelText(cashShiftCopy.start.terminal)).toHaveValue('term-1');
    expect(screen.getByLabelText(cashShiftCopy.start.openingBalance)).toHaveValue('0.00');
    expect(screen.getByText(cashShiftCopy.start.auditNote)).toBeInTheDocument();
  });

  it('calls onCancel from the cancel button', () => {
    render(<StartShift {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.start.cancel }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('updates operator and terminal selections', () => {
    render(<StartShift {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(cashShiftCopy.start.operator), {
      target: { value: 'op-anita' },
    });
    fireEvent.change(screen.getByLabelText(cashShiftCopy.start.terminal), {
      target: { value: 'term-2' },
    });

    expect(screen.getByLabelText(cashShiftCopy.start.operator)).toHaveValue('op-anita');
    expect(screen.getByLabelText(cashShiftCopy.start.terminal)).toHaveValue('term-2');
  });

  it('normalizes opening balance on blur and submits the payload', () => {
    render(<StartShift {...defaultProps} />);

    const opening = screen.getByLabelText(cashShiftCopy.start.openingBalance);
    fireEvent.change(opening, { target: { value: '₹1,250.5' } });
    fireEvent.blur(opening);

    expect(opening).toHaveValue('1250.50');

    fireEvent.change(screen.getByLabelText(cashShiftCopy.start.operator), {
      target: { value: 'op-dev' },
    });
    fireEvent.change(screen.getByLabelText(cashShiftCopy.start.terminal), {
      target: { value: 'term-3' },
    });
    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.start.confirm }));

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        shiftNumber: '1043',
        operatorId: 'op-dev',
        operatorName: 'Dev Patel',
        terminalId: 'term-3',
        openingBalance: 1250.5,
        startedAtLabel: expect.stringMatching(/ at /),
      }),
    );
  });

  it('treats invalid opening balance as zero', () => {
    render(<StartShift {...defaultProps} />);

    const opening = screen.getByLabelText(cashShiftCopy.start.openingBalance);
    fireEvent.change(opening, { target: { value: 'abc' } });
    fireEvent.blur(opening);

    expect(opening).toHaveValue('0.00');

    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.start.confirm }));

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({
        openingBalance: 0,
      }),
    );
  });

  it('does not start when the selected operator is missing from the draft', () => {
    render(
      <StartShift
        {...defaultProps}
        draft={{
          ...cashShiftPreviewStart,
          defaultOperatorId: 'missing-operator',
        }}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(cashShiftCopy.start.operatorMissing);
    expect(screen.getByRole('button', { name: cashShiftCopy.start.confirm })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: cashShiftCopy.start.confirm }));

    expect(onStart).not.toHaveBeenCalled();
  });

  it('hides cancel when canCancel is false', () => {
    render(<StartShift {...defaultProps} canCancel={false} />);

    expect(
      screen.queryByRole('button', { name: cashShiftCopy.start.cancel }),
    ).not.toBeInTheDocument();
  });
});
