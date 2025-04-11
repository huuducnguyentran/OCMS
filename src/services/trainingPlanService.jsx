import axios from "axios";
import { API } from "../../api/apiUrl";
import axiosInstance from "../../utils/axiosInstance";

// API Base URL
const API_BASE_URL = 'https://ocms-vjvm.azurewebsites.net/api';

export const trainingPlanService = {
  getAllTrainingPlans: async () => {
    try {
      const role = localStorage.getItem("role");
      let endpoint = role === "Trainee" ? "TrainingPlan/joined" : "TrainingPlan";
      console.log("Fetching all training plans with endpoint:", endpoint);
      
      const response = await axiosInstance.get(endpoint);
      console.log("All training plans response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching all training plans:", error);
      throw error;
    }
  },

  getTrainingPlanById: async (planId) => {
    try {
      if (!planId) {
        throw new Error("Plan ID is required");
      }
      
      console.log("Fetching training plan with ID:", planId);
      const token = localStorage.getItem("token");
      
      // Kiểm tra token
      if (!token) {
        console.warn("No token found in localStorage");
      }
      
      // Sử dụng axiosInstance thay vì axios trực tiếp để tận dụng interceptors
      console.log("Calling API using axiosInstance");
      const response = await axiosInstance.get(`${API.GET_TRAINING_PLAN_BY_ID}/${planId}`);
      
      console.log("Training plan details response:", response.data);
      return response.data;
    } catch (error) {
      // Log chi tiết lỗi
      console.error("Error fetching training plan by ID:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      
      if (error.response) {
        // Lỗi từ server với mã trạng thái
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
      } else if (error.request) {
        // Yêu cầu được gửi nhưng không nhận được phản hồi
        console.error("Error request:", error.request);
      }
      
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
      console.log("Updating training plan with ID:", id, "Data:", trainingPlanData);
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
    try {
      console.log("Deleting training plan with ID:", planId);
      const response = await axiosInstance.delete(
        `${API.DELETE_TRAINING_PLAN}/${planId}`
      );
      console.log("Delete training plan response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error deleting training plan:", error);
      throw error;
    }
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
      
      const response = await axiosInstance.post(API.CREATE_REQUEST, requestData);
      console.log("Create request response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating request:", error);
      throw error;
    }
  },
};
