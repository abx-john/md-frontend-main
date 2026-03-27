import { Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
  Snackbar,
  Alert,
} from "@mui/material";

import Landing from "./pages/Landing";
import MainLayout from "./layout/MainLayout";
import WareHouse from "./pages/Warehouse";
import Login from "./pages/authentication/Login";

import { selectBusy } from "./store/busySlice";
import { selectSnackbar, hideSnackbar } from "./store/snackbarSlice";
import Product from "./pages/Product";
import Customer from "./pages/Customer";
import Sale from "./pages/Sale";
import SaleList from "./pages/SaleList";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import CategoryList from "./pages/CategoryList";
import ProductQuantityHistory from "./pages/ProductQuantityHistory";

function App() {
  const dispatch = useDispatch();

  // global busy state
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
      {/* GLOBAL SNACKBAR */}

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

      {/* ROUTES */}

      <Routes>
        <Route path="/admin" element={<MainLayout />}>
          <Route path="warehouse" element={<WareHouse />} />
          <Route path="product" element={<Product />} />
          <Route path="customer" element={<Customer />} />
          <Route path="pos" element={<Sale />} />
          <Route path="sales" element={<SaleList />} />
          <Route path="category" element={<CategoryList />} />
          <Route path="sales/:customerId" element={<SaleList />} />
          <Route path="productHistory/:id" element={<ProductQuantityHistory />} />
        </Route>
        <Route path="/" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
      </Routes>

      {/* GLOBAL LOADER (BLUR BACKDROP) */}

      <Backdrop
        open={isBusy}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 9999,
          color: "#fff",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
      >
        <CircularProgress color="inherit" />
        <Typography sx={{ ml: 2 }}>Loading...</Typography>
      </Backdrop>
    </>
  );
}

export default App;
