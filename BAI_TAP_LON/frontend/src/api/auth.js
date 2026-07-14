import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);
export const logout = () => API.post("/auth/logout");
export const getProfile = () => API.get("/auth/profile");
