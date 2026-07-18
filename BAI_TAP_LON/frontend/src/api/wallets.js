import API from "./api";

// Lấy tất cả ví
export const getWallets = () =>
  API.get("/wallets");

// Lấy chi tiết 1 ví
export const getWalletById = (id) =>
  API.get(`/wallets/${id}`);

// Tạo ví
export const createWallet = (data) =>
  API.post("/wallets", data);

// Cập nhật ví
export const updateWallet = (id, data) =>
  API.put(`/wallets/${id}`, data);

// Đóng ví
export const closeWallet = (id) =>
  API.post(`/wallets/${id}/close`);

// Mở ví
export const openWallet = (id) =>
  API.post(`/wallets/${id}/open`);