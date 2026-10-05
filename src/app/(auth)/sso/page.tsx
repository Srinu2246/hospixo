import type { Metadata } from 'next';

import { AuthComingSoon } from '@/features/auth/components/auth-coming-soon';

export const metadata: Metadata = {
  title: 'SSO sign in',
  description: 'Single sign-on for Hospixo workspace.',
};

export default function SsoPage() {
  return (
    <AuthComingSoon
      title="SSO sign-in coming soon"
      description="Single sign-on will redirect through your organization's identity provider once connected."
    />
  );
}
