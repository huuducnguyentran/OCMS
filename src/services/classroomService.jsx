// services/ClassroomService.js

import { API } from "../../api/apiUrl";
import axiosInstance from "../../utils/axiosInstance";

const ClassroomService = {
  // Get all classrooms
  getAllClassrooms: () => {
    return axiosInstance.get(API.GET_ALL_CLASSROOM);
  },

  // Get classroom by ID
  getClassroomById: (id) => {
    return axiosInstance.get(`${API.GET_CLASSROOM_BY_ID}/${id}`);
  },

  // Create a new classroom
  createClassroom: (data) => {
    return axiosInstance.post(API.CREATE_CLASSROOM, data);
  },

  // Update an existing classroom by ID
  updateClassroom: (id, data) => {
    return axiosInstance.put(`${API.UPDATE_CLASSROOM}/${id}`, data);
  },

  // Delete a classroom by ID
  deleteClassroom: (id) => {
    return axiosInstance.delete(`${API.DELETE_CLASSROOM}/${id}`);
  },
};

export default ClassroomService;
