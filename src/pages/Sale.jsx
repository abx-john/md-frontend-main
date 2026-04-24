import { Autocomplete, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, IconButton, InputAdornment, InputLabel, List, ListItem, ListItemButton, ListItemText, MenuItem, Select, Switch, TextField, Typography } from "@mui/material";
import FormTextField from "../components/FormTextField";
import { useEffect, useMemo, useState } from "react";
import { api } from "../axios/index";
import debounce from "lodash.debounce";
import { AddCircleOutlineOutlined, RemoveCircleOutlineOutlined } from "@mui/icons-material";
import DataTableProduct from "../components/DataTableProduct";
import DialogContentText from '@mui/material/DialogContentText';
import { isMobile } from 'mobile-device-detect';
import { useDispatch, useSelector } from "react-redux";
import { fetchWarehouses, selectWarehouses } from "../store/warehouseSlice";
import { fetchCategories, selectCategories } from "../store/categorySlice";
import { setBusy } from "../store/busySlice";
import { showSnackbar } from "../store/snackbarSlice";


const Sale = () => {



    const [mode, setMode] = useState(localStorage.getItem('customerSearchMode') || 'phone');
    const [optionsCustomer, setOptionsCustomer] = useState([]);
    const [optionsProduct, setOptionsProduct] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [product, setProduct] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [inputValueProduct, setInputValueProduct] = useState('');
    const [loadingCustomer, setLoadingCustomer] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(false);
    const [warehouse, setWarehouse] = useState(null);
    const [category, setCategory] = useState(null);
    const warehouses = useSelector(selectWarehouses);
    const categories = useSelector(selectCategories);
    const [quantity, setQuantity] = useState(1);
    const [maxQuantity, setMaxQuantity] = useState(null);
    const [discount, setDiscount] = useState(0);
    const [price, setPrice] = useState(0);
    const [products, setProducts] = useState([]);
    const [paymentMode, setPaymentMode] = useState('cash');
    const [paymentModal, setPaymentModal] = useState(false);
    const [paidAmount, setPaidAmount] = useState(0);
    const [paidAmountError, setPaidAmountError] = useState("");
    const [newCustomer, setNewCustomer] = useState(false);
    const [newCustomerForm, setNewCustomerForm] = useState({
        name: "",
        phone: "",
        email: "",
    });
    const [customerErrors, setCustomerErrors] = useState({});
    const dispatch = useDispatch()




    const submitNewProduct = async (e) => {
        e.preventDefault()
        if (!product) return;

        setProducts(prev => [...prev, {
            id: product.id,
            warehouse: product.warehouse,
            name: product.name,
            price,
            quantity,
            discount,
            product: {
                ...product,
                warehouse: warehouses?.find(wh => wh.id == warehouse)
            },
        }]);
        // reset fields
        setProduct(null);
        setPrice(0);
        setQuantity(1);
        setDiscount(0);
    }


    const fetchCustomers = async (query) => {
        if (!query || query.length < 2) {
            setOptionsCustomer([]);
            return;
        }

        setLoadingCustomer(true);
        try {
            const res = await api.get("/api/customer", {
                params: { search: query, mode: mode, salesCustomer: true },
            });
            setOptionsCustomer(res.data || []);
        } catch (err) {
            console.error("Autocomplete fetch failed", err);
            setOptionsCustomer([]);
        } finally {
            setLoadingCustomer(false);
        }
    };
    const fetchProducts = async (query) => {
        if (!query || query.length < 2) {
            setOptionsProduct([]);
            return;
        }

        setLoadingProduct(true);
        try {
            const res = await api.get("/api/sale-products", {
                params: { search: query, warehouse: warehouse, category: category },
            });
            setOptionsProduct(res.data || []);
        } catch (err) {
            console.error("Autocomplete fetch failed", err);
            setOptionsProduct([]);
        } finally {
            setLoadingProduct(false);
        }
    };
    const debouncedFetch = useMemo(
        () => debounce(fetchCustomers, 400),
        [mode]
    );
    const debouncedFetchProduct = useMemo(
        () => debounce(fetchProducts, 400),
        [warehouse, category]
    );

    const submitSales = () => {
        api.post("api/sale", {
            customer_id: customer.id,
            products: products,
            paymentMode,
            paidAmount
        }).then(res => {
            dispatch(showSnackbar({ message: "New Sales Created", severity: "success" }));
            setCustomer(null);
            setProducts([]);
            setPaymentMode("cash");
            setPaidAmount(0);
            setPaymentModal(false);
        })
            .catch(err => {
                console.error("Sale creation failed:", err);
                dispatch(showSnackbar({ message: "Sale creation failed", severity: "error" }))


            })
    }

    useEffect(() => {
        debouncedFetch(inputValue);
        return debouncedFetch.cancel;
    }, [inputValue]);

    useEffect(() => {
        debouncedFetchProduct(inputValueProduct);
        return debouncedFetchProduct.cancel;
    }, [inputValueProduct]);

    useEffect(() => {
        dispatch(fetchWarehouses());
        dispatch(fetchCategories());
    }, [dispatch]);
    useEffect(() => {
        setProduct(null);
    }, [warehouse]);
    useEffect(() => {
        setProduct(null);
    }, [category]);

    return (<Box sx={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
        gap: 2,
    }}>
        <Dialog onClose={() => setPaymentModal(false)} open={paymentModal} fullWidth
            maxWidth="sm" >
            <Box>
                <DialogTitle>Payment</DialogTitle>
                <DialogContent>

                    <form onSubmit={(e) => {
                        e.preventDefault()
                        submitSales()
                    }} id="payment-form">
                        <TextField
                            margin="dense"
                            id="total-amount"
                            name="totalAmount"
                            label="Total Amount"
                            fullWidth
                            size="small"
                            variant="outlined"
                            InputProps={{ readOnly: true }}
                            value={products.reduce((acc, prod) => {
                                return acc + prod.price * prod.quantity - prod.discount
                            }, 0)}
                        />
                        <TextField
                            required
                            margin="dense"
                            id="paid-amount"
                            name="paidAmount"
                            label="Paid Amount"
                            fullWidth
                            size="small"
                            variant="outlined"
                            value={paidAmount || 0}
                            type="number"
                            onChange={e => {
                                if (products.reduce((acc, prod) => {
                                    acc = acc + prod.price * prod.quantity - prod.discount
                                    return acc
                                }, 0) < Number(e.target.value)) {
                                    setPaidAmountError("Paid amount cannot be more than total amount");
                                    return;
                                }
                                if (paidAmountError) {
                                    setPaidAmountError("");
                                }
                                setPaidAmount(Number(e.target.value) || 0);
                            }}
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPaymentModal(false)}>Cancel</Button>
                    <Button disabled={
                        // !customer?.id ||
                        // !products.length ||
                        // !paymentMode
                        false

                    } type="submit" form="payment-form">
                        Pay
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
        <Box sx={{
            gridColumn: 'span 2',
            gap: 2,
            display: 'flex',
            flexDirection: 'column',
        }}>

            <Box sx={{
                padding: 2,
                borderRadius: 1,
                border: '1.5px solid',
                borderColor: 'divider',
            }}>
                <Typography variant="h6" sx={{
                    display: isMobile ? "block" : "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                    <div style={{ display: isMobile ? "block" : "flex", alignItems: "center", gap: "8px" }}>
                        Customer Details
                        <Typography

                            sx={{ fontSize: "0.75rem", color: "text.secondary" }}
                        >
                            (Enter any one detail)
                        </Typography>
                    </div>

                    <FormControlLabel
                        control={
                            <Switch checked={newCustomer} onChange={e => setNewCustomer(e.target.checked)} name="New Customer" />
                        }
                        label="New Customer"
                    />
                </Typography>
                <Box sx={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? 'repeat(1,1fr)' : 'repeat(3,1fr)',
                    gap: 2,
                    marginTop: 2,
                }}>

                    {
                        newCustomer ?
                            <Box component={"form"} sx={{
                                gridColumn: isMobile ? 'span 1' : 'span 3',
                                display: "grid",
                                gridTemplateColumns: isMobile ? 'repeat(1,1fr)' : 'repeat(3,1fr)',
                                gap: 2,
                            }}
                                onSubmit={e => {
                                    e.preventDefault()
                                    dispatch(setBusy(true))
                                    api.post("/api/customer", newCustomerForm).then(res => {
                                        setCustomer(res.data)

                                        setNewCustomer(false)
                                    }).catch(err => {
                                        console.error("Create error:", err);
                                        setCustomerErrors(err.response.data.errors);
                                    }).finally(() => {
                                        dispatch(setBusy(false))
                                    })
                                }}
                            >

                                <TextField
                                    size="small"
                                    required
                                    fullWidth
                                    label="Name"
                                    value={newCustomerForm.name || ""}
                                    onChange={(e) => {
                                        setNewCustomerForm({ ...newCustomerForm, name: e.target.value })
                                        setCustomerErrors(prev => ({ ...prev, name: null }))
                                    }}
                                    error={!!customerErrors.name?.length}
                                    helperText={customerErrors.name ? customerErrors.name[0] : ""}

                                />
                                <TextField
                                    size="small"
                                    required
                                    fullWidth
                                    label="Phone"
                                    value={newCustomerForm.phone || ""}
                                    onChange={(e) => {
                                        setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })
                                        setCustomerErrors(prev => ({ ...prev, phone: null }))
                                    }}
                                    error={!!customerErrors.phone?.length}
                                    helperText={customerErrors.phone ? customerErrors.phone[0] : ""}

                                />
                                <TextField
                                    size="small"
                                    fullWidth
                                    type="email"
                                    label="Email"
                                    value={newCustomerForm.email || ""}
                                    onChange={(e) => {
                                        setNewCustomerForm({ ...newCustomerForm, email: e.target.value })
                                        setCustomerErrors(prev => ({ ...prev, email: null }))
                                    }}
                                    error={!!customerErrors.email?.length}
                                    helperText={customerErrors.email ? customerErrors.email[0] : ""}
                                />

                                <TextField
                                    size="small"
                                    sx={{
                                        gridColumnStart: "1",
                                        gridColumn: "span 2"
                                    }}
                                    required
                                    fullWidth
                                    label="Address"
                                    value={newCustomerForm.address || ""}
                                    onChange={(e) => {
                                        setNewCustomerForm({ ...newCustomerForm, address: e.target.value })
                                        setCustomerErrors(prev => ({ ...prev, address: null }))
                                    }}
                                    error={!!customerErrors.address?.length}
                                    helperText={customerErrors.address ? customerErrors.address[0] : ""}
                                    rows={4}
                                    multiline

                                />

                                <Button type="submit" sx={{
                                    gridColumnStart: "1"
                                }} variant="outlined"
                                >
                                    Add Customer
                                </Button>
                            </Box> : <><Autocomplete
                                fullWidth
                                options={optionsCustomer}
                                value={customer}
                                loading={loadingCustomer}
                                filterOptions={(x) => x} // 🚨 disable client-side filtering
                                getOptionLabel={(option) =>
                                    `${option.name} (${option.phone})`
                                }
                                onChange={(e, newValue) => setCustomer(newValue)}
                                inputValue={inputValue}
                                onInputChange={(e, newInput) => setInputValue(newInput)}
                                noOptionsText={
                                    inputValue.length < 2
                                        ? "Type at least 2 characters"
                                        : "No customers found"
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search Customer"
                                        size="small"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loadingCustomer && <CircularProgress size={16} />}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                            />
                                <FormControl fullWidth>
                                    <InputLabel id="customer-label">Search Mode</InputLabel>
                                    <Select
                                        labelId="customer-label"
                                        size="small"
                                        id="customer-select"
                                        value={mode}
                                        label="Search Mode"
                                        onChange={e => {
                                            setMode(e.target.value);
                                            localStorage.setItem("customerSearchMode", e.target.value);
                                        }}
                                    >
                                        <MenuItem value={"phone"}>Phone</MenuItem>
                                        <MenuItem value={"email"}>Email</MenuItem>
                                        <MenuItem value={"name"}>Name</MenuItem>
                                    </Select>
                                </FormControl></>
                    }

                </Box>
            </Box>
            <Box sx={{
                padding: 2,
                borderRadius: 1,
                border: '1.5px solid',
                borderColor: 'divider',
            }}>
                <Typography variant="h6">
                    Product Details{" "}
                    <Typography
                        component="span"
                        sx={{ fontSize: "0.75rem", color: "text.secondary" }}
                    >
                        (Select the product)
                    </Typography>
                </Typography>
                <Box
                    component="form"
                    onSubmit={e => submitNewProduct(e)}
                    sx={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? 'repeat(1,1fr)' : 'repeat(3,1fr)',
                        gap: 2,
                        marginTop: 2,
                    }}>

                    <FormControl fullWidth>
                        <InputLabel id="product-label">Warehouse</InputLabel>

                        <Select
                            labelId="product-label"
                            size="small"
                            id="product-select"
                            value={warehouse ?? ""}
                            label="Warehouse"
                            onChange={e => {
                                setWarehouse(e.target.value || null);
                            }}

                        >
                            <MenuItem value="">All Warehouses</MenuItem>
                            {(warehouses || []).map(wh => (
                                <MenuItem key={wh.id} value={wh.id}>{wh.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="category-filter-label">Category</InputLabel>
                        <Select
                            labelId="category-filter-label"
                            size="small"
                            value={category ?? ""}
                            label="Category"
                            onChange={e => setCategory(e.target.value || null)}
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {categories.map(cat => (
                                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Autocomplete
                        fullWidth
                        options={optionsProduct}
                        value={product}
                        loading={loadingProduct}
                        filterOptions={(x) => x}
                        getOptionLabel={(option) =>
                            `${option.product.name} ${option.quantity}/${option.product.unit}`
                        }
                        onChange={(e, newValue) => {
                            setProduct(newValue);
                            const available = newValue?.quantity ?? null;
                            setMaxQuantity(available);
                            if (available !== null && quantity > available) {
                                setQuantity(available);
                            }
                        }}
                        inputValue={inputValueProduct}
                        onInputChange={(e, newInput) => setInputValueProduct(newInput)}
                        noOptionsText={
                            inputValueProduct.length < 2
                                ? "Type at least 2 characters"
                                : "No products found"
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search Product"
                                size="small"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loadingProduct && <CircularProgress size={16} />}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                    <TextField
                        size="small"
                        type="number"
                        label="Price"
                        value={price}
                        onFocus={() => {
                            if (price == 0) {
                                setPrice("")
                            }
                        }}
                        onBlur={() => {
                            if (price == "")
                                setPrice(0)
                        }}
                        onChange={(e) => setPrice(Number(e.target.value) || 0)}
                        inputProps={{
                            min: 0,
                            style: {
                                textAlign: "center", MozAppearance: "textfield", // Firefox
                            }
                        }}
                        sx={{
                            "& input[type=number]": {
                                appearance: "textfield", // Chrome, Safari, Edge
                            },
                            "& input[type=number]::-webkit-outer-spin-button": {
                                WebkitAppearance: "none",
                                margin: 0,
                            },
                            "& input[type=number]::-webkit-inner-spin-button": {
                                WebkitAppearance: "none",
                                margin: 0,
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <IconButton size="small" onClick={() => setPrice(prev => Math.max(0, prev - 1))}>
                                        <RemoveCircleOutlineOutlined />
                                    </IconButton>
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setPrice(prev => Math.max(0, prev + 1))}>
                                        <AddCircleOutlineOutlined />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        size="small"
                        type="number"
                        label="Quantity"
                        onFocus={() => {
                            if (quantity == 0) {
                                setQuantity("")
                            }
                        }}
                        onBlur={() => {
                            if (quantity == "")
                                setQuantity(0)
                        }}
                        value={quantity}
                        onChange={(e) => {
                            const v = Number(e.target.value) || 0;
                            const capped = maxQuantity !== null ? Math.min(v, maxQuantity) : v;
                            setQuantity(capped);
                        }}
                        inputProps={{
                            min: 0,
                            max: maxQuantity ?? undefined,
                            style: {
                                textAlign: "center", MozAppearance: "textfield", // Firefox
                            }
                        }}
                        sx={{
                            "& input[type=number]": {
                                appearance: "textfield", // Chrome, Safari, Edge
                            },
                            "& input[type=number]::-webkit-outer-spin-button": {
                                WebkitAppearance: "none",
                                margin: 0,
                            },
                            "& input[type=number]::-webkit-inner-spin-button": {
                                WebkitAppearance: "none",
                                margin: 0,
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <IconButton size="small" onClick={() => setQuantity(prev => Math.max(0, prev - 1))}>
                                        <RemoveCircleOutlineOutlined />
                                    </IconButton>
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setQuantity(prev => {
                                        const next = prev + 1;
                                        return maxQuantity !== null ? Math.min(maxQuantity, next) : next;
                                    })}>
                                        <AddCircleOutlineOutlined />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        size="small"
                        type="number"
                        label="Discount"
                        onFocus={() => {
                            if (discount == 0) {
                                setDiscount("")
                            }
                        }}
                        onBlur={() => {
                            if (discount == "")
                                setDiscount(0)
                        }}
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                        inputProps={{
                            min: 0,
                            style: {
                                textAlign: "center", MozAppearance: "textfield", // Firefox
                            }
                        }}
                        sx={{
                            "& input[type=number]": {
                                appearance: "textfield", // Chrome, Safari, Edge
                            },
                            "& input[type=number]::-webkit-outer-spin-button": {
                                WebkitAppearance: "none",
                                margin: 0,
                            },
                            "& input[type=number]::-webkit-inner-spin-button": {
                                WebkitAppearance: "none",
                                margin: 0,
                            },
                        }} InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <IconButton size="small" onClick={() => setDiscount(prev => Math.max(0, prev - 1))}>
                                        <RemoveCircleOutlineOutlined />
                                    </IconButton>
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setDiscount(prev => Math.max(0, prev + 1))}>
                                        <AddCircleOutlineOutlined />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button type="submit" variant="outlined">Submit</Button>

                </Box>
                <Box sx={{
                    marginTop: 3
                }}>
                    <Typography variant="h6">
                        Product Lists

                       

                    </Typography>
                    <DataTableProduct rows={products} setRows={setProducts} warehouses={warehouses}></DataTableProduct>

                </Box>
            </Box>
        </Box>
        <Box sx={{
            width: '100%',
            gridColumn: isMobile ? 'span 2' : 'span 1',
            padding: 2,
            borderRadius: 1,
            border: '1.5px solid',
            borderColor: 'divider',

        }} >
            <Typography variant="h6">
                Sale Details
            </Typography>
            <Box sx={{ width: '100%' }}>

                <Divider />

                <List>
                    <ListItem disablePadding>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Typography>Total Items</Typography>
                            <Typography>{products.length}</Typography>
                        </Box>
                    </ListItem>

                    <ListItem disablePadding>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Typography>Subtotal</Typography>
                            <Typography>{products.reduce((acc, product) => {
                                acc = acc + product.price * product.quantity;
                                return acc;
                            }, 0)}</Typography>
                        </Box>

                    </ListItem>
                    <ListItem disablePadding>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Typography>Discount</Typography>
                            <Typography>{products.reduce((acc, product) => {
                                acc = acc + Number(product.discount);
                                return acc;
                            }, 0)}</Typography>
                        </Box>

                    </ListItem>
                    <ListItem disablePadding>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Typography>Total</Typography>
                            <Typography>{products.reduce((acc, product) => {
                                acc = acc + product.price * product.quantity - product.discount;
                                return acc;
                            }, 0)}</Typography>
                        </Box>

                    </ListItem>

                </List>
                <FormControl fullWidth sx={{
                    marginTop: 5.2
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
                <Box sx={{
                    marginTop: 2,
                    display: 'flex',
                    justifyContent: 'center',
                }}>
                    <Button fullWidth type="button" variant="outlined" onClick={() => setPaymentModal(true)}> Pay</Button>
                </Box>

            </Box>
        </Box>
    </Box>);
};

export default Sale;