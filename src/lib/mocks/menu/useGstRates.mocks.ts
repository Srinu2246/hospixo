import { gstRateListSchema, type GstRate } from '@/lib/schemas/menu/gstRatesSchema';

/** Seed GST slabs for the GST Rates list (company / branch). */
export const MOCK_GST_RATES: GstRate[] = gstRateListSchema.parse([
  {
    id: 'gst_001',
    code: 'GST_2',
    name: 'Main course',
    cgst: 2.5,
    sgst: 2.5,
    igst: 5,
    total: 10,
    effectiveFrom: '2026-10-12',
    active: true,
  },
  {
    id: 'gst_002',
    code: 'ITM',
    name: 'starters',
    cgst: 1.5,
    sgst: 1.5,
    igst: 2,
    total: 5,
    effectiveFrom: '2026-10-08',
    active: true,
  },
]);
