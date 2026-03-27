import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// Determine dev or prod
const isDev =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.MODE === "development";

let url;

if (isDev) {
  url = "http://localhost:8000";
} else {
  url = "https://api.mdenterprise.business";
}

// Create axios instance
const api = axios.create({
  baseURL: url,
});

// Export for usage
export { url, api, axios };
