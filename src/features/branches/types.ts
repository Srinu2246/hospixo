export type BranchListItem = Readonly<{
  id: string | number;
  companyId: string | number;
  companyName?: string | null;
  name: string;
  code?: string | null;
  city?: string | null;
  status: 'active' | 'inactive' | (string & {});
  isDefault?: boolean;
}>;

export type BranchesListResult = Readonly<{
  items: readonly BranchListItem[];
  total: number;
}>;
