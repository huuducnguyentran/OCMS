// src/pages/LoginPage.jsx
import { Input, Button, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authServices } from "../../services/authServices";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await authServices.loginUser({ username, password });

      const { token, userID, roles } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userID", userID);
      localStorage.setItem("role", roles?.[0] || "user");
      localStorage.setItem("tokenExpiry", Date.now() + 60 * 60 * 1000); // 1hr

      message.success("Login successful!");
      navigate("/");
    } catch {
      message.error("Invalid username or password.");
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-4xl bg-gray-800 flex rounded-lg shadow-lg overflow-hidden h-[80vh]">
        {/* Left Side - Login Form */}
        <div className="w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-white text-3xl font-semibold mb-6">Login</h2>
          <Input
            className="mb-5 p-3"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input.Password
            className="mt-2 p-3"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-right text-white text-sm mb-4">
            <a href="/forgot-password">Forgot password?</a>
          </div>
          <Button type="primary" className="w-full py-2" onClick={handleLogin}>
            Login
          </Button>
          <div className="text-white text-sm mt-4 text-center">
            Don&apos;t have an account?{" "}
            <a href="/register" className="font-bold">
              Create one
            </a>
          </div>
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
      </div>
    </div>
  );
};

export default LoginPage;
