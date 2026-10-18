export type KnownFeatureFlag = 'new-test-generation' | (string & {});

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
 * Safe default values when GrowthBook is offline, network fails, or flag is unset.
 */
export const DEFAULT_FEATURE_FLAGS: Record<string, boolean> = {
  'new-test-generation': false,
};
