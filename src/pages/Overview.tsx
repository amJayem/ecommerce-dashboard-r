import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  ShoppingCart,
  Users,
  AlertCircle,
  Clock,
  Loader2,
  RefreshCcw,
  Calendar as CalendarIcon,
  Package,
  Archive,
} from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import { formatCurrency } from "@/lib/constants";
import { usePermissions } from "@/hooks/usePermissions";
import {
  useAnalyticsSummary,
  useAnalyticsCharts,
  useAnalyticsInventory,
} from "@/hooks/useAnalytics";
import type {
  AnalyticsPeriod,
  TopProduct,
  CategoryRevenue,
} from "@/lib/api/queries/analytics";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  SHIPPED: "#8b5cf6",
  DELIVERED: "#10b981",
  CANCELLED: "#ef4444",
};

export function Overview() {
  usePageTitle("Overview");
  const { hasPermission } = usePermissions();
  const [period, setPeriod] = useState<AnalyticsPeriod>("7d");

  // Helper to format date as YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  // Initialize with 7 days range
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return formatDate(date);
  });
  const [endDate, setEndDate] = useState(() => formatDate(new Date()));

  const analyticsFilter = useMemo(() => {
    if (period === "custom") {
      return { startDate, endDate: endDate || undefined };
    }
    return { period };
  }, [period, startDate, endDate]);

  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useAnalyticsSummary(analyticsFilter);

  const { data: charts, isLoading: chartsLoading } =
    useAnalyticsCharts(analyticsFilter);

  const { data: inventory, isLoading: inventoryLoading } =
    useAnalyticsInventory();

  const loading = summaryLoading || chartsLoading || inventoryLoading;

  const kpis = useMemo(() => {
    if (!summary) return [];
    return [
      {
        title: "Today's Revenue",
        value: formatCurrency(summary.kpis?.todayRevenue ?? 0),
        description: "Revenue earned today",
        icon: DollarSign,
        color: "text-blue-600",
      },
      {
        title: "Orders Today",
        value: summary.kpis?.ordersToday ?? 0,
        description: "New orders received",
        icon: ShoppingCart,
        color: "text-emerald-600",
      },
      {
        title: "New Customers",
        value: summary.kpis?.newCustomersToday ?? 0,
        description: "Joined today",
        icon: Users,
        color: "text-violet-600",
      },
      {
        title: "Pending Orders",
        value: summary.kpis?.pendingOrdersCount ?? 0,
        description: "Awaiting processing",
        icon: Clock,
        color:
          (summary.kpis?.pendingOrdersCount ?? 0) > 10
            ? "text-red-600"
            : "text-amber-600",
        highlight: (summary.kpis?.pendingOrdersCount ?? 0) > 10,
      },
    ];
  }, [summary]);

  // stats useMemo was unsused, removed to clear lint warning

  if (loading && !summary && !charts && !inventory) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Actionable insights and performance metrics.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            {(["today", "7d", "30d"] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? "secondary" : "ghost"}
                size="sm"
                onClick={() => {
                  setPeriod(p);
                  const end = new Date();
                  const start = new Date();
                  if (p === "7d") start.setDate(end.getDate() - 7);
                  if (p === "30d") start.setDate(end.getDate() - 30);
                  // for 'today', start and end match current date (or start of day? usually API handles 'today' as start of day till now)
                  setStartDate(formatDate(start));
                  setEndDate(formatDate(end));
                }}
                className={cn(
                  "h-8 px-3 text-xs font-medium",
                  period === p && "bg-background shadow-sm"
                )}
              >
                {p === "today" ? "Today" : p === "7d" ? "7 Days" : "30 Days"}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-1"
              onClick={() => refetchSummary()}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="relative">
              <CalendarIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPeriod("custom");
                }}
                onClick={(e) => e.currentTarget.showPicker()}
                onKeyDown={(e) => e.preventDefault()}
                className="h-8 w-36 pl-7 text-xs cursor-pointer hover:bg-muted transition-colors"
              />
            </div>
            <span className="text-muted-foreground text-xs font-medium">
              to
            </span>
            <div className="relative">
              <CalendarIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPeriod("custom");
                }}
                onClick={(e) => e.currentTarget.showPicker()}
                onKeyDown={(e) => e.preventDefault()}
                placeholder="Today"
                className="h-8 w-36 pl-7 text-xs cursor-pointer hover:bg-muted transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* High Priority Alerts */}
      {inventory &&
        ((inventory?.products?.lowStock?.length ?? 0) > 0 ||
          (summary?.kpis?.pendingOrdersCount ?? 0) > 20) && (
          <div className="grid gap-4 md:grid-cols-2">
            {(inventory?.products?.lowStock?.length ?? 0) > 0 && (
              <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/50">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                      Low Stock Alert
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {inventory?.products?.lowStock?.length ?? 0} products are
                      below the threshold.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            {summary && (summary?.kpis?.pendingOrdersCount ?? 0) > 20 && (
              <Card className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/50">
                    <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                      High Pending Orders
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300">
                      {summary?.kpis?.pendingOrdersCount ?? 0} orders awaiting
                      processing.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.title}
              className={cn(kpi.highlight && "ring-1 ring-red-500/50")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <Icon className={cn("h-4 w-4", kpi.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpi.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Revenue Trend Chart */}
        {hasPermission("analytics.sales.read") && (
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>
                Daily revenue over the selected period.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {charts?.revenueTrend?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.revenueTrend}>
                      <defs>
                        <linearGradient
                          id="colorRev"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.1}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E5E7EB"
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                        tickFormatter={(value) => `৳${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value: any) => [
                          formatCurrency(value),
                          "Revenue",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRev)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No data available for this period.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Status Distribution */}
        {hasPermission("analytics.orders.read") && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
              <CardDescription>Distribution of current orders.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col h-[320px]">
                <div className="h-[220px] w-full">
                  {charts?.orderStatusDistribution?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={charts.orderStatusDistribution as any[]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="status"
                        >
                          {charts.orderStatusDistribution.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  STATUS_COLORS[
                                    entry.status as keyof typeof STATUS_COLORS
                                  ] || "#cbd5e1"
                                }
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No data available.
                    </div>
                  )}
                </div>
                <div className="mt-auto grid grid-cols-2 gap-x-4 gap-y-2 pb-2">
                  {charts?.orderStatusDistribution.map((status) => (
                    <div
                      key={status.status}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            STATUS_COLORS[
                              status.status as keyof typeof STATUS_COLORS
                            ],
                        }}
                      />
                      <span className="text-xs font-medium capitalize">
                        {status.status.toLowerCase()}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {status.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Inventory Overview */}
      {hasPermission("analytics.inventory.read") && inventory && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Inventory Overview
            </h2>
            <p className="text-sm text-muted-foreground">
              Current stock and catalog statistics
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Product Inventory Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  Product Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Active Products
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {inventory?.products?.activeCount ?? 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Archived</p>
                    <p className="text-2xl font-bold text-slate-500">
                      {inventory?.products?.archivedCount ?? 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Out of Stock
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {inventory?.products?.outOfStock ?? 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Low Stock Items
                    </p>
                    <p className="text-2xl font-bold text-amber-600">
                      {inventory?.products?.lowStock?.length ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Inventory Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Archive className="h-4 w-4 text-violet-600" />
                  Category Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Active Categories
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {inventory?.categories?.activeCount ?? 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Archived</p>
                    <p className="text-2xl font-bold text-slate-500">
                      {inventory?.categories?.archivedCount ?? 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Total Categories
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {(inventory?.categories?.activeCount ?? 0) +
                        (inventory?.categories?.archivedCount ?? 0)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      With Revenue
                    </p>
                    <p className="text-2xl font-bold text-violet-600">
                      {inventory?.categories?.revenuePerCategory?.length ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Selling Products */}
        {hasPermission("analytics.inventory.read") && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>
                Highest volume products by quantity sold.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventory?.products?.topSelling?.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-2 font-medium">Product</th>
                          <th className="pb-2 font-medium">SKU</th>
                          <th className="pb-2 text-right font-medium">Sold</th>
                          <th className="pb-2 text-right font-medium">
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory?.products?.topSelling?.map(
                          (product: TopProduct) => (
                            <tr
                              key={product.id}
                              className="border-b last:border-0"
                            >
                              <td className="py-3 font-medium">
                                {product.name}
                              </td>
                              <td className="py-3 text-muted-foreground">
                                {product.sku || "N/A"}
                              </td>
                              <td className="py-3 text-right">
                                {product.quantity}
                              </td>
                              <td className="py-3 text-right font-semibold">
                                {formatCurrency(product.revenue)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No sales data available.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Performance */}
        {hasPermission("analytics.inventory.read") && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
              <CardDescription>
                Top revenue generating categories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5 h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {inventory?.categories?.revenuePerCategory?.length ? (
                  inventory?.categories?.revenuePerCategory
                    ?.slice(0, 6)
                    .map((cat: CategoryRevenue) => (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">{cat.name}</span>
                          <span className="text-muted-foreground">
                            {formatCurrency(cat.revenue)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${
                                cat.revenue > 0
                                  ? (cat.revenue /
                                      Math.max(
                                        1,
                                        ...(inventory?.categories?.revenuePerCategory?.map(
                                          (c: CategoryRevenue) => c.revenue
                                        ) || [0])
                                      )) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No category data available.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
