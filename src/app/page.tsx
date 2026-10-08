import { redirect } from 'next/navigation';

import { AUTH_ROUTES } from '@/constants/routes';
import { getServerAuthSession } from '@/lib/auth/session';
import { resolveDashboardHomePath } from '@/lib/auth/access-level';

export default async function HomePage() {
  const session = await getServerAuthSession();
  if (session) {
    redirect(resolveDashboardHomePath(session.user));
  }
  redirect(AUTH_ROUTES.login);
}
