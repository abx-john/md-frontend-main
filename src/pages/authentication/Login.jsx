import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { fetchLaravelCookies, login, setCookies } from "../../axios/function";
import { useDispatch } from "react-redux";
import { startBusy, stopBusy } from "../../store/busySlice";
import { showSnackbar } from "../../store/snackbarSlice";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();



  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(startBusy());
    login({ email, password })
      .then(() => {
        dispatch(
          showSnackbar({ message: "Login successful", severity: "success" })
        );
        navigate("/admin/warehouse");
      })
      .catch((err) => {
        const message = err?.response?.data?.message;
        if (message) {
          setError(message)
          dispatch(showSnackbar({ message, severity: "error" }));
        };
        if (err.response.data.message === "CSRF token mismatch.") {
          setError("Session expired. Please refresh the page and try again.")
          fetchLaravelCookies()
        }
        console.log(err);
      })
      .finally(() => {
        dispatch(stopBusy());
      });
  };

  useEffect(()=>{
    setCookies()
  },[])

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f6fa",
        p: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 380, p: 1 }}>
        <CardContent>
          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            Login
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              label="Email"
              type="email"
              size="small"
              fullWidth
              required
              margin="normal"
              value={email}

              onChange={(e) => {
                setError("")
                setEmail(e.target.value)
              }}
              helperText={error}
              error={Boolean(error)}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              size="small"
              fullWidth
              required
              margin="normal"
              value={password}
              onChange={(e) => {
                setError("")
                setPassword(e.target.value)
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, py: 1 }}
            >
              Sign In
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
