import { DataGrid } from "@mui/x-data-grid";

const DataTableProduct = ({
    rows,
    setRows,
    uneditable,
}) => {
    // temp
    const columns = [
        { field: "id", headerName: "ID", width: 90 },

        {
            field: "name",
            headerName: "Name",
            width: 150,
            editable: false,
            valueGetter: (_, row) => row?.product?.name ?? row?.product?.product?.name ?? row.product_warehouse?.product?.name ?? "N/A",
        },

        {
            field: "warehouse",
            headerName: "Warehouse",
            width: 150,
            editable: false,
            valueGetter: (_, row) => row?.product?.warehouse?.name ?? row.warehouse?.name ?? row.product_warehouse?.warehouse?.name ?? "N/A",
        },

        {
            field: "quantity",
            headerName: "Quantity",
            width: 120,
            editable: true,
            type: "number",
        },

        {
            field: "price",
            headerName: "Price",
            width: 120,
            editable: true,
            type: "number",
        },

        {
            field: "discount",
            headerName: "Discount",
            width: 120,
            editable: true,
            type: "number",
        },

        {
            field: "total",
            headerName: "Total",
            width: 150,
            valueGetter: (_, row) => {
                const price = Number(row?.price) || 0;
                const quantity = Number(row?.quantity) || 0;
                const discount = Number(row?.discount) || 0;
                return Math.max(0, price * quantity - discount);
            },
        },
    ];

    const processRowUpdate = (newRow) => {
        setRows((prev) =>
            prev.map((row) =>
                row.id === newRow.id ? newRow : row
            )
        );

        return newRow; // REQUIRED
    };


    return <div className="">

        <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            initialState={{
                pagination: {
                    paginationModel: {
                        pageSize: 5,
                    },
                },
            }}
            processRowUpdate={processRowUpdate}

            pageSizeOptions={[5]}

            disableRowSelectionOnClick
        />
    </div>
}

export default DataTableProduct;