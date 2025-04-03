// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Skip authentication for certain routes
  const publicRoutes = ["/forgot-password", "/reset-password", "/login"];

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("token");
    const tokenExpiry = localStorage.getItem("tokenExpiry");
    return token && tokenExpiry && Date.now() < Number(tokenExpiry);
  });

  // Function to check authentication
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    if (token && tokenExpiry) {
      const expiryTime = Number(tokenExpiry);
      if (Date.now() < expiryTime) {
        setIsAuthenticated(true);
        setAutoLogout(expiryTime - Date.now()); // Set automatic logout timer
      } else {
        logout();
      }
    } else {
      logout();
    }
  };

  // Automatically logout when the token expires
  const setAutoLogout = (timeLeft) => {
    setTimeout(() => {
      logout();
    }, timeLeft);
  };

  useEffect(() => {
    if (!publicRoutes.includes(location.pathname)) {
      checkAuth(); // Initial authentication check for protected routes
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && !publicRoutes.includes(location.pathname)) {
        checkAuth();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [location.pathname]); // Run on location change

  // Logout function
  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    navigate("/login"); // Redirect to login after logout
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
