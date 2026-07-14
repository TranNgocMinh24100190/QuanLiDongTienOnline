import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export const getWallets = () => API.get("/wallets");
export const createWallet = (data) => API.post("/wallets", data);
export const updateWallet = (id, data) => API.put(`/wallets/${id}`, data);
export const deleteWallet = (id) => API.delete(`/wallets/${id}`);
