import { GrowthBook } from '@growthbook/growthbook-react';
import type { SidebarSession } from '@/lib/auth/session';
import { useFeatureFlagStore } from '@/stores/featureFlagStore';
import type { GrowthBookAttributes, FlagJSONValue } from './types';
import { DEFAULT_FEATURE_FLAGS } from './types';

let growthbookInstance: GrowthBook | null = null;

export function getGrowthBookClientKey(): string {
  return (
    process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY || process.env.VITE_GROWTHBOOK_CLIENT_KEY || ''
  );
}

export function getGrowthBookApiHost(): string {
  return process.env.NEXT_PUBLIC_GROWTHBOOK_API_HOST || 'https://cdn.growthbook.io';
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

/**
 * Returns the singleton GrowthBook instance on the client.
 */
export function getGrowthBook(initialAttributes?: GrowthBookAttributes): GrowthBook {
  if (typeof window === 'undefined') {
    return new GrowthBook({
      apiHost: getGrowthBookApiHost(),
      clientKey: getGrowthBookClientKey(),
      attributes: initialAttributes ?? {},
    });
  }

  if (!growthbookInstance) {
    growthbookInstance = new GrowthBook({
      apiHost: getGrowthBookApiHost(),
      clientKey: getGrowthBookClientKey(),
      attributes: initialAttributes ?? {},
      enableDevMode: process.env.NODE_ENV === 'development',
    });
  } else if (initialAttributes) {
    growthbookInstance.updateAttributes(initialAttributes);
  }

  return growthbookInstance;
}

/**
 * Syncs evaluated feature flags and values from GrowthBook into the Zustand store.
 * Components subscribed to the store avoid re-evaluating flags on every render.
 */
export function syncGrowthBookToStore(gb: GrowthBook): void {
  const features = gb.getFeatures();
  const flags: Record<string, boolean> = {};
  const values: Record<string, FlagJSONValue> = {};

  // Include known default flags
  for (const key of Object.keys(DEFAULT_FEATURE_FLAGS)) {
    flags[key] = gb.isOn(key);
    values[key] = gb.getFeatureValue(key, null);
  }

  // Include all features returned by GrowthBook
  for (const key of Object.keys(features)) {
    flags[key] = gb.isOn(key);
    values[key] = gb.getFeatureValue(key, null);
  }

  useFeatureFlagStore.getState().setFlags(flags, values);
}

/**
 * Initializes GrowthBook features and connects to real-time streaming (SSE).
 * Toggles and rule changes in the GrowthBook dashboard reflect immediately.
 */
export async function initGrowthBook(gb: GrowthBook): Promise<void> {
  const clientKey = getGrowthBookClientKey();
  if (!clientKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[GrowthBook] NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY is missing. Feature flags will use fallback defaults.',
      );
    }
    syncGrowthBookToStore(gb);
    return;
  }

  try {
    await gb.init({ streaming: true });
    syncGrowthBookToStore(gb);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[GrowthBook] Initialization failed, using fallbacks:', error);
    }
    syncGrowthBookToStore(gb);
  }
}

/**
 * Refreshes feature flags on demand from the GrowthBook API.
 */
export async function refreshGrowthBook(gb?: GrowthBook): Promise<void> {
  const client = gb ?? growthbookInstance;
  if (!client) return;

  try {
    await client.refreshFeatures();
    syncGrowthBookToStore(client);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[GrowthBook] Refresh failed:', error);
    }
  }
}

/**
 * Imperative check for evaluating a flag outside React components.
 */
export function evalFeatureFlag(key: string, defaultValue?: boolean): boolean {
  const gb = growthbookInstance ?? getGrowthBook();
  const result = gb.evalFeature(key);

  if (result.source === 'unknownFeature' || result.value === null || result.value === undefined) {
    return defaultValue ?? DEFAULT_FEATURE_FLAGS[key] ?? false;
  }

  return Boolean(result.on);
}
