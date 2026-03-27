// src/store/snackbarSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  open: false,
  message: "",
  severity: "info", // 'error' | 'warning' | 'info' | 'success'
  autoHideDuration: 3000, // ms
};

const snackbarSlice = createSlice({
  name: "snackbar",
  initialState,
  reducers: {
    // payload: { message, severity?, autoHideDuration?, open? }
    showSnackbar: (state, action) => {
      const { message = "", severity = "info", autoHideDuration = 3000, open = true } =
        action.payload || {};
      state.open = open;
      state.message = message;
      state.severity = severity;
      state.autoHideDuration = autoHideDuration;
    },

    // simply close (keeps last message so it can be reopened if needed)
    hideSnackbar: (state) => {
      state.open = false;
    },

    // full reset to initial state (if ever needed)
    resetSnackbar: (state) => {
      state.open = false;
      state.message = "";
      state.severity = "info";
      state.autoHideDuration = 3000;
    },
  },
});

export const { showSnackbar, hideSnackbar, resetSnackbar } = snackbarSlice.actions;
export default snackbarSlice.reducer;

// selector: returns the full snackbar slice
export const selectSnackbar = (state) => state.snackbar;
