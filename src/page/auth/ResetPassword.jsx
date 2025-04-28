// src/pages/ResetPassword.jsx
import { Input, Button, message, Form } from "antd";
import { useState, useEffect } from "react";
import { resetPassword } from "../../services/authServices";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeftOutlined,
  LockOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
// import * as THREE from 'three'; // Tạm thời vô hiệu hóa Three.js

const ResetPassword = () => {
  // Get token from URL path params instead of query params
  const { token } = useParams();
  const location = useLocation();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const navigate = useNavigate();

  // Check for token
  useEffect(() => {
    if (!token) {
      setTokenError(true);
      message.warning(
        "No reset token found. You can request a new password reset link."
      );
    }
  }, [token]);

  // Check password confirmation
  useEffect(() => {
    if (confirmPassword === "") {
      setPasswordMatch(null);
    } else if (newPassword === confirmPassword) {
      setPasswordMatch(true);
    } else {
      setPasswordMatch(false);
    }
  }, [newPassword, confirmPassword]);

  const handleReset = async () => {
    if (tokenError || !token) {
      message.error(
        "No valid reset token found. Please request a new password reset."
      );
      return;
    }

    if (!newPassword) {
      message.error("Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      message.error("Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);
    try {
      // Use token from URL path
      const responseMessage = await resetPassword(token, newPassword);

      message.success(
        responseMessage || "Password has been reset successfully!"
      );
      navigate("/login");
    } catch (error) {
      console.error("Reset password error:", error);
      message.error(
        typeof error === "string"
          ? error
          : "Failed to reset password. Please try again with a valid token."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Static gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900" />

      {/* 3D Animation Container */}
      <div id="animation-container" className="absolute inset-0" />

      {/* Back Button */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/login")}
        className="absolute top-4 left-4 text-blue-300 hover:text-blue-200 z-20"
      >
        Back to Login
      </Button>

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Left Side - Reset Password Form */}
              <div className="w-full md:w-1/2 p-8 bg-white/5">
                <div className="text-white mb-8">
                  <h2 className="text-3xl font-bold mb-2">Reset Password</h2>
                  <p className="text-blue-200/80">Enter your new password</p>
                </div>

                {tokenError || !token ? (
                  <div className="text-red-400 bg-red-900/20 p-4 rounded-lg mb-6">
                    <p>
                      No valid reset token found. Please request a new password
                      reset from the Forgot Password page.
                    </p>
                    <Button
                      type="primary"
                      onClick={() => navigate("/forgot-password")}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 border-0"
                    >
                      Go to Forgot Password
                    </Button>
                  </div>
                ) : (
                  <Form className="space-y-6">
                    <Form.Item>
                      <Input.Password
                        prefix={<LockOutlined className="text-gray-400" />}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-12 bg-white/10 border-gray-500/30 text-white rounded-lg"
                        autoComplete="new-password"
                      />
                    </Form.Item>

                    <Form.Item>
                      <div className="relative">
                        <Input.Password
                          prefix={<LockOutlined className="text-gray-400" />}
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`h-12 bg-white/10 text-white rounded-lg ${
                            passwordMatch === false
                              ? "border-red-500"
                              : passwordMatch === true
                              ? "border-green-500"
                              : "border-gray-500/30"
                          }`}
                          autoComplete="new-password"
                        />
                        {passwordMatch !== null && (
                          <span className="absolute right-3 top-3">
                            {passwordMatch ? (
                              <CheckCircleFilled className="text-green-500 text-lg" />
                            ) : (
                              <CloseCircleFilled className="text-red-500 text-lg" />
                            )}
                          </span>
                        )}
                      </div>
                      {passwordMatch === false && (
                        <div className="text-red-500 text-sm mt-1">
                          Passwords do not match
                        </div>
                      )}
                    </Form.Item>

                    <Button
                      type="primary"
                      loading={loading}
                      onClick={handleReset}
                      disabled={!newPassword || passwordMatch !== true}
                      className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 border-0 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                    >
                      Reset Password
                    </Button>
                  </Form>
                )}
              </div>

              {/* Right Side - Branding */}
              <div className="w-full md:w-1/2 p-8 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 backdrop-blur-lg">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
                      OCMS
                    </span>
                  </h1>
                  <p className="text-blue-200/80 text-lg mb-8">
                    Online Certificate Management System
                  </p>
                  <div className="space-y-4">
                    <div className="text-gray-300 bg-white/5 p-6 rounded-lg">
                      <p className="text-sm opacity-80 leading-relaxed">
                        Set a new password to secure your account. Make sure to
                        choose a strong and secure password.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
