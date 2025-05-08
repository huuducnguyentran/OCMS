// src/services/authServices.js
import { API } from "../../api/apiUrl";
import axiosInstance from "../../utils/axiosInstance.jsx";

export const authServices = {
  loginUser(payload) {
    return axiosInstance.post(API.LOGIN, payload);
  },
};

export const logoutUser = async () => {
  const token = sessionStorage.getItem("token");

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

export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post(API.FORGOT_PASSWORD, {
      email,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to send reset email.";
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axiosInstance.post(
      `${API.RESET_PASSWORD}/${token}`,
      {
        newPassword,
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data?.message ||
      "Failed to reset password. Please try again."
    );
  }
};
