import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Card,
  CardMedia,
  IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { api, url as baseUrl } from "../axios";

export default function ImageUpload({ form, setForm }) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState(form.product_images || []);

  const generateId = () =>
    Date.now().toString() + Math.random().toString(36).substring(2, 9);

  const handleSelect = (e) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);

    const newFiles = selectedFiles.map((file) => ({
      id: generateId(),
      name: file.name,
      url: URL.createObjectURL(file),
      file // keep original file internally if needed later
    }));

    const updated = [...files, ...newFiles];

    setFiles(updated);
    updateForm(updated);

    e.target.value = ""; // reset input
  };

  const handleRemove = (id, url) => {
    if (url.includes("blob:")) {
      const fileToRemove = files.find((f) => f.id === id);

      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }

      const updated = files.filter((f) => f.id !== id);

      setFiles(updated);
      updateForm(updated);
    }

    else {
      api.delete(`/api/productImage/${id}`).then(() => {
        const updated = files.filter((f) => f.id !== id);

        setFiles(updated);
        updateForm(updated);
      });
    }
  };

  const updateForm = (fileList) => {
    setForm((prev) => ({
      ...prev,
      files: fileList.map(({ id, name, url, file }) => ({
        id,
        name,
        url,
        file
      }))
    }));
  };

  const getUrl = (url) => {
    if (url.includes("blob:")) {
      return url;
    }
    console.log(baseUrl)
    return `${baseUrl}/storage/${url}`;
  }

  // cleanup on unmount
  useEffect(() => {
    return () => {
      // files.forEach((f) => URL.revokeObjectURL(f.url));
    };
  }, [files]);

  return (
    <Box>
      <Button
        variant="contained"
        onClick={() => inputRef.current?.click()}
      >
        Upload Images
      </Button>

      <input
        type="file"
        multiple
        accept="image/*"
        hidden
        ref={inputRef}
        onChange={handleSelect}
      />

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {files.map((file) => (
          <Grid item key={file.id}>
            <Card
              sx={{
                width: 120,
                height: 120,
                position: "relative"
              }}
            >
              <CardMedia
                component="img"
                image={getUrl(file.url)}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />



              <IconButton
                size="small"
                onClick={() => handleRemove(file.id, file.url)}
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  color: "#fff"
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Card>

          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
