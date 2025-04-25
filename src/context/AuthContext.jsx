// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";

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

  const checkAuth = () => {
    const token = sessionStorage.getItem("token");
    const tokenExpiry = sessionStorage.getItem("tokenExpiry");
    const userData = sessionStorage.getItem("user");

    if (token && tokenExpiry) {
      const expiryTime = Number(tokenExpiry);
      if (Date.now() < expiryTime) {
        setIsAuthenticated(true);
        setUser(userData ? JSON.parse(userData) : null);
        setAutoLogout(expiryTime - Date.now());
      } else {
        logout();
      }
    } else {
      logout();
    }
  };

  const logout = () => {
    sessionStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    //  Do not navigate to /login if already on a public route
    if (!isPublicRoute(location.pathname)) {
      navigate("/login");
    }
  };

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

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, user, setUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
