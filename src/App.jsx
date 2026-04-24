
import { Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { lazy, Suspense } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
  Snackbar,
  Alert,
} from "@mui/material";

import { selectBusy } from "./store/busySlice";
import { selectSnackbar, hideSnackbar } from "./store/snackbarSlice";

/* =======================
   LAZY LOADED COMPONENTS
======================= */

const Landing = lazy(() => import("./pages/Landing"));
const MainLayout = lazy(() => import("./layout/MainLayout"));
const WareHouse = lazy(() => import("./pages/Warehouse"));
const Login = lazy(() => import("./pages/authentication/Login"));
const Product = lazy(() => import("./pages/Product"));
const Customer = lazy(() => import("./pages/Customer"));
const Sale = lazy(() => import("./pages/Sale"));
const SaleList = lazy(() => import("./pages/SaleList"));
const ProductList = lazy(() => import("./pages/ProductList"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const CategoryList = lazy(() => import("./pages/CategoryList"));
const CategoryListLanding = lazy(() => import("./pages/CategoryListLanding"));
const ProductQuantityHistory = lazy(() =>
  import("./pages/ProductQuantityHistory")
);
const ProductWarehousePage = lazy(() => import("./pages/ProductWarehousePage"));

/* =======================
   APP COMPONENT
======================= */

function App() {
  const dispatch = useDispatch();

  // global busy state (API loading)
  const isBusy = useSelector(selectBusy);

  // global snackbar state
  const { open, message, severity, autoHideDuration } =
    useSelector(selectSnackbar);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    dispatch(hideSnackbar());
  };

  return (
    <>
      {/* =======================
          GLOBAL SNACKBAR
      ======================= */}
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          elevation={6}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>

      {/* =======================
          ROUTES WITH SUSPENSE
      ======================= */}
      <Suspense
        fallback={
          <Backdrop
            open={true}
            sx={{
              zIndex: (theme) => theme.zIndex.drawer + 9999,
              color: "#fff",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              backgroundColor: "rgba(0,0,0,0.2)",
            }}
          >
            <CircularProgress color="inherit" />
            <Typography sx={{ ml: 2 }}>Loading page...</Typography>
          </Backdrop>
        }
      >
        <Routes>
          <Route path="/admin" element={<MainLayout />}>
            <Route path="warehouse" element={<WareHouse />} />
            <Route path="product" element={<Product />} />
            <Route path="customer" element={<Customer />} />
            <Route path="pos" element={<Sale />} />
            <Route path="sales" element={<SaleList />} />
            <Route path="category" element={<CategoryList />} />
            <Route path="sales/:customerId" element={<SaleList />} />
            <Route
              path="productHistory/:id"
              element={<ProductQuantityHistory />}
            />
            <Route
              path="product-warehouse/:id"
              element={<ProductWarehousePage />}
            />
          </Route>

          <Route path="/" element={<CategoryListLanding />} />
          <Route path="/category/:id" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Suspense>

      {/* =======================
          GLOBAL API LOADER
      ======================= */}
      <Backdrop
        open={isBusy}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 9998, // slightly lower than suspense
          color: "#fff",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          backgroundColor: "rgba(0,0,0,0.15)",
        }}
      >
        <CircularProgress color="inherit" />
        <Typography sx={{ ml: 2 }}>Loading...</Typography>
      </Backdrop>
    </>
  );
}

export default App;