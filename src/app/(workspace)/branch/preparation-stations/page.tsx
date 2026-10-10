import type { Metadata } from 'next';
import { PreparationStationsPage } from '@/features/preparation-stations';
import { branchPreparationStationsPageConfig } from '@/features/preparation-stations/config/preparation-stations-page-config';

export const metadata: Metadata = {
  title: 'Preparation Stations | Hospixo',
  description: 'Configure kitchen prep stations for this branch.',
};

export default function BranchPreparationStationsPage() {
  return <PreparationStationsPage pageConfig={branchPreparationStationsPageConfig} />;
}
