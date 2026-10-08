import type { Metadata } from 'next';
import { PreparationStationsPage } from '@/features/preparation-stations';
import { companyPreparationStationsPageConfig } from '@/features/preparation-stations';

export const metadata: Metadata = {
  title: 'Preparation Stations | Hospixo',
  description: 'Configure kitchen prep stations used for routing menu items and KOT tickets.',
};

export default function CompanyPreparationStationsPage() {
  return <PreparationStationsPage pageConfig={companyPreparationStationsPageConfig} />;
}
