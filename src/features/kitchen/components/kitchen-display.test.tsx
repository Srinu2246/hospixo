import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { KitchenDisplay } from '@/features/kitchen/components/kitchen-display';
import {
  kitchenDisplayCopy,
  kitchenPreviewConnection,
  kitchenPreviewOrders,
  kitchenPreviewStats,
} from '@/features/kitchen/config';
import { defaultKitchenStations } from '@/features/kitchen/config/stations';
import type { KitchenOrder } from '@/features/kitchen/types';

const takeawayOrder: KitchenOrder = {
  id: 'ord-takeaway',
  number: '2001',
  status: 'new',
  priority: 'normal',
  channel: 'takeaway',
  stationId: 'main-kitchen',
  placedAt: '2026-07-20T12:10:00.000Z',
  elapsedLabel: '4m',
  items: [
    {
      id: 'i-t1',
      name: 'Veg Roll',
      quantity: 1,
      category: 'starters',
      notes: 'Extra spicy',
    },
  ],
};

const deliveryOrder: KitchenOrder = {
  id: 'ord-delivery',
  number: '2002',
  status: 'ready',
  priority: 'high',
  channel: 'delivery',
  stationId: 'bar',
  placedAt: '2026-07-20T12:12:00.000Z',
  items: [{ id: 'i-d1', name: 'Mango Lassi', quantity: 2, category: 'drinks' }],
};

describe('KitchenDisplay', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders header, stats, board columns, and footer from preview data', () => {
    render(
      <KitchenDisplay
        orders={kitchenPreviewOrders}
        stations={defaultKitchenStations}
        stats={kitchenPreviewStats}
        connectionStatus={kitchenPreviewConnection}
      />,
    );

    expect(screen.getByRole('heading', { name: kitchenDisplayCopy.title })).toBeInTheDocument();
    expect(screen.getByText('Main Kitchen - Floor 1')).toBeInTheDocument();
    expect(screen.getByText(kitchenDisplayCopy.live)).toBeInTheDocument();
    expect(screen.getByText('324')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: kitchenDisplayCopy.columns.new }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: kitchenDisplayCopy.columns.preparing }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: kitchenDisplayCopy.columns.ready }),
    ).toBeInTheDocument();
    expect(screen.getByText('#1021')).toBeInTheDocument();
    expect(screen.getByText('T-12')).toBeInTheDocument();
    expect(screen.getAllByText(kitchenDisplayCopy.priority.high).length).toBeGreaterThan(0);
    expect(screen.getAllByText(kitchenDisplayCopy.channel.takeaway).length).toBeGreaterThan(0);
    expect(screen.getByText(kitchenDisplayCopy.footer.printerConnected)).toBeInTheDocument();
    expect(screen.getByText(kitchenDisplayCopy.footer.posSyncActive)).toBeInTheDocument();
    expect(screen.getByText(/14m 30s/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kitchen alerts' })).toBeInTheDocument();
  }, 15_000);

  it('shows the empty board message when there are no orders', () => {
    render(<KitchenDisplay orders={[]} stats={{ total: 0, pending: 0, preparing: 0, ready: 0 }} />);

    expect(screen.getByText(kitchenDisplayCopy.emptyBoard)).toBeInTheDocument();
    expect(screen.getAllByText(kitchenDisplayCopy.emptyColumn)).toHaveLength(3);
  });

  it('filters orders by station and computes stats when stats prop is omitted', () => {
    render(
      <KitchenDisplay
        orders={[...kitchenPreviewOrders, deliveryOrder]}
        stations={defaultKitchenStations}
      />,
    );

    expect(screen.getByText('#1021')).toBeInTheDocument();
    expect(screen.queryByText('#2002')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Bar' }));

    expect(screen.getByText('Bar Station')).toBeInTheDocument();
    expect(screen.getByText('#2002')).toBeInTheDocument();
    expect(screen.queryByText('#1021')).not.toBeInTheDocument();
    expect(screen.getByText(kitchenDisplayCopy.channel.delivery)).toBeInTheDocument();
  });

  it('moves tickets through board columns without external handlers', () => {
    render(<KitchenDisplay orders={kitchenPreviewOrders} stations={defaultKitchenStations} />);

    fireEvent.click(
      screen.getAllByRole('button', { name: kitchenDisplayCopy.actions.startPreparing })[0]!,
    );
    const preparingCard = screen.getByText('#1021').closest('article');
    expect(preparingCard).toHaveAttribute('data-status', 'preparing');

    fireEvent.click(
      within(preparingCard!).getByRole('button', {
        name: kitchenDisplayCopy.actions.markReady,
      }),
    );
    const readyCard = screen.getByText('#1021').closest('article');
    expect(readyCard).toHaveAttribute('data-status', 'ready');

    fireEvent.click(
      within(readyCard!).getByRole('button', { name: kitchenDisplayCopy.actions.served }),
    );
    expect(screen.queryByText('#1021')).not.toBeInTheDocument();
  });

  it('recalls a preparing ticket back to new and notifies optional callbacks', () => {
    const onStartPreparing = vi.fn();
    const onRecall = vi.fn();
    const onMarkReady = vi.fn();
    const onServed = vi.fn();

    render(
      <KitchenDisplay
        orders={kitchenPreviewOrders}
        stations={defaultKitchenStations}
        onStartPreparing={onStartPreparing}
        onRecall={onRecall}
        onMarkReady={onMarkReady}
        onServed={onServed}
      />,
    );

    fireEvent.click(
      screen.getAllByRole('button', { name: kitchenDisplayCopy.actions.startPreparing })[0]!,
    );
    expect(onStartPreparing).toHaveBeenCalledWith('ord-1021');

    const preparingCard = screen.getByText('#1021').closest('article');
    fireEvent.click(
      within(preparingCard!).getByRole('button', { name: kitchenDisplayCopy.actions.recall }),
    );
    expect(onRecall).toHaveBeenCalledWith('ord-1021');
    expect(screen.getByText('#1021').closest('article')).toHaveAttribute('data-status', 'new');

    const preparing1020 = screen.getByText('#1020').closest('article');
    fireEvent.click(
      within(preparing1020!).getByRole('button', {
        name: kitchenDisplayCopy.actions.markReady,
      }),
    );
    expect(onMarkReady).toHaveBeenCalledWith('ord-1020');

    const ready1018 = screen.getByText('#1018').closest('article');
    fireEvent.click(
      within(ready1018!).getByRole('button', { name: kitchenDisplayCopy.actions.served }),
    );
    expect(onServed).toHaveBeenCalledWith('ord-1018');
  });

  it('renders takeaway destination, elapsed time, item notes, and offline footer labels', () => {
    render(
      <KitchenDisplay
        orders={[takeawayOrder]}
        stations={defaultKitchenStations}
        connectionStatus={{
          printerConnected: false,
          posSyncActive: false,
        }}
      />,
    );

    expect(screen.getByText(kitchenDisplayCopy.channel.takeaway)).toBeInTheDocument();
    expect(screen.getByText('4m')).toBeInTheDocument();
    expect(screen.getByText('Extra spicy')).toBeInTheDocument();
    expect(screen.getByText(kitchenDisplayCopy.category.starters)).toBeInTheDocument();
    expect(screen.getByText(kitchenDisplayCopy.footer.printerDisconnected)).toBeInTheDocument();
    expect(screen.getByText(kitchenDisplayCopy.footer.posSyncInactive)).toBeInTheDocument();
    expect(screen.queryByText(/Avg\. Prep Time/)).not.toBeInTheDocument();
  });

  it('hides station tabs when none are provided and still renders board orders', () => {
    render(<KitchenDisplay orders={kitchenPreviewOrders} stations={[]} />);

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: kitchenDisplayCopy.title })).toBeInTheDocument();
    expect(screen.getByText('#1021')).toBeInTheDocument();
  });

  it('uses station label as subtitle when subtitle is missing', () => {
    render(<KitchenDisplay orders={[]} stations={[{ id: 'grill', label: 'Grill' }]} />);

    const title = screen.getByRole('heading', { name: kitchenDisplayCopy.title });
    expect(title.parentElement).toHaveTextContent('Grill');
  });
});
