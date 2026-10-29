import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { parseBranchList, parsePagedBranchList } from './branchListSchema';

describe('branchListSchema', () => {
  it('parses userCount from branch object with user_count', () => {
    const payload = [
      {
        id: 101,
        name: 'Downtown Central',
        company_id: 1,
        company_name: 'IHCL',
        code: 'DTC',
        city: 'Mumbai',
        status: 'active',
        is_default: true,
        user_count: 8,
      },
    ];

    const result = parseBranchList(payload);
    assert.equal(result.length, 1);
    assert.equal(result[0].userCount, 8);
  });

  it('parses userCount from branch object with total_users', () => {
    const payload = {
      data: {
        items: [
          {
            branch_id: 102,
            branch_name: 'Westside Cafe',
            companyId: 1,
            companyName: 'IHCL',
            total_users: 14,
          },
        ],
        total: 1,
      },
    };

    const result = parsePagedBranchList(payload);
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].userCount, 14);
  });

  it('defaults userCount to 0 when user count fields are absent', () => {
    const payload = [
      {
        id: 103,
        name: 'Marina Bay',
        company_id: 2,
        code: 'MRB',
      },
    ];

    const result = parseBranchList(payload);
    assert.equal(result.length, 1);
    assert.equal(result[0].userCount, 0);
  });
});
