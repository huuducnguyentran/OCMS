// src/pages/ForgotPasswordPage.jsx
import { Input, Button, message, Layout } from "antd";
import { useState } from "react";
import { forgotPassword } from "../../services/authServices";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    if (!email) {
      message.error("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const responseMessage = await forgotPassword(email);
      message.success(responseMessage || "Password reset email sent!");
      navigate("/reset-password");
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
          {/* Breadcrumb positioned at top-left */}
          <div className="absolute top-4 left-4">
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              className="text-blue-400 hover:text-blue-600 px-0"
            >
              Back
            </Button>
          </div>
          <h2 className="text-white text-3xl font-semibold mb-6">
            Forgot Password
          </h2>
          <Input
            className="!mb-4 p-3"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="primary"
            className="w-full py-2"
            loading={loading}
            onClick={handleForgotPassword}
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

export default ForgotPassword;
