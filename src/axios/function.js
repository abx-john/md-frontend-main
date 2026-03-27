import { api } from ".";

// Helper: clear all cookies for current domain
const clearCookies = () => {
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
  });
};

// Helper: fetch fresh Laravel cookies (XSRF-TOKEN + session)
const fetchLaravelCookies = async () => {
  await api.get("/sanctum/csrf-cookie"); // Laravel sets cookies here
};

// Parse cookies into object
const parseCookies = () => {
  let cookies = document.cookie.split(";");
  let cookieObj = {};

  cookies.forEach((cookie) => {
    if (!cookie.includes("=")) return;
    let [key, value] = cookie.split("=");
    cookieObj[key.trim()] = value;
  });

  return cookieObj;
};

// Main cookie manager
const setCookies = async () => {
  try {
    let cookieObj = parseCookies();

    // If missing key Laravel requires (e.g., XSRF-TOKEN), fetch again
    if (!cookieObj["XSRF-TOKEN"]) {
      await fetchLaravelCookies();
      cookieObj = parseCookies();
    }

    return cookieObj;
  } catch (error) {
    // Handle Laravel CSRF mismatch or other cookie-related errors
    const message =
      error?.response?.data?.message || error?.response?.data?.error || "";

    const isCsrfError =
      error?.response?.status === 419 ||
      message.toLowerCase().includes("csrf") ||
      message.toLowerCase().includes("mismatch");

    if (isCsrfError) {
      console.warn("⚠️ CSRF token mismatch — resetting cookies…");

      clearCookies();
      await fetchLaravelCookies();

      return parseCookies();
    }

    console.error("Unexpected cookie error:", error);
    throw error;
  }
};

const login = async (credentials) => {
  return api.post("/api/login", credentials);
};

const getMe = () => {
  return api.get("/api/user");
};

const fetchWarehouses = async () => {
  return api.get("/api/warehouses");
};
const fetchCategories = async () => {
  return api.get("/api/categories");
};

const logout = () => {
  return api.get("/api/logout");
}




export { setCookies, login, getMe, fetchWarehouses,logout,fetchLaravelCookies,fetchCategories };
