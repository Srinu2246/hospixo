import { describe, expect, it } from 'vitest';

import { kitchenDisplayCopy } from '@/features/kitchen/config/copy';

describe('kitchenDisplayCopy', () => {
  it('exposes stable kitchen display labels', () => {
    expect(kitchenDisplayCopy.title).toBe('Kitchen Display');
    expect(kitchenDisplayCopy.columns.new).toBe('New Orders');
    expect(kitchenDisplayCopy.actions.startPreparing).toBe('Start Preparing');
    expect(kitchenDisplayCopy.channel.delivery).toBe('Delivery');
    expect(kitchenDisplayCopy.footer.avgPrep).toBe('Avg. Prep Time');
  });
});
