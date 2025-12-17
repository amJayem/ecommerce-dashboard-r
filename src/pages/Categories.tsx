import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuth } from "@/hooks/useAuth";
import {
  useCategories,
  useDeleteCategory,
  type Category,
} from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import { Edit, EyeOff, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type StatusFilter = "all" | "active" | "inactive";

export function Categories() {
  usePageTitle("Categories");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const userRole = user?.role?.toLowerCase();
  const isAdmin = userRole === "admin" || userRole === "super_admin";

  // React Query hooks
  const {
    data: categories = [],
    isLoading: loading,
    error,
    refetch,
  } = useCategories();
  const deleteCategoryMutation = useDeleteCategory();

  const errorMessage = error instanceof Error ? error.message : null;

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        category.slug.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? category.isActive
          : !category.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [categories, debouncedSearch, statusFilter]);

  const columns: Column<Category>[] = [
    {
      key: "category",
      label: "Category",
      render: (category) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-sm font-semibold">
            {category.icon ||
              (category.name ? category.name.charAt(0).toUpperCase() : "C")}
          </div>
          <div>
            <Link
              to={`/categories/${category.id}/edit`}
              className="font-medium text-primary hover:underline"
            >
              {category.name}
            </Link>
            <p className="text-xs text-muted-foreground">{category.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "parent",
      label: "Parent",
      render: (category) =>
        category.parent ? (
          <span>{category.parent.name}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "products",
      label: "Products",
      render: (category) => (
        <span className="font-medium">{category._count?.products ?? 0}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (category) => (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
            category.isActive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
              : "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-300"
          )}
        >
          {category.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "sortOrder",
      label: "Order",
      render: (category) => <span>{category.sortOrder ?? 0}</span>,
    },
  ];

  const handleDelete = async (category: Category) => {
    if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteCategoryMutation.mutateAsync(category.id);
      // React Query will automatically refetch the categories list
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete category";
      alert(message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage category hierarchy and metadata.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {isAdmin && (
            <Button onClick={() => navigate("/categories/new")}>
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter categories.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or slug..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            Overview of every category in the catalog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <EyeOff className="h-6 w-6 text-destructive" />
              <p className="text-sm text-destructive">{errorMessage}</p>
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredCategories}
              loading={loading}
              keyExtractor={(category) => category.id}
              actions={
                isAdmin
                  ? (category) => (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            navigate(`/categories/${category.id}/edit`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )
                  : undefined
              }
              actionsHeader="Actions"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
