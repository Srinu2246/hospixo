import { describe, expect, it } from 'vitest';

import { dineInInitialOrderLines } from '@/features/pos/config/dine-in';
import {
  buildCheckoutFeeLines,
  computeCheckoutTotal,
  dineInLinesToCheckout,
  formatCheckoutRupee,
} from '@/features/pos/config/checkout';

describe('checkout helpers', () => {
  it('maps dine-in lines into checkout rows', () => {
    const rows = dineInLinesToCheckout(dineInInitialOrderLines.slice(0, 1));
    expect(rows).toEqual([
      expect.objectContaining({
        name: 'Pasta Carbonara',
        quantity: 6,
        unitPrice: 480,
      }),
    ]);
  });

  it('builds fee lines from the live subtotal', () => {
    const subtotal = 1000;
    const feeLines = buildCheckoutFeeLines(subtotal);
    expect(feeLines[0]).toMatchObject({ id: 'subtotal', amount: 1000 });
    expect(feeLines.find((fee) => fee.id === 'service')).toMatchObject({ amount: 20 });
    expect(feeLines.find((fee) => fee.id === 'tax')).toMatchObject({ amount: 50 });
  });

  it('computes the checkout total from fee lines', () => {
    const total = computeCheckoutTotal([
      { id: 'subtotal', label: 'Sub Total', amount: 1000 },
      { id: 'discount', label: 'Discount', amount: -100, tone: 'discount' },
      { id: 'tax', label: 'Tax', amount: 45 },
    ]);
    expect(total).toBe(945);
  });

  it('formats rupee amounts for positive and discount values', () => {
    expect(formatCheckoutRupee(2268)).toBe('Rs 2,268.00');
    expect(formatCheckoutRupee(-150, { signedDiscount: true })).toBe('- Rs 150.00');
  });
});
