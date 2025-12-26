import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Overview } from "@/pages/Overview";
import { Products } from "@/pages/Products";
import { ProductForm } from "@/pages/product/ProductForm";
import { Categories } from "@/pages/Categories";
import { CategoryForm } from "@/pages/CategoryForm";
import { Orders } from "@/pages/Orders";
import { Customers } from "@/pages/Customers";
import { Settings } from "@/pages/Settings";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Users } from "@/pages/Users";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Overview />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "categories",
        element: <Categories />,
      },
      {
        path: "products/new",
        element: <ProductForm />,
      },
      {
        path: "products/:productId/edit",
        element: <ProductForm />,
      },
      {
        path: "categories/new",
        element: <CategoryForm />,
      },
      {
        path: "categories/:categoryId/edit",
        element: <CategoryForm />,
      },
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "customers",
        element: <Customers />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "users",
        element: <Users />,
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
]);
