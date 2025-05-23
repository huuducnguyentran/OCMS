import { API } from "../../api/apiUrl";
import axiosInstance from "../../utils/axiosInstance";

const instructorAssServices = {
  // Lấy tất cả Instructor Assignments
  getAllInstructorAssignments: () => {
    return axiosInstance.get(API.GET_ALL_INSTRUCTOR_ASSIGNMENTS);
  },

  // Lấy Instructor Assignment theo ID
  getInstructorAssignmentById: (id) => {
    return axiosInstance.get(`${API.GET_INSTRUCTOR_ASSIGNMENT_BY_ID}/${id}`);
  },

  // Tạo mới Instructor Assignment
  createInstructorAssignment: (data) => {
    return axiosInstance.post(API.CREATE_INSTRUCTOR_ASSIGNMENT, data);
  },

  // Cập nhật Instructor Assignment theo ID
  updateInstructorAssignment: (id, data) => {
    return axiosInstance.put(`${API.UPDATE_INSTRUCTOR_ASSIGNMENT}/${id}`, data);
  },

  // Xóa Instructor Assignment theo ID
  deleteInstructorAssignment: (id) => {
    return axiosInstance.delete(`${API.DELETE_INSTRUCTOR_ASSIGNMENT}/${id}`);
  },

   getAllInstructors: async () => {
    const response = await axiosInstance.get(`${API.GET_ALL_USER}`, {
      params: { roleName: "Instructor" }
    });
    return response.data;
  },

  getAllSubjects: async () => {
    const response = await axiosInstance.get(`${API.GET_ALL_SUBJECTS}`);
    return response.data;
  },
};

export default instructorAssServices;
