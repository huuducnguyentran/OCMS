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
