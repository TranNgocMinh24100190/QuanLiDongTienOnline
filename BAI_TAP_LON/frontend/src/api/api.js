import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

// Auto refresh access token khi hết hạn
API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Nếu access token hết hạn
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Gọi refresh token
        await API.post("/auth/refresh");

        // Chạy lại request cũ
        return API(originalRequest);
      } catch (refreshError) {
        console.error(
          "Refresh token failed:",
          refreshError
        );

        // Refresh token cũng chết => về login
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;