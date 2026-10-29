import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { parseCompanyList } from './companyListSchema';

describe('companyListSchema', () => {
  it('parses userCount from standard user_count field', () => {
    const payload = {
      companies: [
        {
          id: 1,
          name: 'IHCL',
          status: 'active',
          branch_count: 3,
          user_count: 12,
        },
      ],
    };

    const result = parseCompanyList(payload);
    assert.equal(result.length, 1);
    assert.equal(result[0].userCount, 12);
  });

  it('parses userCount from total_users field', () => {
    const payload = {
      data: [
        {
          company_id: 2,
          company_name: 'Taj Group',
          status: 'active',
          total_users: 25,
        },
      ],
    };

    const result = parseCompanyList(payload);
    assert.equal(result.length, 1);
    assert.equal(result[0].userCount, 25);
  });

  it('parses userCount from users array length', () => {
    const payload = [
      {
        id: 3,
        name: 'Oberoi Hotels',
        status: 'active',
        users: [{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }],
      },
    ];

    const result = parseCompanyList(payload);
    assert.equal(result.length, 1);
    assert.equal(result[0].userCount, 3);
  });

  it('defaults to 0 when user count fields are missing or 0', () => {
    const payload = [
      {
        id: 4,
        name: 'IHCL',
        status: 'active',
      },
    ];

    const result = parseCompanyList(payload);
    assert.equal(result.length, 1);
    assert.equal(result[0].userCount, 0);
  });
});
