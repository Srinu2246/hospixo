import { describe, expect, it } from 'vitest';

import { flowPaths } from '@/config/shell/flow-paths';
import { routes } from '@/config/routes';
import {
  buildCaptainOperationsNavSections,
  buildPlatformOperationsNavSections,
  buildPosOperationsNavSections,
} from '@/features/pos/config/nav-operations';
import { resolvePosFlowPaths } from '@/features/pos/lib/pos-flow-paths';

function itemLabels(sections: ReturnType<typeof buildPosOperationsNavSections>) {
  return sections.flatMap((section) => section.items.map((item) => item.label));
}

describe('buildPosOperationsNavSections', () => {
  it('returns captain-only items for the captain flow', () => {
    const paths = resolvePosFlowPaths('/captain/dine-in');
    const sections = buildPosOperationsNavSections(paths);

    expect(itemLabels(sections)).toEqual([
      'Tables',
      'Dine In',
      'Ready Orders',
      'Orders',
      'Menu Availability',
    ]);
    expect(sections[0]?.items.map((item) => item.href)).toEqual([
      flowPaths.captain.tables,
      flowPaths.captain.dineIn,
      flowPaths.captain.ready,
      flowPaths.captain.orders,
      flowPaths.captain.menuAvailability,
    ]);
  });

  it('returns full POS operations for platform flow', () => {
    const paths = resolvePosFlowPaths('/tables');
    const sections = buildPosOperationsNavSections(paths);

    expect(itemLabels(sections)).toEqual([
      'Dashboard',
      'Tables',
      'Dine In',
      'Ready List',
      'Online Orders',
      'All Orders',
      'Cash Shift',
      'Due Payments',
    ]);
  });

  it('returns full POS operations for branch flow', () => {
    const paths = resolvePosFlowPaths('/branch/tables');
    const sections = buildPosOperationsNavSections(paths);

    expect(itemLabels(sections)).toContain('Dashboard');
    expect(itemLabels(sections)).toContain('Cash Shift');
    expect(itemLabels(sections)).not.toContain('Menu Availability');
  });
});

describe('buildCaptainOperationsNavSections', () => {
  it('excludes dashboard, cash shift, and due payments', () => {
    const paths = resolvePosFlowPaths(routes.dashboard.captain);
    const labels = itemLabels(buildCaptainOperationsNavSections(paths));

    expect(labels).not.toContain('Dashboard');
    expect(labels).not.toContain('Cash Shift');
    expect(labels).not.toContain('Due Payments');
    expect(labels).not.toContain('Online Orders');
  });
});

describe('buildPlatformOperationsNavSections', () => {
  it('includes dashboard and finance items', () => {
    const paths = resolvePosFlowPaths(routes.platform.pos.tables);
    const labels = itemLabels(buildPlatformOperationsNavSections(paths));

    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Due Payments');
    expect(labels).not.toContain('Menu Availability');
  });
});
