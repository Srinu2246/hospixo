import type { MenuSizeOption } from '@/features/pos/config/dine-in';
import { formatDineInRupee } from '@/features/pos/config/dine-in';

const SIZE_SUBTITLES: Record<string, string> = {
  mini: 'Smaller serving size',
  single: 'Standard serving size',
  regular: 'Standard serving size',
  medium: 'Standard serving size',
  half: 'Smaller serving size',
  cup: 'Single cup serving',
  double: 'Twice the pasta, more meat',
  large: 'Larger serving size',
  full: 'Full serving size',
  bowl: 'Full bowl serving',
  family: 'Family sharing size',
};

export function getSizeSubtitle(size: MenuSizeOption) {
  return SIZE_SUBTITLES[size.id] ?? 'Custom portion size';
}

export function getSizePriceLabel(size: MenuSizeOption, referenceSizePrice: number) {
  if (size.price === referenceSizePrice) return { text: 'Included', included: true };
  const delta = size.price - referenceSizePrice;
  if (delta < 0) {
    return { text: `- ${formatDineInRupee(Math.abs(delta))}`, included: false };
  }
  return { text: `+ ${formatDineInRupee(delta)}`, included: false };
}
