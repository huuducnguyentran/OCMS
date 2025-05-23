// src/pages/ResetPassword.jsx
import { Input, Button, message, Form } from "antd";
import { useState, useEffect } from "react";
import { resetPassword } from "../../services/authServices";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftOutlined,
  LockOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setTokenError(true);
      message.warning("No reset token found. You can request a new link.");
    }
  }, [token]);

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
      message.error("Invalid or missing reset token.");
      return;
    }
    if (!newPassword) {
      message.error("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      message.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const responseMessage = await resetPassword(token, newPassword);
      message.success(responseMessage || "Password reset successfully!");
      navigate("/login");
    } catch (error) {
      message.error(
        typeof error === "string"
          ? error
          : "Failed to reset password. Try again with a valid token."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Cyan Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950 via-cyan-800 to-cyan-600" />

      {/* Placeholder for animation container */}
      <div id="animation-container" className="absolute inset-0" />

      {/* Back Button */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/login")}
        className="absolute top-4 left-4 !text-cyan-200 hover:!text-cyan-100 z-20"
      >
        Back to Login
      </Button>

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Left - Form */}
              <div className="w-full md:w-1/2 p-8 bg-white/5">
                <div className="text-white mb-8">
                  <h2 className="text-3xl font-bold mb-2">Reset Password</h2>
                  <p className="text-cyan-200/80">Enter your new password</p>
                </div>

                {tokenError || !token ? (
                  <div className="text-red-400 bg-red-900/20 p-4 rounded-lg mb-6">
                    <p>No valid reset token found.</p>
                    <Button
                      type="primary"
                      onClick={() => navigate("/forgot-password")}
                      className="mt-4 !bg-cyan-600 hover:!bg-cyan-700 !border-0"
                    >
                      Go to Forgot Password
                    </Button>
                  </div>
                ) : (
                  <Form className="space-y-6">
                    <Form.Item>
                      <Input.Password
                        prefix={<LockOutlined className="!text-gray-400" />}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-12 !bg-white/10 !border-gray-500/30 !text-white rounded-lg"
                        autoComplete="new-password"
                      />
                    </Form.Item>

                    <Form.Item>
                      <div className="relative">
                        <Input.Password
                          prefix={<LockOutlined className="!text-gray-400" />}
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`h-12 !bg-white/10 !text-white rounded-lg ${
                            passwordMatch === false
                              ? "!border-red-500"
                              : passwordMatch === true
                              ? "!border-green-500"
                              : "!border-gray-500/30"
                          }`}
                          autoComplete="new-password"
                        />
                        {passwordMatch !== null && (
                          <span className="absolute right-3 top-3">
                            {passwordMatch ? (
                              <CheckCircleFilled className="!text-green-500 text-lg" />
                            ) : (
                              <CloseCircleFilled className="!text-red-500 text-lg" />
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
                      className="w-full h-12 text-lg font-medium !bg-gradient-to-r from-cyan-600 to-cyan-700 border-0 rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all duration-300"
                    >
                      Reset Password
                    </Button>
                  </Form>
                )}
              </div>

              {/* Right - Branding */}
              <div className="w-full md:w-1/2 p-8 bg-gradient-to-br from-cyan-900/30 to-cyan-800/30 backdrop-blur-lg">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-cyan-100">
                      OCMS
                    </span>
                  </h1>
                  <p className="text-cyan-200/80 text-lg mb-8">
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
