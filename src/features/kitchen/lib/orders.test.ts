import { describe, expect, it } from 'vitest';

import {
  kitchenPreviewConnection,
  kitchenPreviewOrders,
  kitchenPreviewStats,
} from '@/features/kitchen/config/fixture';
import {
  getKitchenConnectionStatus,
  getKitchenOrders,
  getKitchenStatsSummary,
} from '@/features/kitchen/lib/orders';

describe('kitchen order loaders', () => {
  it('returns preview fixtures until the API is wired', async () => {
    await expect(getKitchenOrders()).resolves.toEqual(kitchenPreviewOrders);
    await expect(getKitchenStatsSummary()).resolves.toEqual(kitchenPreviewStats);
    await expect(getKitchenConnectionStatus()).resolves.toEqual(kitchenPreviewConnection);
  });
});
