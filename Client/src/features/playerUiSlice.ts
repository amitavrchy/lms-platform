import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type PlayerUiState = {
  focusMode: boolean;
  playbackRate: number;
  notesOpen: boolean;
};

const initialState: PlayerUiState = {
  focusMode: false,
  playbackRate: 1,
  notesOpen: false,
};

const playerUiSlice = createSlice({
  name: "playerUi",
  initialState,
  reducers: {
    setFocusMode(state, action: PayloadAction<boolean>) {
      state.focusMode = action.payload;
    },
    toggleFocusMode(state) {
      state.focusMode = !state.focusMode;
    },
    setPlaybackRate(state, action: PayloadAction<number>) {
      state.playbackRate = action.payload;
    },
    setNotesOpen(state, action: PayloadAction<boolean>) {
      state.notesOpen = action.payload;
    },
  },
});

export const { setFocusMode, toggleFocusMode, setPlaybackRate, setNotesOpen } = playerUiSlice.actions;
export default playerUiSlice.reducer;
