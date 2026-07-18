import API from "./api";

// Lấy danh sách giao dịch
export const getTransactions = () =>
  API.get("/transactions");

// Tạo giao dịch mới
export const createTransaction = (data) =>
  API.post("/transactions", data);

// Reverse giao dịch
export const reverseTransaction = (id) =>
  API.post(`/transactions/${id}/reverse`);