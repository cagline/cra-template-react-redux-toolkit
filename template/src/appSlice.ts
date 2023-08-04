import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store/store';
import { light } from "@mui/material/styles/createPalette";

export type ThemeMode = 'light' | 'dark';

export interface AppState {
  themeMode:  ThemeMode
}

const initialState: AppState = {
  themeMode: 'light',
};
export const appSlice = createSlice({
  name: 'app',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    changeThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload == 'light'? 'dark': 'light';
    },
  },
});

export const { changeThemeMode} = appSlice.actions;
export const selectThemeMode = (state: RootState) => state.app.themeMode;


export default appSlice.reducer;
