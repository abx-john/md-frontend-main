import React, { use, useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { api } from "../axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, selectCategories, selectCategoryNames } from "../store/categorySlice";
import { fetchWarehouses, selectWarehouses } from "../store/warehouseSlice";
import { showSnackbar } from "../store/snackbarSlice";
import { Autocomplete, createFilterOptions } from "@mui/material";
import ImageUpload from "../components/ImageUpload";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { getRowValue } from "@mui/x-data-grid/internals";

export default function Product() {
  const dispatch = useDispatch();
  const filter = createFilterOptions();
  const warehouses = useSelector(selectWarehouses);
  const categories = useSelector(selectCategories);
  const categoryNames = useSelector(selectCategoryNames);

  const columns = useMemo(() => {
    const baseColumns = [
      { field: "id", headerName: "ID", width: 80 },
      { field: "name", headerName: "Name", width: 200 },
      {
        field: "category_name",
        headerName: "Category",
        width: 200,
        type: "singleSelect",
        valueOptions: categoryNames,
      },
      { field: "unit", headerName: "Unit", width: 150 },
      { field: "description", headerName: "Description", width: 200 },
    ];

    const warehouseColumns = warehouses.map((w) => ({
      field: `${w.id}`,
      headerName: w.name,
      width: 120,
      sortable:false,
      filterable:false,
      valueGetter: (value, row) => {

        return ((row.product_warehouses.find(e => e.warehouse_id === w.id)?.quantity) || "0");
    },
    }));

    const quantity = {
      field: "quantity",
      headerName: "Total Quantity",
      width: 150,
    }

    return [...baseColumns, ...warehouseColumns, ...[quantity]];
  }, [warehouses, categoryNames]);

  console.log(columns)

  const [refreshKey, setRefreshKey] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // 'create' | 'view'
  const [form, setForm] = useState({ name: "", files: [], warehouse_id: null, category_id: null, quantity: "", unit: "", description: "", product_warehouses: [] });
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState([]);


  const [selectedProductId, setSelectedProductId] = useState({
    type: 'include',
    ids: new Set(),
  });


  const navigate = useNavigate()

  const openCreateDialog = () => {
    setDialogMode("create");
    setForm({
      name: "",
      warehouse_id: null,
      quantity: "",
      unit: "",
      description: "",
      product_warehouses: warehouses.map(e => ({
        warehouse_id: e.id, quantity: 0, warehouse: {
          name: e.name
        }
      })),
    });
    setDialogOpen(true);
  };

  const openViewDialog = (row) => {
    setDialogMode("view");
    setForm({
      ...row,
      warehouse_id: row.warehouse?.id || null,
      category_id: row.category?.id || null,

    });

    const warehouseAvailable = row.product_warehouses.map(e => e.warehouse_id);
    const missingWarehouses = warehouses.filter(e => !warehouseAvailable.includes(e.id)).map(e => ({
      warehouse_id: e.id, quantity: 0, warehouse: {
        name: e.name
      }
    }))

    setForm((f) => ({
      ...f,
      product_warehouses: [...(f.product_warehouses || []), ...missingWarehouses]
    }))

    setDialogOpen(true);

  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleChange = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    try {





      const res = await api.post("/api/product", { ...form, images: (form.files || []).map(e => e.file) }, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(form)


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

  const navigateToHistory = () => {
    navigate(`/admin/productHistory/${form.id}`);
  }



  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchWarehouses());
  }, [dispatch])

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={openCreateDialog}>
          Create Product
        </Button>
        <Button variant="contained" onClick={() => {

          const finalSelectionId = selectedProductId.type === "include" ?
            [...selectedProductId.ids] : products.filter(e => ![...selectedProductId.ids].includes(e.id)).map(e => e.id)



          const finalUnselectionId = products.map(e => e.id).filter(id => !finalSelectionId.includes(id))
          console.log(
            finalSelectionId, selectedProductId
          )

          api.post("/api/landing/show", { product_ids: finalSelectionId, not_product_ids: finalUnselectionId })
            .then(res => {
              dispatch(showSnackbar({
                message: res.data?.message || "Products shown in landing successfully",
                severity: "success",
                autoHideDuration: 5000,
              }));
              setSelectedProductId({ type: 'include', ids: new Set() });
              setRefreshKey(k => k + 1);
            })
            .catch(err => {
              console.error("Show in landing error:", err);
              const msg = err?.response?.data?.message || err?.message || "Failed to show in landing";



              dispatch(showSnackbar(
                {
                  message: msg,
                  severity: "error",
                  autoHideDuration: 5000,
                }
              ));
            })

        }}>
          Show in Landing

        </Button>

      </Stack>

      <DataTable
        tableName="product"
        columns={columns}
        pageSizeOptions={[10, 25, 50]}
        onViewRow={(row) => openViewDialog(row)}
        refreshKey={refreshKey}
        rowSelectionModel={selectedProductId}
        setRowSelectionModel={setSelectedProductId}
        serverSideInclude={"show_in_landing"}
        setRowsCallback={setProducts}
        selectable={true}
      />

      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <form onSubmit={e => handleSubmit(e)}>
          <DialogTitle>{dialogMode === "create" ? "Create Product" : "View Product"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Name" required size="small" value={form.name} onChange={handleChange("name")} fullWidth />

              <Autocomplete
                size="small"
                // Provide the object that matches the stored id, or null
                value={categories.find(c => c.id === form.category_id) || null}
                onChange={(event, newValue) => {
                  if (typeof newValue === 'string') {
                    setForm({ ...form, category_id: null, category_label: newValue });
                  } else if (newValue && newValue.inputValue) {
                    setForm({ ...form, category_id: null, category_label: newValue.inputValue });
                  } else if (newValue) {
                    setForm({ ...form, category_id: newValue.id });
                  } else {
                    setForm({ ...form, category_id: null });
                  }
                }}
                filterOptions={(options, params) => {
                  const filtered = filter(options, params);
                  return filtered;
                }}
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                id="cate-autocomplete"
                options={categories}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') {
                    return option;
                  }
                  if (option.inputValue) {
                    return option.inputValue;
                  }
                  return option.name || '';
                }}
                renderOption={(props, option) => {
                  return (
                    <li {...props}>
                      {option.name ?? option.inputValue ?? option}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField required size="small" {...params} label="Category" />
                )}
              />

              {
                (form?.product_warehouses || []).map((item) => {
                  return (
                    <TextField
                      key={item.warehouse_id}
                      required
                      label={`Quantity in ${item.warehouse?.name}`}
                      size="small"
                      value={item.quantity}
                      onChange={(event) => {
                        const newQuantity = event.target.value;

                        const updatedWarehouses = form.product_warehouses.map((w) => {
                          if (w.warehouse_id === item.warehouse_id) {
                            return { ...w, quantity: newQuantity };
                          }
                          return w;
                        });

                        // assuming you have setForm
                        setForm({
                          ...form,
                          product_warehouses: updatedWarehouses,
                        });
                      }}
                      fullWidth
                    />
                  );
                })
              }
              <TextField required label="Unit" size="small" value={form.unit} onChange={handleChange("unit")} fullWidth />
              <TextField required label="Cost Price" size="small" value={form.cost_price} onChange={handleChange("cost_price")} fullWidth />
              <TextField label="Cost Price Before Discount" size="small" value={form.cost_price_before_discount} onChange={handleChange("cost_price_before_discount")} fullWidth />
              <TextField label="Description" multiline rows={4} size="small" value={form.description} onChange={handleChange("description")} fullWidth />
              <ImageUpload form={form} setForm={setForm}></ImageUpload>
              <div>
                <Button variant="contained" onClick={() => navigateToHistory()}>History</Button>
              </div>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
            >
              {submitting ? "Saving..." : dialogMode === "create" ? "Create" : "Edit"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
