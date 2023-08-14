import { FormControlLabel, IconButton, MenuItem, styled, Switch, Toolbar, Typography } from "@mui/material";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Select from '@mui/material/Select';


import React, { useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { changeThemeMode, selectThemeMode } from "../../appSlice";
import { Trans, useTranslation } from "react-i18next";
import config from '../../config';

const drawerWidth = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}


const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({theme, open}) => ({
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

const languages = [
  {lang: 'en', nativeName: 'English'},
  {lang: 'de', nativeName: 'Deutsch'}
];

const Topbar = ({open, onDrawerOpen}: any) => {
  const [lang, setLang] = useState(languages[0].lang);
  const themeMode = useAppSelector(selectThemeMode);
  const dispatch = useAppDispatch();
  const {t, i18n} = useTranslation();

  const handleDrawerOpen = () => {
    onDrawerOpen(true);
  };
  const onLangChange = (e: any) => {
    const selectedLang = e.target.value;
    console.log(selectedLang)
    debugger
    setLang(selectedLang);
    i18n.changeLanguage(selectedLang);
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
          <Trans i18nKey="app.title">React + Redux-Toolkit + MUI + Typescript Boilerplate</Trans>
        </Typography>

        <Select onChange={onLangChange} defaultValue={lang} style={{marginLeft: 'auto'}}>
          {languages.map((lan:any) => (
            <MenuItem
              key={lan.lang}
              value={lan.lang}
            >{lan.nativeName}</MenuItem>
          ))}
        </Select>
        <FormControlLabel
          style={{marginLeft: 'auto'}}
          control={<Switch checked={themeMode == 'dark'} onChange={() => dispatch(changeThemeMode(themeMode))}/>}
          label={t('app.darkMood')}
        />
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
