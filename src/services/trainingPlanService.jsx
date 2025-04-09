import axiosInstance from "../../utils/axiosInstance";
import { API } from "../../api/apiUrl";

export const trainingPlanService = {
  getAllTrainingPlans: async () => {
    const response = await axiosInstance.get(API.GET_ALL_TRAINING_PLANS);
    return response.data;
  },

  
  getTrainingPlanById: async (id) => {
    console.log("Getting training plan with ID:", id);
    try {
      const response = await axiosInstance.get(`${API.GET_TRAINING_PLAN_BY_ID}/${id}`);
      console.log("API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("API error:", error);
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


  deleteTrainingPlan: async (id) => {
    const response = await axiosInstance.delete(
      `${API.DELETE_TRAINING_PLAN}/${id}`
    );
    return response.data;
  },

  createRequest: async (planId, description, notes) => {
    try {
      const requestData = {
        requestType: 0,
        requestEntityId: planId,
        description: description || "",
        notes: notes || ""
      };
      console.log("Creating request with data:", requestData);
      
      const response = await axiosInstance.post(
        API.GET_ALL_REQUEST,
        requestData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating request:", error);
      throw error;
    }
  }
};
