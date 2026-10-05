import type { Metadata } from 'next';

import { AuthComingSoon } from '@/features/auth/components/auth-coming-soon';

export const metadata: Metadata = {
  title: 'Forgot password',
  description: 'Password reset will be available soon.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthComingSoon
      title="Password reset coming soon"
      description="Forgot-password email delivery is not connected to the backend yet. Contact your administrator if you need access restored."
    />
  );
}
