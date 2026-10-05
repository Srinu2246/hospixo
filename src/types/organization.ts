export type OrganizationStatus =
  'active' | 'suspended' | 'trial' | 'expiring' | 'draft' | 'inactive' | 'cancelled' | 'disabled';

export type OrganizationSummary = Readonly<{
  id: string;
  publicId?: string;
  name: string;
  status: OrganizationStatus;
  plan: string;
  industry: string;
  companyCount: number;
  branchCount: number;
  createdAt: string;
}>;

export type OrganizationListResult = Readonly<{
  items: readonly OrganizationSummary[];
  total: number;
  page: number;
  pageSize: number;
}>;

export type OrganizationActivityItem = Readonly<{
  id: string;
  title: string;
  actor: string;
  occurredAt: string;
}>;
