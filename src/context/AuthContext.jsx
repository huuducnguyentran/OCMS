// src/component/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

const AuthProvider = ({ children }) => {
  const token = localStorage.getItem("token");
  const tokenExpiry = localStorage.getItem("tokenExpiry");

  const isTokenExpired = !tokenExpiry || Date.now() > Number(tokenExpiry);

  if (!token || isTokenExpired) {
    localStorage.clear(); // Clear expired session
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ✅ Add PropTypes validation
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
