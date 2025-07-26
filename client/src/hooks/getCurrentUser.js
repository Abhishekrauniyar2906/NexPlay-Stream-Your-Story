import axiosInstance from "../utils/axios.helper";
import { setUser } from "../store/authSlice";

export const getCurrentUser = async (dispatch) => {
    try {
        const token = localStorage.getItem("accessToken");

        // Ensure token exists before making the request
        if (!token) {
            console.log("No token found in localStorage");
            return;
        }

        const response = await axiosInstance.get("/users/current-user", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log(response);

        if (response?.data?.data) {
            dispatch(setUser(response.data.data));
            return response.data;
        }
    } catch (error) {
        console.log(error);
    }
};
