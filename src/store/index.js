// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import busyReducer from "./busySlice";
import snackbarReducer from "./snackbarSlice";
// import other reducers if you have them, e.g. auth
// import authReducer from "./authSlice";

const store = configureStore({
  reducer: {
    busy: busyReducer,
    snackbar: snackbarReducer,
    // auth: authReducer, // uncomment if present
  },
  // optional: you can customize middleware here
});

export default store;
