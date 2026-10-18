import { create } from 'zustand';
import type { FeatureFlagKey, FlagJSONValue } from '@/integrations/growthbook/types';
import { DEFAULT_FEATURE_FLAGS } from '@/integrations/growthbook/types';

export type FeatureFlagStoreState = {
  flags: Record<string, boolean>;
  values: Record<string, FlagJSONValue>;
  isReady: boolean;
  setFlags: (flags: Record<string, boolean>, values?: Record<string, FlagJSONValue>) => void;
  setFlag: (key: string, enabled: boolean, value?: FlagJSONValue) => void;
  isFeatureOn: (key: FeatureFlagKey, defaultValue?: boolean) => boolean;
  getFeatureValue: <T extends FlagJSONValue>(key: FeatureFlagKey, defaultValue: T) => T;
  reset: () => void;
};

/**
 * Global Zustand store holding all feature flag states and values.
 * Components read from this store without re-evaluating flags on every render.
 */
export const useFeatureFlagStore = create<FeatureFlagStoreState>((set, get) => ({
  flags: { ...DEFAULT_FEATURE_FLAGS },
  values: {},
  isReady: false,
  setFlags: (flags, values = {}) =>
    set((state) => ({
      flags: { ...state.flags, ...flags },
      values: { ...state.values, ...values },
      isReady: true,
    })),
  setFlag: (key, enabled, value) =>
    set((state) => ({
      flags: { ...state.flags, [key]: enabled },
      values: value !== undefined ? { ...state.values, [key]: value } : state.values,
    })),
  isFeatureOn: (key, defaultValue) => {
    const current = get().flags[key];
    if (current !== undefined) return current;
    return defaultValue ?? DEFAULT_FEATURE_FLAGS[key] ?? false;
  },
  getFeatureValue: (key, defaultValue) => {
    const current = get().values[key];
    if (current !== undefined && current !== null) {
      return current as typeof defaultValue;
    }
    return defaultValue;
  },
  reset: () =>
    set({
      flags: { ...DEFAULT_FEATURE_FLAGS },
      values: {},
      isReady: false,
    }),
}));
