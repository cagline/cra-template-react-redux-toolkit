import React from "react";
import {
  ButtonBase,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  useTheme,
} from "@mui/material";
import type { CSSObject, Theme } from "@mui/material";
import {
  CalculateOutlined,
  ChecklistRtlOutlined,
  ChevronLeft,
  ChevronRight,
  Home,
  ErrorOutline,
  AccountBalanceWallet,
} from "@mui/icons-material";
import MuiDrawer from "@mui/material/Drawer";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoUrl from "../../logo.jpg";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const ImageButton = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 64,
  [theme.breakpoints.down('sm')]: {
    width: '100% !important', // Overrides inline-style
    height: 100,
  },
  '&:hover, &.Mui-focusVisible': {
    zIndex: 1,
    '& .MuiImageBackdrop-root': {
      opacity: 0.15,
    },
    '& .MuiImageMarked-root': {
      opacity: 0,
    },
    '& .MuiTypography-root': {
      border: '4px solid currentColor',
    },
  },
}));

const ImageSrc = styled('span')({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundSize: 'contain',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
});

const SideNav = ({ open, onDrawerOpen, onDrawerClose }: any) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleDrawerOpen = () => {
    onDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    onDrawerClose(false);
  };

  return (
    <Drawer variant="permanent" open={open}>
      <DrawerHeader>
        <ImageButton
          onClick={() => {
            navigate(`/`);
          }}
        >
          <ImageSrc style={{ backgroundImage: `url(${logoUrl})` }} />
        </ImageButton>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        <ListItem key={'Dashboard'} disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}
            onClick={() => {
              navigate(`/`);
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
              <Home />
            </ListItemIcon>
            <ListItemText primary={t('dashboard')} sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
        <ListItem key={'Todo'} disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}
            onClick={() => {
              navigate(`/todo`);
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
              <ChecklistRtlOutlined />
            </ListItemIcon>
            <ListItemText primary={t('todo.title')} sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
        <ListItem key={'Counter'} disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}
            onClick={() => {
              navigate(`/counter`);
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
              <CalculateOutlined />
            </ListItemIcon>
            <ListItemText primary={t('counter.title')} sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
        <ListItem key={'Portfolio'} disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}
            onClick={() => {
              navigate(`/portfolio`);
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
              <AccountBalanceWallet />
            </ListItemIcon>
            <ListItemText primary="Portfolio" sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>

        <ListItem key={'Error'} disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}
            onClick={() => {
              navigate(`/error`);
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
              <ErrorOutline color="error" />
            </ListItemIcon>
            <ListItemText primary={t('error.title')} sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
      </List>
      {import.meta.env.VITE_APP_VERSION}
    </Drawer>
  );
};

export default SideNav;
