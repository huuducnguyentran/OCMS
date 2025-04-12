import axiosInstance from "../../utils/axiosInstance";
import { API } from "../../api/apiUrl";

export const trainingPlanService = {
  getAllTrainingPlans: async () => {
    const role = localStorage.getItem("role");
    let endpoint = role === "Trainee" ? "TrainingPlan/joined" : "TrainingPlan";
    const response = await axiosInstance.get(endpoint);
    return response.data;
  },

  
getTrainingPlanById: async (id) => {
    try {
      const response = await axiosInstance.get(`${API.GET_TRAINING_PLAN_BY_ID}/${id}`);
      // Kiểm tra và xử lý response
      if (response.status === 200 && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('Error in getTrainingPlanById:', error);
      throw error;
    }
  },


  createTrainingPlan: async (trainingPlanData) => {
    const response = await axiosInstance.post(
      API.CREATE_TRAINING_PLAN,
      trainingPlanData
    );
    return response.data;
  },


  updateTrainingPlan: async (id, trainingPlanData) => {
    const response = await axiosInstance.put(
      `${API.UPDATE_TRAINING_PLAN}/${id}`,
      trainingPlanData
    );
    return response.data;
  },

  deleteTrainingPlan: async (planId) => {
    const response = await axiosInstance.delete(
      `${API.DELETE_TRAINING_PLAN}/${planId}`
    );
    return response.data;
  },

  createRequest: async (planId, description, notes, requestType) => {
    try {
      const response = await axiosInstance.post(API.CREATE_REQUEST, {
        planId: planId,
        description: description,
        notes: notes || "",
        requestType: requestType
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
