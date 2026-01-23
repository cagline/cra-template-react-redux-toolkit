import { Outlet } from "react-router-dom";
import SideNav from "../components/SideNav/SideNav";
import TopBar from "../components/Topbar/Topbar";
import { Suspense, useState } from "react";
import { Container, styled } from "@mui/material";

const drawerWidth = 240;

const PageContainer = styled(Container, { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  marginTop: 64,
  maxWidth: "none !important",
  width: "100%",
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
  ...(!open && {
    width: "100%",
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
    <Container 
      maxWidth={false} 
      sx={{ 
        maxWidth: "none !important",
        width: "100%",
        paddingLeft: 0,
        paddingRight: 0,
      }}
    >
      <TopBar open={open} onDrawerOpen={handleDrawerOpen} />
      <SideNav open={open} onDrawerOpen={handleDrawerOpen} onDrawerClose={handleDrawerClose} />
      <PageContainer open={open} id="page-content-wrapper" maxWidth={false}>
        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </PageContainer>
    </Container>
  );
};

export default DashboardLayout;
