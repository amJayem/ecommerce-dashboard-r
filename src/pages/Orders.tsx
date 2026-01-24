import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Search,
  Eye,
  Download,
  Loader2,
  Filter,
  X,
  RefreshCcw,
} from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import { useDebounce } from "@/hooks/use-debounce";
import { formatCurrency } from "@/lib/constants";
import { usePermissions } from "@/hooks/usePermissions";
import {
  ordersApi,
  type Order,
  type OrderQuery,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/api";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export function Orders() {
  usePageTitle("Orders");
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    orders: Order[];
    total: number;
    pages: number;
  }>({
    orders: [],
    total: 0,
    pages: 1,
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<
    PaymentStatus | "all"
  >("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const queryParams = useMemo<OrderQuery>(() => {
    const params: OrderQuery = {
      page: currentPage,
      limit: limit,
    };

    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (statusFilter !== "all") params.status = statusFilter;
    if (paymentStatusFilter !== "all")
      params.paymentStatus = paymentStatusFilter;
    if (startDate) params.startDate = new Date(startDate).toISOString();
    if (endDate) params.endDate = new Date(endDate).toISOString();
    if (minAmount) params.minAmount = Number(minAmount);
    if (maxAmount) params.maxAmount = Number(maxAmount);

    return params;
  }, [
    currentPage,
    limit,
    searchQuery,
    statusFilter,
    paymentStatusFilter,
    startDate,
    endDate,
    minAmount,
    maxAmount,
  ]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ordersApi.getAll(queryParams);
      setData(response);
    } catch (error) {
      toast.error("Failed to load orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    paymentStatusFilter !== "all" ||
    startDate !== "" ||
    endDate !== "" ||
    minAmount !== "" ||
    maxAmount !== "";

  const pendingOrdersCount = data.orders.filter(
    (o) => o.status === "PENDING"
  ).length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            View and manage all customer orders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders()}
            disabled={loading}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {hasPermission("order.read") && (
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrdersCount}</div>
            <p className="text-xs text-muted-foreground">In this view</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pages}</div>
            <p className="text-xs text-muted-foreground">Total pages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                data.orders.reduce((acc, curr) => acc + curr.totalAmount, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">Sum of current view</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Search & Filter Orders</CardTitle>
              <CardDescription>
                Find orders by ID, customer, email, or application filters
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders by ID, customer name, email or phone..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as OrderStatus | "all");
                    setCurrentPage(1);
                  }}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Payment Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Status</label>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => {
                    setPaymentStatusFilter(
                      e.target.value as PaymentStatus | "all"
                    );
                    setCurrentPage(1);
                  }}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Payment Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              {/* Date Filters */}
              <div className="space-y-2 lg:col-span-1">
                <label className="text-sm font-medium">Date Range</label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Amount Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount Range</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minAmount}
                    onChange={(e) => {
                      setMinAmount(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxAmount}
                    onChange={(e) => {
                      setMaxAmount(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {statusFilter !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="hover:text-primary/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {paymentStatusFilter !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                  Payment: {paymentStatusFilter}
                  <button
                    onClick={() => setPaymentStatusFilter("all")}
                    className="hover:text-primary/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {startDate && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                  From: {startDate}
                  <button
                    onClick={() => setStartDate("")}
                    className="hover:text-primary/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {endDate && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                  To: {endDate}
                  <button
                    onClick={() => setEndDate("")}
                    className="hover:text-primary/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            A list of all recent orders in your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Order ID</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Items</th>
                  <th className="text-left p-4 font-medium">Total</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="ml-2">Loading orders...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  data.orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-accent/50">
                      <td className="p-4 font-medium">#{order.id}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-primary">
                            {order.shippingAddress
                              ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                              : order.user?.name || "Guest"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.user?.email || "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">{order.items?.length || 0}</td>
                      <td className="p-4 font-medium">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={order.status} />
                          <StatusBadge status={order.paymentStatus} />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && data.orders.length > 0 && (
            <div className="flex flex-col gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {data.orders.length} of {data.total} orders
                  </p>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="limit-select"
                      className="text-sm text-muted-foreground"
                    >
                      Items per page:
                    </label>
                    <select
                      id="limit-select"
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
                {data.pages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {data.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(data.pages, p + 1))
                      }
                      disabled={currentPage === data.pages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
