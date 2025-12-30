import { useState } from "react";
import { ordersApi } from "@/lib/api";
import { type OrderStatus, type PaymentStatus } from "@/lib/api";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface StatusSelectorProps {
  orderId: number | string;
  currentStatus: OrderStatus | PaymentStatus;
  type: "order" | "payment";
  onStatusChange?: (newStatus: any) => void;
}

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

export function StatusSelector({
  orderId,
  currentStatus,
  type,
  onStatusChange,
}: StatusSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const options = type === "order" ? ORDER_STATUSES : PAYMENT_STATUSES;

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      if (type === "order") {
        await ordersApi.updateStatus(orderId, newStatus as OrderStatus);
      } else {
        await ordersApi.updatePaymentStatus(
          orderId,
          newStatus as PaymentStatus
        );
      }
      toast.success(
        `${
          type === "order" ? "Order" : "Payment"
        } status updated to ${newStatus}`
      );
      onStatusChange?.(newStatus);
    } catch (error) {
      toast.error(
        `Failed to update status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
      <select
        disabled={isLoading}
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="flex h-9 w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
