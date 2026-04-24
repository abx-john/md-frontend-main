import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Typography, Box } from "@mui/material";
import { api } from "../axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, selectCategoryNames } from "../store/categorySlice";
import DataTable from "../components/DataTable";

export default function ProductWarehousePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [warehouseName, setWarehouseName] = useState("");
  const categoryNames = useSelector(selectCategoryNames);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    api
      .get(`/api/warehouse/${id}`)
      .then((res) => setWarehouseName(res.data?.name ?? `Warehouse #${id}`))
      .catch(() => setWarehouseName(`Warehouse #${id}`));
  }, [id]);

  const columns = useMemo(
    () => [
      { field: "product_name", headerName: "Product Name", flex: 1, minWidth: 200 },
      {
        field: "category_name",
        headerName: "Category",
        width: 200,
        type: "singleSelect",
        valueOptions: categoryNames,
      },
      { field: "quantity", headerName: "Quantity", width: 130, type: "number" },
    ],
    [categoryNames]
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        {warehouseName} — Products
      </Typography>

      <DataTable
        key={id}
        tableName="productWarehouse"
        columns={columns}
        queryParams={{ warehouse_id: id }}
        pageSizeOptions={[10, 25, 50]}
        onViewRow={(row) =>
          navigate(`/admin/productHistory/${row.id}?mode=warehouse`)
        }
      />
    </Box>
  );
}
