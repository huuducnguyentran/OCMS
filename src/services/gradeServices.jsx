import axiosInstance from "../../utils/axiosInstance";
import { API } from "../../api/apiUrl";

export const gradeServices = {
  importGrades: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await axiosInstance.post(API.IMPORT_GRADE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getAllGrades: async () => {
    const response = await axiosInstance.get(API.GET_ALL_GRADES);
    return response.data;
  },

  getGradeById: async (traineeAssignID) => {
    try {
      const response = await axiosInstance.get(`${API.GET_GRADE_BY_ID}/${traineeAssignID}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch grade';
    }
  },

  updateGrade: async (gradeId, gradeData) => {
    try {
      // Sử dụng gradeId trong URL và giữ nguyên payload
      const response = await axiosInstance.put(`${API.UPDATE_GRADE}/${gradeId}`, gradeData);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data);
      throw error.response?.data?.message || 'Failed to update grade';
    }
  },

  getAllUsers: async () => {
    const response = await axiosInstance.get(API.GET_ALL_USER);
    return response.data;
  },

  deleteGrade: async (gradeId) => {
    try {
      const response = await axiosInstance.delete(`${API.DELETE_GRADE}/${gradeId}`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data);
      throw error.response?.data?.message || 'Failed to delete grade';
    }
  },
};
