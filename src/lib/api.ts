// src/lib/api.ts
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"; // ⚡ update to your backend URL

const api = axios.create({
    baseURL: `${BACKEND_URL}/api`, // ⚡ update to your backend URL
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// ✅ Request interceptor → attach token if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Response interceptor → handle global errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // token expired or unauthorized → clear and redirect
            localStorage.removeItem("authToken");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;