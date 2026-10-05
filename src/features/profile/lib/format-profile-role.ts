const ROLE_LABELS: Record<string, string> = {
  company_admin: 'admin/owner',
  org_admin: 'admin/owner',
  branch_admin: 'branch admin',
  owner: 'admin/owner',
  manager: 'manager',
};

export function formatProfileRole(roles: readonly string[] | undefined): string {
  if (!roles?.length) return 'user';

  const primary = roles[0] ?? 'user';
  return ROLE_LABELS[primary] ?? primary.replace(/_/g, ' ');
}
