import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { Toaster } from "@/components/ui/sonner.tsx";
import DashboardPage from "@/DashboardPage.tsx";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import AnalyticsPage from "@/AnalyticsPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/analytics",
    element: <AnalyticsPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>,
);
