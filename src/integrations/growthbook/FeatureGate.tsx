'use client';

import type { ReactNode } from 'react';
import type { FeatureFlagKey } from './types';
import { useFeatureFlag } from './useFeatureFlag';

export type FeatureGateProps = {
  flag: FeatureFlagKey;
  fallback?: ReactNode;
  children: ReactNode;
  invert?: boolean;
};

/**
 * Declarative component for rendering features conditionally based on feature flags.
 *
 * @example
 * <FeatureGate flag="new-test-generation" fallback={<LegacyComponent />}>
 *   <NewTestGenerationComponent />
 * </FeatureGate>
 */
export function FeatureGate({ flag, fallback = null, children, invert = false }: FeatureGateProps) {
  const isEnabled = useFeatureFlag(flag);
  const shouldShow = invert ? !isEnabled : isEnabled;

  if (!shouldShow) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
