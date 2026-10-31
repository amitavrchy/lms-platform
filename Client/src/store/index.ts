import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/authSlice";
import uiReducer from "@/features/uiSlice";
import playerUiReducer from "@/features/playerUiSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      playerUi: playerUiReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
