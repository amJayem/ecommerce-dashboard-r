import { useQuery } from "@tanstack/react-query";
import { analyticsQueries, type AnalyticsFilter } from "@/lib/api/queries/analytics";

export const analyticsKeys = {
  all: ["analytics"] as const,
  summary: (filter: AnalyticsFilter) => [...analyticsKeys.all, "summary", filter] as const,
  charts: (filter: AnalyticsFilter) => [...analyticsKeys.all, "charts", filter] as const,
  inventory: () => [...analyticsKeys.all, "inventory"] as const,
};

export function useAnalyticsSummary(filter: AnalyticsFilter) {
  return useQuery({
    queryKey: analyticsKeys.summary(filter),
    queryFn: () => analyticsQueries.getSummary(filter),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAnalyticsCharts(filter: AnalyticsFilter) {
  return useQuery({
    queryKey: analyticsKeys.charts(filter),
    queryFn: () => analyticsQueries.getCharts(filter),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAnalyticsInventory() {
  return useQuery({
    queryKey: analyticsKeys.inventory(),
    queryFn: () => analyticsQueries.getInventory(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
