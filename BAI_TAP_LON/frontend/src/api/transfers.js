import API from "./api";

// Tạo transfer
export const createTransfer = (data) =>
  API.post("/transfers", data);

// Reverse transfer
export const reverseTransfer = (id) =>
  API.post(`/transfers/reverse/${id}`);