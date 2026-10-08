import { redirect } from 'next/navigation';

import { routes } from '@/config/routes';

export default async function InvitationAcceptRedirect({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ token?: string }>;
}>) {
  const { token } = await searchParams;
  redirect(
    token
      ? `${routes.auth.inviteAccept}?token=${encodeURIComponent(token)}`
      : routes.auth.inviteAccept,
  );
}
