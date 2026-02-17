import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getErrorMessage = (error) => {
  return error?.response?.data?.error || error?.message || "Something went wrong";
};

export default api;

