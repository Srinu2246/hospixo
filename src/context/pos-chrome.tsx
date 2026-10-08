'use client';

import { createContext, useContext, type ReactNode } from 'react';

/**
 * When POS screens sit inside AccessShell (captain / cashier / branch chrome),
 * hide the inner PosOperationsShell / PosFlowShell sidebars to avoid double nav.
 */
export type PosChromeMode = 'standalone' | 'embedded';

const PosChromeContext = createContext<PosChromeMode>('standalone');

export function PosChromeProvider({
  mode,
  children,
}: Readonly<{ mode: PosChromeMode; children: ReactNode }>) {
  return <PosChromeContext.Provider value={mode}>{children}</PosChromeContext.Provider>;
}

export function usePosChromeMode(): PosChromeMode {
  return useContext(PosChromeContext);
}
