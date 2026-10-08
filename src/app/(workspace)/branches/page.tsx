import { redirect } from 'next/navigation';

import { getServerAuthSession } from '@/lib/auth/session';
import { resolveAccessLevel, resolveDashboardHomePath } from '@/lib/auth/access-level';

type BranchesRedirectPageProps = Readonly<{
  searchParams: Promise<{ company_id?: string; org_id?: string }>;
}>;

export default async function BranchesRedirectPage({ searchParams }: BranchesRedirectPageProps) {
  const { company_id, org_id } = await searchParams;
  const params = new URLSearchParams();
  if (company_id) params.set('company_id', company_id);
  if (org_id) params.set('org_id', org_id);

  const session = await getServerAuthSession();
  if (session) {
    const level = resolveAccessLevel(session.user);
    if (level === 'branch' || level === 'counter' || level === 'captain' || level === 'kitchen') {
      redirect(resolveDashboardHomePath(session.user));
    }
    if (level === 'company') {
      const query = params.toString();
      redirect(`/company/branches${query ? `?${query}` : ''}`);
    }
  }

  const query = params.toString();
  redirect(`/organisation/branches${query ? `?${query}` : ''}`);
}
