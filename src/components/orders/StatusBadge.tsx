import { Badge } from "@/components/ui/badge";
import { type OrderStatus, type PaymentStatus } from "@/lib/api";

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      // Order Statuses
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200";

      // Payment Statuses
      case "PAID":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200";
      case "FAILED":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200";

      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Badge
      variant="outline"
      className={`${getStatusStyles(
        status
      )} font-medium px-2.5 py-0.5 rounded-full border`}
    >
      {status}
    </Badge>
  );
}
