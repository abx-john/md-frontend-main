// src/store/busySlice.js
import { createSlice } from "@reduxjs/toolkit";

const busySlice = createSlice({
  name: "busy",
  initialState: {
    loading: false,
  },
  reducers: {
    setBusy: (state, action) => {
      state.loading = action.payload; // true or false
    },
    startBusy: (state) => {
      state.loading = true;
    },
    stopBusy: (state) => {
      state.loading = false;
    }
  },
});

export const { setBusy, startBusy, stopBusy } = busySlice.actions;
export default busySlice.reducer;

// selector
export const selectBusy = (state) => state.busy.loading;
