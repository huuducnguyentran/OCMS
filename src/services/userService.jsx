import axiosInstance from "../../utils/axiosInstance";
import { API } from "../../api/apiUrl";

export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get(`/${API.GET_ALL_USER}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching requests:", error?.response || error.message);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/${API.GET_USER_BY_ID}/${id}`);
    return response.data.user;
  } catch (error) {
    console.error("Error fetching requests:", error?.response || error.message);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get(`/${API.GET_USER_PROiLE}`);
    return response.data.user;
  } catch (error) {
    console.error("Error fetching requests:", error?.response || error.message);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await axiosInstance.put(
      `/${API.UPDATE_USER}/${id}/details`,
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching requests:", error?.response || error.message);
    throw error;
  }
};

export const updateAvatar = async (formData) => {
  try {
    const response = await axiosInstance.put(
      `${API.UPDATE_USER_AVATAR}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updatePassword = async (id, password) => {
  try {
    const response = await axiosInstance.put(
      `/${API.UPDATE_PASSWORD}/${id}/password`,
      password
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching requests:", error?.response || error.message);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post(`/${API.CREATE_USER}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error?.response || error.message);
    throw error;
  }
};

export const getAllSpecialties = async () => {
  try {
    const response = await axiosInstance.get(`/${API.GET_ALL_SPECIALTY}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching specialties:", error?.response || error.message);
    throw error;
  }
};

export const updateUserDetails = async (userId, userData) => {
  try {
    const response = await axiosInstance.put(`/api/User/${userId}/details`, userData);
    return response.data;
  } catch (error) {
    console.error("Failed to update user details:", error);
    throw error.response?.data || error.message || "Failed to update user details";
  }
};

export const exportTraineeInfo = async (traineeId) => {
  try {
    // Thiết lập responseType là 'blob' để nhận dữ liệu nhị phân
    const response = await axiosInstance.get(`/Report/export-trainee-info/${traineeId}`, {
      responseType: 'blob'
    });
    
    // Lấy tên file từ header Content-Disposition nếu có
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'TraineeInfo.xlsx';
    
    if (contentDisposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }
    
    // Tạo URL từ blob
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] 
    });
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Tạo link và kích hoạt download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Dọn dẹp
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
    
    return true;
  } catch (error) {
    console.error("Error exporting trainee info:", error);
    throw error;
  }
};
