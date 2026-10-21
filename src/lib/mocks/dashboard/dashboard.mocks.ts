import { DateRangeOption, PeriodOption } from '@/features/dashboard/enums';
import type {
  DashboardStatItem,
  CompanyPerformanceRow,
  OutletPerformanceRow,
  TaxItem,
  DiscountItem,
  FinancialBreakdownItem,
  TopPerformingBranch,
  SubscriptionUsageData,
  NeedsAttentionItem,
  AiBusinessInsight,
  AccountManagerInfo,
  LeakageStats,
  ExpenseItem,
  OutletChartBarItem,
  PaymentModeItem,
  OnlineAggregatorItem,
  ChannelCardItem,
} from '@/features/dashboard/types/dashboard.types';

// ==========================================
// 1. ORGANIZATION LEVEL DATA
// ==========================================

export const ORG_STAT_CARDS: DashboardStatItem[] = [
  {
    id: 'org-sales',
    label: 'TOTAL SALES',
    value: '₹48,52,300',
    trend: {
      value: '+12.4%',
      isPositive: true,
      periodText: 'vs last month',
    },
    iconType: 'sales',
  },
  {
    id: 'org-net',
    label: 'NET SALES',
    value: '₹42,18,750',
    trend: {
      value: '+9.8%',
      isPositive: true,
      periodText: 'vs last month',
    },
    iconType: 'net',
  },
  {
    id: 'org-companies',
    label: 'COMPANIES',
    value: '6 Active',
    iconType: 'companies',
  },
  {
    id: 'org-branches',
    label: 'BRANCHES',
    value: '24 Total',
    iconType: 'branches',
  },
];

export const COMPANY_PERFORMANCE_ROWS: CompanyPerformanceRow[] = [
  {
    id: 'cp-1',
    companyName: 'Al Baik Foods Ltd',
    branches: 18,
    revenue: '₹840,000',
    revenueNumeric: 840000,
    orders: '5,420',
    expenses: '₹410,000',
    profit: '₹430,000',
    isProfitPositive: true,
    status: 'active',
  },
  {
    id: 'cp-2',
    companyName: 'Spice Garden Group',
    branches: 12,
    revenue: '₹620,000',
    revenueNumeric: 620000,
    orders: '4,110',
    expenses: '₹350,000',
    profit: '₹270,000',
    isProfitPositive: true,
    status: 'active',
  },
  {
    id: 'cp-3',
    companyName: 'Urban Bites Co',
    branches: 8,
    revenue: '₹480,000',
    revenueNumeric: 480000,
    orders: '3,200',
    expenses: '₹210,000',
    profit: '₹270,000',
    isProfitPositive: true,
    status: 'active',
  },
  {
    id: 'cp-4',
    companyName: 'Fresh Catch Ltd',
    branches: 6,
    revenue: '₹310,000',
    revenueNumeric: 310000,
    orders: '2,090',
    expenses: '₹290,000',
    profit: '₹20,000',
    isProfitPositive: true,
    status: 'warning',
  },
  {
    id: 'cp-5',
    companyName: 'Golden Wok Chain',
    branches: 4,
    revenue: '₹150,000',
    revenueNumeric: 150000,
    orders: '1,600',
    expenses: '₹160,000',
    profit: '-₹10,000',
    isProfitPositive: false,
    status: 'inactive',
  },
  {
    id: 'cp-6',
    companyName: 'Silver Spoon Bistro',
    branches: 3,
    revenue: '₹120,000',
    revenueNumeric: 120000,
    orders: '1,200',
    expenses: '₹130,000',
    profit: '-₹10,000',
    isProfitPositive: false,
    status: 'active',
  },
];

export const ORG_TAX_BREAKDOWN: TaxItem[] = [
  { label: 'CGST (2.5%)', rate: '2.5%', amount: '₹45,200', color: '#1B59F8', percentage: 40.6 },
  { label: 'SGST (2.5%)', rate: '2.5%', amount: '₹45,200', color: '#00BFA5', percentage: 40.6 },
  { label: 'Service Tax', amount: '₹12,500', color: '#8B5CF6', percentage: 11.2 },
  { label: 'VAT', amount: '₹8,400', color: '#F59E0B', percentage: 7.6 },
];

export const ORG_FINANCIAL_BREAKDOWN: FinancialBreakdownItem[] = [
  { label: 'COGS', amount: '₹23,86,500', percentage: 49.2, color: '#4F46E5' },
  { label: 'Expenses', amount: '₹9,86,400', percentage: 20.3, color: '#0EA5E9' },
  { label: 'Profit', amount: '₹8,32,100', percentage: 17.1, color: '#10B981' },
  { label: 'Taxes', amount: '₹2,45,600', percentage: 5.1, color: '#F59E0B' },
];

export const ORG_TOP_BRANCHES: TopPerformingBranch[] = [
  { rank: 1, name: 'Downtown Plaza', companyName: 'Al Baik Foods', revenue: '₹184,200' },
  { rank: 2, name: 'Marina Bay', companyName: 'Spice Garden', revenue: '₹162,100' },
  { rank: 3, name: 'Mall Extension', companyName: 'Al Baik Foods', revenue: '₹145,000' },
  { rank: 4, name: 'Kensington Road', companyName: 'Urban Bites', revenue: '₹123,000' },
  { rank: 5, name: 'Financial Center', companyName: 'Golden Wok', revenue: '₹98,400' },
];

export const ORG_SUBSCRIPTION_USAGE: SubscriptionUsageData = {
  planName: 'Enterprise Pro',
  status: 'Active',
  billingCycle: 'Monthly / 15 Sep 2025',
  renewalDate: '15 Sep 2025',
  metrics: [
    { label: 'Companies', used: 3, total: 10 },
    { label: 'Branches', used: 8, total: 50 },
    { label: 'Storage Used', used: 62, total: 100, unit: 'GB' },
    { label: 'API Calls This Month', used: 45200, total: 100000 },
    { label: 'Active Users', used: 142, total: 200 },
    { label: 'Devices', used: 142, total: 250 },
  ],
};

export const ORG_NEEDS_ATTENTION: NeedsAttentionItem[] = [
  {
    id: 'att-1',
    message: '3 branches exceeded budget threshold',
    timestamp: '2m ago',
    type: 'budget',
  },
  {
    id: 'att-2',
    message: 'License renewal due in 15 days',
    timestamp: '2h ago',
    type: 'license',
  },
  {
    id: 'att-3',
    message: '2 users pending approvals',
    timestamp: '5h ago',
    type: 'approval',
  },
  {
    id: 'att-4',
    message: 'Inventory sync failed at Downtown',
    timestamp: '1d ago',
    type: 'sync',
  },
];

export const ORG_AI_INSIGHTS: AiBusinessInsight[] = [
  {
    id: 'ai-1',
    title:
      'Revenue at Marina Branch increased 34% after menu optimization. Apply to 4 similar branches.',
    confidence: 94,
  },
  {
    id: 'ai-2',
    title: 'Predicted stockout for chicken breast at 3 branches within 5 days.',
    confidence: 88,
  },
  {
    id: 'ai-3',
    title: 'Staff overtime costs up 18%. Shift rebalancing recommended.',
    confidence: 82,
  },
];

export const ACCOUNT_MANAGER: AccountManagerInfo = {
  id: '63284',
  name: 'Kumar Reddy',
  avatarUrl: '/images/kumar_reddy.jpg',
  status: 'Online Now',
  description:
    'Your dedicated account manager for all operational support and billing queries. Reach out anytime during working hours.',
  availableHours: '10:00 AM – 07:00 PM',
  phoneWhatsapp: '+919876543210',
};

// ==========================================
// 2. COMPANY LEVEL DATA
// ==========================================

export const COMPANY_STAT_CARDS: DashboardStatItem[] = [
  {
    id: 'comp-total',
    label: 'TOTAL SALES',
    value: '₹42,850',
    trend: {
      value: '+12.4%',
      isPositive: true,
      periodText: 'vs yesterday',
    },
    iconType: 'sales',
  },
  {
    id: 'comp-online',
    label: 'ONLINE SALES',
    value: '₹20,000',
    trend: {
      value: '-4.1%',
      isPositive: false,
      periodText: 'vs yesterday',
    },
    iconType: 'online',
  },
  {
    id: 'comp-offline',
    label: 'OFFLINE SALES',
    value: '₹22,000',
    trend: {
      value: '+15.6%',
      isPositive: true,
      periodText: 'vs yesterday',
    },
    iconType: 'offline',
  },
  {
    id: 'comp-branch',
    label: 'BRANCH',
    value: '24 Total',
    subValue: '12 Branches Active',
    iconType: 'branches',
  },
];

export const OUTLET_PERFORMANCE_ROWS: OutletPerformanceRow[] = [
  {
    id: 'out-1',
    outletName: 'Downtown Central',
    orders: 87,
    sales: '₹90,944.00',
    netSales: '₹86,822.10',
    tax: '4,133.68',
    discount: '822.90',
  },
  {
    id: 'out-2',
    outletName: 'Westside Mall',
    orders: 0,
    sales: '0.00',
    netSales: '0.00',
    tax: '0.00',
    discount: '0.00',
  },
  {
    id: 'out-3',
    outletName: 'Uptown Terrace',
    orders: 87,
    sales: '₹90,944.00',
    netSales: '₹86,822.10',
    tax: '4,133.68',
    discount: '822.90',
  },
  {
    id: 'out-4',
    outletName: 'Harbor Front',
    orders: 0,
    sales: '0.00',
    netSales: '0.00',
    tax: '0.00',
    discount: '0.00',
  },
  {
    id: 'out-5',
    outletName: 'North Station',
    orders: 0,
    sales: '0.00',
    netSales: '0.00',
    tax: '0.00',
    discount: '0.00',
  },
];

export const OUTLET_SALES_CHART_BARS: OutletChartBarItem[] = [
  { label: 'Outlet 1', heightPercent: 78, isHighlight: false },
  { label: 'Outlet 2', heightPercent: 62, isHighlight: false },
  { label: 'Outlet 3', heightPercent: 70, isHighlight: false },
  { label: 'Outlet 4', heightPercent: 55, isHighlight: false },
  { label: 'Outlet 5', heightPercent: 68, isHighlight: false },
  { label: 'Outlet 6', heightPercent: 100, isHighlight: true },
  { label: 'Outlet 7', heightPercent: 74, isHighlight: false },
  { label: 'Outlet 8', heightPercent: 48, isHighlight: false },
  { label: 'Outlet 9', heightPercent: 64, isHighlight: false },
  { label: 'Outlet 10', heightPercent: 72, isHighlight: false },
];

export const COMPANY_DISCOUNTS_BREAKDOWN: DiscountItem[] = [
  { label: 'Promo Codes', amount: '₹28,400', color: '#F87171', percentage: 38.6 },
  { label: 'Loyalty Points', amount: '₹15,200', color: '#34D399', percentage: 20.7 },
  { label: 'Managerial', amount: '₹8,900', color: '#60A5FA', percentage: 12.1 },
  { label: 'Happy Hour', amount: '₹21,000', color: '#FBBF24', percentage: 28.6 },
];

export const COMPANY_TODAYS_EXPENSES: ExpenseItem[] = [
  { category: 'Food Purchases', amount: '₹26,000' },
  { category: 'Utilities', amount: '₹13,000' },
  { category: 'Delivery Commission', amount: '₹36,000' },
  { category: 'Kitchen Wastage', amount: '₹3,000' },
  { category: 'Miscellaneous', amount: '₹26,000' },
];

export const LEAKAGE_STATS: LeakageStats = {
  kots: {
    cancelled: 2,
    modified: 5,
    shifted: 0,
    notUsedInBills: 1,
  },
  bills: {
    modified: 3,
    reprinted: 1,
    knockedOffAmount: '₹450',
  },
};

// ==========================================
// 3. BRANCH SALES LEVEL DATA
// ==========================================

export const BRANCH_STAT_CARDS: DashboardStatItem[] = [
  {
    id: 'br-sales',
    label: 'TOTAL SALES',
    value: '₹42,850',
    trend: {
      value: '+12.4%',
      isPositive: true,
      periodText: 'vs yesterday',
    },
    iconType: 'sales',
  },
  {
    id: 'br-net',
    label: 'NET SALES',
    value: '₹42,000',
    trend: {
      value: '+8.2%',
      isPositive: true,
      periodText: 'vs yesterday',
    },
    iconType: 'net',
  },
  {
    id: 'br-online',
    label: 'ONLINE SALES',
    value: '₹20,000',
    trend: {
      value: '-4.1%',
      isPositive: false,
      periodText: 'vs yesterday',
    },
    iconType: 'online',
  },
  {
    id: 'br-offline',
    label: 'OFFLINE SALES',
    value: '₹22,000',
    trend: {
      value: '+15.6%',
      isPositive: true,
      periodText: 'vs yesterday',
    },
    iconType: 'offline',
  },
];

export const MOCK_PERIOD_OPTIONS: PeriodOption[] = Object.values(PeriodOption);

export const BRANCH_SALES_SUMMARY = {
  totalOrders: '932',
  totalSales: '₹48,560',
  dateRange: DateRangeOption.LAST_7_DAYS as string,
  defaultStartDate: new Date('2025-06-28'),
  defaultEndDate: new Date('2025-07-04'),
};

export const BRANCH_SALES_CHART_Y_AXIS = ['150k', '100k', '50k', '0k'] as const;

export const BRANCH_SALES_CHART_LEGEND = [
  { label: 'Dine In', color: '#BFDBFE' },
  { label: 'Take Away', color: '#34D399' },
  { label: 'Delivery', color: '#FB7185' },
] as const;

export const BRANCH_PAYMENT_MODES: PaymentModeItem[] = [
  { label: 'Cash', color: '#3B82F6', amount: '₹142,783' },
  { label: 'Card', color: '#8B5CF6', amount: '₹53,786' },
  { label: 'UPI', color: '#10B981', amount: '₹37,730' },
  { label: 'Other', color: '#F59E0B', amount: '₹652,961' },
];

export const BRANCH_ONLINE_ORDERS_STATS = {
  totalOnlineSales: '₹ 0',
  orders: 0,
};

export const BRANCH_ONLINE_AGGREGATORS: OnlineAggregatorItem[] = [
  { name: 'Zomato', iconColor: '#EF4444', orders: 0 },
  { name: 'Swiggy', iconColor: '#F97316', orders: 0 },
  { name: 'GrowthFalcons', iconColor: '#E11D48', orders: 0 },
];

export const BRANCH_CHANNEL_CARDS: ChannelCardItem[] = [
  {
    id: 'dine-in',
    title: 'Dine In',
    amount: '₹848,582',
    orders: '735 Orders',
    icon: 'dine-in',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
  },
  {
    id: 'take-away',
    title: 'Take Away',
    amount: '₹948',
    orders: '2 Orders',
    icon: 'take-away',
    color: '#10B981',
    bgColor: '#ECFDF5',
  },
  {
    id: 'delivery',
    title: 'Delivery',
    amount: '₹37,730',
    orders: '161 Orders',
    icon: 'delivery',
    color: '#F97316',
    bgColor: '#FFF7ED',
  },
];

export const BRANCH_EXPENSES: ExpenseItem[] = [
  { category: 'Food Purchases', amount: '₹26,000' },
  { category: 'Utilities', amount: '₹13,000' },
  { category: 'Delivery Comm.', amount: '₹36,000' },
  { category: 'Payment Gateway', amount: '₹23,000' },
  { category: 'Kitchen Wastage', amount: '₹3,000' },
  { category: 'Maintenance', amount: '₹3,000' },
  { category: 'Miscellaneous', amount: '₹26,000' },
];

export const BRANCH_LEAKAGE_STATS = {
  kots: {
    cancelled: 0,
    modified: 0,
    shifted: 0,
    notUsedInBills: 1,
  },
  bills: {
    modified: 0,
    reprinted: 0,
    waivedOff: '₹0',
  },
};
