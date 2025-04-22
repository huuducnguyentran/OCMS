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
      `/${API.GET_CERTIFICATE_TEMPLATE_BY_ID}/${id}`,
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

export const getPendingCertificate = async () => {
  const response = await axiosInstance.get(`${API.GET_PENDING_CERTIFICATE}`);
  return response.data;
};

export const getActiveCertificate = async () => {
  const response = await axiosInstance.get(`${API.GET_ACTIVE_CERTIFICATE}`);
  return response.data;
};

export const getRevokedCertificate = async () => {
  const response = await axiosInstance.get(`${API.GET_REVOKED_CERTIFICATE}`);
  return response.data;
};

export const getCertificateById = async (certificateId) => {
  const response = await axiosInstance.get(
    `${API.GET_CERTIFICATE_BY_ID}/${certificateId}`
  );
  return response.data;
};

export const getTraineeCertificateByOtherId = async (userId) => {
  const response = await axiosInstance.get(
    `${API.GET_TRAINEE_CERTIFICATE}/${userId}`
  );
  return response.data;
};

export const getTraineeCertificateById = async () => {
  const response = await axiosInstance.get(
    `${API.GET_TRAINEE_CERTIFICATE}/view`
  );
  return response.data;
};

export const signCertificate = async (certificateId) => {
  const response = await axiosInstance.post(
    `${API.SIGN_DIGITAL_SIGNATURE}/${certificateId}`
  );
  return response.data;
};

export const revokeCertificate = async (
  certificateId,
  revokeReason = "No longer valid"
) => {
  const response = await axiosInstance.post(
    `${API.REVOKE_CERTIFICATE}/${certificateId}`,
    { revokeReason }, // sending required body
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
