import { describe, expect, it } from 'vitest';

import { menuAvailabilityCopy } from '@/features/pos/menu-availability/config/copy';

describe('menuAvailabilityCopy.footer', () => {
  it('pluralizes changed and eighty-sixed counts', () => {
    expect(menuAvailabilityCopy.footer.changed(1)).toBe('1 item changed');
    expect(menuAvailabilityCopy.footer.changed(2)).toBe('2 items changed');
    expect(menuAvailabilityCopy.footer.eightySixed(1)).toBe("1 currently 86'd");
    expect(menuAvailabilityCopy.footer.eightySixed(3)).toBe("3 currently 86'd");
  });
});
