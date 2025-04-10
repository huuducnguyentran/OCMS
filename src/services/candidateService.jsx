//src/services/candidateService.jsx
import axiosInstance from "../../utils/axiosInstance";
import { API } from "../../api/apiUrl";

// Function to import candidate using Excel file
export const importCandidate = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");

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

// ✅ Function to get list of candidates
export const getCandidates = async () => {
  try {
    const token = localStorage.getItem("token");

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
    const token = localStorage.getItem("token");

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
    const token = localStorage.getItem("token");
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
