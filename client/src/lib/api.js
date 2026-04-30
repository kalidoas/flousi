import axios from "axios";

const normalizeApiBaseUrl = (value) => {
  if (!value) {
    return "/api";
  }

  const trimmed = value.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const baseURL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

// Use the key required by the app for Bearer token storage.
export const authTokenKey = "flousi_token";

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(authTokenKey, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  localStorage.removeItem(authTokenKey);
  delete api.defaults.headers.common.Authorization;
};

export const loadAuthToken = () => {
  const token = localStorage.getItem(authTokenKey);
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
  return token;
};

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(authTokenKey);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

loadAuthToken();

