'use client';

import { useFeatureIsOn, useFeatureValue, useGrowthBook } from '@growthbook/growthbook-react';

import type { FeatureFlagKey, FlagJSONValue } from './types';
import { DEFAULT_FEATURE_FLAGS } from './types';

/**
 * Whether a feature flag is on. Reads from GrowthBook (source of truth).
 * Falls back to defaults when the flag is not yet loaded / unknown.
 */
export function useFeatureFlag(key: FeatureFlagKey, fallbackValue?: boolean): boolean {
  const flagKey = String(key);
  const fallback = fallbackValue ?? DEFAULT_FEATURE_FLAGS[flagKey] ?? false;
  const isOn = useFeatureIsOn(flagKey);
  const gb = useGrowthBook();
  const known = Boolean(gb?.getFeatures()?.[flagKey]);

  if (!known) return fallback;
  return isOn;
}

/**
 * Typed feature value from GrowthBook. Prefer this for non-boolean variants.
 */
export function useFeatureFlagValue<T extends FlagJSONValue>(
  key: FeatureFlagKey,
  fallbackValue: T,
): T {
  return useFeatureValue(String(key), fallbackValue) as T;
}
