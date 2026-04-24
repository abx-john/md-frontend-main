import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../axios";

/**
 * Fetch all categories once. The `condition` guard prevents a second API
 * call when the data is already loaded or currently loading.
 */
export const fetchCategories = createAsyncThunk(
  "category/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/categories");
      return res.data ?? [];
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const { status } = getState().category;
      return status !== "succeeded" && status !== "loading";
    },
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState: {
    items: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    /** Call this after creating/updating a category to force a re-fetch. */
    invalidateCategories: (state) => {
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { invalidateCategories } = categorySlice.actions;
export default categorySlice.reducer;

// Selectors
export const selectCategories = (state) => state.category.items;
/** Flat name array — ready for DataGrid `valueOptions` */
export const selectCategoryNames = (state) =>
  state.category.items.map((c) => c.name);
export const selectCategoryStatus = (state) => state.category.status;
