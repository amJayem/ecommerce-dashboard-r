import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { userQueries, type Permission } from "@/lib/api/queries/users";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ManageAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (role: string, permissions: string[]) => Promise<void>;
  userName: string;
}

export function ManageAccessModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
}: ManageAccessModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: userQueries.getPermissions,
    enabled: isOpen,
  });

  const groupedPermissions = useMemo(() => {
    if (!permissions) return {};
    return permissions.reduce((acc, permission) => {
      const category = permission.category || "General";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [permissions]);

  const handleTogglePermission = (permissionName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionName)
        ? prev.filter((p) => p !== permissionName)
        : [...prev, permissionName]
    );
  };

  const handleSelectAllInCategory = (category: string, checked: boolean) => {
    const categoryPermissions = groupedPermissions[category].map((p) => p.name);
    if (checked) {
      setSelectedPermissions((prev) =>
        Array.from(new Set([...prev, ...categoryPermissions]))
      );
    } else {
      setSelectedPermissions((prev) =>
        prev.filter((p) => !categoryPermissions.includes(p))
      );
    }
  };

  const handleConfirm = async () => {
    if (!selectedRole || selectedPermissions.length === 0) return;
    try {
      setIsSubmitting(true);
      await onConfirm(selectedRole, selectedPermissions);
      onClose();
    } catch (error) {
      console.error("Failed to approve user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = selectedRole && selectedPermissions.length > 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle>Manage Access for {userName}</AlertDialogTitle>
          <AlertDialogDescription>
            Assign a role and specific permissions before approving this user.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4 flex-1 overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="role">Select Role</Label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
            >
              <option value="" disabled>
                Select a role
              </option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="OPERATOR">Operator</option>
              <option value="USER">User</option>
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Permissions</Label>
              <span className="text-sm text-muted-foreground">
                {selectedPermissions.length} selected
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([category, items]) => (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-1">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        {category}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-primary hover:bg-transparent"
                        onClick={() => {
                          const allSelected = items.every((p) =>
                            selectedPermissions.includes(p.name)
                          );
                          handleSelectAllInCategory(category, !allSelected);
                        }}
                      >
                        {items.every((p) =>
                          selectedPermissions.includes(p.name)
                        )
                          ? "Deselect All"
                          : "Select All"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-start space-x-3 space-y-0"
                        >
                          <Checkbox
                            id={`perm-${permission.id}`}
                            checked={selectedPermissions.includes(
                              permission.name
                            )}
                            onCheckedChange={() =>
                              handleTogglePermission(permission.name)
                            }
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              htmlFor={`perm-${permission.id}`}
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {permission.name
                                .split(".")
                                .pop()
                                ?.replace(/_/g, " ")}
                            </Label>
                            {permission.description && (
                              <p className="text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <Button
            onClick={handleConfirm}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Approve User
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
