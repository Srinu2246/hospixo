import type { KitchenStation } from '@/features/kitchen/types';

/** Station filters for the KDS until venue stations load from the API. */
export const defaultKitchenStations: KitchenStation[] = [
  { id: 'main-kitchen', label: 'Main Kitchen', subtitle: 'Main Kitchen - Floor 1' },
  { id: 'tandoor', label: 'Tandoor', subtitle: 'Tandoor Station' },
  { id: 'bar', label: 'Bar', subtitle: 'Bar Station' },
];
