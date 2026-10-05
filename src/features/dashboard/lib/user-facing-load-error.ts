/** User-facing dashboard load copy — never include API paths, methods, or status codes. */
export const dashboardLoadCopy = {
  signInRequired: 'Sign in to continue.',
  missingOrganization: 'Your session is missing organization details. Sign out and sign in again.',
  noCompanies: 'No companies are set up for this organization yet.',
  noBranches: 'No branches were found. Add a branch, then try again.',
  noCompanyResolved: 'No company is available for this organization yet.',
  unableToLoadCompanies: 'Unable to load companies. Try again or contact your admin.',
  unableToLoadBranches: 'Unable to load branches. Try again or contact your admin.',
  unableToLoadDashboard: 'Unable to load dashboard data. Try again shortly.',
  unknownOutlet: 'Select a branch',
  assignedOutlet: 'Your branch',
} as const;

const API_LEAK_PATTERN = /\/api\/v\d|verify get|http \d{3}|backend:|frontend:/i;

export function toUserFacingDashboardError(message: string | null | undefined): string {
  const raw = message?.trim() ?? '';
  if (!raw) return dashboardLoadCopy.unableToLoadDashboard;

  const lower = raw.toLowerCase();

  if (lower.includes('no authenticated') || lower.includes('sign in')) {
    return dashboardLoadCopy.signInRequired;
  }

  if (lower.includes('organization id is missing') || lower.includes('org_id')) {
    return dashboardLoadCopy.missingOrganization;
  }

  if (
    lower.includes('no company found') ||
    lower.includes('no companies') ||
    lower.includes('has no companies')
  ) {
    return dashboardLoadCopy.noCompanies;
  }

  if (lower.includes('0 branches') || lower.includes('no branches')) {
    return dashboardLoadCopy.noBranches;
  }

  if (
    lower.includes('companies api failed') ||
    lower.includes('unable to load organization companies')
  ) {
    return dashboardLoadCopy.unableToLoadCompanies;
  }

  if (lower.includes('branches api failed')) {
    return dashboardLoadCopy.unableToLoadBranches;
  }

  if (lower.includes('unable to load') && lower.includes('dashboard')) {
    return dashboardLoadCopy.unableToLoadDashboard;
  }

  if (API_LEAK_PATTERN.test(raw)) {
    return dashboardLoadCopy.unableToLoadDashboard;
  }

  return raw;
}

export function summarizeUserFacingLoadErrors(errors: readonly string[]): string | null {
  const unique = [
    ...new Set(
      errors
        .map((error) => toUserFacingDashboardError(error))
        .filter((message) => message.length > 0),
    ),
  ];

  if (unique.length === 0) return null;
  return unique.join(' ');
}
