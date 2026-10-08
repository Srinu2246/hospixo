export type GstRateId = string; // NOSONAR

export type GstRateApi = Readonly<{
  id: number;
  organization_id?: number;
  company_id?: number;
  code: string;
  name: string;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
  total_rate: number;
  effective_from: string;
  effective_to: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
}>;

export type CreateGstRateApiRequest = Readonly<{
  code: string;
  name: string;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
  total_rate: number;
  effective_from: string;
  effective_to?: string | null;
}>;

export type ListGstRatesApiQuery = Readonly<{
  code?: string;
  active_only?: boolean;
}>;
