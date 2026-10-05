import fs from "node:fs";
import path from "node:path";

const appDir = path.join(import.meta.dirname, "..", "app");

const routes = `(auth)/login
(auth)/mfa
(auth)/sso
(control-plane)/audit
(control-plane)/companies
(control-plane)/companies/[companyId]
(control-plane)/companies/[companyId]/audit-log
(control-plane)/companies/[companyId]/branches
(control-plane)/companies/[companyId]/branches/add
(control-plane)/companies/[companyId]/branches/add/branch-data
(control-plane)/companies/[companyId]/branches/add/complete
(control-plane)/companies/[companyId]/branches/add/departments
(control-plane)/companies/[companyId]/branches/add/review
(control-plane)/companies/[companyId]/branches/add/staff-assignment
(control-plane)/companies/[companyId]/integrations
(control-plane)/companies/[companyId]/modules
(control-plane)/companies/[companyId]/overview
(control-plane)/companies/[companyId]/subscriptions
(control-plane)/companies/[companyId]/users
(control-plane)/dashboard
(control-plane)/feature-flags
(control-plane)/finance
(control-plane)/invoices
(control-plane)/onboarding
(control-plane)/onboarding/create
(control-plane)/onboarding/create/company
(control-plane)/onboarding/create/complete
(control-plane)/onboarding/create/contact-location
(control-plane)/onboarding/create/review
(control-plane)/onboarding/create/subscription
(control-plane)/onboarding/create/tax-compliance
(control-plane)/operations
(control-plane)/operations/data-imports
(control-plane)/operations/failed-jobs
(control-plane)/operations/integration-health
(control-plane)/operations/tenant-activation
(control-plane)/organizations/(list)
(control-plane)/organizations/[organizationId]
(control-plane)/organizations/[organizationId]/activity
(control-plane)/organizations/[organizationId]/audit-log
(control-plane)/organizations/[organizationId]/branches
(control-plane)/organizations/[organizationId]/branches/[branchId]
(control-plane)/organizations/[organizationId]/branches/[branchId]/overview
(control-plane)/organizations/[organizationId]/branches/[branchId]/settings
(control-plane)/organizations/[organizationId]/branches/add
(control-plane)/organizations/[organizationId]/branches/add/branch-data
(control-plane)/organizations/[organizationId]/branches/add/complete
(control-plane)/organizations/[organizationId]/branches/add/departments
(control-plane)/organizations/[organizationId]/branches/add/review
(control-plane)/organizations/[organizationId]/branches/add/staff-assignment
(control-plane)/organizations/[organizationId]/companies
(control-plane)/organizations/[organizationId]/companies/[companyId]
(control-plane)/organizations/[organizationId]/companies/[companyId]/audit-log
(control-plane)/organizations/[organizationId]/companies/[companyId]/branches
(control-plane)/organizations/[organizationId]/companies/[companyId]/integrations
(control-plane)/organizations/[organizationId]/companies/[companyId]/modules
(control-plane)/organizations/[organizationId]/companies/[companyId]/overview
(control-plane)/organizations/[organizationId]/companies/[companyId]/subscriptions
(control-plane)/organizations/[organizationId]/companies/[companyId]/users
(control-plane)/organizations/[organizationId]/overview
(control-plane)/organizations/[organizationId]/settings
(control-plane)/organizations/[organizationId]/subscription
(control-plane)/organizations/create
(control-plane)/organizations/create/commercial
(control-plane)/organizations/create/complete
(control-plane)/organizations/create/details
(control-plane)/organizations/create/draft/[organizationId]
(control-plane)/organizations/create/drafts
(control-plane)/organizations/create/review
(control-plane)/payments
(control-plane)/plans
(control-plane)/products
(control-plane)/release-management
(control-plane)/security
(control-plane)/settings
(control-plane)/subscriptions/(list)
(control-plane)/subscriptions/[planId]
(control-plane)/subscriptions/[planId]/edit
(control-plane)/subscriptions/create
(control-plane)/subscriptions/create/complete
(control-plane)/subscriptions/create/features
(control-plane)/subscriptions/create/review
(control-plane)/support
(control-plane)/support/customer-search
(control-plane)/support/impersonation-requests
(control-plane)/support/tickets
(control-plane)/system-health`;

const SKIP = new Set([
  "(control-plane)/dashboard",
  "(control-plane)/organizations/(list)",
  "(control-plane)/settings",
  "(auth)/login",
]);

function toTitle(routePath) {
  const segments = routePath
    .replace(/^\(control-plane\)\//, "")
    .replace(/^\(auth\)\//, "")
    .split("/")
    .filter((s) => !s.startsWith("(") && !s.startsWith("["));
  if (segments.length === 0) return "Admin";
  return segments
    .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" — ");
}

function pageContent(title) {
  const safe = title.replace(/"/g, '\\"');
  return `import PagePlaceholder from "@/components/page/PagePlaceholder";

export default function Page() {
  return <PagePlaceholder title="${safe}" />;
}
`;
}

for (const route of routes.trim().split("\n")) {
  if (SKIP.has(route)) continue;
  const dir = path.join(appDir, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "page.tsx"), pageContent(toTitle(route)));
}

console.log("Generated placeholder pages (skipped custom routes).");
