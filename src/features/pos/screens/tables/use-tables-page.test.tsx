import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useTablesPage } from '@/features/pos/screens/tables/use-tables-page';
import { PosOrderProvider } from '@/context/pos-order';
import { PosOrdersProvider } from '@/context/pos-orders-store';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/tables',
}));

function TablesProbe() {
  const page = useTablesPage();
  return (
    <div>
      <span data-testid="table-count">{page.visibleTables.length}</span>
      <button type="button" onClick={() => page.handleDesktopTableSelect('t1')}>
        Select T1
      </button>
      <button type="button" onClick={() => page.handleOrderMenu()}>
        Order Menu
      </button>
    </div>
  );
}

describe('useTablesPage', () => {
  afterEach(() => {
    cleanup();
    pushMock.mockReset();
  });

  it('selects a table on desktop and navigates to dine-in', () => {
    render(
      <PosOrdersProvider>
        <PosOrderProvider>
          <TablesProbe />
        </PosOrderProvider>
      </PosOrdersProvider>,
    );

    expect(Number(screen.getByTestId('table-count').textContent)).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Select T1' }));
    expect(pushMock).toHaveBeenCalledWith('/dine-in');
  });

  it('navigates to dine-in from order menu when a table is selected', () => {
    render(
      <PosOrdersProvider>
        <PosOrderProvider>
          <TablesProbe />
        </PosOrderProvider>
      </PosOrdersProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select T1' }));
    pushMock.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Order Menu' }));
    expect(pushMock).toHaveBeenCalledWith('/dine-in');
  });

  it('selects a table on compact table select and navigates to dine-in', () => {
    function CompactProbe() {
      const page = useTablesPage();
      return (
        <>
          <span data-testid="selected-table">{page.selectedTableId ?? ''}</span>
          <button type="button" onClick={() => page.handleCompactTableSelect('t2')}>
            Compact T2
          </button>
          <button type="button" onClick={() => page.handleOrderMenu()}>
            Order Menu
          </button>
        </>
      );
    }

    render(
      <PosOrdersProvider>
        <PosOrderProvider>
          <CompactProbe />
        </PosOrderProvider>
      </PosOrdersProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Compact T2' }));
    expect(pushMock).toHaveBeenCalledWith('/dine-in');
    expect(screen.getByTestId('selected-table').textContent).toBe('t02');

    pushMock.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Order Menu' }));
    expect(pushMock).toHaveBeenCalledWith('/dine-in');
  });
});
