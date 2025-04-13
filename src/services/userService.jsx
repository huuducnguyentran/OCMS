import axiosInstance from "../../utils/axiosInstance";
import { API } from "../../api/apiUrl";

export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get(`/${API.GET_ALL_USER}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching requests:", error?.response || error.message);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/${API.GET_USER_BY_ID}/${id}`);
    return response.data.user;
  } catch (error) {
    console.error("Error fetching requests:", error?.response || error.message);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get(`/${API.GET_USER_PROiLE}`);
    return response.data.user;
  } catch (error) {
    console.error("Error fetching requests:", error?.response || error.message);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await axiosInstance.put(
      `/${API.UPDATE_USER}/${id}/details`,
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching requests:", error?.response || error.message);
    throw error;
  }
};
export const updateAvatar = async (formData) => {
  try {
    const response = await axiosInstance.put(
      `${API.UPDATE_USER_AVATAR}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updatePassword = async (id, password) => {
  try {
    const response = await axiosInstance.put(
      `/${API.UPDATE_PASSWORD}/${id}/password`,
      password
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching requests:", error?.response || error.message);
    throw error;
  }
};
