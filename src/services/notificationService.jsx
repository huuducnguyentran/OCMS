import axiosInstance from "../../utils/axiosInstance";

export const notificationService = {
  getUnreadCount: async (userId) => {
    try {
      const response = await axiosInstance.get(`notifications/unread-count/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
      throw error;
    }
  },
  
  getNotificationsByUserId: async (userId) => {
    try {
      const response = await axiosInstance.get(`notifications/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },
  
  markAsRead: async (notificationId) => {
    try {
      const response = await axiosInstance.post(`notifications/mark-as-read/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }
};

export default notificationService;
