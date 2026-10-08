import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TableCard } from '@/features/pos/screens/tables/table-card';
import { posTables } from '@/features/pos/config/tables';

describe('TableCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders table details and selects on click', () => {
    const onSelect = vi.fn();
    const table = posTables[0];

    render(<TableCard table={table} selected onSelect={onSelect} />);

    expect(screen.getByRole('button', { name: /T1, Occupied/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: /T1, Occupied/i }));
    expect(onSelect).toHaveBeenCalledWith(table.id);
  });
});
