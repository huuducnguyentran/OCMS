// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance, { setNavigateFunction, checkAccountStatus } from "../../utils/axiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPublicRoute = (pathname) => {
    const publicPaths = ["/forgot-password", "/login"];
    if (pathname.startsWith("/reset-password/")) {
      return true;
    }
    return publicPaths.includes(pathname);
  };

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = sessionStorage.getItem("token");
    const tokenExpiry = sessionStorage.getItem("tokenExpiry");
    return token && tokenExpiry && Date.now() < Number(tokenExpiry);
  });

  const [user, setUser] = useState(() => {
    const userData = sessionStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });

  // Đặt hàm navigate để sử dụng trong axiosInstance
  useEffect(() => {
    setNavigateFunction((path, options) => navigate(path, options));
  }, [navigate]);

  // Hàm kiểm tra trạng thái tài khoản được xuất ra để các component có thể sử dụng
  const verifyAccountStatus = useCallback(async () => {
    if (!isAuthenticated || isPublicRoute(location.pathname)) return true;
    return await checkAccountStatus();
  }, [isAuthenticated, location.pathname]);

  const checkAuth = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    const tokenExpiry = sessionStorage.getItem("tokenExpiry");
    const userData = sessionStorage.getItem("user");

    if (token && tokenExpiry) {
      const expiryTime = Number(tokenExpiry);
      if (Date.now() < expiryTime) {
        setIsAuthenticated(true);
        setUser(userData ? JSON.parse(userData) : null);
        setAutoLogout(expiryTime - Date.now());
        
        // Kiểm tra trạng thái tài khoản khi đăng nhập hoặc khôi phục phiên
        if (!isPublicRoute(location.pathname)) {
          await verifyAccountStatus();
        }
      } else {
        logout();
      }
    } else {
      logout();
    }
  }, [location.pathname, verifyAccountStatus]);

  const logout = useCallback(() => {
    sessionStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    //  Do not navigate to /login if already on a public route
    if (!isPublicRoute(location.pathname)) {
      navigate("/login");
    }
  }, [location.pathname, navigate]);

  const setAutoLogout = (timeLeft) => {
    setTimeout(() => {
      logout();
    }, timeLeft);
  };

  useEffect(() => {
    // Always check on mount
    checkAuth();

    const handleVisibilityChange = () => {
      if (!document.hidden && !isPublicRoute(location.pathname)) {
        checkAuth();
      }
    };

    // Định kỳ kiểm tra trạng thái tài khoản (30 giây một lần)
    const statusInterval = setInterval(() => {
      if (isAuthenticated && !isPublicRoute(location.pathname)) {
        verifyAccountStatus();
      }
    }, 30000);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(statusInterval);
    };
  }, [checkAuth, isAuthenticated, location.pathname, verifyAccountStatus]);

  return (
    <AuthContext.Provider
      value={{ 
        isAuthenticated, 
        setIsAuthenticated, 
        user, 
        setUser, 
        logout,
        verifyAccountStatus 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
