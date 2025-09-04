export interface Widget {
  id: string;
  type: 'stock-table' | 'finance-cards' | 'chart';
  title: string;
  config: Record<string, any>;
  size?: {
    width: 'full' | 'half' | 'quarter';
    height: 'small' | 'medium' | 'large';
  };
  data?: any;
  loading?: boolean;
  error?: string | null;
  lastUpdated?: number;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: string;
}

export interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp?: number;
}

export interface DashboardState {
  widgets: Widget[];
  theme: 'light' | 'dark';
  isLoading: boolean;
  error: string | null;
}
