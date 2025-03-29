// src/pages/ForgotPasswordPage.jsx
import { Input, Button, message, Layout } from "antd";
import { useState } from "react";
import { resetPassword } from "../../services/authServices";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async () => {
    if (!newPassword) {
      message.error("Please enter a new password.");
      return;
    }

    setLoading(true);
    try {
      const responseMessage = await resetPassword(token, newPassword);
      message.success(responseMessage);
      navigate("/login");
    } catch (errorMessage) {
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="w-screen h-screen flex items-center justify-center !bg-gray-900">
      <Layout.Content className="w-full max-w-4xl bg-gray-800 flex  shadow-lg h-[80vh]">
        {/* Left Side - Forgot Password Form */}
        <div className="w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-white text-3xl font-semibold mb-6">
            Forgot Password
          </h2>
          <Input
            className="mb-5 p-3"
            placeholder="Enter token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <Input
            className="mb-5 p-3"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button
            type="primary"
            className="w-full py-2"
            loading={loading}
            onClick={handleReset}
          >
            Send Reset Link
          </Button>
        </div>

        {/* Right Side - Branding */}
        <div className="w-1/2 bg-gray-700 flex flex-col items-center justify-center p-8">
          <h1 className="text-4xl font-bold text-white">
            <span className="text-red-500">F</span>
            <span className="text-green-500">l</span>
            <span className="text-blue-500">i</span>
            <span className="text-yellow-500">g</span>
            <span className="text-white">ht</span>
            <span className="text-white font-bold">Vault</span>
          </h1>
          <p className="text-gray-300 mt-2 italic text-lg">
            Choose your paths to the sky
          </p>
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default ResetPassword;
