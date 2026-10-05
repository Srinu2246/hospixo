import { describe, expect, it } from 'vitest';

import { toBranchSelectOptions, toRoleSelectOptions } from './backend-options';

describe('backend user-role options', () => {
  it('maps backend branches to JSON-friendly select options', () => {
    const options = toBranchSelectOptions([
      { id: 12, name: 'Downtown Branch', country: 'US', is_default: false, status: 'active' },
      { id: 18, name: 'Company HQ', country: 'US', is_default: true, status: 'active' },
    ]);

    expect(options).toEqual([
      { value: '12', label: 'Downtown Branch' },
      { value: '18', label: 'Company HQ' },
    ]);
  });

  it('maps backend role payloads to JSON-friendly select options', () => {
    const options = toRoleSelectOptions([
      {
        id: 1,
        code: 'branch_manager',
        display_name: 'Branch Manager',
        scope: 'branch',
        status: 'active',
      },
      {
        id: 2,
        code: 'company_manager',
        display_name: 'Company Manager',
        scope: 'company',
        status: 'active',
      },
    ]);

    expect(options).toEqual([
      { value: '1', label: 'Branch Manager' },
      { value: '2', label: 'Company Manager' },
    ]);
  });
});
