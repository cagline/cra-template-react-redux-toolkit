import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import {apiSlice as todoApiSlice} from '../api/todoApiSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [todoApiSlice.reducerPath] : todoApiSlice.reducer,
  },
  middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(todoApiSlice.middleware)
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
