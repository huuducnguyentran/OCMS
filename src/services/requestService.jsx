// src/services/RequestService.jsx
import axiosInstance from "../../utils/axiosInstance";
import { API } from "../../api/apiUrl";

export const getAllRequests = async () => {
  try {
    const response = await axiosInstance.get(`/${API.GET_ALL_REQUEST}`);
    return response.data.requests;
  } catch (error) {
    console.error("Error fetching requests:", error?.response || error.message);
    throw error;
  }
};

export const getAllEduOfficerRequests = async () => {
  try {
    const response = await axiosInstance.get(
      `/${API.GET_ALL_EDU_OFFICER_REQUEST}`
    );
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
    console.error(
      "Error fetching request by id:",
      error?.response || error.message
    );
    throw error;
  }
};

// Lấy danh sách học viên được gán vào khóa học theo request ID
export const getTraineesByRequestId = async (requestId) => {
  try {
    const endpoint = API.GET_TRAINEES_BY_REQUEST_ID.replace('{requestId}', requestId);
    const response = await axiosInstance.get(`/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching trainees by request ID:",
      error?.response || error.message
    );
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
    console.error(
      "Error approving requests:",
      error?.response || error.message
    );
    throw error;
  }
};

// Reject request
export const rejectRequest = async (id, data) => {
  try {
    const response = await axiosInstance.put(
      `${API.REJECT_REQUEST}/${id}/reject`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error rejecting requests:",
      error?.response || error.message
    );
    throw error;
  }
};

export const createRequest = async (data) => {
  try {
    const response = await axiosInstance.post(`/${API.CREATE_REQUEST}`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating subject:", error?.response || error.message);
    throw error;
  }
};

export const deleteRequest = async (id) => {  
  try {
    const response = await axiosInstance.delete(`/${API.DELETE_REQUEST}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting subject:", error?.response || error.message);
    throw error;
  }
};
