import * as React from "react";
import PropTypes from "prop-types";
import { Outlet, Router, useLocation, useNavigate } from "react-router-dom"; // <- add this
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MailIcon from "@mui/icons-material/Mail";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Category, ExitToApp, ExpandLess, ExpandMore, GroupOutlined, Inventory, Payments, PointOfSale, Warehouse, WarehouseOutlined } from "@mui/icons-material";
import { logout, setCookies } from "../axios/function";
import { useDispatch, useSelector } from "react-redux";
import { fetchWarehouses, selectWarehouses } from "../store/warehouseSlice";

const drawerWidth = 240;

function MainLayout(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname === navigate.route;

  const dispatch = useDispatch();
  const [warehouseProductsOpen, setWarehouseProductsOpen] = React.useState(false);
  const warehouses = useSelector(selectWarehouses);

  React.useEffect(() => {
    if (warehouseProductsOpen) {
      dispatch(fetchWarehouses());
    }
  }, [warehouseProductsOpen, dispatch]);

  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const navigations = [
    {
      name: "Warehouse",
      route: "/admin/warehouse",
      icon: <Warehouse />,
    },
    {
      name: "Product",
      route: "/admin/product",
      icon: <Inventory />,
    },
    {
      name: "Customer",
      route: "/admin/customer",
      icon: <GroupOutlined />,
    },
    {
      name: "Sales",
      route: "/admin/pos",
      icon: <PointOfSale />,
    },
    {
      name: "Sale Lists",
      route: "/admin/sales",
      icon: <Payments />,
    },
    {
      name: "Categories",
      route: "/admin/category",
      icon: <Category />,
    },
    {
      name: "Logout",
      route: "/admin/logout",
      icon: <ExitToApp />,
      onclick: () => {
        console.log("Logging out...");
        logout().then(() => {
          navigate("/login");
          setCookies()
        })
      }
    },
  ];

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {navigations.map((navigation, index) => (
          <ListItem sx={{

            paddingY: 0.2,
          }} key={index} disablePadding>
            <ListItemButton
              selected={location.pathname.startsWith(navigation.route)}
              sx={{
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0,0,0,0.12)',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: 'rgba(0,0,0,0.15)',
                },
              }}
              onClick={() =>
                navigation.onclick
                  ? navigation.onclick()
                  : navigate(navigation.route)
              }
            >
              <ListItemIcon>{navigation.icon}</ListItemIcon>
              <ListItemText primary={navigation.name} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* Warehouse Products accordion */}
        <ListItem sx={{ paddingY: 0.2 }} disablePadding>
          <ListItemButton
            selected={location.pathname.startsWith("/admin/product-warehouse")}
            sx={{
              borderRadius: 1,
              '&.Mui-selected': { backgroundColor: 'rgba(0,0,0,0.12)' },
              '&.Mui-selected:hover': { backgroundColor: 'rgba(0,0,0,0.15)' },
            }}
            onClick={() => setWarehouseProductsOpen((prev) => !prev)}
          >
            <ListItemIcon><WarehouseOutlined /></ListItemIcon>
            <ListItemText primary="Warehouse Products" />
            {warehouseProductsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={warehouseProductsOpen} timeout="auto" unmountOnExit>
          <List disablePadding>
            {warehouses.map((wh) => (
              <ListItem key={wh.id} sx={{ paddingY: 0.2, pl: 2 }} disablePadding>
                <ListItemButton
                  selected={location.pathname === `/admin/product-warehouse/${wh.id}`}
                  sx={{
                    borderRadius: 1,
                    pl: 4,
                    '&.Mui-selected': { backgroundColor: 'rgba(0,0,0,0.12)' },
                    '&.Mui-selected:hover': { backgroundColor: 'rgba(0,0,0,0.15)' },
                  }}
                  onClick={() => navigate(`/admin/product-warehouse/${wh.id}`)}
                >
                  <ListItemText primary={wh.name} primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
      <Divider />
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            MD Enterprise
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          slotProps={{
            root: {
              keepMounted: true,
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content area — render child routes here */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar /> {/* keeps content below appbar */}
        <Outlet /> {/* <-- child routes render inside this layout */}
      </Box>
    </Box>
  );
}

MainLayout.propTypes = {
  window: PropTypes.func,
};

export default MainLayout;
