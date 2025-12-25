import { useState, useMemo, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Settings2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

const DEFAULT_PERMISSIONS = [
  // Order permissions
  {
    name: "order.read",
    description: "View orders",
    category: "order",
  },
  {
    name: "order.create",
    description: "Create orders",
    category: "order",
  },
  {
    name: "order.update",
    description: "Update order status and details",
    category: "order",
  },
  {
    name: "order.delete",
    description: "Delete orders",
    category: "order",
  },

  // Product permissions
  {
    name: "product.read",
    description: "View products",
    category: "product",
  },
  {
    name: "product.create",
    description: "Create new products",
    category: "product",
  },
  {
    name: "product.update",
    description: "Update product details",
    category: "product",
  },
  {
    name: "product.delete",
    description: "Delete products",
    category: "product",
  },

  // Category permissions
  {
    name: "category.read",
    description: "View categories",
    category: "category",
  },
  {
    name: "category.create",
    description: "Create new categories",
    category: "category",
  },
  {
    name: "category.update",
    description: "Update category details",
    category: "category",
  },
  {
    name: "category.delete",
    description: "Delete categories",
    category: "category",
  },

  // User permissions
  {
    name: "user.read",
    description: "View users and user lists",
    category: "user",
  },
  {
    name: "user.approve",
    description: "Approve or reject pending users",
    category: "user",
  },
  {
    name: "user.manage",
    description: "Manage users (suspend, update roles, etc.)",
    category: "user",
  },

  // Admin permissions
  {
    name: "admin.action",
    description: "Perform general administrative actions",
    category: "admin",
  },
];

interface ManageAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (role: string, permissions: string[]) => Promise<void>;
  userName: string;
  initialRole?: string;
  initialPermissions?: any[];
}

export function ManageAccessModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  initialRole = "",
  initialPermissions = [],
}: ManageAccessModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>(initialRole);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Normalize permissions to strings (names)
  const normalizePermissions = (perms: any[]): string[] => {
    return perms
      .map((p) => (typeof p === "string" ? p : p?.name))
      .filter(Boolean);
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedRole(initialRole);
      setSelectedPermissions(normalizePermissions(initialPermissions));
    }
  }, [isOpen, initialRole, initialPermissions]);

  const groupedPermissions = useMemo(() => {
    return DEFAULT_PERMISSIONS.reduce((acc, permission) => {
      const category = permission.category || "General";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    }, {} as Record<string, typeof DEFAULT_PERMISSIONS>);
  }, []);

  // Helper to check if a read permission is required by other selected permissions
  const isReadRequired = (permissionName: string) => {
    if (!permissionName.endsWith(".read")) return false;
    const module = permissionName.split(".")[0];
    return selectedPermissions.some(
      (p) => p.startsWith(`${module}.`) && p !== permissionName
    );
  };

  const handleTogglePermission = (permissionName: string) => {
    setSelectedPermissions((prev) => {
      const isCurrentlySelected = prev.includes(permissionName);
      let nextSelected: string[];

      if (isCurrentlySelected) {
        // If unchecking a read permission, check if it's required
        if (isReadRequired(permissionName)) return prev;
        nextSelected = prev.filter((p) => p !== permissionName);
      } else {
        // If checking a write permission, ensure read is also checked
        nextSelected = [...prev, permissionName];
        if (
          !permissionName.endsWith(".read") &&
          !permissionName.includes(".action")
        ) {
          const module = permissionName.split(".")[0];
          const readPerm = `${module}.read`;
          if (!nextSelected.includes(readPerm)) {
            nextSelected.push(readPerm);
          }
        }
      }
      return nextSelected;
    });
  };

  const handleSelectAllInCategory = (category: string, checked: boolean) => {
    const categoryPermissions = (groupedPermissions[category] || []).map(
      (p) => p.name
    );
    if (checked) {
      setSelectedPermissions((prev) => {
        const next = Array.from(new Set([...prev, ...categoryPermissions]));
        // Ensure read permissions are added for any write permissions in the category
        categoryPermissions.forEach((p) => {
          if (!p.endsWith(".read") && !p.includes(".action")) {
            const module = p.split(".")[0];
            const readPerm = `${module}.read`;
            if (!next.includes(readPerm)) next.push(readPerm);
          }
        });
        return next;
      });
    } else {
      setSelectedPermissions((prev) => {
        // Find permissions in this category that are NOT required by other categories (rare, but good to be safe)
        return prev.filter((p) => !categoryPermissions.includes(p));
      });
    }
  };

  const handleConfirm = async () => {
    if (!selectedRole || selectedPermissions.length === 0) {
      toast.error("Please select a role and at least one permission");
      return;
    }
    try {
      setIsSubmitting(true);
      await onConfirm(selectedRole, selectedPermissions);
      toast.success(
        isUpdate ? "Access updated successfully" : "User approved successfully"
      );
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update access");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = selectedRole && selectedPermissions.length > 0;
  const isUpdate = !!initialRole;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            {isUpdate ? "Update Access" : "Manage Access"} for {userName}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isUpdate
              ? "Modify the assigned role and permissions for this user."
              : "Assign a role and specific permissions before approving this user."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4 flex-1 overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="role">Select Role</Label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md 
              border border-input bg-background px-3 py-2 text-sm 
              ring-offset-background placeholder:text-muted-foreground 
              focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 
              disabled:cursor-not-allowed disabled:opacity-50"
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
                      {items.every((p) => selectedPermissions.includes(p.name))
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((permission) => {
                      const isRequired = isReadRequired(permission.name);
                      return (
                        <div
                          key={permission.name}
                          className="flex items-start space-x-3 space-y-0"
                        >
                          <Checkbox
                            id={`perm-${permission.name}`}
                            checked={selectedPermissions.includes(
                              permission.name
                            )}
                            disabled={isRequired}
                            onCheckedChange={() =>
                              handleTogglePermission(permission.name)
                            }
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              htmlFor={`perm-${permission.name}`}
                              className={cn(
                                "text-sm font-medium leading-none cursor-pointer",
                                isRequired &&
                                  "text-muted-foreground cursor-default"
                              )}
                            >
                              {permission.name
                                .split(".")
                                .pop()
                                ?.replace(/_/g, " ")}
                              {isRequired && (
                                <span className="ml-1 text-[10px] text-blue-500 font-normal">
                                  (Required for actions)
                                </span>
                              )}
                            </Label>
                            {permission.description && (
                              <p className="text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <Button
            onClick={handleConfirm}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUpdate ? "Save Changes" : "Approve User"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
