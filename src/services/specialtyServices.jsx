import axios from "../../utils/axiosInstance";
import { API } from "../../api/apiUrl";

export const specialtyService = {
  // Get all specialties
  getAllSpecialties: async () => {
    try {
      const response = await axios.get(API.GET_ALL_SPECIALTY);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get specialty by ID
  getSpecialtyById: async (id) => {
    try {
      const response = await axios.get(`${API.GET_SPECIALTY_BY_ID}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new specialty
  createSpecialty: async (specialtyData) => {
    try {
      const response = await axios.post(API.CREATE_SPECIALTY, specialtyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update specialty
  updateSpecialty: async (id, specialtyData) => {
    try {
      const response = await axios.put(`${API.UPDATE_SPECIALTY}/${id}`, specialtyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete specialty
  deleteSpecialty: async (id) => {
    try {
      const response = await axios.delete(`${API.DELETE_SPECIALTY}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get specialty tree structure
  getSpecialtyTree: async () => {
    try {
      const response = await axios.get(API.GET_SPECIALTY_TREE);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
