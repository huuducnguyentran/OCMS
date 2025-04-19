import { API } from "../../api/apiUrl";
import axiosInstance from "../../utils/axiosInstance";

export const importDecisionTemplate = async (formData) => {
  try {
    const response = await axiosInstance.post(
      `/${API.IMPORT_DECISION_TEMPLATE}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error importing templates:", error);
    throw error;
  }
};

export const fetchDecisionTemplates = async () => {
  try {
    const response = await axiosInstance.get(
      `/${API.GET_ALL_DECISION_TEMPLATE}`,
      {
        headers: {
          Accept: "text/plain",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching decision templates:", error);
    throw error;
  }
};

export const fetchDecisionTemplatebyId = async (id) => {
  try {
    const response = await axiosInstance.get(
      `/${API.GET_DECISION_TEMPLATE_BY_ID}/${id}`,
      {
        headers: {
          Accept: "application/json", // or remove this line
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching decision template by ID:", error);
    throw error;
  }
};

export const updateDecisionTemplate = async (templateId, formData) => {
  try {
    const response = await axiosInstance.put(
      `/${API.UPDATE_DECISION_TEMPLATE}/${templateId}/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating certificate templates:", error);
    throw error;
  }
};

export const deleteDecisionTemplate = async (templateId) => {
  try {
    const response = await axiosInstance.delete(
      `/${API.DELETE_DECISION_TEMPLATE}/${templateId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error updating certificate templates:", error);
    throw error;
  }
};
