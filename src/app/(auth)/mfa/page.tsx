import type { Metadata } from 'next';

import { AuthComingSoon } from '@/features/auth/components/auth-coming-soon';

export const metadata: Metadata = {
  title: 'Multi-factor authentication',
  description: 'MFA verification for Hospixo.',
};

export default function MfaPage() {
  return (
    <AuthComingSoon
      title="Multi-factor authentication"
      description="Complete verification using your registered authenticator app. This flow will connect to your identity provider in a later phase."
    />
  );
}
