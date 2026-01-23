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
import { Badge } from "@/components/ui/badge";

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onManageAccess: (
    id: number,
    name: string,
    role?: string,
    permissions?: string[]
  ) => void;
  onReject: (id: number) => void;
  onSuspend: (id: number) => void;
}

export function UserTable({
  users,
  isLoading,
  onManageAccess,
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
            <TableHead>Permissions</TableHead>
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
                {user.permissions && user.permissions.length > 0 ? (
                  <div className="flex flex-wrap gap-1 max-w-[250px]">
                    {user.permissions.slice(0, 3).map((p) => {
                      const permissionName =
                        typeof p === "string" ? p : (p as any)?.name;
                      if (!permissionName || typeof permissionName !== "string")
                        return null;

                      return (
                        <Badge
                          key={permissionName}
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-4 normal-case"
                        >
                          {permissionName.split(".").pop()?.replace(/_/g, " ")}
                        </Badge>
                      );
                    })}
                    {user.permissions.length > 3 && (
                      <span className="text-[10px] text-muted-foreground font-medium">
                        +{user.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <UserActions
                  userId={user.id}
                  userName={user.name}
                  status={
                    (user as any).status ||
                    (user.isVerified ? "APPROVED" : "PENDING")
                  }
                  onManageAccess={(id, name) => {
                    const permissionNames =
                      user.permissionNames ||
                      user.permissions?.map((p) =>
                        typeof p === "string" ? p : p.name
                      ) ||
                      [];
                    onManageAccess(id, name, user.role, permissionNames);
                  }}
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
