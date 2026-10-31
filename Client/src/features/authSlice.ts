import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/lib/api";

type AuthState = {
  user: AuthUser | null;
  hydrated: boolean;
};

const initialState: AuthState = {
  user: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.hydrated = true;
    },
    setHydrated(state, action: PayloadAction<boolean>) {
      state.hydrated = action.payload;
    },
    logout(state) {
      state.user = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("learnora_access_token");
        localStorage.removeItem("learnora_refresh_token");
      }
    },
  },
});

export const { setUser, setHydrated, logout } = authSlice.actions;
export default authSlice.reducer;
