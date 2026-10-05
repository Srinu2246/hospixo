export type DashboardMetric = Readonly<{
  amount: number;
  currency: string;
  changePercent: number;
  changeLabel: string;
}>;

export type DashboardOutlet = Readonly<{
  id: string;
  name: string;
}>;

export type DashboardCompany = Readonly<{
  id: string;
  name: string;
}>;

export type OutletSalesRow = Readonly<{
  outletId: string;
  outletName: string;
  orders: number;
  sales: number;
  netSales: number;
  tax: number;
  discount: number;
  modified: number;
  reprinted: number;
  waivedCharges: number;
}>;

export type DashboardBreakdownItem = Readonly<{
  label: string;
  amount: number;
  color: string;
  shareLabel?: string;
}>;

export type DashboardExpenseItem = Readonly<{
  label: string;
  amount: number;
}>;

export type DashboardLeakageStat = Readonly<{
  label: string;
  value: number | string;
  tone?: 'danger';
}>;

export type DashboardLeakageGroup = Readonly<{
  items: readonly DashboardLeakageStat[];
}>;

export type DashboardBranchStats = Readonly<{
  total: number;
  active: number;
}>;

export type DashboardOverview = Readonly<{
  outlets: DashboardOutlet[];
  kpis: {
    totalSales: DashboardMetric;
    netSales: DashboardMetric;
    onlineSales: DashboardMetric;
    offlineSales: DashboardMetric;
  };
  branchStats: DashboardBranchStats;
  salesByOutlet: OutletSalesRow[];
  taxSummary: {
    total: number;
    items: DashboardBreakdownItem[];
  };
  discountsSummary: {
    total: number;
    items: DashboardBreakdownItem[];
  };
  revenueForecast: {
    total: number;
    confidence: string;
    series: readonly number[];
  };
  customerInsights: {
    newCustomerRate: number;
    averageOrderValue: number;
    aovChangePercent: number;
    peakHours: readonly (readonly number[])[];
  };
  expenses: {
    total: number;
    items: DashboardExpenseItem[];
  };
  leakage: {
    kots: DashboardLeakageGroup;
    bills: DashboardLeakageGroup;
  };
  accountManager: {
    name: string;
    phone: string;
    online: boolean;
    supportId: string;
    supportHours: string;
    supportMessage: string;
  };
}>;

export type {
  BranchDashboardDisplayData,
  BranchDashboardOverview,
  BranchDashboardPeriod,
  BranchOnlinePlatformRow,
  BranchOrderTypeRow,
} from './branch-dashboard';

export type {
  OrganisationAccountManager,
  OrganisationAlert,
  OrganisationBranchRank,
  OrganisationCompanyPerformanceRow,
  OrganisationCompanyStatus,
  OrganisationDashboardKpi,
  OrganisationDashboardOverview,
  OrganisationDashboardQuery,
  OrganisationDashboardViewMode,
  OrganisationFinancialSlice,
  OrganisationInsight,
  OrganisationCompanyChartPoint,
  OrganisationPerformanceMetricId,
  OrganisationUsageStat,
} from './organisation-dashboard';
