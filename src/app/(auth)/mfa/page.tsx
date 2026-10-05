import AuthSupportingText from '@shared/components/auth-supporting-text/AuthSupportingText';
import AdminLoginSplitLayout from '@/components/auth/AdminLoginSplitLayout';

export default function MfaPage() {
  return (
    <AdminLoginSplitLayout
      title="Multi-factor authentication"
      description="MFA is mandatory for all admin sessions."
    >
      <AuthSupportingText>
        Complete verification using your registered authenticator app. This flow will connect to
        your identity provider in a later phase.
      </AuthSupportingText>
    </AdminLoginSplitLayout>
  );
}
