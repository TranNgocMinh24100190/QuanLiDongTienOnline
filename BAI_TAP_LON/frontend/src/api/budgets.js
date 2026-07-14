import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export const getBudgets = () => API.get("/budgets");
export const createBudget = (data) => API.post("/budgets", data);
export const updateBudget = (id, data) => API.put(`/budgets/${id}`, data);
export const deleteBudget = (id) => API.delete(`/budgets/${id}`);
