// src/services/RequestService.jsx
import axiosInstance from "../../utils/axiosInstance";
import { API } from "../../api/apiUrl";

export const getAllRequests = async () => {
  try {
    const response = await axiosInstance.get(`/${API.GET_ALL_REQUEST}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching requests:", error?.response || error.message);
    throw error;
  }
};

export const getRequestById = async (id) => {
  try {
    const response = await axiosInstance.get(`/${API.GET_REQUEST_BY_ID}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching requests:", error?.response || error.message);
    throw error;
  }
};

// Approve request
export const approveRequest = async (id) => {
  try {
    const response = await axiosInstance.put(
      `${API.APPROVE_REQUEST}/${id}/approve`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching requests:", error?.response || error.message);
    throw error;
  }
};

// Reject request
export const rejectRequest = async (id, reason = "") => {
  try {
    const response = await axiosInstance.put(
      `${API.REJECT_REQUEST}/${id}/reject`,
      reason,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching requests:", error?.response || error.message);
    throw error;
  }
};
