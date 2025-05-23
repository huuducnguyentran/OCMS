import axiosInstance from "../../utils/axiosInstance";
import { API } from "../../api/apiUrl";

export const courseService = {
  getAllCourses: async () => {
    try {
      const response = await axiosInstance.get(API.GET_ALL_COURSES);
      return response.data;
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },

  getCourseById: async (courseId) => {
    try {
      const response = await axiosInstance.get(
        `${API.GET_COURSE_BY_ID}/${courseId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      throw error;
    }
  },

  createCourse: async (courseData) => {
    try {
      const response = await axiosInstance.post("Course/create", courseData);
      return response.data;
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  },

  updateCourse: async (courseId, courseData) => {
    try {
      const response = await axiosInstance.put(
        `${API.UPDATE_COURSE}/${courseId}`,
        courseData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating course ${courseId}:`, error);
      throw error;
    }
  },

  deleteCourse: async (courseId) => {
    try {
      const response = await axiosInstance.delete(
        `${API.DELETE_COURSE}/${courseId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting course ${courseId}:`, error);
      throw error;
    }
  },

  getCourseSubjects: async (courseId) => {
    try {
      const response = await axiosInstance.get(
        `${API.GET_COURSE_SUBJECTS}/${courseId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching subjects for course ${courseId}:`, error);
      throw error;
    }
  },

  assignTraineeToCourse: async (courseId, traineeData) => {
    try {
      const response = await axiosInstance.post(
        `${API.ASSIGN_TRAINEE_TO_COURSE}/${courseId}`,
        traineeData
      );
      return response.data;
    } catch (error) {
      console.error(`Error assigning trainee to course ${courseId}:`, error);
      throw error;
    }
  },

  addSubjectToCourse: async (courseId, subjectData) => {
    try {
      const response = await axiosInstance.post(
        `${API.ADD_SUBJECT_TO_COURSE}/${courseId}`,
        subjectData
      );
      return response.data;
    } catch (error) {
      console.error(`Error adding subject to course ${courseId}:`, error);
      throw error;
    }
  },

  getAssignedTraineeCourse: async (id) => {
    try {
      const response = await axiosInstance.get(
        `${API.GET_ASSIGNED_TRAINEE_COURSE}/${id}/courses`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching course ${id}:`, error);
      throw error;
    }
  },
  importCourse: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post(
        `${API.IMPORT_COURSE}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error importing course:", error);
      throw error;
    }
  },

  assignSubjectSpecialty: async (data) => {
    try {
      const response = await axiosInstance.post("Course/assign-subject-specialty", data);
      return response.data;
    } catch (error) {
      console.error("Error assigning subject specialty to course:", error);
      throw error;
    }
  },
};
