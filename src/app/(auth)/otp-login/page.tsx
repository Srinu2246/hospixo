import type { Metadata } from 'next';

import { AuthComingSoon } from '@/features/auth/components/auth-coming-soon';

export const metadata: Metadata = {
  title: 'OTP sign in',
  description: 'OTP sign-in will be available soon.',
};

export default function OtpLoginPage() {
  return (
    <AuthComingSoon
      title="OTP sign-in coming soon"
      description="One-time password login is not connected to the backend yet. Please use email and password or SSO."
    />
  );
}
