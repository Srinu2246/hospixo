import { companyLandingContent } from '@/features/dashboard/config/company';
import { toUserFacingDashboardError } from '@/features/dashboard/lib/user-facing-load-error';

import styles from './company-fallback-banner.module.css';

export function CompanyFallbackBanner({
  detail,
}: Readonly<{
  detail?: string | null;
}>) {
  const message = detail?.trim()
    ? toUserFacingDashboardError(detail)
    : companyLandingContent.fallback.banner;
  return (
    <p className={styles.banner} role="status">
      {message}
    </p>
  );
}
