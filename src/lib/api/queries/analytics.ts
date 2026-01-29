import { api } from "../axios";

export type AnalyticsPeriod = "today" | "7d" | "30d" | "custom";

export interface AnalyticsFilter {
  period?: AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
}

export interface AnalyticsSummary {
  kpis: {
    todayRevenue: number;
    ordersToday: number;
    newCustomersToday: number;
    pendingOrdersCount: number;
  };
  sales: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusCounts: {
      pending: number;
      confirmed: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    };
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    guest: number;
    registered: number;
  };
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  revenue: number;
}

export interface AnalyticsCharts {
  revenueTrend: ChartDataPoint[];
  orderStatusDistribution: StatusCount[];
  paymentMethodBreakdown: PaymentMethodBreakdown[];
}

export interface TopProduct {
  id: number;
  name: string;
  sku?: string;
  quantity: number;
  revenue: number;
}

export interface CategoryRevenue {
  id: number;
  name: string;
  slug: string;
  revenue: number;
}

export interface AnalyticsInventory {
  products: {
    activeCount: number;
    archivedCount: number;
    lowStock: any[];
    outOfStock: number;
    topSelling: TopProduct[];
  };
  categories: {
    activeCount: number;
    archivedCount: number;
    revenuePerCategory: CategoryRevenue[];
  };
}

export const analyticsQueries = {
  getSummary: async (filter: AnalyticsFilter): Promise<AnalyticsSummary> => {
    const response = await api.get<AnalyticsSummary>("/analytics/summary", {
      params: filter,
    });
    return response.data;
  },
  getCharts: async (filter: AnalyticsFilter): Promise<AnalyticsCharts> => {
    const response = await api.get<AnalyticsCharts>("/analytics/charts", {
      params: filter,
    });
    return response.data;
  },
  getInventory: async (): Promise<AnalyticsInventory> => {
    const response = await api.get<AnalyticsInventory>("/analytics/inventory");
    return response.data;
  },
};
