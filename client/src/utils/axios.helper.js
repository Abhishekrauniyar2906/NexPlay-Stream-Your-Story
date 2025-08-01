import axios from "axios";
import { toast } from "react-toastify";
import { parseErrorMessage } from "./parseErrorMsg";

const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
    withCredentials: true,
});

// Request interceptor to add the access token to headers
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const errorMsg = parseErrorMessage(error.response?.data);
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            errorMsg === "TokenExpiredError" &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            try {
                const { data } = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                localStorage.setItem("accessToken", data.data.accessToken);
                axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${data.data.accessToken}`;
                return axiosInstance(originalRequest);
            } catch (err) {
                console.error("Failed to refresh token", err);
                localStorage.removeItem("accessToken");
                toast.error("Session expired. Please login again!");
                window.location.reload();
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
