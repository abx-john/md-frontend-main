import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";

/**
 * Fetch all warehouses once. The `condition` guard prevents duplicate API
 * calls when the data is already loaded or currently loading.
 */
export const fetchWarehouses = createAsyncThunk(
  "warehouse/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/warehouses");
      return res.data ?? [];
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const { status } = getState().warehouse;
      return status !== "succeeded" && status !== "loading";
    },
  }
);

const warehouseSlice = createSlice({
  name: "warehouse",
  initialState: {
    items: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    /** Call this after creating/updating a warehouse to force a re-fetch. */
    invalidateWarehouses: (state) => {
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { invalidateWarehouses } = warehouseSlice.actions;
export default warehouseSlice.reducer;

// Selectors
export const selectWarehouses = (state) => state.warehouse.items;
export const selectWarehouseStatus = (state) => state.warehouse.status;
