import { router } from "@/routes";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Analytics />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
