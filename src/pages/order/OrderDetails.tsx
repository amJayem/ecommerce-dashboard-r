import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ConfirmDeleteModal } from "@/components/shared/ConfirmDeleteModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Printer,
  Trash2,
  Loader2,
  Package,
  User,
  MapPin,
  CreditCard,
} from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import { formatCurrency } from "@/lib/constants";
import { ordersApi, type Order } from "@/lib/api";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { StatusSelector } from "@/components/orders/StatusSelector";
import { toast } from "react-hot-toast";
import { Separator } from "@/components/ui/separator";

export function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  usePageTitle(order ? `Order #${order.id}` : "Order Details");

  useEffect(() => {
    if (id) {
      fetchOrder(id);
    }
  }, [id]);

  const fetchOrder = async (orderId: string) => {
    setLoading(true);
    try {
      const data = await ordersApi.getById(orderId);
      setOrder(data);
    } catch (error) {
      toast.error("Failed to load order details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      if (order?.id) {
        await ordersApi.delete(order.id);
        toast.success("Order deleted successfully");
        navigate("/orders");
      }
    } catch (error) {
      toast.error("Failed to delete order");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <Button variant="link" onClick={() => navigate("/orders")}>
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/orders")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Order #{order.id}
            </h1>
            <p className="text-muted-foreground">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Order
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Order Items & Summary */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                {order.items.length} items in this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                      <img
                        src={item.product?.coverImage || "/placeholder.png"}
                        alt={item.product?.name || "Product image"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="font-medium">
                        {item.product?.name || "Unknown Product"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(item.price)} x {item.quantity}
                      </span>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(item.total)}
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{formatCurrency(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Card: Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Update order and payment status</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Status</label>
                <StatusSelector
                  orderId={order.id}
                  currentStatus={order.status}
                  type="order"
                  onStatusChange={(s) =>
                    setOrder((prev) => (prev ? { ...prev, status: s } : null))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Status</label>
                <StatusSelector
                  orderId={order.id}
                  currentStatus={order.paymentStatus}
                  type="payment"
                  onStatusChange={(s) =>
                    setOrder((prev) =>
                      prev ? { ...prev, paymentStatus: s } : null
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Customer & Shipping Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">
                  {order.userId ? order.user?.name : "Guest Customer"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.userId
                    ? order.user?.email
                    : order.guestEmail || "No email provided"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.user?.phoneNumber || "No phone"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {order.shippingAddress ? (
                <>
                  <p className="font-medium">
                    {order.shippingAddress.firstName}{" "}
                    {order.shippingAddress.lastName}
                  </p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  <p>{order.shippingAddress.phone}</p>
                </>
              ) : (
                <p className="text-muted-foreground italic">
                  {order.shippingAddressText || "No address provided"}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {order.billingAddress ? (
                <>
                  <p className="font-medium">
                    {order.billingAddress.firstName}{" "}
                    {order.billingAddress.lastName}
                  </p>
                  <p>{order.billingAddress.street}</p>
                  <p>
                    {order.billingAddress.city}, {order.billingAddress.zipCode}
                  </p>
                  <p>{order.billingAddress.country}</p>
                  <p>{order.billingAddress.phone}</p>
                </>
              ) : (
                <p className="text-muted-foreground italic">Same as shipping</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between font-medium">
                <span>{order.paymentMethod}</span>
                <StatusBadge status={order.paymentStatus} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Delivery Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated</span>
                <span>
                  {order.estimatedDelivery
                    ? new Date(order.estimatedDelivery).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              {order.deliveryNote && (
                <div className="pt-2 italic text-muted-foreground">
                  "{order.deliveryNote}"
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
        loading={isDeleting}
      />
    </div>
  );
}
