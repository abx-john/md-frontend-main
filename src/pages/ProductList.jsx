import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
  Container
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import products from "../data/products";
import { useEffect, useState } from "react";
import { api, url } from "../axios";

export default function ProductList() {

  const [products,setProducts] = useState([])

  useEffect(()=>{
    api.get("api/productList").then(res => {
      setProducts(res.data || [])
    })
  },[])

  const navigate = useNavigate();
  console.log(products[0])

  return (
    <Container sx={{ mt: 3 }}>


      <Grid container xs spacing={2} sx={{
        backgroundColor: "#f5f5f5",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      }}>
        {products.map(product => (
          <Grid
          key={product.id}
            item
            xs={4}
            sm={4}
            md={3}
          >
            <Card>
              <CardActionArea >
                <CardMedia
                  component="img"
                  height="140"
                  image={url+"/storage/"+product.product_images[0]?.url}
                  alt={product.name}
                />
                <CardContent>
                  <Typography variant="body2" fontWeight="bold">
                    {product.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ₹{product.cost_price}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
