// src/services/authServices.js
import { API } from "../../api/apiUrl";
import axiosInstance from "../../utils/axiosInstance.jsx";

export const authServices = {
  loginUser(payload) {
    return axiosInstance.post(API.LOGIN, payload);
  },
};

export const logoutUser = async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await axiosInstance.post(
      `/${API.LOGOUT}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Logout API error:", error);
    throw error;
  }
};
