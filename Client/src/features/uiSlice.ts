import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type UiState = {
  theme: "dark" | "light";
  sidebarOpen: boolean;
  tutorOpen: boolean;
};

const initialState: UiState = {
  theme: "dark",
  sidebarOpen: true,
  tutorOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<"dark" | "light">) {
      state.theme = action.payload;
      if (typeof document !== "undefined") {
        document.documentElement.dataset.theme = action.payload === "light" ? "light" : "dark";
      }
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setTutorOpen(state, action: PayloadAction<boolean>) {
      state.tutorOpen = action.payload;
    },
  },
});

export const { setTheme, toggleSidebar, setTutorOpen } = uiSlice.actions;
export default uiSlice.reducer;
