import { API } from "../../api/apiUrl";
import axiosInstance from "../../utils/axiosInstance";

// Get all subject specialties
export const getAllSubjectSpecialties = async () => {
  try {
    const response = await axiosInstance.get(`/${API.GET_ALL_SUBJECT_SPECIALTY}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subject specialties:", error?.response || error.message);
    throw error;
  }
};

// Get subject specialty by ID
export const getSubjectSpecialtyById = async (id) => {
  try {
    const response = await axiosInstance.get(`/${API.GET_SUBJECT_SPECIALTY_BY_ID}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subject specialty:", error?.response || error.message);
    throw error;
  }
};

// Create a new subject specialty
export const createSubjectSpecialty = async (subjectSpecialtyData) => {
  try {
    const response = await axiosInstance.post(
      `/${API.CREATE_SUBJECT_SPECIALTY}`,
      subjectSpecialtyData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating subject specialty:", error?.response || error.message);
    throw error;
  }
};

// Delete a subject specialty by ID
export const deleteSubjectSpecialty = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `/${API.DELETE_SUBJECT_SPECIALTY}/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting subject specialty:", error?.response || error.message);
    throw error;
  }
};

// Helper function to get all subjects for dropdown
export const getSubjectsForDropdown = async () => {
  try {
    const response = await axiosInstance.get(`/${API.GET_ALL_SUBJECTS}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subjects for dropdown:", error?.response || error.message);
    throw error;
  }
};

// Helper function to get all specialties for dropdown
export const getSpecialtiesForDropdown = async () => {
  try {
    // Assuming there's an API endpoint for specialties
    const response = await axiosInstance.get(`/Specialty`);
    return response.data;
  } catch (error) {
    console.error("Error fetching specialties for dropdown:", error?.response || error.message);
    throw error;
  }
};

// Get all subjects
export const getAllSubject = async () => {
  try {
    const response = await axiosInstance.get(`/${API.GET_ALL_SUBJECTS}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subjects:", error?.response || error.message);
    throw error;
  }
};
