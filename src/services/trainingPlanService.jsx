import axios from "axios";
import { API } from "../../api/apiUrl";
import axiosInstance from "../../utils/axiosInstance";

// API Base URL
const API_BASE_URL = "https://ocms-vjvm.azurewebsites.net/api";

export const trainingPlanService = {
  getAllTrainingPlans: async () => {
    const role = sessionStorage.getItem("role");
    let endpoint = role === "Trainee" ? "TrainingPlan/joined" : "TrainingPlan";
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },

  getTrainingPlanById: async (id) => {
    try {
      const response = await axiosInstance.get(
        `${API.GET_TRAINING_PLAN_BY_ID}/${id}`
      );
      // Kiểm tra và xử lý response
      if (response.data && response.data.plan) {
        const plan = response.data.plan;

        // Lấy thông tin chi tiết của subjects
        if (plan.subjects && plan.subjects.length > 0) {
          const subjectPromises = plan.subjects.map(async (subject) => {
            try {
              const subjectResponse = await axiosInstance.get(
                `${API.GET_SUBJECT_BY_ID}/${subject.subjectId}`
              );
              return subjectResponse.data.subject;
            } catch (error) {
              console.error(
                `Error fetching subject ${subject.subjectId}:`,
                error
              );
              return subject;
            }
          });

          const subjectDetails = await Promise.all(subjectPromises);
          plan.subjects = subjectDetails;
        }

        // Lấy thông tin chi tiết của training schedules
        if (plan.trainingSchedules && plan.trainingSchedules.length > 0) {
          const schedulePromises = plan.trainingSchedules.map(
            async (schedule) => {
              try {
                const scheduleResponse = await axiosInstance.get(
                  `${API.GET_TRAINING_SCHEDULE_BY_ID}/${schedule.scheduleId}`
                );
                return scheduleResponse.data.schedule;
              } catch (error) {
                console.error(
                  `Error fetching schedule ${schedule.scheduleId}:`,
                  error
                );
                return schedule;
              }
            }
          );

          const scheduleDetails = await Promise.all(schedulePromises);
          plan.trainingSchedules = scheduleDetails;
        }

        return response.data;
      }
      throw new Error("Invalid response format");
    } catch (error) {
      console.error("Error in getTrainingPlanById:", error);
      throw error;
    }
  },

  createTrainingPlan: async (trainingPlanData) => {
    try {
      console.log("Creating training plan with data:", trainingPlanData);
      const response = await axiosInstance.post(
        API.CREATE_TRAINING_PLAN,
        trainingPlanData
      );
      console.log("Create training plan response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating training plan:", error);
      throw error;
    }
  },

  updateTrainingPlan: async (id, trainingPlanData) => {
    try {
      console.log(
        "Updating training plan with ID:",
        id,
        "Data:",
        trainingPlanData
      );
      const response = await axiosInstance.put(
        `${API.UPDATE_TRAINING_PLAN}/${id}`,
        trainingPlanData
      );
      console.log("Update training plan response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating training plan:", error);
      throw error;
    }
  },

  deleteTrainingPlan: async (planId) => {
    const response = await axiosInstance.delete(
      `${API.DELETE_TRAINING_PLAN}/${planId}`
    );
    return response.data;
  },

  createRequest: async (planId, description, notes, requestType) => {
    try {
      console.log("Creating request for plan ID:", planId);
      const requestData = {
        planId: planId,
        description: description,
        notes: notes || "",
        requestType: requestType,
      };
      console.log("Request data:", requestData);

      const response = await axiosInstance.post(
        API.CREATE_REQUEST,
        requestData
      );
      console.log("Create request response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating request:", error);
      throw error;
    }
  },

  getTrainingPlanDetails: async (id) => {
    try {
      const response = await axiosInstance.get(
        `${API.GET_TRAINING_PLAN_BY_ID}/${id}`
      );

      if (response.status === 200 && response.data) {
        // Lấy thêm thông tin chi tiết về courses và subjects
        const plan = response.data.plan;

        // Nếu có courses, lấy thông tin chi tiết của từng course
        if (plan.courses && plan.courses.length > 0) {
          const coursePromises = plan.courses.map(async (course) => {
            const courseResponse = await axiosInstance.get(
              `${API.GET_COURSE_BY_ID}/${course.courseId}`
            );
            return courseResponse.data;
          });

          const courseDetails = await Promise.all(coursePromises);
          plan.courseDetails = courseDetails;
        }

        // Nếu có subjects, lấy thông tin chi tiết của từng subject
        if (plan.subjects && plan.subjects.length > 0) {
          const subjectPromises = plan.subjects.map(async (subject) => {
            const subjectResponse = await axiosInstance.get(
              `${API.GET_SUBJECT_BY_ID}/${subject.subjectId}`
            );
            return subjectResponse.data;
          });

          const subjectDetails = await Promise.all(subjectPromises);
          plan.subjectDetails = subjectDetails;
        }

        // Nếu có training schedules, lấy thông tin chi tiết
        if (plan.trainingSchedules && plan.trainingSchedules.length > 0) {
          const schedulePromises = plan.trainingSchedules.map(
            async (schedule) => {
              const scheduleResponse = await axiosInstance.get(
                `${API.GET_TRAINING_SCHEDULE_BY_ID}/${schedule.scheduleId}`
              );
              return scheduleResponse.data;
            }
          );

          const scheduleDetails = await Promise.all(schedulePromises);
          plan.scheduleDetails = scheduleDetails;
        }

        return {
          message: "Training plan details retrieved successfully",
          plan: plan,
        };
      }

      throw new Error("Failed to get training plan details");
    } catch (error) {
      console.error("Error in getTrainingPlanDetails:", error);
      throw error;
    }
  },
};
