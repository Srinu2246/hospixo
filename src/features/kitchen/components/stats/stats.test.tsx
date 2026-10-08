import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { KitchenStatsBar } from '@/features/kitchen/components/stats';
import { kitchenDisplayCopy } from '@/features/kitchen/config';

describe('KitchenStatsBar', () => {
  afterEach(() => {
    cleanup();
  });

  it('hides the live badge when isLive is false', () => {
    render(
      <KitchenStatsBar stats={{ total: 1, pending: 1, preparing: 0, ready: 0 }} isLive={false} />,
    );

    expect(screen.queryByText(kitchenDisplayCopy.live)).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(kitchenDisplayCopy.stats.total);
  });
});
