import React, { useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { api } from "../axios";

export default function WareHouse() {
  const columns = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 80 },
      { field: "name", headerName: "Name", width: 200 },
      { field: "location", headerName: "Location", width: 200 },
    ],
    []
  );

  const [refreshKey, setRefreshKey] = useState(0);

  // dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // 'create' | 'view'
  const [form, setForm] = useState({ name: "", location: "" });
  const [submitting, setSubmitting] = useState(false);

  // optional: use notistack for quick snackbars, fallback to alert if not installed
  let enqueueSnackbar = null;
  try {
    // dynamic require to avoid hard dependency if not installed
    // eslint-disable-next-line no-unused-vars
    const ns = require("notistack");
    // won't actually run — better to assume you have your redux snackbar; left here for reference
  } catch (e) {}

  const openCreateDialog = () => {
    setDialogMode("create");
    setForm({ name: "", location: "" });
    setDialogOpen(true);
  };

  const openViewDialog = (row) => {
    setDialogMode("view");
    setForm({ name: row.name ?? "", location: row.location ?? "" });
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleChange = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.value }));

  const handleSubmit = async () => {
    // For create mode POST to /api/warehouse
    setSubmitting(true);
    try {
      const res = await api.post("/api/warehouse", form);
      // success — refresh datatable
      setRefreshKey((k) => k + 1);
      setDialogOpen(false);
      // optionally show a snackbar via your redux or notistack
      // dispatch(showSnackbar({ message: "Created", severity: "success" }));
    } catch (err) {
      console.error("Create error:", err);
      // show error to user
      const msg = err?.response?.data?.message || err?.message || "Create failed";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={openCreateDialog}>
          Create Warehouse
        </Button>
      </Stack>

      <DataTable
        tableName="warehouse"
        columns={columns}
        pageSizeOptions={[10, 25, 50]}
        onViewRow={(row) => openViewDialog(row)}
        refreshKey={refreshKey}
      />

      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === "create" ? "Create Warehouse" : "View Warehouse"}</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" size="small" value={form.name} onChange={handleChange("name")} fullWidth />
            <TextField label="Location" size="small" value={form.location} onChange={handleChange("location")} fullWidth />
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
