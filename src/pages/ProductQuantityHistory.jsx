import React, { lazy, Suspense, useMemo, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { api } from "../axios";
import FormTextField from "../components/FormTextField";
import { useNavigate, useParams } from "react-router-dom";

const DataTable = lazy(() => import("../components/DataTable"));


export default function Customer() {
  const params = useParams()
  console.log(params)
  const navigate = useNavigate();
  const columns = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 80,filterable: false,sortable: false },
      { field: "product", headerName: "Product",valueGetter: (row) => row?.name || "Unknown", width: 200 ,filterable:false,sortable: false},
      { field: "quantity", headerName: "Quantity", width: 200 ,filterable:false,sortable: false},
      { field: "user", headerName: "User",valueGetter: (row) => row?.name || "Unknown", width: 200 ,filterable:false,sortable: false},

    ],
    []
  );

  const [refreshKey, setRefreshKey] = useState(0);

  // dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // 'create' | 'view'
  const [form, setForm] = useState({ name: "", quantity: "", user: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // optional: use notistack for quick snackbars, fallback to alert if not installed
  let enqueueSnackbar = null;
  try {
    // dynamic require to avoid hard dependency if not installed
    // eslint-disable-next-line no-unused-vars
    const ns = require("notistack");
    // won't actually run — better to assume you have your redux snackbar; left here for reference
  } catch (e) { }

  const openCreateDialog = () => {
    setDialogMode("create");
    setForm({ name: "", email: "", phone: "", total_outstanding: 0.00, total_paid: 0.00, total_discount: 0.00 });
    setDialogOpen(true);
  };

  const openViewDialog = (row) => {
    setDialogMode("view");
    setForm(row);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleChange = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post("/api/productQuantityHistory", form);
      setRefreshKey((k) => k + 1);
      setDialogOpen(false);
    } catch (err) {
      console.error("Create error:", err);
      const msg = err?.response?.data?.message || err?.message || "Create failed";
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
      else alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>


      <Suspense fallback={
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{ height: 400 }}
        >
          Loading table…
        </Stack>
      }>


        <DataTable
          tableName="productQuantityHistory"
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          onViewRow={(row) => openViewDialog(row)}
          refreshKey={refreshKey}
        />
      </Suspense>

      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === "create" ? "Create Customer" : "View Quantity History"}</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormTextField readOnly name="product.name" label="Name" form={form} errors={errors} handleChange={handleChange} />

            <FormTextField name="quantity" readOnly label="Quantity" type="number" form={form} errors={errors} handleChange={handleChange} />
            <FormTextField name="user.name" label="User"  form={form} errors={errors} handleChange={handleChange} />



          </Stack>
        </DialogContent>

        <DialogActions>

          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting }
          >
            {submitting ? "Saving..." : dialogMode === "create" ? "Create" : "Close"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
