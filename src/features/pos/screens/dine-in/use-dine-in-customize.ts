import { useMemo, useState } from 'react';

import type { DineInMenuItem, MenuItemCustomization } from '@/features/pos/config/dine-in';
import { computeCustomizedUnitPrice, getDefaultCustomization } from '@/features/pos/config/dine-in';

export function useDineInCustomize(item: DineInMenuItem) {
  const defaultCustomization = useMemo(() => getDefaultCustomization(item), [item]);
  const [customization, setCustomization] = useState<MenuItemCustomization>(defaultCustomization);
  const [activeItemId, setActiveItemId] = useState(item.id);

  if (item.id !== activeItemId) {
    setActiveItemId(item.id);
    setCustomization(defaultCustomization);
  }

  const referenceSizePrice = useMemo(() => {
    const defaultSize = item.sizes?.find((size) => size.id === defaultCustomization.sizeId);
    return defaultSize?.price ?? item.price;
  }, [defaultCustomization.sizeId, item]);

  const unitPrice = useMemo(
    () => computeCustomizedUnitPrice(item, customization),
    [item, customization],
  );

  const quantity = customization.quantity ?? 1;
  const totalPrice = unitPrice * quantity;
  const cookingPreferences = item.cookingPreferences ?? [];

  function toggleAddOn(addOnId: string) {
    setCustomization((prev) => {
      const current = prev.addOnIds ?? [];
      const next = current.includes(addOnId)
        ? current.filter((id) => id !== addOnId)
        : [...current, addOnId];
      return { ...prev, addOnIds: next };
    });
  }

  function setSizeId(sizeId: string) {
    setCustomization((prev) => ({ ...prev, sizeId }));
  }

  function setCookingPreference(cookingPreference: string) {
    setCustomization((prev) => ({ ...prev, cookingPreference }));
  }

  function decreaseQty() {
    setCustomization((prev) => ({
      ...prev,
      quantity: Math.max(1, (prev.quantity ?? 1) - 1),
    }));
  }

  function increaseQty() {
    setCustomization((prev) => ({
      ...prev,
      quantity: (prev.quantity ?? 1) + 1,
    }));
  }

  return {
    customization,
    referenceSizePrice,
    unitPrice,
    quantity,
    totalPrice,
    cookingPreferences,
    toggleAddOn,
    setSizeId,
    setCookingPreference,
    decreaseQty,
    increaseQty,
  };
}
