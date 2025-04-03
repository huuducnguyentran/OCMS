import { API } from "../../api/apiUrl";
import axiosInstance from "../../utils/axiosInstance";

// Get all subjects
export const getAllSubject = async () => {
  try {
    const response = await axiosInstance.get(`/${API.VIEW_SUBJECT}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subjects:", error?.response || error.message);
    throw error;
  }
};

export const getSubjectById = async (id) => {
  try {
    const response = await axiosInstance.get(`/${API.GET_SUBJECT_BY_ID}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subjects:", error?.response || error.message);
    throw error;
  }
};

// Create a new subject
export const createSubject = async (subjectData) => {
  try {
    const response = await axiosInstance.post(
      `/${API.CREATE_SUBJECT}`,
      subjectData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating subject:", error?.response || error.message);
    throw error;
  }
};

// Update a subject by ID
export const updateSubject = async (id, subjectData) => {
  try {
    const response = await axiosInstance.put(
      `/${API.UPDATE_SUBJECT}/${id}`,
      subjectData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating subject:", error?.response || error.message);
    throw error;
  }
};

// Delete a subject by ID
export const deleteSubject = async (id) => {
  try {
    const response = await axiosInstance.delete(`/${API.DELETE_SUBJECT}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting subject:", error?.response || error.message);
    throw error;
  }
};
