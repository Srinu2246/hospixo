export type ApiCompany = Readonly<{
  id: number | string;
  organization_id: number | string;
  name: string;
  code?: string | null;
  business_type?: string | null;
  status?: string | null;
  branch_count?: number;
  user_count?: number;
  created_at?: string | null;
}>;

export type CompaniesListResponse = Readonly<{
  items: readonly ApiCompany[];
  total: number;
}>;
