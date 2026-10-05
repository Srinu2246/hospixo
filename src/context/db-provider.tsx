'use client';

import type { ReactNode } from 'react';

/** PowerSync is not wired in hospixo_client yet — passthrough wrapper. */
export function DbProvider({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
