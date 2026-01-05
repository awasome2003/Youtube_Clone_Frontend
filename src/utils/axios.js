// src/utils/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and there's no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post(
          `http://localhost:5000/api/auth/refresh-token`,
          {
            refreshToken,
          }
        );

        const { accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (err) {
        // If refresh fails, logout the user
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
