import { Outlet } from "react-router-dom";

const UnauthorizedLayout = () => {
  return (
    <div  >
      <Outlet />
    </div>
  );
};

export default UnauthorizedLayout;
