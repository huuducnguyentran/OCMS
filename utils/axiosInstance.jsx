// utils/axiosInstance.js
import axios from "axios";
import { BASE_URL } from "./environment";
import { API } from "../api/apiUrl";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token automatically to each request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Variable to track if status check request is in progress
let isCheckingStatus = false;
// Create separate axios instance for checking user status to avoid recursion
const statusCheckInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to status check requests
statusCheckInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Store the original navigation function - will be set from AuthContext
let navigateToLogin = null;
let messageApi = null;

export const setNavigateFunction = (navigateFn) => {
  navigateToLogin = navigateFn;
};

export const setMessageApi = (api) => {
  messageApi = api;
};

// Check if user is authenticated, can be used in any component
export const requireAuth = (navigate, message) => {
  const token = sessionStorage.getItem("token");
  
  if (!token) {
    if (message) {
      message.error("Please login to continue");
    } else if (messageApi) {
      messageApi.error("Please login to continue");
    }
    
    if (navigate) {
      navigate("/login");
    } else if (navigateToLogin) {
      navigateToLogin("/login");
    } else {
      window.location.href = "/login";
    }
    return false;
  }
  
  return true;
};

// Higher-order component to protect routes
export const withAuth = (WrappedComponent) => {
  return (props) => {
    const token = sessionStorage.getItem("token");
    
    // If no token, redirect to login page
    if (!token) {
      if (messageApi) {
        messageApi.error("Please login to continue");
      }
      
      if (navigateToLogin) {
        navigateToLogin("/login");
        return null;
      } else {
        window.location.href = "/login";
        return null;
      }
    }
    
    // If token exists, render the component
    return <WrappedComponent {...props} />;
  };
};

// Check user account status
export const checkAccountStatus = async () => {
  if (isCheckingStatus) return true;
  
  try {
    isCheckingStatus = true;
    const token = sessionStorage.getItem("token");
    if (!token) return false;
    
    const response = await statusCheckInstance.get("/User/profile");
    const userData = response.data.user;
    
    // Kiểm tra trạng thái tài khoản
    if (userData.accountStatus === "Deactivated") {
      // Xóa dữ liệu phiên khi tài khoản bị vô hiệu hóa
      sessionStorage.clear();
      
      // Chuyển hướng về trang đăng nhập với thông báo
      if (navigateToLogin) {
        navigateToLogin("/login", {
          state: { 
            message: "Your account has been deactivated. Please contact the administrator for more information.",
            type: "error" 
          }
        });
      }
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error checking account status:", error);
    // Xử lý khi không thể kết nối đến API
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      sessionStorage.clear();
      if (navigateToLogin) {
        navigateToLogin("/login");
      }
    }
    return false;
  } finally {
    isCheckingStatus = false;
  }
};

// Add response interceptor to check account status
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Skip status check for login-related endpoints or when already checking status
    if (
      error.config.url?.includes("login") || 
      error.config.url?.includes("reset-password") || 
      error.config.url?.includes("forgot-password") ||
      isCheckingStatus
    ) {
      return Promise.reject(error);
    }
    
    // If 401 status (unauthorized), let the existing logout mechanism handle it
    if (error.response?.status === 401) {
      // Clear session and redirect to login
      sessionStorage.clear();
      if (navigateToLogin) {
        navigateToLogin("/login", {
          state: { 
            message: "Your session has expired. Please login again.",
            type: "error" 
          }
        });
      } else {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // For other errors, check account status
    await checkAccountStatus();
    return Promise.reject(error);
  }
);

export default axiosInstance;
