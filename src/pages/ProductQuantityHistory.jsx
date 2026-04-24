import React, { lazy, Suspense, useMemo, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { api } from "../axios";
import FormTextField from "../components/FormTextField";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const DataTable = lazy(() => import("../components/DataTable"));


export default function ProductQuantityHistory() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Determine context: coming from warehouse-products page or from product page
  const isWarehouseMode = searchParams.get("mode") === "warehouse";

  // In warehouse mode, params.id is the product_warehouse row id
  // In product mode, params.id is the product id
  const queryParams = isWarehouseMode
    ? { product_warehouse_id: params.id }
    : { product_id: params.id };

  const columns = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 80, filterable: false, sortable: false },
      {
        field: "product_warehouse",
        headerName: "Product",
        width: 200,
        filterable: false,
        sortable: false,
        valueGetter: (row) => row?.product?.name || "Unknown",
      },
      ...(isWarehouseMode
        ? []
        : [
            {
              field: "product_warehouse_warehouse",
              headerName: "Warehouse",
              width: 180,
              filterable: false,
              sortable: false,
              valueGetter: (_row, fullRow) =>
                fullRow?.product_warehouse?.warehouse?.name || "Unknown",
            },
          ]),
      { field: "quantity", headerName: "Qty Change", width: 130, filterable: false, sortable: false },
      {
        field: "user",
        headerName: "User",
        width: 180,
        filterable: false,
        sortable: false,
        valueGetter: (row) => row?.name || "Unknown",
      },
    ],
    [isWarehouseMode]
  );

  const [refreshKey, setRefreshKey] = useState(0);

  // dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("view");
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const openViewDialog = (row) => {
    setDialogMode("view");
    setForm(row);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleChange = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.value }));

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        {isWarehouseMode ? "Warehouse Product History" : "Product Quantity History"}
      </Typography>

      <Suspense fallback={
        <Stack alignItems="center" justifyContent="center" sx={{ height: 400 }}>
          Loading table…
        </Stack>
      }>
        <DataTable
          tableName="productQuantityHistory"
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          onViewRow={(row) => openViewDialog(row)}
          refreshKey={refreshKey}
          queryParams={queryParams}
        />
      </Suspense>

      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>View Quantity History</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormTextField
              readOnly
              name="product_warehouse.product.name"
              label="Product"
              form={form}
              errors={errors}
              handleChange={handleChange}
            />
            {!isWarehouseMode && (
              <FormTextField
                readOnly
                name="product_warehouse.warehouse.name"
                label="Warehouse"
                form={form}
                errors={errors}
                handleChange={handleChange}
              />
            )}
            <FormTextField
              name="quantity"
              readOnly
              label="Qty Change"
              type="number"
              form={form}
              errors={errors}
              handleChange={handleChange}
            />
            <FormTextField
              name="user.name"
              readOnly
              label="User"
              form={form}
              errors={errors}
              handleChange={handleChange}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
