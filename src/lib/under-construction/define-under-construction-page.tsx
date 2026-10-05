import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { UnderConstructionPage } from '@/components/common/under-construction/under-construction-page';
import {
  getUnderConstructionRoute,
  type UnderConstructionPath,
} from '@/config/shell/under-construction-routes';

type UnderConstructionPageModule = Readonly<{
  metadata: Metadata;
  default: () => ReactElement;
}>;

export function defineUnderConstructionPage(
  path: UnderConstructionPath,
): UnderConstructionPageModule {
  const def = getUnderConstructionRoute(path);
  if (!def) {
    throw new Error(`Missing under-construction route definition for "${path}"`);
  }

  return {
    metadata: { title: def.title },
    default: function UnderConstructionRoutePage() {
      return <UnderConstructionPage title={def.title} subtitle={def.subtitle} />;
    },
  };
}
