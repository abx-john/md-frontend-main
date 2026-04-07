import React, { useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Card,
  CardMedia,
  IconButton,
  Divider,
} from "@mui/material";
// import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
// import ShareIcon from "@mui/icons-material/Share";
import { useParams } from "react-router-dom";
import { api, url } from "../axios";

const ProductPage = () => {

  const param = useParams()

  const [product, setProduct] = React.useState(null)

  console.log(param.id)

  const fetchProduct = () => {
    api.get(`api/productList/${param.id}`).then((res) => {
      setProduct(res.data)
    })
  }

  useEffect(() => {
    fetchProduct()
  }, [])


  return (
    <Grid container spacing={3} sx={{ p: 3, bgcolor: "#f5f5f5", width: "100%" }}>
      <Grid container spacing={3}>
        {/* LEFT: Images */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 2 }}>
            <CardMedia
              component="img"
              width={"100%"}
              height="500"
              image={`${url}/storage/${product?.product_images?.[0]?.url}`}
              alt="Sofa"
            />
          </Card>

          {/* Thumbnail row */}
          <Grid container spacing={2} mt={1}>
            {(product?.product_images || []).map((item, i) => (
              <Grid item xs={4} key={i}>
                <Card sx={{ borderRadius: 2 }}>
                  <Box
                    sx={{
                      width: "100%",
                      aspectRatio: "1 / 1", // 🔥 key fix
                      overflow: "hidden",
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={`${url}/storage/${item.url}`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover", // 🔥 prevents stretching
                      }}
                    />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* RIGHT: Details */}
        <Grid item xs={12} md={5}>
          <Box>
            {/* Title */}
            <Typography variant="h5" fontWeight="bold">
              {product?.name || "Product Name"}
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={1}>
              {product?.description || "Product Description"}

            </Typography>

            {/* Rating */}
            {/* <Typography mt={1}>⭐ 4.0 (1 Review)</Typography> */}

            {/* Price */}
            <Box mt={2}>
              <Typography variant="h5" fontWeight="bold">
                ₹ {product?.cost_price || "N/A"}
                <Typography
                  component="span"
                  sx={{ textDecoration: "line-through", ml: 1 }}
                  color="red"
                >
                    ₹ {product?.cost_price_before_discount || "N/A"}
                </Typography>
              </Typography>

              {/* <Typography color="error">46% OFF</Typography> */}
            </Box>

            {/* EMI */}
            {/* <Typography mt={1} color="text.secondary">
              Or pay ₹7,288/month EMI (0% interest)
            </Typography> */}

            {/* Offers */}
            {/* <Box mt={2} p={2} bgcolor="#fff3e0" borderRadius={2}>
              <Typography variant="body2">
                Use coupon <b>SUMMER26</b> at checkout for extra discount
              </Typography>
            </Box> */}

            {/* Style Buttons */}
            <Box mt={3}>
              <Typography fontWeight="bold">Category:</Typography>
              <Box display="flex" gap={2} mt={1}>
                <Button variant="contained">{product?.category?.name}</Button>

              </Box>
            </Box>

            {/* Delivery */}
            {/* <Box mt={3}>
              <Typography fontWeight="bold">
                Check delivery & assembly
              </Typography>
              <Box display="flex" gap={1} mt={1}>
                <TextField size="small" placeholder="Enter pincode" />
                <Button variant="outlined">Check</Button>
              </Box>
            </Box> */}

            {/* Actions */}
            {/* <Box mt={3} display="flex" gap={2}>
              <IconButton>
                <FavoriteBorderIcon />
              </IconButton>
              <IconButton>
                <ShareIcon />
              </IconButton>
            </Box> */}
          </Box>
        </Grid>
      </Grid>

      {/* Sticky Bottom Bar */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        width="100%"
        bgcolor="white"
        p={2}
        boxShadow={3}
      >
        <Grid container alignItems="center">
          <Grid item xs={6}>
            <Typography fontWeight="bold">₹ {product?.cost_price || "N/A"}</Typography>
            <Typography color="error" variant="body2">
             {product?.cost_price_before_discount && `${Math.round(((product.cost_price - product.cost_price_before_discount) / product.cost_price) * 100)}% OFF`}
            </Typography>
          </Grid>

          <Grid item xs={6} textAlign="right">
            {/* <Button
              variant="contained"
              color="error"
              size="large"
              sx={{ px: 4 }}
            >
              Add to Cart
            </Button> */}
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
};

export default ProductPage;