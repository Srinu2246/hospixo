export type CompanyListItem = Readonly<{
  id: string | number;
  name: string;
  code?: string | null;
  businessType?: string | null;
  status: 'active' | 'inactive' | (string & {});
  branchCount: number;
  userCount: number;
  createdAt?: string | null;
}>;

export type CompaniesListResult = Readonly<{
  items: readonly CompanyListItem[];
  total: number;
}>;
