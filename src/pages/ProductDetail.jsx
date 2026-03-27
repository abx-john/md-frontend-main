// src/pages/ProductDetail.jsx
import {
  Container,
  Typography,
  Chip,
  Box
} from "@mui/material";
import { useParams } from "react-router-dom";
import products from "../data/products";

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return <Typography>Product not found</Typography>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box
        component="img"
        src={product.image}
        alt={product.name}
        sx={{ width: "100%", maxHeight: 300, objectFit: "cover", mb: 2 }}
      />

      <Typography variant="h5" fontWeight="bold">
        {product.name}
      </Typography>

      <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
        ₹{product.price}
      </Typography>

      <Chip
        label={product.availability}
        color={product.availability === "In Stock" ? "success" : "warning"}
        sx={{ mt: 1 }}
      />

      <Typography sx={{ mt: 2 }}>
        {product.description}
      </Typography>
    </Container>
  );
}
