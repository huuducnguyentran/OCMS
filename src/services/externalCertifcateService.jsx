//src/services/CerrtificateService.jsx
import axiosInstance from "../../utils/axiosInstance";
import { API } from "../../api/apiUrl";

export const getExternalCertificatesByCandidateId = async (id) => {
  try {
    const token = sessionStorage.getItem("token");

    const response = await axiosInstance.get(
      `/${API.GET_EXTERNAL_CERTIFICATE_BY_ID}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw error;
  }
};

export const createExternalCertificate = (candidateId, formData) => {
  const token = sessionStorage.getItem("token");

  return axiosInstance.post(
    `/${API.CREATE_EXTERNAL_CERTIFICATE}/${candidateId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
