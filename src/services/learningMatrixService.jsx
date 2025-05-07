import axiosInstance from "../../utils/axiosInstance";
import { API } from "../../api/apiUrl";

export const learningMatrixService = {
  // Lấy tất cả Course Subject Specialties
  getAllCourseSubjectSpecialties: async () => {
    try {
      const response = await axiosInstance.get(`/CourseSubjectSpecialty`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data);
      throw error.response?.data?.message || "Không thể tải danh sách ma trận học tập";
    }
  },

  // Lấy Course Subject Specialty theo ID
  getCourseSubjectSpecialtyById: async (id) => {
    try {
      const response = await axiosInstance.get(`/CourseSubjectSpecialty/${id}`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data);
      throw error.response?.data?.message || "Không thể tìm thấy ma trận học tập";
    }
  },

  // Thêm Course Subject Specialty mới
  createCourseSubjectSpecialty: async (data) => {
    try {
      const response = await axiosInstance.post(`/CourseSubjectSpecialty`, data);
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data);
      throw error;
    }
  },

  // Cập nhật Course Subject Specialty
  updateCourseSubjectSpecialty: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/CourseSubjectSpecialty/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data);
      throw error.response?.data?.message || "Không thể cập nhật ma trận học tập";
    }
  },

  // Xóa Course Subject Specialty
  deleteCourseSubjectSpecialty: async (id) => {
    try {
      const response = await axiosInstance.delete(`/CourseSubjectSpecialty/${id}`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data);
      throw error.response?.data?.message || "Không thể xóa ma trận học tập";
    }
  },

  // Xóa tất cả Subject Specialties cho một môn học
  deleteAllSubjectSpecialties: async (payload) => {
    try {
      const response = await axiosInstance.delete(`/CourseSubjectSpecialty/Allsubject`, {
        data: payload // courseId và specialtyId
      });
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data);
      throw error.response?.data?.message || "Không thể xóa tất cả ma trận học tập";
    }
  },

  // Lấy danh sách môn học theo courseId và specialtyId
  getSubjectsForCourseAndSpecialty: async (courseId, specialtyId) => {
    try {
      const response = await axiosInstance.get(
        `/CourseSubjectSpecialty/subjects?courseId=${courseId}&specialtyId=${specialtyId}`
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data);
      throw error.response?.data?.message || "Không thể tải danh sách môn học";
    }
  },

  // Lấy Course Subject Specialties theo Course ID
  getCourseSubjectSpecialtiesByCourseId: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/CourseSubjectSpecialty/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data);
      throw error.response?.data?.message || "Không thể tải ma trận học tập cho khóa học này";
    }
  },
}; 