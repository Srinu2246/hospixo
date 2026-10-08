import { describe, expect, it } from 'vitest';

import { getMenuCategories, getMenuItems } from '@/features/pos/menu-availability/lib';
import { menuPreviewCategories, menuPreviewItems } from '@/features/pos/menu-availability/config';

describe('menu-availability data loaders', () => {
  it('returns preview categories', async () => {
    await expect(getMenuCategories()).resolves.toEqual([...menuPreviewCategories]);
  });

  it('returns preview items', async () => {
    await expect(getMenuItems()).resolves.toEqual([...menuPreviewItems]);
  });
});
