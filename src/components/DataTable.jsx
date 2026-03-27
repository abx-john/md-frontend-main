import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { api } from "../axios";
import { isMobile } from "mobile-device-detect";

const STORAGE_PREFIX = "datatable";
const FILTER_DEBOUNCE = 400;

function storageKey(tableName) {
  return `${STORAGE_PREFIX}:${tableName}:columns`;
}

function buildSortParams(sortModel) {
  if (!sortModel || sortModel.length === 0) return {};
  const m = sortModel[0];
  return { sort_by: m.field, sort_dir: m.sort || "asc" };
}

function buildFilterParams(filterModel) {
  if (!filterModel || !filterModel.items || filterModel.items.length === 0) return {};
  return { filters: JSON.stringify(filterModel) };
}

export default function DataTable({
  tableName,
  columns: initialColumns,
  pageSizeOptions = [5, 10, 25],
  onViewRow, // function(row) -> called when user clicks view
  refreshKey = 0, // change this to force reload
  customerId,
  rowSelectionModel,
  setRowSelectionModel,
  serverSideInclude,
  setRowsCallback
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("per_page") || String(pageSizeOptions[0]), 10);
  const sort_by = searchParams.get("sort_by") || null;
  const sort_dir = searchParams.get("sort_dir") || null;
  const filtersParam = searchParams.get("filters") || null;

  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pageState, setPageState] = useState({ page: Math.max(0, page - 1), pageSize });
  const [sortModel, setSortModel] = useState(() => (sort_by ? [{ field: sort_by, sort: sort_dir || "asc" }] : []));
  const [filterModel, setFilterModel] = useState(() => {
    if (filtersParam) {
      try {
        return JSON.parse(filtersParam);
      } catch (e) {
        return { items: [] };
      }
    }
    return { items: [] };
  });

  const [columns, setColumns] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey(tableName));
      if (saved) {
        const parsed = JSON.parse(saved);
        return initialColumns
          .map((col) => {
            const savedCol = parsed.find((c) => c.field === col.field);
            if (!savedCol) return col;
            return {
              ...col,
              hide: savedCol.hide,
              width: savedCol.width || col.width,
            };
          })
          .sort((a, b) => {
            const aSaved = parsed.findIndex((c) => c.field === a.field);
            const bSaved = parsed.findIndex((c) => c.field === b.field);
            if (aSaved === -1 && bSaved === -1) return 0;
            if (aSaved === -1) return 1;
            if (bSaved === -1) return -1;
            return aSaved - bSaved;
          });
      }
    } catch (e) { }
    return initialColumns;
  });

  const filterTimer = useRef(null);

  const fetchData = useCallback(
    async ({ pageNum = pageState.page + 1, perPage = pageState.pageSize, sortM = sortModel, filterM = filterModel }) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: pageNum,
          per_page: perPage,
          ...buildSortParams(sortM),
          ...buildFilterParams(filterM),
        };



        if (customerId) {
          params['customer_id'] = customerId;
        }
        const res = await api.get(`/api/${tableName}`, { params });
        const data = res.data || {};


        if(serverSideInclude){
          setRowSelectionModel({
            type: 'include',
            ids: new Set(
              data.data.filter((item) => item[serverSideInclude]===true).map((item) => item.id)
            ),
          })
        }

        const rowsData = data.data ?? data.rows ?? data;
        const total = data.total ?? data.meta?.total ?? (Array.isArray(rowsData) ? rowsData.length : 0);

        setRows(rowsData);
        if(setRowsCallback){
          setRowsCallback(rowsData);
        }
        setRowCount(Number(total));
      } catch (err) {
        console.error("DataTable fetch error:", err);
        setError(err?.response?.data?.message || err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    },
    [pageState.page, pageState.pageSize, sortModel, filterModel, tableName, customerId]
  );

  useEffect(() => {
    fetchData({ pageNum: pageState.page + 1, perPage: pageState.pageSize, sortM: sortModel, filterM: filterModel });
  }, [fetchData, pageState.page, pageState.pageSize, sortModel, filterModel, refreshKey]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);

    nextParams.set("page", String(pageState.page + 1));
    nextParams.set("per_page", String(pageState.pageSize));

    if (sortModel && sortModel.length > 0) {
      nextParams.set("sort_by", sortModel[0].field);
      nextParams.set("sort_dir", sortModel[0].sort || "asc");
    } else {
      nextParams.delete("sort_by");
      nextParams.delete("sort_dir");
    }

    if (filterModel && filterModel.items && filterModel.items.length > 0) {
      nextParams.set("filters", JSON.stringify(filterModel));
    } else {
      nextParams.delete("filters");
    }

    // --- NEW: If there is a "name" filter, append a top-level `name` query param ---
    // Support both possible item keys used by DataGrid: `columnField` or `field`
    try {
      const items = filterModel?.items || [];
      const nameItem = items.find(
        (it) =>
          (it.columnField === "name" || it.field === "name") &&
          it.value !== undefined &&
          it.value !== null &&
          String(it.value).trim() !== ""
      );
      if (nameItem) {
        nextParams.set("name", String(nameItem.value));
      } else {
        nextParams.delete("name");
      }
    } catch (e) {
      // ignore parsing issues
      nextParams.delete("name");
    }
    // --- END NEW ---

    const current = searchParams.toString();
    const next = nextParams.toString();
    if (current !== next) {
      // setSearchParams(nextParams, { replace: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageState.page, pageState.pageSize, sortModel, filterModel, setSearchParams]);

  useEffect(() => {
    const newPage = parseInt(searchParams.get("page") || "1", 10) - 1;
    const newPerPage = parseInt(searchParams.get("per_page") || String(pageSizeOptions[0]), 10);

    if (newPage !== pageState.page || newPerPage !== pageState.pageSize) {
      setPageState({ page: newPage, pageSize: newPerPage });
    }

    const sby = searchParams.get("sort_by");
    const sdir = searchParams.get("sort_dir");
    if (sby) {
      setSortModel([{ field: sby, sort: sdir || "asc" }]);
    } else {
      setSortModel([]);
    }

    const f = searchParams.get("filters");
    if (f) {
      try {
        setFilterModel(JSON.parse(f));
      } catch (e) { }
    } else {
      setFilterModel({ items: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handlePageChange = (newPage) => {
    setPageState((s) => ({ ...s, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageState({ page: 0, pageSize: newPageSize });
  };

  const handleSortModelChange = (newSortModel) => {
    setSortModel(newSortModel);
  };

  const handleFilterModelChange = (newFilterModel) => {
    setFilterModel(newFilterModel);

    if (filterTimer.current) clearTimeout(filterTimer.current);
    filterTimer.current = setTimeout(() => {
      setFilterModel((m) => m);
    }, FILTER_DEBOUNCE);
  };

  const saveColumnSettings = useCallback(
    (cols) => {
      try {
        const payload = cols.map((c, idx) => ({
          field: c.field,
          hide: !!c.hide,
          width: c.width,
          order: idx,
        }));
        localStorage.setItem(storageKey(tableName), JSON.stringify(payload));
      } catch (e) { }
    },
    [tableName]
  );

  const handleColumnResize = (params) => {
    const newCols = columns.map((c) => (c.field === params.colDef.field ? { ...c, width: params.width } : c));
    setColumns(newCols);
    saveColumnSettings(newCols);
  };

  // Add actions column (view)
  const dgColumns = useMemo(() => {
    const adapted = [...columns];

    adapted.push({
      field: "__actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", gap: 1 }}>
          <Button size="small" variant="outlined" onClick={() => onViewRow?.(params.row)}>
            View
          </Button>
        </Box>
      ),
    });

    return adapted;
  }, [columns, onViewRow]);

  return (
    <Box sx={{
      height: 600, width: isMobile ? '88vw' : '100%',
      maxWidth: '100vw',
      overflowX: 'auto',
    }}>
      {error && <Alert severity="error">{error}</Alert>}

      <DataGrid

        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={(newSelection) => {

          setRowSelectionModel({ ...newSelection });
        }}
        rows={rows}
        columns={dgColumns}
        pagination
        paginationMode="server"
        rowCount={rowCount}
        page={pageState.page}
        pageSize={pageState.pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        rowsPerPageOptions={[10]}
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        filterMode="server"
        filterModel={filterModel}
        onFilterModelChange={handleFilterModelChange}
        checkboxSelection={!!rowSelectionModel && !!setRowSelectionModel}
        disableRowSelectionOnClick={!setRowSelectionModel && !rowSelectionModel}
        loading={loading}
        onColumnVisibilityModelChange={(model) => {
          const newCols = columns.map((c) => {
            const vis = model[c.field];
            if (typeof vis === "boolean") return { ...c, hide: !vis };
            return c;
          });
          setColumns(newCols);
          saveColumnSettings(newCols);
        }}
        onColumnOrderChange={(params) => {
          const srcIndex = columns.findIndex((c) => c.field === params.columnField);
          if (srcIndex === -1) return;
          const newCols = [...columns];
          const [moved] = newCols.splice(srcIndex, 1);
          newCols.splice(params.targetIndex, 0, moved);
          setColumns(newCols);
          saveColumnSettings(newCols);
        }}
        onColumnResize={handleColumnResize}
        components={{
          LoadingOverlay: () => (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <CircularProgress />
            </Box>
          ),
        }}
      />
    </Box>
  );
}
