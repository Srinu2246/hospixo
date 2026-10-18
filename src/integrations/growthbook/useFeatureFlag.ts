'use client';

import { useFeatureFlagStore } from '@/stores/featureFlagStore';
import type { FeatureFlagKey, FlagJSONValue } from './types';
import { DEFAULT_FEATURE_FLAGS } from './types';

/**
 * Returns whether a feature flag is enabled directly from the Zustand store.
 * Subscribes to the specific flag key so the component only re-renders
 * when this flag changes, avoiding redundant SDK evaluations.
 */
export function useFeatureFlag(key: FeatureFlagKey, fallbackValue?: boolean): boolean {
  return useFeatureFlagStore((state) => {
    const flagVal = state.flags[key];
    if (flagVal !== undefined) return flagVal;
    return fallbackValue ?? DEFAULT_FEATURE_FLAGS[key] ?? false;
  });
}

/**
 * Returns the typed value of a feature flag directly from the Zustand store.
 */
export function useFeatureFlagValue<T extends FlagJSONValue>(
  key: FeatureFlagKey,
  fallbackValue: T,
): T {
  return useFeatureFlagStore((state) => {
    const value = state.values[key];
    if (value !== undefined && value !== null) {
      return value as T;
    }
    return fallbackValue;
  });
}
