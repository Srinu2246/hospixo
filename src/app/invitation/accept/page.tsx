import { redirect } from 'next/navigation';

type InvitationAcceptRedirectProps = Readonly<{
  searchParams: Promise<{ token?: string }>;
}>;

/** Legacy email links may use /invitation/accept — canonical path is /invite/accept. */
export default async function InvitationAcceptRedirect({
  searchParams,
}: InvitationAcceptRedirectProps) {
  const { token } = await searchParams;
  redirect(token ? `/invite/accept?token=${encodeURIComponent(token)}` : '/invite/accept');
}
