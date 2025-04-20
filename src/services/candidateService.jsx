//src/services/candidateService.jsx
import axiosInstance from "../../utils/axiosInstance";
import { API } from "../../api/apiUrl";

// Function to import candidate using Excel file
export const importCandidate = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const token = sessionStorage.getItem("token");

    const response = await axiosInstance.post(
      `/${API.IMPORT_CANDIDATE}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error importing candidate:", error);
    throw error;
  }
};

// Hàm để lấy candidate từ import request
export const getCandidateByRequestId = async (requestId) => {
  try {
    const token = sessionStorage.getItem("token");
    const response = await axiosInstance.get(`/Candidate/candidate/${requestId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Log response để debug
    console.log("Candidate from request response:", response.data);
    
    // Trả về mảng các ứng viên nếu API trả về mảng
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // Trả về mảng các ứng viên nếu response chứa mảng candidates
    if (response.data && Array.isArray(response.data.candidates)) {
      return response.data.candidates;
    }
    
    // Nếu response trả về một ứng viên duy nhất, bọc trong mảng
    if (response.data && response.data.candidateId) {
      return [response.data];
    }
    
    // Trường hợp không tìm thấy ứng viên, trả về mảng rỗng
    return [];
  } catch (error) {
    console.error("Error fetching candidate from request:", error);
    throw error;
  }
};

// ✅ Function to get list of candidates
export const getCandidates = async () => {
  try {
    const token = sessionStorage.getItem("token");

    const response = await axiosInstance.get(`/${API.CANDIDATE}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw error;
  }
};

export const getCandidateById = async (id) => {
  try {
    const token = sessionStorage.getItem("token");

    const response = await axiosInstance.get(`/${API.CANDIDATE_BY_ID}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw error;
  }
};

export const createCandidateAccount = async (id) => {
  try {
    const token = sessionStorage.getItem("token");
    const response = await axiosInstance.post(
      `/${API.CREATE_CANDIDATE_ACCOUNT}/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating candidate account:", error);
    throw error;
  }
};

export const updateCandidate = async (id, payload) => {
  try {
    const response = await axiosInstance.put(
      `/${API.UPDATE_CANDIDATE}/${id}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error updating subject:", error?.response || error.message);
    throw error;
  }
};

export const deleteCandidate = async (id) => {
  try {
    const token = sessionStorage.getItem("token");
    const response = await axiosInstance.delete(
      `/${API.DELETE_CANDIDATE}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting candidate:", error);
    throw error;
  }
};
