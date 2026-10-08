import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { StatusLegend, StatusPill } from '@/features/pos/screens/shared/status-pill';

describe('StatusPill', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a status label', () => {
    render(<StatusPill status="available" label="Available" />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('renders a compact legend list', () => {
    render(
      <StatusLegend
        items={[
          { status: 'occupied', label: 'Occupied' },
          { status: 'ready', label: 'Ready' },
        ]}
      />,
    );

    expect(screen.getByLabelText('Table status legend')).toBeInTheDocument();
    expect(screen.getByText('Occupied')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });
});
