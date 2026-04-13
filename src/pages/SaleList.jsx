import React, { use, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { api } from "../axios";
import { Box, FormControl, InputLabel, MenuItem, OutlinedInput, Select } from "@mui/material";
import { isMobile } from "mobile-device-detect";
import DataTableProduct from "../components/DataTableProduct";
import { FormatShapes } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showSnackbar } from "../store/snackbarSlice";

export default function SaleList() {

  const params = useParams()
  const dispatch = useDispatch();

  const columns = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 80 },
      {
        field: "customer_name",
        headerName: "Customer Name",
        width: 300,
        valueGetter: (value) => value,
      },
      { field: "subtotal", headerName: "Subtotal", width: 200 },
      { field: "discount", headerName: "Discount", width: 200 },
      { field: "payable", headerName: "Payable", width: 200 },
      {
        field: "total_paid",

        headerName: "Total Paid",
        width: 200,
      },
      {
        headerName: "Total Outstanding",
        field: "outstanding",
        width: 200,

      },
      {
        field: "products",
        valueGetter: (value) => value?.length || 0,
        headerName: "No of Items",
        width: 200,
      },
    ],
    []
  );
  const paymentColumns = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'paid_amount',
      headerName: 'Paid Amount',
      type: "number",
      width: 150,
    },
    {
      field: 'mode',
      headerName: 'Payment Mode',
      type: "number",
      width: 150,
      valueGetter: ((value) => value[0].toUpperCase() + value.substring(1))
    },

  ];

  const [refreshKey, setRefreshKey] = useState(0);

  // dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // 'create' | 'view'
  const [form, setForm] = useState({ name: "", location: "" });
  const [submitting, setSubmitting] = useState(false);
  const [paymentMode, setPaymentMode] = useState("cash")
  const [paidAmount, setPaidAmount] = useState(0)



  const openViewDialog = (row) => {
    setDialogMode("view");
    setPaymentMode("cash")
    setPaidAmount(0)
    setForm(row);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleChange = (key) => (e) =>
    setForm((s) => ({ ...s, [key]: e.target.value }));

  const handleSubmit = async () => {
    // For create mode POST to /api/sale
    setSubmitting(true);
    try {
      const res = await api.post("/api/payment", {
        id: form.id,
        mode: paymentMode,
        paid_amount: paidAmount,
      });
      // success — refresh datatable
      setRefreshKey((k) => k + 1);
      setDialogOpen(false);
      // optionally show a snackbar via your redux or notistack
      dispatch(showSnackbar({ message: "New Payment Created", severity: "success" }));
    } catch (err) {
      console.error("Create error:", err);
      // show error to user
      const msg =
        err?.response?.data?.message || err?.message || "Create failed";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <DataTable
        tableName="sale"
        columns={columns}
        pageSizeOptions={[10, 25, 50]}
        onViewRow={(row) => openViewDialog(row)}
        refreshKey={refreshKey}
        customerId={params?.customerId}
      />

      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle>
          {dialogMode === "create" ? "Create Warehouse" : "View Sales"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* {
              JSON.stringify(form)
            } */}
          </Stack>

          <Box
            component="fieldset"
            sx={{
              border: "1px solid",
              borderColor: "grey.400",
              borderRadius: 1,
              px: 2,
              pb: 2,
              gap: 2,
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(1, 1fr)"
                : "repeat(2, 1fr)",
            }}
          >
            <Box
              component="legend"
              sx={{
                px: 1,
                fontSize: 12,
                color: "text.primary",
              }}
            >
              Customer
            </Box>

            <TextField
              label="Name"
              size="small"
              value={form?.customer_name || ""}
              onChange={() => { }}
              fullWidth
            />
            <TextField
              label="Phone"
              size="small"
              value={form?.customer_phone || ""}
              onChange={() => { }}
              fullWidth
            />
            <TextField
              label="Email"
              size="small"
              value={form?.customer_email || ""}
              onChange={() => { }}
              fullWidth
            />
          </Box>
          <Box
            component="fieldset"
            sx={{
              border: "1px solid",
              borderColor: "grey.400",
              borderRadius: 1,
              px: 2,
              pb: 2,
              mt: 2,
            }}
          >
            <Box
              component="legend"
              sx={{
                px: 1,
                fontSize: 12,
                color: "text.primary",
              }}
            >
              Products
            </Box>

            <Box
              sx={{
                width: "100%",
                overflowX: "auto",     // ✅ key for mobile
              }}
            >
              <Box
                sx={{
                  maxWidth: isMobile ? "60vw" : "100%", // 👈 force horizontal scroll on mobile
                }}
              >
                <DataTableProduct rows={form.products} />
              </Box>
            </Box>
          </Box>

          <Box
            component="fieldset"
            sx={{
              border: "1px solid",
              borderColor: "grey.400",
              borderRadius: 1,
              px: 2,
              pb: 2,
              mt: 2,
            }}
          >
            <Box
              component="legend"
              sx={{
                px: 1,
                fontSize: 12,
                color: "text.primary",
              }}
            >
              Payments
            </Box>

            <Box
              sx={{
                width: "100%",
                overflowX: "auto",     // ✅ key for mobile
              }}
            >
              <Box
                sx={{
                  maxWidth: isMobile ? "60vw" : "100%", // 👈 force horizontal scroll on mobile
                }}
              >
                <DataGrid
                  rows={form.payments}
                  columns={paymentColumns}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 5,
                      },
                    },
                  }}
                  pageSizeOptions={[5]}
                  
                  disableRowSelectionOnClick
                />
              </Box>
            </Box>
          </Box>
          <Box
            component="fieldset"
            sx={{
              border: "1px solid",
              borderColor: "grey.400",
              borderRadius: 1,
              px: 2,
              pb: 2,
              mt: 2,
            }}
          >
            <Box
              component="legend"
              sx={{
                px: 1,
                fontSize: 12,
                color: "text.primary",
              }}
            >
              New Payment
            </Box>

            <Box
              sx={{
                width: "100%",
                overflowX: "auto",     // ✅ key for mobile
              }}
            >
              <Box
                component={"form"}
                onSubmit={e => {
                  e.preventDefault()
                  handleSubmit()
                }}
                sx={{
                  display: "grid",
                  paddingTop: 1,
                  gridTemplateColumns: isMobile ? 'repeat(1, 1fr)' : 'repeat(3, 1fr)',
                  gap: 3,
                  maxWidth: isMobile ? "60vw" : "100%", // 👈 force horizontal scroll on mobile
                }}
              >
                <FormControl fullWidth sx={{

                }}>
                  <InputLabel id="payment-mode-label">Payment Mode</InputLabel>
                  <Select
                    labelId="payment-mode-label"
                    size="small"
                    id="payment-mode"
                    value={paymentMode}
                    label="Payment Mode"
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <MenuItem value={"cash"}>Cash</MenuItem>
                    <MenuItem value={"online"}>Online</MenuItem>
                    <MenuItem value={"upi"}>UPI</MenuItem>
                    <MenuItem value={"gpay"}>GPay</MenuItem>
                    <MenuItem value={"cheque"}>Cheque</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Paid Amount"
                  size="small"
                  value={paidAmount}
                  required
                  type="number"
                  onFocus={e => {
                    if (paidAmount == 0) {
                      setPaidAmount("")
                    }

                  }}
                  onBlur={e => {
                    if (paidAmount == "") {
                      setPaidAmount(0)
                    }

                  }}
                  inputProps={{
                    min: 1,
                    step: 1,
                  }}
                  onChange={(e) => { setPaidAmount(e.target.value) }}
                  fullWidth
                />
                <Button type="submit" variant="outlined" disabled={submitting}>
                  Submit
                </Button>
              </Box>
            </Box>
          </Box>
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
            {submitting
              ? "Saving..."
              : dialogMode === "create"
                ? "Create"
                : "Close"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
