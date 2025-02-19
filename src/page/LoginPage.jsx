// src/pages/LoginPage.jsx
import { Input, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulate login (You can replace this with API login logic)
    navigate("/");
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl bg-gray-800 flex rounded-lg shadow-lg overflow-hidden h-[80vh]">
          {/* Left Side - Login Form */}
          <div className="w-1/2 p-8 flex flex-col justify-center">
            <h2 className="text-white text-3xl font-semibold mb-6">Login</h2>
            <Input className="mb-5 p-3" placeholder="Email" />
            <Input.Password className="mt-2 p-3" placeholder="Password" />
            <div className="text-right text-white text-sm mb-4">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <Button
              type="primary"
              className="w-full py-2"
              onClick={handleLogin}
            >
              Login
            </Button>
            <div className="text-white text-sm mt-4 text-center">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-bold">
                Create one
              </Link>
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
    </div>
  );
};

export default LoginPage;
