import axiosInstance from "../../utils/axiosInstance";
import { API } from "../../api/apiUrl";

// Get all departments
export const getAllDepartments = async () => {
  try {
    const response = await axiosInstance.get(API.GET_ALL_DEPARTMENTS);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get department by ID
export const getDepartmentById = async (id) => {
  try {
    const response = await axiosInstance.get(`${API.GET_DEPARTMENT_BY_ID}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create new department
export const createDepartment = async (departmentData) => {
  try {
    const response = await axiosInstance.post(API.CREATE_DEPARTMENT, departmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update department
export const updateDepartment = async (id, departmentData) => {
  try {
    const response = await axiosInstance.put(`${API.UPDATE_DEPARTMENT}/${id}`, departmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete department
export const deleteDepartment = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API.DELETE_DEPARTMENT}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Assign user to department
export const assignToDepartment = async (departmentId, userId) => {
  try {
    const response = await axiosInstance.put(`${API.ASSIGN_TO_DEPARTMENT}/${departmentId}/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Remove user from department
export const removeFromDepartment = async (userId) => {
  try {
    const response = await axiosInstance.put(`${API.REMOVE_FROM_DEPARTMENT}/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Thêm hàm để lấy danh sách users
export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get(API.GET_ALL_USER);
    return response.data;
  } catch (error) {
    throw error;
  }
};
