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
    const role = sessionStorage.getItem("role");
    const isInstructor = role === "Instructor";

    const response = await axiosInstance.get(
      isInstructor ? API.GET_INSTRUCTOR_GRADES : API.GET_ALL_GRADES
    );
    return response.data;
  },

  getGradeById: async (traineeAssignID) => {
    try {
      const response = await axiosInstance.get(
        `${API.GET_GRADE_BY_ID}/${traineeAssignID}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch grade";
    }
  },

  getTraineeGrades: async (userId) => {
    try {
      const response = await axiosInstance.get(
        `${API.GET_TRAINEE_GRADES}/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data);
      throw error.response?.data?.message || "Failed to fetch trainee grades";
    }
  },

  updateGrade: async (gradeId, gradeData) => {
    try {
      // Sử dụng gradeId trong URL và giữ nguyên payload
      const response = await axiosInstance.put(
        `${API.UPDATE_GRADE}/${gradeId}`,
        gradeData
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data);
      throw error.response?.data?.message || "Failed to update grade";
    }
  },

  getAllUsers: async () => {
    const response = await axiosInstance.get(API.GET_ALL_USER);
    return response.data;
  },

  deleteGrade: async (gradeId) => {
    try {
      const response = await axiosInstance.delete(
        `${API.DELETE_GRADE}/${gradeId}`
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data);
      throw error.response?.data?.message || "Failed to delete grade";
    }
  },
};
export const exportCourseResults = async () => {
  try {
    // Thiết lập responseType là 'blob' để nhận dữ liệu nhị phân
    const response = await axiosInstance.get(`/Report/export-course-result`, {
      responseType: "blob",
    });

    // Lấy tên file từ header Content-Disposition nếu có
    const contentDisposition = response.headers["content-disposition"];
    let filename = "CourseResults.xlsx";

    if (contentDisposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, "");
      }
    }

    // Tạo URL từ blob
    const blob = new Blob([response.data], {
      type: response.headers["content-type"],
    });
    const blobUrl = window.URL.createObjectURL(blob);

    // Tạo link và kích hoạt download
    const link = document.createElement("a");
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
