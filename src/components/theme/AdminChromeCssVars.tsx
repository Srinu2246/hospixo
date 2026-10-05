'use client';

import GlobalStyles from '@mui/material/GlobalStyles';

import { adminChromeCssVariableMap } from '@theme/adminChrome';

/**
 * Injects admin shell/auth CSS variables from theme tokens (AGENTS §3).
 */
export default function AdminChromeCssVars() {
  const variables = adminChromeCssVariableMap();

  return (
    <GlobalStyles
      styles={{
        ':root': variables,
      }}
    />
  );
}
