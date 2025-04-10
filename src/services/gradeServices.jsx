import axiosInstance from "../../utils/axiosInstance";
import { API } from "../../api/apiUrl";

export const gradeServices = {
  importGrades: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await axiosInstance.post(API.IMPORT_GRADE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getAllGrades: async () => {
    const response = await axiosInstance.get(API.GET_ALL_GRADES);
    return response.data;
  },

   getAllUsers: async () => {
    const response = await axiosInstance.get(API.GET_ALL_USER);
    return response.data;
  },
};
