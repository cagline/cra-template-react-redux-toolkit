import { useRoutes } from "react-router-dom";
import UnauthorizedLayout from "./layouts/UnauthorizedLayout";
import Dashboard from "./features/dashboard/Dashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./features/home/Home";
import About from "./features/help/Help";
import Todo from "./features/todo/Todo";
import Counter from "./features/counter/Counter";


export default function AppRoutes() {
  return useRoutes([
    {
      element: <DashboardLayout/>,
      children: [
        {path: "/", element: <Dashboard/>},
        {path: "counter", element: <Counter/>},
        {path: "todo", element: <Todo/>}
      ]
    },
    {
      element: <UnauthorizedLayout/>,
      children: [
        {path: "home", element: <Home/>},
        {path: "about", element: <About/>}
      ],
    },
  ]);
}
