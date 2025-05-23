import { API } from "../../api/apiUrl";
import axiosInstance from "../../utils/axiosInstance";

// Lấy tất cả Instructor Assignments
export const getAllInstructorAssignments = async () => {
  try {
    const response = await axiosInstance.get(`/${API.GET_ALL_INSTRUCTOR_ASSIGNMENTS}`);
    // API trả về: { message: "...", data: [...] }
    if (response && response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // Nếu backend trả về trực tiếp mảng trong response.data (ít khả năng hơn dựa trên hình ảnh)
    if (response && Array.isArray(response.data)) {
        return response.data;
    }
    console.warn("Unexpected format for getAllInstructorAssignments:", response);
    return []; // Trả về mảng rỗng nếu không đúng định dạng hoặc không có dữ liệu
  } catch (error) {
    console.error("Error fetching instructor assignments:", error?.response?.data || error?.response || error.message);
    throw error;
  }
};

// Lấy Instructor Assignment theo ID
export const getInstructorAssignmentById = async (id) => {
  try {
    const response = await axiosInstance.get(`/${API.GET_INSTRUCTOR_ASSIGNMENT_BY_ID}/${id}`);
    // API có thể trả về { message: "...", data: {...} } hoặc trực tiếp object data
    return response.data; // Giả định trả về object data trực tiếp hoặc trong response.data.data
  } catch (error) {
    console.error(`Error fetching instructor assignment by id ${id}:`, error?.response?.data || error?.response || error.message);
    throw error;
  }
};

// Tạo mới Instructor Assignment
export const createInstructorAssignment = async (assignmentData) => {
  try {
    const response = await axiosInstance.post(`/${API.CREATE_INSTRUCTOR_ASSIGNMENT}`, assignmentData);
    // API trả về: { message: "...", data: {...} }
    return response.data; // Thường là object assignment vừa tạo nằm trong response.data hoặc response.data.data
  } catch (error) {
    console.error("Error creating instructor assignment:", error?.response?.data || error?.response || error.message);
    throw error;
  }
};

// Cập nhật Instructor Assignment
export const updateInstructorAssignment = async (id, assignmentData) => {
  try {
    const response = await axiosInstance.put(`/${API.UPDATE_INSTRUCTOR_ASSIGNMENT}/${id}`, assignmentData);
    // API có thể trả về { message: "...", data: {...} } hoặc chỉ message
    return response.data;
  } catch (error) {
    console.error(`Error updating instructor assignment ${id}:`, error?.response?.data || error?.response || error.message);
    throw error;
  }
};

// Xóa Instructor Assignment
export const deleteInstructorAssignment = async (id) => {
  try {
    const response = await axiosInstance.delete(`/${API.DELETE_INSTRUCTOR_ASSIGNMENT}/${id}`);
    // API có thể trả về message xác nhận
    return response.data;
  } catch (error) {
    console.error(`Error deleting instructor assignment ${id}:`, error?.response?.data || error?.response || error.message);
    throw error;
  }
}; 