import type { Metadata } from 'next';
import { GstRatesPage } from '@/features/gst-rates';
import { companyGstRatesPageConfig } from '@/features/gst-rates';

export const metadata: Metadata = {
  title: 'GST Rates | Hospixo',
  description: 'Configure GST slabs used across menu items and billing.',
};

export default function CompanyGstRatesPage() {
  return <GstRatesPage pageConfig={companyGstRatesPageConfig} />;
}
