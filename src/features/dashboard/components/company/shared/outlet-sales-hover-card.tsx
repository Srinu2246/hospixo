'use client';

import { MetricHoverCard } from '@/features/dashboard/components/shared/metric-hover-card';
import type { OutletSalesRow } from '@/features/dashboard/types';
import { formatCurrency } from '@/features/dashboard/lib/format';

type OutletSalesHoverCardProps = Readonly<{
  row: OutletSalesRow;
  placement?: 'start' | 'center' | 'end';
  sx?: object;
}>;

const fields: ReadonlyArray<{
  label: string;
  value: (row: OutletSalesRow) => string;
}> = [
  { label: 'Orders', value: (row) => String(row.orders) },
  { label: 'Sales', value: (row) => formatCurrency(row.sales) },
  { label: 'Net Sales', value: (row) => formatCurrency(row.netSales) },
  { label: 'Tax', value: (row) => formatCurrency(row.tax) },
  { label: 'Discount', value: (row) => formatCurrency(row.discount) },
  { label: 'Modified', value: (row) => String(row.modified) },
  { label: 'Re-printed', value: (row) => String(row.reprinted) },
  { label: 'Waived Charges', value: (row) => formatCurrency(row.waivedCharges) },
];

export function OutletSalesHoverCard({ row, placement = 'center', sx }: OutletSalesHoverCardProps) {
  const items = fields.map((field) => ({
    label: field.label,
    value: field.value(row),
  }));

  return <MetricHoverCard title={row.outletName} items={items} placement={placement} sx={sx} />;
}
