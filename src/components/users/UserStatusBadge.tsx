import { Badge } from "@/components/ui/badge";

interface UserStatusBadgeProps {
  status: string;
  className?: string;
}

export function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-500/50";
      case "PENDING":
        return "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 border-yellow-500/50";
      case "SUSPENDED":
        return "bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-500/50";
      case "REJECTED":
        return "bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 border-gray-500/50";
      default:
        return "bg-slate-500/15 text-slate-700 hover:bg-slate-500/25 border-slate-500/50";
    }
  };

  return (
    <Badge
      variant="outline"
      className={`${getStatusColor(status)} ${className}`}
    >
      {status}
    </Badge>
  );
}
