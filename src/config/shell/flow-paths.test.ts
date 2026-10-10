import { describe, expect, it } from 'vitest';

import { flowPaths, isCaptainFlowPath } from './flow-paths';

describe('isCaptainFlowPath', () => {
  it('matches the captain root and nested routes only', () => {
    expect(isCaptainFlowPath(flowPaths.captain.root)).toBe(true);
    expect(isCaptainFlowPath(flowPaths.captain.ready)).toBe(true);
    expect(isCaptainFlowPath(`${flowPaths.captain.orders}/123`)).toBe(true);
    expect(isCaptainFlowPath('/captaincy/orders')).toBe(false);
    expect(isCaptainFlowPath(flowPaths.branch.orders)).toBe(false);
  });
});
