import { API } from "../../api/apiUrl";
import axiosInstance from "../../utils/axiosInstance";

export const assignTrainee = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");

    const response = await axiosInstance.post(
      `/${API.ASSIGN_TRAINEE}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error importing trainee:", error);
    throw error;
  }
};

export const getAllAssignedTrainee = async () => {
  try {
    const response = await axiosInstance.get(
      `/${API.GET_ALL_ASSIGNED_TRAINEE}`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching assigned trainee:", error);
    throw error;
  }
};
