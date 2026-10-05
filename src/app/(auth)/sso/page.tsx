import AuthSupportingText from '@shared/components/auth-supporting-text/AuthSupportingText';
import AdminLoginSplitLayout from '@/components/auth/AdminLoginSplitLayout';

export default function SsoPage() {
  return (
    <AdminLoginSplitLayout
      title="SSO"
      description="Continue with Google Workspace for Hospixo employees."
    >
      <AuthSupportingText>
        Single sign-on will redirect through your organization&apos;s identity provider.
      </AuthSupportingText>
    </AdminLoginSplitLayout>
  );
}
