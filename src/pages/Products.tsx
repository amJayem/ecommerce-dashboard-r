import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Plus, Search, Edit, Trash2 } from "lucide-react"
import { usePageTitle } from "@/hooks/use-page-title"

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: "$99.99",
    stock: 45,
    status: "active",
  },
  {
    id: 2,
    name: "Leather Wallet",
    category: "Accessories",
    price: "$49.99",
    stock: 120,
    status: "active",
  },
  {
    id: 3,
    name: "Smart Watch",
    category: "Electronics",
    price: "$199.99",
    stock: 0,
    status: "out of stock",
  },
  {
    id: 4,
    name: "Cotton T-Shirt",
    category: "Clothing",
    price: "$24.99",
    stock: 200,
    status: "active",
  },
  {
    id: 5,
    name: "Running Shoes",
    category: "Footwear",
    price: "$129.99",
    stock: 35,
    status: "active",
  },
]

export function Products() {
  usePageTitle("Products")

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory and details.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Products</CardTitle>
          <CardDescription>Find products by name, category, or SKU</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            A list of all products in your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Product</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-left p-4 font-medium">Price</th>
                  <th className="text-left p-4 font-medium">Stock</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-accent/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">#{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{product.category}</td>
                    <td className="p-4 font-medium">{product.price}</td>
                    <td className="p-4">{product.stock}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          product.status === "active"
                            ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

