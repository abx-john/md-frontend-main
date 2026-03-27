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
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const DataTable = lazy(() => import("../components/DataTable"));


export default function Customer() {
  const navigate = useNavigate();

  const parseMysqlDate = (value) => {
    if (!value) return null;
    return new Date(value.replace(" ", "T"));
  }

  const columns = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 80 },
      { field: "name", headerName: "Name", width: 200 },
      { field: "email", headerName: "Email", width: 200 },
      { field: "phone", headerName: "Phone", width: 200 },
      { field: "total_paid", headerName: "Total Paid", width: 200 },
      { field: "total_outstanding", headerName: "Total Outstanding", width: 200 },
      { field: "total_discount", headerName: "Total Discount", width: 200 },
      {
        field: "outstanding_last_date", type: "date",headerName: "Outstanding Last Date", width: 200,
        valueGetter: (row) => {
          return parseMysqlDate(row)
        },
        valueFormatter: (params) =>
          params ? format(params, "dd MMM yyyy hh:mm:ss a") : "",
      },
    ],
    []
  );

  const [refreshKey, setRefreshKey] = useState(0);

  // dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // 'create' | 'view'
  const [form, setForm] = useState({ name: "", email: "", phone: "", total_outstanding: 0.00, total_paid: 0.00, total_discount: 0.00 });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});



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
      const res = await api.post("/api/customer", form);
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
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={openCreateDialog}>
          Create Customer
        </Button>
      </Stack>

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
          tableName="customer"
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          onViewRow={(row) => openViewDialog(row)}
          refreshKey={refreshKey}
        />
      </Suspense>

      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === "create" ? "Create Customer" : "View Customer"}</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormTextField name="name" label="Name" form={form} errors={errors} handleChange={handleChange} />

            <FormTextField name="email" label="Email" type="email" form={form} errors={errors} handleChange={handleChange} />
            <FormTextField name="address" label="Address" multiline={4} form={form} errors={errors} handleChange={handleChange} />

            <FormTextField name="phone" label="Phone" form={form} errors={errors} handleChange={handleChange} />

            <FormTextField name="total_paid" label="Total Paid" form={form} errors={errors} handleChange={() => { }} />

            <FormTextField name="total_outstanding" label="Total Outstanding" form={form} errors={errors} handleChange={() => { }} />

            <FormTextField name="total_discount" label="Total Discount" form={form} errors={errors} handleChange={() => { }} />

          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" onClick={() => {
            navigate(`/admin/sales/${form.id}`)
          }} >
            Sales Report
          </Button>
          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || dialogMode === "view"}
          >
            {submitting ? "Saving..." : dialogMode === "create" ? "Create" : "Close"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
