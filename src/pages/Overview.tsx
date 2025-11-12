import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { usePageTitle } from "@/hooks/use-page-title"
import { formatCurrency } from "@/lib/constants"

const stats = [
  {
    title: "Total Revenue",
    value: formatCurrency(45231.89),
    description: "+20.1% from last month",
    icon: DollarSign,
    trend: "up",
  },
  {
    title: "Orders",
    value: "+2,350",
    description: "+180.1% from last month",
    icon: ShoppingCart,
    trend: "up",
  },
  {
    title: "Customers",
    value: "+12,234",
    description: "+19% from last month",
    icon: Users,
    trend: "up",
  },
  {
    title: "Products",
    value: "+573",
    description: "+201 since last month",
    icon: Package,
    trend: "up",
  },
]

const recentSales = [
  {
    id: 1,
    customer: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: formatCurrency(1999.00),
    status: "completed",
  },
  {
    id: 2,
    customer: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: formatCurrency(39.00),
    status: "pending",
  },
  {
    id: 3,
    customer: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: formatCurrency(299.00),
    status: "completed",
  },
  {
    id: 4,
    customer: "William Kim",
    email: "will@email.com",
    amount: formatCurrency(99.00),
    status: "completed",
  },
  {
    id: 5,
    customer: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: formatCurrency(39.00),
    status: "pending",
  },
]

export function Overview() {
  usePageTitle("Overview")

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your store performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendIcon
                    className={`h-3 w-3 ${
                      stat.trend === "up" ? "text-teal-600 dark:text-teal-400" : "text-red-600 dark:text-red-400"
                    }`}
                  />
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>
            You made {recentSales.length} sales this month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {sale.customer}
                  </p>
                  <p className="text-sm text-muted-foreground">{sale.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{sale.amount}</p>
                    <p
                      className={`text-xs ${
                        sale.status === "completed"
                          ? "text-teal-600 dark:text-teal-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {sale.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

