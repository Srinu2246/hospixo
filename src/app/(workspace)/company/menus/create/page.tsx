import type { Metadata } from 'next';
import { SessionFormPage } from '@/features/menus';

export const metadata: Metadata = {
  title: 'Create Menus | Hospixo',
  description: 'Create a meal session with a time range and operating days.',
};

export default function CreateCompanyMenuPage() {
  return <SessionFormPage mode="create" />;
}
