// src/services/certificateService.js

import { API } from "../../api/apiUrl";
import axiosInstance from "../../utils/axiosInstance";

export const importCertificate = async (formData) => {
  try {
    const response = await axiosInstance.post(
      `/${API.IMPORT_CERTIFICATE_TEMPLATE}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error importing trainee:", error);
    throw error;
  }
};

export const fetchCertificateTemplates = async () => {
  try {
    const response = await axiosInstance.get(
      `/${API.GET_ALL_CERTIFICATE_TEMPLATE}`,
      {
        headers: {
          Accept: "text/plain",
        },
      }
    );
    return response.data.templates;
  } catch (error) {
    console.error("Error fetching certificate templates:", error);
    throw error;
  }
};

export const fetchCertificateTemplatebyId = async (id) => {
  try {
    const response = await axiosInstance.get(
      `/${API.GET_CERTIFICATE_TEMPLATE_BY_ID}/${id}/`,
      {
        headers: {
          Accept: "text/plain",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching certificate templates:", error);
    throw error;
  }
};

export const updateCertificateTemplate = async (templateId, formData) => {
  try {
    const response = await axiosInstance.put(
      `/${API.UPDATE_CERTIFICATE_TEMPLATE}/${templateId}/`,
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

export const deleteCertificateTemplate = async (templateId) => {
  try {
    const response = await axiosInstance.delete(
      `/${API.UPDATE_CERTIFICATE_TEMPLATE}/${templateId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error updating certificate templates:", error);
    throw error;
  }
};
