import { describe, expect, it } from 'vitest';

import {
  getSizePriceLabel,
  getSizeSubtitle,
} from '@/features/pos/screens/dine-in/dine-in-customize-sheet.helpers';

describe('dine-in customize sheet helpers', () => {
  it('returns known and fallback size subtitles', () => {
    expect(getSizeSubtitle({ id: 'medium', label: 'Medium', price: 480 })).toBe(
      'Standard serving size',
    );
    expect(getSizeSubtitle({ id: 'custom', label: 'Custom', price: 100 })).toBe(
      'Custom portion size',
    );
  });

  it('labels included, discounted, and upgraded size prices', () => {
    expect(getSizePriceLabel({ id: 'single', label: 'Single', price: 299 }, 299)).toEqual({
      text: 'Included',
      included: true,
    });

    expect(getSizePriceLabel({ id: 'mini', label: 'Mini', price: 199 }, 299)).toEqual({
      text: '- Rs 100',
      included: false,
    });

    expect(getSizePriceLabel({ id: 'double', label: 'Double', price: 449 }, 299)).toEqual({
      text: '+ Rs 150',
      included: false,
    });
  });

  it('returns subtitles for known size ids', () => {
    expect(getSizeSubtitle({ id: 'mini', label: 'Mini', price: 199 })).toBe('Smaller serving size');
    expect(getSizeSubtitle({ id: 'double', label: 'Double', price: 449 })).toBe(
      'Twice the pasta, more meat',
    );
    expect(getSizeSubtitle({ id: 'family', label: 'Family', price: 899 })).toBe(
      'Family sharing size',
    );
  });
});
