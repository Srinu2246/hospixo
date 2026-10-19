export type DashboardLevel = 'organization' | 'company' | 'branch';

export interface DashboardStatItem {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  trend?: {
    value: string;
    isPositive: boolean;
    periodText: string;
  };
  iconType: 'sales' | 'net' | 'companies' | 'branches' | 'online' | 'offline';
}

export interface CompanyPerformanceRow {
  id: string;
  companyName: string;
  branches: number;
  revenue: string;
  revenueNumeric: number;
  orders: string;
  expenses: string;
  profit: string;
  isProfitPositive: boolean;
  status: 'active' | 'warning' | 'inactive';
}

export interface OutletPerformanceRow {
  id: string;
  outletName: string;
  orders: number;
  sales: string;
  netSales: string;
  tax: string;
  discount: string;
}

export interface TaxItem {
  label: string;
  rate?: string;
  amount: string;
  color: string;
  percentage: number;
}

export interface DiscountItem {
  label: string;
  amount: string;
  color: string;
  percentage: number;
}

export interface FinancialBreakdownItem {
  label: string;
  amount: string;
  percentage: number;
  color: string;
}

export interface TopPerformingBranch {
  rank: number;
  name: string;
  companyName: string;
  revenue: string;
}

export interface SubscriptionUsageData {
  planName: string;
  status: 'Active' | 'Trial' | 'Expired';
  billingCycle: string;
  renewalDate?: string;
  metrics: {
    label: string;
    used: number;
    total: number;
    unit?: string;
  }[];
}

export interface NeedsAttentionItem {
  id: string;
  message: string;
  timestamp: string;
  type: 'budget' | 'license' | 'approval' | 'sync';
}

export interface AiBusinessInsight {
  id: string;
  title: string;
  confidence: number;
}

export interface AccountManagerInfo {
  id: string;
  name: string;
  avatarUrl: string;
  status: 'Online Now' | 'Away' | 'Offline';
  description: string;
  availableHours: string;
  phoneWhatsapp: string;
}

export interface LeakageStats {
  kots: {
    cancelled: number;
    modified: number;
    shifted: number;
    notUsedInBills: number;
  };
  bills: {
    modified: number;
    reprinted: number;
    knockedOffAmount: string;
  };
}

export interface ExpenseItem {
  category: string;
  amount: string;
}

export interface OutletChartBarItem {
  label: string;
  heightPercent: number;
  isHighlight: boolean;
}

export interface PaymentModeItem {
  label: string;
  color: string;
  amount: string;
}

export interface OnlineAggregatorItem {
  name: string;
  iconColor: string;
  orders: number;
}

export interface ChannelCardItem {
  id: string;
  title: string;
  amount: string;
  orders: string;
  icon: 'dine-in' | 'take-away' | 'delivery';
  color: string;
  bgColor: string;
}

export enum DateRangeOption {
  TODAY = 'Today',
  YESTERDAY = 'Yesterday',
  THIS_WEEK = 'This Week (Mon - Sun)',
  LAST_7_DAYS = 'Last 7 Days (28 Jun - 4 Jul 2025)',
  THIS_MONTH = 'This Month',
  LAST_MONTH = 'Last Month',
  CUSTOM_RANGE = 'Custom Range...',
}

export enum PeriodOption {
  TODAY = 'Today',
  YESTERDAY = 'Yesterday',
  LAST_7_DAYS = 'Last 7 Days',
  THIS_MONTH = 'This Month',
}
