import { FEATURE_FLAG_DEFAULTS, type FeatureFlagName } from './featureFlags';

export type KnownFeatureFlag = FeatureFlagName | 'new-test-generation' | (string & {});

export type FeatureFlagKey = KnownFeatureFlag;

export type FlagJSONValue =
  string | number | boolean | null | { [key: string]: FlagJSONValue } | FlagJSONValue[];

export type GrowthBookAttributes = {
  id?: string;
  userId?: string;
  email?: string;
  role?: string;
  scope?: string;
  companyId?: string;
  branchId?: string;
  organizationId?: string;
  device?: 'desktop' | 'mobile' | 'tablet';
  [key: string]: unknown;
};

/**
 * Safe defaults when GrowthBook is offline, network fails, or a flag is unset.
 * Nav flags come from FEATURE_FLAG_DEFAULTS (VERSION_1 MVP).
 */
export const DEFAULT_FEATURE_FLAGS: Record<string, boolean> = {
  ...FEATURE_FLAG_DEFAULTS,
  'new-test-generation': false,
};
