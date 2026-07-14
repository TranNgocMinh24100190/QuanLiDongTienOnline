import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export const getTransfers = () => API.get("/transfers");
export const createTransfer = (data) => API.post("/transfers", data);
export const updateTransfer = (id, data) => API.put(`/transfers/${id}`, data);
export const deleteTransfer = (id) => API.delete(`/transfers/${id}`);
