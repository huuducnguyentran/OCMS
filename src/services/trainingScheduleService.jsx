import axiosInstance from "../../utils/axiosInstance";
import { API } from "../../api/apiUrl";
import { BASE_URL } from "../../utils/environment";

export const trainingScheduleService = {
  getAllTrainingSchedules: async () => {
    try {
      const response = await axiosInstance.get(API.GET_ALL_TRAINING_SCHEDULE);
      return response.data;
    } catch (error) {
      console.error("Error fetching training schedules:", error);
      throw error;
    }
  },

  getTrainingScheduleById: async (id) => {
    try {
      const response = await axiosInstance.get(
        `${API.GET_TRAINING_SCHEDULE_BY_ID}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching training schedule ${id}:`, error);
      throw error;
    }
  },

  createTrainingSchedule: async (scheduleData) => {
    try {
      const response = await axiosInstance.post(
        API.CREATE_TRAINING_SCHEDULE,
        scheduleData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating training schedule:", error);
      throw error;
    }
  },

  updateTrainingSchedule: async (id, scheduleData) => {
    try {
      const response = await axiosInstance.put(
        `${API.UPDATE_TRAINING_SCHEDULE}/${id}`,
        scheduleData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating training schedule ${id}:`, error);
      throw error;
    }
  },

  deleteTrainingSchedule: async (id) => {
    try {
      const response = await axiosInstance.delete(
        `${API.DELETE_TRAINING_SCHEDULE}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting training schedule ${id}:`, error);
      throw error;
    }
  },

  getInstructorSubjects: async () => {
    try {
      const response = await axiosInstance.get(API.GET_INSTRUCTOR_SUBJECTS);
      return response.data;
    } catch (error) {
      console.error("Error fetching instructor subjects:", error);
      throw error;
    }
  },

  getTraineeSubjects: async () => {
    try {
      const response = await axiosInstance.get(API.GET_TRAINEE_SUBJECTS);
      return response.data;
    } catch (error) {
      console.error("Error fetching trainee subjects:", error);
      throw error;
    }
  },

  validateToken: async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return false;
      const response = await axiosInstance.get("User/validate-token");
      return response.status === 200;
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  },

  getCreatedSchedules: async (userId) => {
    try {
      const response = await axiosInstance.get(
        `${API.GET_ALL_TRAINING_SCHEDULE}`,
        {
          params: {
            createdBy: userId,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching created schedules:", error);
      throw error;
    }
  },

  getScheduleBySubjectId: async (subjectId) => {
    try {
      console.log("Fetching schedules for subject:", subjectId);

      // Chỉ gọi API subject, vì response đã chứa cả training schedules
      const subjectUrl = `${API.GET_SUBJECT_BY_ID}/${subjectId}`;

      console.log("Fetching from:", subjectUrl);

      try {
        // Chỉ gọi API subject, không cần gọi thêm API schedule
        const subjectResponse = await axiosInstance.get(subjectUrl);
        console.log("Subject API Response:", subjectResponse.data);

        if (!subjectResponse.data || !subjectResponse.data.subject) {
          console.error("Invalid subject response format");
          throw new Error("Subject data not found");
        }

        // Lấy thông tin subject từ response
        const subjectDetails = subjectResponse.data.subject;

        // Lấy schedules từ subject response
        const schedules = subjectDetails.trainingSchedules || [];

        console.log(`Found ${schedules.length} schedules in subject response`);

        return {
          schedules: schedules,
          subjectDetails: subjectDetails,
        };
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in getScheduleBySubjectId:", error);
      throw error;
    }
  },

  getSchedulesBySubjectId: async (subjectId) => {
    try {
      const response = await axiosInstance.get(
        `${API.GET_SCHEDULE_BY_SUBJECT}/${subjectId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching schedules for subject ${subjectId}:`,
        error
      );
      throw error;
    }
  },

  getAllSubjects: async () => {
    try {
      console.log("Fetching all subjects from API");

      const response = await axiosInstance.get(API.GET_ALL_SUBJECTS);
      console.log("All subjects API response:", response.data);

      // Xử lý dữ liệu response
      if (response.data && response.data.subjects) {
        console.log(`Got ${response.data.subjects.length} subjects from API`);
        return response.data.subjects;
      }

      if (Array.isArray(response.data)) {
        console.log(
          `Got ${response.data.length} subjects from API (array format)`
        );
        return response.data;
      }

      console.warn("Unexpected API response format");
      return [];
    } catch (error) {
      console.error("Error fetching subjects from API:", error);
      throw error; // Ném lỗi ra để component xử lý
    }
  },
};
