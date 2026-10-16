import {
  companyListSchema,
  type CompanyListItem,
} from '@/lib/schemas/organization/companies/companyListSchema';

export type { CompanyListItem };

export const MOCK_COMPANIES: CompanyListItem[] = companyListSchema.parse([
  {
    id: 12,
    name: 'Al Baik Foods Ltd',
    code: 'ABF',
    businessType: 'Restaurant',
    status: 'active',
    branchCount: 4,
    userCount: 28,
  },
  {
    id: 18,
    name: 'Spice Garden Group',
    code: 'SGG',
    businessType: 'Restaurant',
    status: 'active',
    branchCount: 2,
    userCount: 15,
  },
  {
    id: 21,
    name: 'Urban Bites Co',
    code: 'UBC',
    businessType: 'Cafe',
    status: 'inactive',
    branchCount: 1,
    userCount: 6,
  },
]);
