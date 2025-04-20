import axiosInstance from "../../utils/axiosInstance";

export const exportExpiredCertificates = async () => {
  try {
    const response = await axiosInstance.get('/Report/export-expired-certificates', {
      responseType: 'blob' // Quan trọng: để nhận response dạng file
    });

    // Lấy tên file từ header Content-Disposition nếu có
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'expired-certificates.xlsx';
    
    if (contentDisposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    // Tạo Blob từ response data
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] 
    });

    // Tạo URL cho blob và tải xuống
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Dọn dẹp
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

    return true;
  } catch (error) {
    console.error("Error exporting expired certificates:", error);
    throw error;
  }
};

export const exportCertificate = async () => {
  try {
    const response = await axiosInstance.get('/Report/export-expired-certificates', {
      responseType: 'blob'
    });

    // Lấy tên file từ header Content-Disposition nếu có
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'certificates.xlsx';
    
    if (contentDisposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    // Tạo Blob từ response data
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] 
    });

    // Tạo URL cho blob và tải xuống
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Dọn dẹp
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

    return true;
  } catch (error) {
    console.error("Error exporting certificates:", error);
    throw error;
  }
}; 