import {
  branchListSchema,
  type BranchListItem,
} from '@/lib/schemas/organization/branches/branchListSchema';

export type { BranchListItem };

export const MOCK_BRANCHES: BranchListItem[] = branchListSchema.parse([
  {
    id: 101,
    name: 'Downtown Central',
    companyId: 12,
    companyName: 'Al Baik Foods Ltd',
    code: 'DTC',
    city: 'Hyderabad',
    status: 'active',
    isDefault: true,
  },
  {
    id: 102,
    name: 'Westside Mall',
    companyId: 12,
    companyName: 'Al Baik Foods Ltd',
    code: 'WSM',
    city: 'Bengaluru',
    status: 'active',
  },
  {
    id: 103,
    name: 'Marina Bay',
    companyId: 18,
    companyName: 'Spice Garden Group',
    code: 'MRB',
    city: 'Chennai',
    status: 'active',
    isDefault: true,
  },
  {
    id: 104,
    name: 'Harbor Front',
    companyId: 21,
    companyName: 'Urban Bites Co',
    code: 'HBF',
    city: 'Mumbai',
    status: 'inactive',
  },
]);
