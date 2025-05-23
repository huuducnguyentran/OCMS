import { API } from "../../api/apiUrl";
import axiosInstance from "../../utils/axiosInstance";

// Lấy tất cả ClassSubject
export const getAllClassSubjects = async () => {
  try {
    const response = await axiosInstance.get(`/${API.GET_ALL_CLASS_SUBJECT}`);
    if (response && response.data && response.data.classSubjects) {
      return response.data.classSubjects;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching class subjects:", error?.response || error.message);
    throw error;
  }
};

// Lấy ClassSubject theo ID
export const getClassSubjectById = async (id) => {
  try {
    const response = await axiosInstance.get(`/${API.GET_CLASS_SUBJECT_BY_ID}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching class subject by id:", error?.response || error.message);
    throw error;
  }
};

// Lấy chi tiết ClassSubject theo ID
export const getClassSubjectDetailsById = async (id) => {
  try {
    const response = await axiosInstance.get(`/${API.GET_CLASS_SUBJECT_DETAILS_BY_ID}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching class subject details by id:", error?.response || error.message);
    throw error;
  }
};

// Lấy ClassSubject theo classId
export const getClassSubjectByClassId = async (classId) => {
  try {
    const response = await axiosInstance.get(`/${API.GET_CLASS_SUBJECT_BY_CLASS_ID}/${classId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching class subject by classId:", error?.response || error.message);
    throw error;
  }
};

// Lấy ClassSubject theo subjectId
export const getClassSubjectBySubjectId = async (subjectId) => {
  try {
    const response = await axiosInstance.get(`/${API.GET_CLASS_SUBJECT_BY_SUBJECT_ID}/${subjectId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching class subject by subjectId:", error?.response || error.message);
    throw error;
  }
};

// Lấy ClassSubject theo instructorId
export const getClassSubjectByInstructorId = async (instructorId) => {
  try {
    const response = await axiosInstance.get(`/${API.GET_CLASS_SUBJECT_BY_INSTRUCTOR_ID}/${instructorId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching class subject by instructorId:", error?.response || error.message);
    throw error;
  }
};

// Tạo mới ClassSubject
export const createClassSubject = async (data) => {
  try {
    const response = await axiosInstance.post(`/${API.CREATE_CLASS_SUBJECT}`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating class subject:", error?.response || error.message);
    throw error;
  }
};

// Cập nhật ClassSubject
export const updateClassSubject = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/${API.UPDATE_CLASS_SUBJECT}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating class subject:", error?.response || error.message);
    throw error;
  }
}; 