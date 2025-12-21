import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userQueries, userMutations } from "@/lib/api/queries/users";
import { UserTable } from "@/components/users/UserTable";
import { ManageAccessModal } from "@/components/users/ManageAccessModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Users() {
  const [filter, setFilter] = useState("PENDING");
  const [isManageAccessOpen, setIsManageAccessOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const queryClient = useQueryClient();

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
      alert("User approved successfully");
    },
    onError: (error: any) => {
      alert(`Error: ${error.message || "Failed to approve user"}`);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: userMutations.rejectUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      alert("User rejected successfully");
    },
    onError: (error: any) => {
      alert(`Error: ${error.message || "Failed to reject user"}`);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: userMutations.suspendUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      alert("User suspended successfully");
    },
    onError: (error: any) => {
      alert(`Error: ${error.message || "Failed to suspend user"}`);
    },
  });

  const handleManageAccess = (id: number, name: string) => {
    setSelectedUser({ id, name });
    setIsManageAccessOpen(true);
  };

  const handleApproveConfirm = async (role: string, permissions: string[]) => {
    if (selectedUser) {
      await approveMutation.mutateAsync({
        id: selectedUser.id,
        role,
        permissions,
      });
    }
  };

  const handleReject = async (id: number) => {
    if (window.confirm("Are you sure you want to reject this user?")) {
      await rejectMutation.mutateAsync(id);
    }
  };

  const handleSuspend = async (id: number) => {
    if (window.confirm("Are you sure you want to suspend this user?")) {
      await suspendMutation.mutateAsync(id);
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
          onConfirm={handleApproveConfirm}
        />
      )}
    </div>
  );
}
