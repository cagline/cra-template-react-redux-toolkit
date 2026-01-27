import { lazy, Suspense } from "react";
import { useRoutes } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import DashboardLayout from "./layouts/DashboardLayout";
import UnauthorizedLayout from "./layouts/UnauthorizedLayout";
import { RemoteModuleA, RemoteModuleB } from "./remotes";

const Error = lazy(() => import("./features/error/Error"));
const Home = lazy(() => import("./features/home/Home"));
const About = lazy(() => import("./features/help/Help"));
const Todo = lazy(() => import("./features/todo/Todo"));
const Counter = lazy(() => import("./features/counter/Counter"));
const Dashboard = lazy(() => import("./features/dashboard/Dashboard"));

// Loading fallback for Suspense
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
    <CircularProgress />
  </Box>
);

export default function AppRoutes() {
  return useRoutes([
    {
      element: <DashboardLayout />,
      children: [
        { path: "/", element: <Dashboard /> },
        { path: "counter", element: <Counter /> },
        { path: "todo", element: <Todo /> },
        { path: "error", element: <Error /> },
        // Micro Frontend Routes
        // These routes mount remote modules that handle their own internal routing
        { 
          path: "module-a/*", 
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <RemoteModuleA />
            </Suspense>
          ) 
        },
        { 
          path: "module-b/*", 
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <RemoteModuleB />
            </Suspense>
          ) 
        },
      ],
    },
    {
      element: <UnauthorizedLayout />,
      children: [
        { path: "home", element: <Home /> },
        { path: "about", element: <About /> },
      ],
    },
  ]);
}
