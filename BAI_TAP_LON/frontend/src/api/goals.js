import API from "./api";

// Lấy danh sách mục tiêu
export const getGoals = () => API.get("/goals");

// Tạo mục tiêu
export const createGoal = (data) =>
  API.post("/goals", data);

// Cập nhật mục tiêu
export const updateGoal = (id, data) =>
  API.put(`/goals/${id}`, data);

// Xóa mục tiêu
export const deleteGoal = (id) =>
  API.delete(`/goals/${id}`);