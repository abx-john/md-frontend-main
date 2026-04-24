// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import busyReducer from "./busySlice";
import snackbarReducer from "./snackbarSlice";
import categoryReducer from "./categorySlice";
import warehouseReducer from "./warehouseSlice";

const store = configureStore({
  reducer: {
    busy: busyReducer,
    snackbar: snackbarReducer,
    category: categoryReducer,
    warehouse: warehouseReducer,
  },
});

export default store;
