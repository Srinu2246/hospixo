export type KdsOrderStatus = 'new' | 'preparing' | 'ready';

export type KdsOrderPriority = 'high' | 'normal';

export type KdsOrderChannel = 'dine_in' | 'takeaway' | 'delivery';

export type KdsItemCategory = 'starters' | 'mains' | 'drinks' | 'desserts' | 'other';

export type KdsOrderItem = {
  id: string;
  name: string;
  quantity: number;
  category: KdsItemCategory;
  notes?: string;
};

export type KdsOrder = {
  id: string;
  number: string;
  status: KdsOrderStatus;
  priority: KdsOrderPriority;
  channel: KdsOrderChannel;
  tableLabel?: string;
  stationId: string;
  items: KdsOrderItem[];
  placedAt: string;
  elapsedLabel?: string;
};

export type KdsStation = {
  id: string;
  label: string;
  subtitle?: string;
};

export type KdsStats = {
  total: number;
  pending: number;
  preparing: number;
  ready: number;
};

export type KdsColumnCounts = Partial<Record<KdsOrderStatus, number>>;

export type KdsConnectionStatus = {
  printerConnected: boolean;
  posSyncActive: boolean;
  avgPrepTimeLabel?: string;
};
