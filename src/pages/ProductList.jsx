import React, { useEffect, useState } from "react";
import { api, url } from "../axios";

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  TextField,
  Chip,
  Stack,

} from "@mui/material";
import { Pagination } from "swiper/modules";
import "swiper/css/pagination";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton, InputBase, Paper, Slide } from "@mui/material";


import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useNavigate } from "react-router-dom";

// 🔧 CHANGE THIS to your Laravel storage URL
const BASE_URL = `${url}/storage/`;



export default function ProductPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  // const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedChip, setSelectedChip] = useState([])
  const [openSearch, setOpenSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);

  const handleSearch = () => {
    console.log("Search:", query);
    // 👉 call your API here
  };

  const getProduct = () => {
    api.get("api/productList").then((res) => {
      setProducts(res.data || []);
      setCategories(Array.from(
        new Map(
          res.data
            .flatMap(e => e.category || [])
            .map(item => [item.id, item])
        ).values()
      ))

      console.log(categories)


    });
  }

  useEffect(() => {
    getProduct()
  }, []);

  const filteredProducts = React.useMemo(() => {
    let prods = products;

    if (selectedChip.length > 0) {
      prods = prods.filter(prod =>
        selectedChip.includes(prod.category.id)
      );
    }

    if (query) {
      const q = query.toLowerCase();

      prods = prods.filter(prod =>
        prod.name.toLowerCase().includes(q) ||
        prod.category.name.toLowerCase().includes(q) ||
        prod.description.toLowerCase().includes(q)
      );
    }

    return prods;
  }, [products, selectedChip, query]);

  return (
    <Box sx={{
      maxWidth: "1400px",
      mx: "auto",        // center
      px: { xs: 2, md: 4 },
      py: 3,
      minHeight: "100vh",
    }}>
      <Stack sx={{

      }} direction="row" justifyContent="flex-end" mb={2}>
        {!openSearch && (
          <IconButton onClick={() => setOpenSearch(true)}>
            <SearchIcon />
          </IconButton>
        )}

        <Slide direction="left" in={openSearch} mountOnEnter unmountOnExit>
          <Paper
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <InputBase
              autoFocus
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              sx={{ ml: 1, flex: 1, width: 200 }}
            />

            <IconButton onClick={handleSearch}>
              <SearchIcon />
            </IconButton>

            <IconButton onClick={() => { setOpenSearch(false); setQuery("") }}>
              <CloseIcon />
            </IconButton>
          </Paper>
        </Slide>
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        mb={3}
        py={2}
        justifyContent="center"
        sx={{ overflowX: "auto" }}
      >

        {(categories ?? []).map((cat) => (
          <Chip sx={{
            background: selectedChip.includes(cat.id) ? "rgb(100, 100,100)" : "rgb(199, 199,199)",
            color: "white"
          }} key={cat.id} onClick={() => {

            selectedChip.includes(cat.id) ? setSelectedChip(selectedChip.filter(id => id !== cat.id)) : setSelectedChip(Array.from(new Set([...selectedChip, ...[cat.id]])))
          }} label={cat.name} clickable />

        ))}
      </Stack>


      {/* FILTER BAR */}

      {/* PRODUCT GRID */}
      <Grid container spacing={3}  >
        {filteredProducts.map((product) => {
          let swiperInstance = null;
          const price = Number(product.cost_price || 0);
          const original = Number(product.cost_price_before_discount || 0);
          const discount = Math.round(
            ((price - original) / price) * 100
          );



          return (
            <Grid item xs={12} md={4} sx={{ maxWidth: { md: "30.33%" } }} key={product.id}>              <Card
              sx={{
                height: "100%",
                transition: "0.3s",
                "&:hover": { boxShadow: 6 },
                cursor: "pointer"
              }}

            >
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  overflow: "hidden",
                }}
                onMouseEnter={() => swiperInstance?.autoplay.start()}
                onMouseLeave={() => swiperInstance?.autoplay.stop()}
              >
                <Swiper
                  modules={[Autoplay, Pagination]}
                  autoplay={{
                    delay: 1500,
                    disableOnInteraction: false,
                  }}
                  onSwiper={(swiper) => {
                    swiperInstance = swiper;
                    swiper.autoplay.stop(); // stop initially
                  }}
                  loop={true}
                  style={{ height: "100%", width: "100%" }}
                >
                  {product.product_images.map((img) => (
                    <SwiperSlide key={img.id} onClick={() => navigate(`/product/${product.id}`)}>
                      <Box
                        component="img"
                        src={BASE_URL + img.url}

                        alt={product.name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover", // 🔥 important
                        }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Box>

              {/* 📦 CONTENT */}
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  {/* LEFT (TITLE) */}
                  <Box sx={{ width: "70%", pr: 1 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={500}
                      sx={{
                        fontSize: 14,
                        lineHeight: 1.3,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      fontWeight={500}
                      sx={{
                        fontSize: 10,
                        lineHeight: 1.3,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {product.description}
                    </Typography>
                  </Box>

                  {/* RIGHT (PRICE) */}
                  <Box
                    sx={{
                      width: "30%",
                      textAlign: "right",
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                    }}
                  >
                    <Typography fontSize={13}>
                      ₹{price.toLocaleString()}
                    </Typography>

                    {product.cost_price_before_discount && (
                      <Typography
                        fontSize={11}
                        color="text.secondary"
                        sx={{ textDecoration: "line-through" }}
                      >
                        ₹{Number(product.cost_price_before_discount).toLocaleString()}
                      </Typography>)}

                    {product.cost_price_before_discount && (
                      <Typography
                        color="error"
                        fontWeight={500}
                        fontSize={12}
                      >
                        {discount}% off
                      </Typography>)}
                  </Box>
                </Box>
              </CardContent>
            </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}