import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { User } from "@/lib/api/queries/auth";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserActions } from "./UserActions";

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
  onSuspend: (id: number) => Promise<void>;
}

export function UserTable({
  users,
  isLoading,
  onApprove,
  onReject,
  onSuspend,
}: UserTableProps) {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading users...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No users found.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </TableCell>
              <TableCell className="capitalize">{user.role}</TableCell>
              <TableCell>
                <UserStatusBadge
                  status={
                    (user as any).status ||
                    (user.isVerified ? "APPROVED" : "PENDING")
                  }
                />
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <UserActions
                  userId={user.id}
                  status={
                    (user as any).status ||
                    (user.isVerified ? "APPROVED" : "PENDING")
                  }
                  onApprove={onApprove}
                  onReject={onReject}
                  onSuspend={onSuspend}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
