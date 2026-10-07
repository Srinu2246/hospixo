import { Alert } from '@mui/material';

import { companyLandingContent } from '@/features/dashboard/config/company';
import { toUserFacingDashboardError } from '@/features/dashboard/lib/user-facing-load-error';

export function CompanyFallbackBanner({
  detail,
}: Readonly<{
  detail?: string | null;
}>) {
  const message = detail?.trim()
    ? toUserFacingDashboardError(detail)
    : companyLandingContent.fallback.banner;

  return (
    <Alert
      severity="warning"
      role="status"
      sx={{
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
      }}
    >
      {message}
    </Alert>
  );
}
