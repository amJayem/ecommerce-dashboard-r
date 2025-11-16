import { cn } from "@/lib/utils"
import { AlertCircle, Loader2, Package } from "lucide-react"
import * as React from "react"

export interface Column<T> {
  key: string
  label: string
  render: (item: T) => React.ReactNode
  className?: string
  headerClassName?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  actions?: (item: T) => React.ReactNode
  actionsHeader?: string
  keyExtractor: (item: T) => string | number
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  error = null,
  emptyMessage = "No data found",
  emptyIcon,
  actions,
  actionsHeader = "Actions",
  keyExtractor,
  className,
}: DataTableProps<T>) {
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        {emptyIcon || <Package className="h-12 w-12 text-muted-foreground" />}
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  // Table with data
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "text-left p-4 font-medium",
                  column.headerClassName
                )}
              >
                {column.label}
              </th>
            ))}
            {actions && (
              <th className="text-right p-4 font-medium">{actionsHeader}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="border-b hover:bg-accent/50"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn("p-4", column.className)}
                >
                  {column.render(item)}
                </td>
              ))}
              {actions && (
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    {actions(item)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

