import React, { useEffect, useState } from "react";
import { api, url } from "../axios";

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  IconButton,
  InputBase,
  Paper,
  Slide,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { useNavigate } from "react-router-dom";

const BASE_URL = `${url}/storage/`;

export default function ProductPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedChip, setSelectedChip] = useState([]);
  const [openSearch, setOpenSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);

  const handleSearch = () => {
    console.log("Search:", query);
  };

  const getProduct = () => {
    api.get("api/productList").then((res) => {
      setProducts(res.data || []);
      setCategories(
        Array.from(
          new Map(
            res.data
              .flatMap((e) => e.category || [])
              .map((item) => [item.id, item])
          ).values()
        )
      );
    });
  };

  useEffect(() => {
    getProduct();
  }, []);

  const filteredProducts = React.useMemo(() => {
    let prods = products;


    if (selectedChip.length > 0) {
      prods = prods.filter((prod) =>
        selectedChip.includes(prod.category.id)
      );
    }

    if (query) {
      const q = query.toLowerCase();

      prods = prods.filter(
        (prod) =>
          prod.name.toLowerCase().includes(q) ||
          prod.category.name.toLowerCase().includes(q) ||
          prod.description.toLowerCase().includes(q)
      );
    }

    return prods;


  }, [products, selectedChip, query]);

  return (
    <Box
      sx={{
        maxWidth: "1400px",
        mx: "auto",
        px: { xs: 2, md: 4 },
        py: 3,
        minHeight: "100vh",
      }}
    >
      {/* 🔍 SEARCH */} <Stack direction="row" justifyContent="flex-end" mb={2}>
        {!openSearch && (
          <IconButton onClick={() => setOpenSearch(true)}> <SearchIcon /> </IconButton>
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
                if (e.key === "Enter") handleSearch();
              }}
              sx={{ ml: 1, flex: 1, width: 200 }}
            />

            <IconButton onClick={handleSearch}>
              <SearchIcon />
            </IconButton>

            <IconButton
              onClick={() => {
                setOpenSearch(false);
                setQuery("");
              }}
            >
              <CloseIcon />
            </IconButton>
          </Paper>
        </Slide>
      </Stack>

      {/* 🧩 CATEGORY FILTER */}
      <Stack
        direction="row"
        spacing={1}
        mb={3}
        py={2}
        justifyContent="center"
        sx={{ overflowX: "auto" }}
      >
        {categories.map((cat) => (
         <Chip
  key={cat.id}
  label={cat.name}
  clickable
  sx={{
    background: selectedChip.includes(cat.id)
      ? "rgb(80,80,80)"        // darker selected
      : "rgb(210,210,210)",    // lighter unselected
    color: selectedChip.includes(cat.id) ? "white" : "black",

    transition: "0.2s",

    "&:hover": {
      background: selectedChip.includes(cat.id)
        ? "rgb(60,60,60)"      // darker hover for selected
        : "rgb(170,170,170)",  // noticeable hover for unselected
    },
  }}
  onClick={() => {
    selectedChip.includes(cat.id)
      ? setSelectedChip(selectedChip.filter((id) => id !== cat.id))
      : setSelectedChip([...new Set([...selectedChip, cat.id])]);
  }}
/>
        ))}
      </Stack>

      {/* 🧱 GRID */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {filteredProducts.map((product) => {
          let swiperInstance = null;

          const price = Number(product.cost_price || 0);
          const original = Number(product.cost_price_before_discount || 0);
          const discount = Math.round(((price - original) / price) * 100);

          return (
            <Grid
              size={{ xs: 12, md: 4, lg: 3 }}
              key={product.id}
              sx={{ display: "flex" }}
            >
              <Card
                sx={{
                  width: "100%",
                  height: 440,
                  display: "flex",
                  flexDirection: "column",
                  transition: "0.3s",
                  "&:hover": { boxShadow: 6 },
                  cursor: "pointer",
                }}
              >
                {/* 🖼 IMAGE */}
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
                      swiper.autoplay.stop();
                    }}
                    loop
                    style={{ height: "100%", width: "100%" }}
                  >
                    {product.product_images.map((img) => (
                      <SwiperSlide
                        key={img.id}
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        <Box
                          component="img"
                          src={BASE_URL + img.url}
                          alt={product.name}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </Box>

                {/* 📦 CONTENT */}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between">
                    <Box sx={{ width: "70%", pr: 1 }}>
                      <Typography
                        fontSize={14}
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {product.name}
                      </Typography>

                      <Typography fontSize={10}>
                        {product.description}
                      </Typography>
                    </Box>

                    <Box textAlign="right">
                      <Typography fontSize={13}>
                        ₹{price.toLocaleString()}
                      </Typography>

                      {product.cost_price_before_discount && (
                        <>
                          <Typography
                            fontSize={11}
                            sx={{ textDecoration: "line-through" }}
                          >
                            ₹{original.toLocaleString()}
                          </Typography>

                          <Typography color="error" fontSize={12}>
                            {discount}% off
                          </Typography>
                        </>
                      )}
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
