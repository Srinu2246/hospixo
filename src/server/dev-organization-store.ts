import 'server-only';

import { organizationFallbackList } from '@/constants/organizations';
import type {
  OrganizationCreateFormData,
  OrganizationCreateResult,
} from '@/types/organization-create';
import type { OrganizationListResult, OrganizationSummary } from '@/types/organization';

type DraftRecord = Readonly<{
  form: OrganizationCreateFormData;
  updatedAt: string;
}>;

const draftForms = new Map<string, DraftRecord>();
let createdOrganizations: OrganizationSummary[] = [];

function slugId(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return base || `org-${Date.now()}`;
}

function uniqueId(base: string): string {
  let id = base;
  let n = 1;
  const all = allSummaries();
  while (all.some((org) => org.id === id)) {
    id = `${base}-${n++}`;
  }
  return id;
}

function allSummaries(): OrganizationSummary[] {
  return [...organizationFallbackList.items, ...createdOrganizations];
}

function summaryFromDraft(id: string, form: OrganizationCreateFormData): OrganizationSummary {
  return {
    id,
    name: form.details.name.trim() || 'Untitled draft',
    status: 'draft',
    plan: form.commercial.planPublicId || '—',
    industry: 'Hospitality',
    companyCount: 0,
    branchCount: 0,
    createdAt: draftForms.get(id)?.updatedAt ?? new Date().toISOString(),
  };
}

export function listOrganizationsForAdmin(): OrganizationListResult {
  const draftSummaries = [...draftForms.entries()].map(([id, record]) =>
    summaryFromDraft(id, record.form),
  );
  const active = allSummaries().filter((org) => org.status !== 'draft');
  const items = [...active, ...draftSummaries];
  return {
    items,
    total: items.length,
    page: 1,
    pageSize: Math.max(10, items.length),
  };
}

export function saveOrganizationDraftRecord(
  form: OrganizationCreateFormData,
  draftOrganizationId?: string | null,
): string {
  const id = draftOrganizationId?.trim() || uniqueId(slugId(form.details.name));
  draftForms.set(id, { form, updatedAt: new Date().toISOString() });
  return id;
}

export function loadOrganizationDraftForm(
  organizationId: string,
): OrganizationCreateFormData | null {
  return draftForms.get(organizationId)?.form ?? null;
}

export function createOrganizationFromForm(
  form: OrganizationCreateFormData,
  draftOrganizationId?: string | null,
): OrganizationCreateResult {
  const id = draftOrganizationId?.trim() || uniqueId(slugId(form.details.name || 'organization'));
  draftForms.delete(id);

  const planLabel =
    form.commercial.planPublicId.charAt(0).toUpperCase() + form.commercial.planPublicId.slice(1);

  const summary: OrganizationSummary = {
    id,
    name: form.details.name.trim(),
    status: 'active',
    plan: planLabel || 'Growth',
    industry: 'Hospitality',
    companyCount: 0,
    branchCount: 0,
    createdAt: new Date().toISOString(),
  };

  createdOrganizations = [summary, ...createdOrganizations.filter((org) => org.id !== id)];

  const createdAt = summary.createdAt;
  return {
    organizationId: id,
    organizationName: summary.name,
    status: summary.status,
    plan: `${planLabel} Plan`,
    createdAt,
    data: {
      organization_id: id,
      name: summary.name,
      admin_email: form.admin.email.trim(),
    },
    source: 'local',
  };
}
