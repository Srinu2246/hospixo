export type OrganisationPerformanceMetricId = 'total-sales' | 'revenue' | 'orders' | 'profit';

export type OrganisationDashboardViewMode = 'chart' | 'list';

export type OrganisationDateRangeId = 'today' | 'last-7-days' | 'last-30-days' | 'custom';

export type OrganisationCompanyStatus = 'active' | 'warning' | 'inactive';

export type OrganisationDashboardQuery = Readonly<{
  metric?: OrganisationPerformanceMetricId;
  view?: OrganisationDashboardViewMode;
  range?: OrganisationDateRangeId;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}>;

export type OrganisationDashboardKpi = Readonly<{
  id: string;
  label: string;
  value: string;
  changePercent?: number;
  changeLabel?: string;
  helperText?: string;
}>;

export type OrganisationCompanyPerformanceRow = Readonly<{
  id: string;
  companyName: string;
  branches: number;
  revenue: number;
  orders: number;
  expenses: number;
  profit: number;
  status: OrganisationCompanyStatus;
  href?: string;
}>;

export type OrganisationCompanyChartPoint = Readonly<{
  id: string;
  label: string;
  value: number;
}>;

export type OrganisationFinancialSlice = Readonly<{
  id: string;
  label: string;
  percent: number;
  amount: number;
  tone: 'cogs' | 'expenses' | 'profit' | 'taxes';
}>;

export type OrganisationBranchRank = Readonly<{
  id: string;
  rank: number;
  branchName: string;
  companyName: string;
  revenue: number;
}>;

export type OrganisationUsageStat = Readonly<{
  id: string;
  label: string;
  used: number;
  limit: number;
  unit?: string;
}>;

export type OrganisationAlert = Readonly<{
  id: string;
  title: string;
  occurredAt: string;
  severity: 'critical' | 'warning';
  href?: string;
}>;

export type OrganisationInsight = Readonly<{
  id: string;
  title: string;
  confidence: number;
}>;

export type OrganisationAccountManager = Readonly<{
  name: string;
  role: string;
  avatarInitials: string;
  isOnline: boolean;
  employeeId: string;
  availability: string;
  whatsappPhone: string;
}>;

export type OrganisationDashboardOverview = Readonly<{
  dateRangeLabel: string;
  kpis: readonly OrganisationDashboardKpi[];
  performanceMetric: OrganisationPerformanceMetricId;
  performanceRows: readonly OrganisationCompanyPerformanceRow[];
  allPerformanceRows: readonly OrganisationCompanyPerformanceRow[];
  performanceTotal: number;
  performancePage: number;
  performancePageSize: number;
  companySeries: readonly OrganisationCompanyChartPoint[];
  taxSummary: Readonly<{
    total: number;
    items: readonly {
      label: string;
      amount: number;
      color: string;
      shareLabel?: string;
    }[];
  }>;
  financialBreakdown: readonly OrganisationFinancialSlice[];
  topBranches: readonly OrganisationBranchRank[];
  subscription: Readonly<{
    plan: string;
    status: 'active' | 'inactive';
    billingCycle: string;
    renewalDate: string;
    managePlanHref: string;
    usage: readonly OrganisationUsageStat[];
  }>;
  alerts: readonly OrganisationAlert[];
  insights: readonly OrganisationInsight[];
  accountManager: OrganisationAccountManager;
}>;
