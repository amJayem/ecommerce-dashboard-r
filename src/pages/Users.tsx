import { useState } from "react";
import { toast } from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userQueries, userMutations } from "@/lib/api/queries/users";
import { UserTable } from "@/components/users/UserTable";
import { ManageAccessModal } from "@/components/users/ManageAccessModal";
import { ConfirmDeleteModal } from "@/components/shared/ConfirmDeleteModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";
import { ShieldAlert } from "lucide-react";

export function Users() {
  const { hasPermission } = usePermissions();
  const [filter, setFilter] = useState("ALL");
  const [isManageAccessOpen, setIsManageAccessOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    name: string;
    role?: string;
    permissions?: string[];
  } | null>(null);

  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    type: "reject" | "suspend" | null;
    userId: number | null;
  }>({
    isOpen: false,
    type: null,
    userId: null,
  });

  const queryClient = useQueryClient();

  if (!hasPermission("user.read") && !hasPermission("user.manage")) {
    return (
      <div className="flex h-[450px] flex-col items-center justify-center space-y-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Access Denied</h3>
          <p className="text-muted-foreground">
            You do not have the required permissions to view the user list.
          </p>
        </div>
      </div>
    );
  }

  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ["users", filter],
    queryFn: () => userQueries.getUsers(filter),
  });

  // Safe access to users array
  const users = Array.isArray(usersResponse)
    ? usersResponse
    : (usersResponse as any)?.users || [];

  const approveMutation = useMutation({
    mutationFn: userMutations.approveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User approved successfully");
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message || "Failed to approve user"}`);
    },
  });

  const updateAccessMutation = useMutation({
    mutationFn: userMutations.updateUserAccess,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User access updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message || "Failed to update access"}`);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: userMutations.rejectUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User rejected successfully");
      closeConfirmModal();
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message || "Failed to reject user"}`);
      closeConfirmModal();
    },
  });

  const suspendMutation = useMutation({
    mutationFn: userMutations.suspendUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User suspended successfully");
      closeConfirmModal();
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message || "Failed to suspend user"}`);
      closeConfirmModal();
    },
  });

  const handleManageAccess = (
    id: number,
    name: string,
    role?: string,
    permissions?: string[]
  ) => {
    setSelectedUser({ id, name, role, permissions });
    setIsManageAccessOpen(true);
  };

  const handleApproveConfirm = async (role: string, permissions: string[]) => {
    if (selectedUser) {
      // If the user already has a role, it's an update, not an initial approval
      if (selectedUser.role) {
        await updateAccessMutation.mutateAsync({
          id: selectedUser.id,
          role,
          permissions,
        });
      } else {
        await approveMutation.mutateAsync({
          id: selectedUser.id,
          role,
          permissions,
        });
      }
    }
  };

  const handleReject = (id: number) => {
    setConfirmModalState({
      isOpen: true,
      type: "reject",
      userId: id,
    });
  };

  const handleSuspend = (id: number) => {
    setConfirmModalState({
      isOpen: true,
      type: "suspend",
      userId: id,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModalState({
      isOpen: false,
      type: null,
      userId: null,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModalState.userId || !confirmModalState.type) return;

    if (confirmModalState.type === "reject") {
      await rejectMutation.mutateAsync(confirmModalState.userId);
    } else if (confirmModalState.type === "suspend") {
      await suspendMutation.mutateAsync(confirmModalState.userId);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Approve and manage dashboard access
          </p>
        </div>
      </div>

      <div className="flex space-x-2 border-b pb-2">
        {["ALL", "PENDING", "APPROVED", "SUSPENDED"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "ghost"}
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status.toLowerCase()}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            List of users currently in {filter.toLowerCase()} status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable
            users={users}
            isLoading={isLoading}
            onManageAccess={handleManageAccess}
            onReject={handleReject}
            onSuspend={handleSuspend}
          />
        </CardContent>
      </Card>

      {selectedUser && (
        <ManageAccessModal
          isOpen={isManageAccessOpen}
          onClose={() => setIsManageAccessOpen(false)}
          userName={selectedUser.name}
          initialRole={selectedUser.role}
          initialPermissions={selectedUser.permissions}
          onConfirm={handleApproveConfirm}
        />
      )}

      <ConfirmDeleteModal
        isOpen={confirmModalState.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={
          confirmModalState.type === "reject" ? "Reject User" : "Suspend User"
        }
        description={
          confirmModalState.type === "reject"
            ? "Are you sure you want to reject this user? This action cannot be undone."
            : "Are you sure you want to suspend this user? They will lose access to the dashboard."
        }
        loading={rejectMutation.isPending || suspendMutation.isPending}
      />
    </div>
  );
}
