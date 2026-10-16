import type { Metadata } from 'next';
import { CreateCustomTemplateScreen } from '@/features/employees/user-roles';

export const metadata: Metadata = {
  title: 'Create Custom Template | Hospixo Platform',
  description:
    'Define a brand new role template from scratch with custom parameters and permissions.',
};

export default function CreateCustomTemplatePage() {
  return <CreateCustomTemplateScreen />;
}
