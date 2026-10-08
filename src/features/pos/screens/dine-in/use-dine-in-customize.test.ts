import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { DineInMenuItem } from '@/features/pos/config/dine-in';
import { dineInMenuItems } from '@/features/pos/config/dine-in';
import { useDineInCustomize } from '@/features/pos/screens/dine-in/use-dine-in-customize';

const customizableItem =
  dineInMenuItems.find((item) => item.id === 'biryani-chicken') ?? dineInMenuItems[0];

const plainItem: DineInMenuItem = {
  id: 'plain-rice',
  name: 'Plain Rice',
  price: 120,
  category: 'mains',
  group: 'MAINS',
  imageUrl: customizableItem.imageUrl,
};

const sizedWithoutSingle: DineInMenuItem = {
  id: 'family-only',
  name: 'Family Tray',
  price: 500,
  category: 'mains',
  group: 'MAINS',
  imageUrl: customizableItem.imageUrl,
  sizes: [
    { id: 'family', label: 'Family', price: 899 },
    { id: 'large', label: 'Large', price: 699 },
  ],
};

describe('useDineInCustomize', () => {
  afterEach(() => {
    cleanup();
  });

  it('starts from the default customization and reference size price', () => {
    const { result } = renderHook(() => useDineInCustomize(customizableItem));

    expect(result.current.customization.sizeId).toBe('single');
    expect(result.current.quantity).toBe(1);
    expect(result.current.referenceSizePrice).toBe(299);
    expect(result.current.unitPrice).toBe(299);
    expect(result.current.totalPrice).toBe(299);
    expect(result.current.cookingPreferences.length).toBeGreaterThan(0);
  });

  it('falls back to item price when sizes are missing', () => {
    const { result } = renderHook(() => useDineInCustomize(plainItem));

    expect(result.current.customization.sizeId).toBeUndefined();
    expect(result.current.referenceSizePrice).toBe(120);
    expect(result.current.unitPrice).toBe(120);
    expect(result.current.cookingPreferences).toEqual([]);
  });

  it('uses the first size when single is unavailable', () => {
    const { result } = renderHook(() => useDineInCustomize(sizedWithoutSingle));

    expect(result.current.customization.sizeId).toBe('family');
    expect(result.current.referenceSizePrice).toBe(899);
  });

  it('updates size, cooking preference, quantity, and add-ons', () => {
    const { result } = renderHook(() => useDineInCustomize(customizableItem));

    act(() => {
      result.current.setSizeId('family');
    });
    expect(result.current.customization.sizeId).toBe('family');
    expect(result.current.unitPrice).toBe(899);

    act(() => {
      result.current.setCookingPreference('Spicy');
    });
    expect(result.current.customization.cookingPreference).toBe('Spicy');

    act(() => {
      result.current.toggleAddOn('raita');
    });
    expect(result.current.customization.addOnIds).toEqual(['raita']);
    expect(result.current.unitPrice).toBeGreaterThan(899);

    act(() => {
      result.current.toggleAddOn('raita');
    });
    expect(result.current.customization.addOnIds).toEqual([]);

    act(() => {
      result.current.increaseQty();
      result.current.increaseQty();
    });
    expect(result.current.quantity).toBe(3);
    expect(result.current.totalPrice).toBe(result.current.unitPrice * 3);

    act(() => {
      result.current.decreaseQty();
    });
    expect(result.current.quantity).toBe(2);

    act(() => {
      result.current.decreaseQty();
      result.current.decreaseQty();
      result.current.decreaseQty();
    });
    expect(result.current.quantity).toBe(1);
  });

  it('resets customization when the menu item changes', () => {
    const otherItem = dineInMenuItems.find((item) => item.id === 'espresso') ?? customizableItem;

    const { result, rerender } = renderHook(({ item }) => useDineInCustomize(item), {
      initialProps: { item: customizableItem },
    });

    act(() => {
      result.current.setSizeId('double');
      result.current.increaseQty();
    });
    expect(result.current.customization.sizeId).toBe('double');
    expect(result.current.quantity).toBe(2);

    rerender({ item: otherItem });

    expect(result.current.customization.sizeId).toBe(
      otherItem.sizes?.find((size) => size.id === 'single')?.id ?? otherItem.sizes?.[0]?.id,
    );
    expect(result.current.quantity).toBe(1);
  });
});
