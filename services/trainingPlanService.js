export const trainingPlanService = {
  // ... existing methods ...

  // Get training plan by ID
  getTrainingPlanById: async (id) => {
    const response = await axiosInstance.get(`${API.GET_TRAINING_PLAN_BY_ID}/${id}`);
    return response.data;
  },

  // Update training plan
  updateTrainingPlan: async (id, data) => {
    const response = await axiosInstance.put(`${API.UPDATE_TRAINING_PLAN}/${id}`, data);
    return response.data;
  },

  // Delete training plan
  deleteTrainingPlan: async (id) => {
    const response = await axiosInstance.delete(
      `${API.DELETE_TRAINING_PLAN}/${id}`
    );
    return response.data;
  },
};
