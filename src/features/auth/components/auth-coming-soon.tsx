import Link from 'next/link';

import { AUTH_ROUTES } from '@/constants/routes';
import { AuthSplitLayout } from '@/features/auth/components/login-split-layout';

import sharedStyles from './forms/shared/auth-form-shared.module.css';

type AuthComingSoonProps = Readonly<{
  title: string;
  description?: string;
}>;

export function AuthComingSoon({
  title,
  description = 'This sign-in option is not available yet. Please use email and password or SSO.',
}: AuthComingSoonProps) {
  return (
    <AuthSplitLayout
      title={title}
      description={description}
      footer={
        <>
          Prefer another method? <Link href={AUTH_ROUTES.login}>Back to sign in</Link>
        </>
      }
    >
      <div className={sharedStyles.form}>
        <p className={`${sharedStyles.banner} ${sharedStyles['banner-info']}`}>
          Coming soon — this flow will be enabled once the backend is connected.
        </p>
        <Link href={AUTH_ROUTES.login} className={sharedStyles.submit}>
          Use email &amp; password
        </Link>
        <div className={sharedStyles['link-row']}>
          <Link href={AUTH_ROUTES.adminLogin}>Platform admin sign-in</Link>
          {' · '}
          <Link href={AUTH_ROUTES.sso}>Sign in with SSO</Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
