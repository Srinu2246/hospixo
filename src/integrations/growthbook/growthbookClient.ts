import { GrowthBook } from '@growthbook/growthbook-react';

import type { SidebarSession } from '@/lib/auth/session';

import type { GrowthBookAttributes } from './types';
import { DEFAULT_FEATURE_FLAGS } from './types';

let growthbookInstance: GrowthBook | null = null;

export function getGrowthBookClientKey(): string {
  return process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY?.trim() || '';
}

export function getGrowthBookApiHost(): string {
  return process.env.NEXT_PUBLIC_GROWTHBOOK_API_HOST?.trim() || '';
}

/**
 * Maps the application's auth session and organization/branch context
 * into GrowthBook targeting attributes.
 */
export function buildGrowthBookAttributes(
  session?: Partial<SidebarSession> | null,
): GrowthBookAttributes {
  if (!session) return {};

  const account = session.account;
  const context = session.context;
  const user = session.user;

  const id = account?.id ? String(account.id) : undefined;
  const email = account?.email || user?.email || undefined;
  const role = session.role || account?.roles?.[0] || undefined;
  const scope = account?.scope || undefined;

  const companyId =
    context?.companyId !== undefined
      ? String(context.companyId)
      : account?.company_id !== undefined
        ? String(account.company_id)
        : undefined;

  const branchId =
    context?.branchId !== undefined
      ? String(context.branchId)
      : account?.branch_id !== undefined
        ? String(account.branch_id)
        : undefined;

  const organizationId =
    context?.organizationId !== undefined
      ? String(context.organizationId)
      : account?.org_id !== undefined
        ? String(account.org_id)
        : undefined;

  return {
    id,
    userId: id,
    email,
    role,
    scope,
    companyId,
    branchId,
    organizationId,
  };
}

function growthBookConfig(initialAttributes?: GrowthBookAttributes) {
  const apiHost = getGrowthBookApiHost();
  const clientKey = getGrowthBookClientKey();

  return {
    ...(apiHost ? { apiHost } : {}),
    ...(clientKey ? { clientKey } : {}),
    attributes: initialAttributes ?? {},
  };
}

/** Singleton GrowthBook client (browser). SSR gets a fresh instance. */
export function getGrowthBook(initialAttributes?: GrowthBookAttributes): GrowthBook {
  if (typeof window === 'undefined') {
    return new GrowthBook(growthBookConfig(initialAttributes));
  }

  if (!growthbookInstance) {
    growthbookInstance = new GrowthBook({
      ...growthBookConfig(initialAttributes),
      enableDevMode: process.env.NODE_ENV === 'development',
    });
  } else if (initialAttributes) {
    growthbookInstance.updateAttributes(initialAttributes);
  }

  return growthbookInstance;
}

/**
 * Loads features and enables streaming so dashboard toggles apply live.
 * GrowthBookProvider handles React re-renders — no Zustand mirror.
 */
export async function initGrowthBook(gb: GrowthBook): Promise<void> {
  const clientKey = getGrowthBookClientKey();
  const apiHost = getGrowthBookApiHost();
  if (!clientKey || !apiHost) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[GrowthBook] NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY or NEXT_PUBLIC_GROWTHBOOK_API_HOST is missing. Feature flags will use fallback defaults.',
      );
    }
    return;
  }

  try {
    await gb.init({ streaming: true });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[GrowthBook] Initialization failed, using fallbacks:', error);
    }
  }
}

/** Refreshes feature definitions from the GrowthBook API. */
export async function refreshGrowthBook(gb?: GrowthBook): Promise<void> {
  const client = gb ?? growthbookInstance;
  if (!client) return;

  const clientKey = getGrowthBookClientKey();
  const apiHost = getGrowthBookApiHost();
  if (!clientKey || !apiHost) return;

  try {
    await client.refreshFeatures();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[GrowthBook] Refresh failed:', error);
    }
  }
}

/** Imperative flag check outside React (prefer useFeatureFlag in components). */
export function evalFeatureFlag(key: string, defaultValue?: boolean): boolean {
  const gb = growthbookInstance ?? getGrowthBook();
  const result = gb.evalFeature(key);

  if (result.source === 'unknownFeature' || result.value === null || result.value === undefined) {
    return defaultValue ?? DEFAULT_FEATURE_FLAGS[key] ?? false;
  }

  return Boolean(result.on);
}
