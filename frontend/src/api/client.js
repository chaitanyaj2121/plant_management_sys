import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const TOKEN_STORAGE_KEY = "auth_token";
const USER_STORAGE_KEY = "auth_user";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getErrorMessage = (error) => {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong"
  );
};

export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const setAuthToken = (token) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const getAuthUser = () => {
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

export const setAuthUser = (user) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const clearAuthUser = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const clearAuthSession = () => {
  clearAuthToken();
  clearAuthUser();
};

export const loginUser = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  if (data?.token) {
    setAuthToken(data.token);
  }
  if (data?.user) {
    setAuthUser(data.user);
  }
  return data;
};

export const registerUser = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  if (data?.token) {
    setAuthToken(data.token);
  }
  if (data?.user) {
    setAuthUser(data.user);
  }
  return data;
};

export default api;

