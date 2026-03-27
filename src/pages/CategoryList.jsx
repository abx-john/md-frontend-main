import React, {  useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { api } from "../axios";
import { fetchWarehouses } from "../axios/function";
import { useDispatch } from "react-redux";
import { setBusy, stopBusy } from "../store/busySlice";
import { showSnackbar } from "../store/snackbarSlice";
import { Autocomplete, createFilterOptions } from "@mui/material";

export default function Category() {
  const dispatch = useDispatch();
  const filter = createFilterOptions();

  const columns = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 80 },
      { field: "name", headerName: "Name", width: 200 },

    ],
    []
  );

  const [refreshKey, setRefreshKey] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // 'create' | 'view'
  const [form, setForm] = useState({ name: "", });
  const [submitting, setSubmitting] = useState(false);
  const [warehouses, setWarehouses] = useState([]);


  const openCreateDialog = () => {
    setDialogMode("create");
    setForm({ name: "", warehouse_id: null, quantity: "", unit: "", description: "" });
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
      const res = await api.post("/api/category", form);

      setRefreshKey((k) => k + 1);
      setDialogOpen(false);
    } catch (err) {
      console.error("Create error:", err);
      const msg = err?.response?.data?.message || err?.message || "Create failed";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };



  useEffect(() => {
    dispatch(setBusy(true));
    fetchWarehouses().then(res => {
      setWarehouses(res.data);
    })
      .catch(() => dispatch(showSnackbar({ message: "Failed to load warehouses", severity: "error" })))
      .finally(() => {
        dispatch(stopBusy());
      });
  }, [])

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={openCreateDialog}>
          Create Category
        </Button>
      </Stack>

      <DataTable
        tableName="category"
        columns={columns}
        pageSizeOptions={[10, 25, 50]}
        onViewRow={(row) => openViewDialog(row)}
        refreshKey={refreshKey}
      />

      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === "create" ? "Create Category" : "View Category"}</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" size="small" value={form.name} onChange={handleChange("name")} fullWidth />


          </Stack>
        </DialogContent>

        <DialogActions>
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
