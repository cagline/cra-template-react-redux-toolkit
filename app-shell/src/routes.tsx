import { lazy, Suspense } from "react";
import { useRoutes } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import DashboardLayout from "./layouts/DashboardLayout";
import UnauthorizedLayout from "./layouts/UnauthorizedLayout";
import { RemoteModuleA, RemoteModuleB } from "./remotes";

const ErrorPage = lazy(() =>
  import("./features/error").then((m) => ({ default: m.ErrorPage }))
);
const HomePage = lazy(() =>
  import("./features/home").then((m) => ({ default: m.HomePage }))
);
const HelpPage = lazy(() =>
  import("./features/help").then((m) => ({ default: m.HelpPage }))
);
const TodoPage = lazy(() =>
  import("./features/todo").then((m) => ({ default: m.TodoPage }))
);
const CounterPage = lazy(() =>
  import("./features/counter").then((m) => ({ default: m.CounterPage }))
);
const DashboardPage = lazy(() =>
  import("./features/dashboard").then((m) => ({ default: m.DashboardPage }))
);

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
        { path: "/", element: <DashboardPage /> },
        { path: "counter", element: <CounterPage /> },
        { path: "todo", element: <TodoPage /> },
        { path: "error", element: <ErrorPage /> },
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
        { path: "home", element: <HomePage /> },
        { path: "about", element: <HelpPage /> },
      ],
    },
  ]);
}
