'use client';

import { usePosBreakpoint } from '@/features/pos/hooks/use-pos-breakpoint';

interface ResponsivePosContentProps<T extends object> {
  desktop: React.ComponentType<T>;
  tablet: React.ComponentType<T>;
  mobile: React.ComponentType<T>;
  props: T;
}

export function ResponsivePosContent<T extends object>({
  desktop: Desktop,
  tablet: Tablet,
  mobile: Mobile,
  props,
}: Readonly<ResponsivePosContentProps<T>>) {
  const breakpoint = usePosBreakpoint();

  if (breakpoint === 'mobile') return <Mobile {...props} />;
  if (breakpoint === 'tablet') return <Tablet {...props} />;
  return <Desktop {...props} />;
}
