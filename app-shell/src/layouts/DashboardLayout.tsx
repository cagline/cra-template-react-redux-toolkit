import { Outlet } from "react-router-dom";
import SideNav from "../components/SideNav/SideNav";
import TopBar from "../components/Topbar/Topbar";
import { Suspense, useState } from "react";
import { Box, styled } from "@mui/material";
import { PageTitleProvider } from "./PageTitleProvider";

const drawerWidth = 240;

const PageContainer = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  marginTop: 64,
  marginLeft: 64,
  width: `calc(100% - 64px)`,
  maxWidth: "none",
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DashboardLayout = () => {
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <PageTitleProvider>
      <Box sx={{ width: "100%" }}>
        <TopBar open={open} onDrawerOpen={handleDrawerOpen} />
        <SideNav open={open} onDrawerOpen={handleDrawerOpen} onDrawerClose={handleDrawerClose} />
        <PageContainer open={open} id="page-content-wrapper">
          <Suspense fallback={<div>Loading...</div>}>
            <Outlet />
          </Suspense>
        </PageContainer>
      </Box>
    </PageTitleProvider>
  );
};

export default DashboardLayout;
