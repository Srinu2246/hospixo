export type GstRate = {
  id: string;
  code: string;
  name: string;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  totalRate: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateGstRateInput = {
  code: string;
  name: string;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  totalRate: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
};

export type GstRatesViewMode = 'list' | 'create-rate' | 'view-rate';
