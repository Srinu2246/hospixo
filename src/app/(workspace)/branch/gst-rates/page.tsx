import type { Metadata } from 'next';
import { GstRatesPage } from '@/features/gst-rates';
import { branchGstRatesPageConfig } from '@/features/gst-rates/config/gst-rates-page-config';

export const metadata: Metadata = {
  title: 'GST Rates | Hospixo',
  description: 'View and manage GST slabs for this branch.',
};

export default function BranchGstRatesPage() {
  return <GstRatesPage pageConfig={branchGstRatesPageConfig} />;
}
