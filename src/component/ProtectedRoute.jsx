import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../context/useAuth";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, verifyAccountStatus } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  
  useEffect(() => {
    const verifyStatus = async () => {
      try {
        if (isAuthenticated) {
          await verifyAccountStatus();
        }
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyStatus();
  }, [isAuthenticated, verifyAccountStatus]);
  
  if (isVerifying) {
    // Hiển thị trang loading hoặc để trống nếu đang kiểm tra
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

ProtectedRoute.propTypes = {
  element: PropTypes.node.isRequired,
};

export default ProtectedRoute;
