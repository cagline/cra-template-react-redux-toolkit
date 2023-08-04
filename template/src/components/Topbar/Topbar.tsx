import { FormControlLabel, IconButton, styled, Switch, Toolbar, Typography, useTheme } from "@mui/material";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';

import React, { useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {  changeThemeMode, selectThemeMode } from "../../appSlice";

const drawerWidth = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}



const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Topbar = ({open, onDrawerOpen}: any) => {
  const themeMode = useAppSelector(selectThemeMode);
  const dispatch = useAppDispatch();

  const handleDrawerOpen = () => {
    onDrawerOpen(true);
  };

  return (
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && {display: 'none'}),
            }}
          >
            <MenuIcon/>
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Mini variant drawer
          </Typography>
          <FormControlLabel
            style={{ marginLeft: 'auto'}}
            control={<Switch checked={themeMode=='dark'} onChange={() => dispatch(changeThemeMode(themeMode))}/>}
            label="Dark Mode"
          />
        </Toolbar>
      </AppBar>
  );
};

export default Topbar;
