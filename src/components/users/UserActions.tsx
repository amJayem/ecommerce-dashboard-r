import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, XCircle, Ban } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface UserActionsProps {
  userId: number;
  status: string;
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
  onSuspend: (id: number) => Promise<void>;
}

export function UserActions({
  userId,
  status,
  onApprove,
  onReject,
  onSuspend,
}: UserActionsProps) {
  const { hasPermission } = usePermissions();
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    try {
      setIsLoading(true);
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {hasPermission("user.approve") && status === "PENDING" && (
          <>
            <DropdownMenuItem
              onClick={() => handleAction(() => onApprove(userId))}
            >
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAction(() => onReject(userId))}
            >
              <XCircle className="mr-2 h-4 w-4 text-red-600" />
              Reject
            </DropdownMenuItem>
          </>
        )}

        {hasPermission("user.manage") && status === "APPROVED" && (
          <DropdownMenuItem
            onClick={() => handleAction(() => onSuspend(userId))}
          >
            <Ban className="mr-2 h-4 w-4 text-red-600" />
            Suspend
          </DropdownMenuItem>
        )}

        {/* Fallback if no actions available */}
        {((!hasPermission("user.approve") && !hasPermission("user.manage")) ||
          (status !== "PENDING" && status !== "APPROVED")) && (
          <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
