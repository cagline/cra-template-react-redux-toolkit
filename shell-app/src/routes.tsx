import { lazy } from "react";
import { useRoutes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import UnauthorizedLayout from "./layouts/UnauthorizedLayout";

const Error = lazy(() => import("./features/error/Error"));
const Home = lazy(() => import("./features/home/Home"));
const About = lazy(() => import("./features/help/Help"));
const Todo = lazy(() => import("./features/todo/Todo"));
const Counter = lazy(() => import("./features/counter/Counter"));
const Dashboard = lazy(() => import("./features/dashboard/Dashboard"));
const Portfolio = lazy(() => import("./features/portfolio/Portfolio"));

export default function AppRoutes() {
  return useRoutes([
    {
      element: <DashboardLayout />,
      children: [
        { path: "/", element: <Dashboard /> },
        { path: "counter", element: <Counter /> },
        { path: "todo", element: <Todo /> },
        { path: "portfolio", element: <Portfolio /> },
        { path: "error", element: <Error /> },
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
