import type { Metadata } from 'next';

import { CreateCustomTemplateRouteView } from '@/features/user-roles/components/create-template/create-custom-template-route';

export const metadata: Metadata = { title: 'Create Custom Template' };

export default function CreateCustomTemplateRoute() {
  return <CreateCustomTemplateRouteView />;
}
