// src/components/Header.jsx
import { Layout, Avatar, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAvatar } from "../context/AvatarContext";
import { useEffect, useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const { avatar } = useAvatar();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("userID");
    const storedRole = localStorage.getItem("role");

    if (storedUsername) setUsername(storedUsername);
    if (storedRole) setRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    message.success("Logged out successfully.");
    navigate("/login");
  };

  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <Layout.Header className="bg-white shadow-md px-6 py-4 flex items-center justify-between w-full">
      <SearchBar />

      <div className="flex items-center gap-4">
        {/* Role display */}
        {role && (
          <span className="text-gray-600 text-sm font-semibold">
            Role: {role}
          </span>
        )}

        {/* Username display */}
        {username && (
          <span className="text-gray-700 font-medium text-sm">
            Welcome, {username}
          </span>
        )}

        {isLoggedIn ? (
          <>
            {/* Logout button */}
            <Avatar
              src={avatar || "https://via.placeholder.com/40"}
              size="large"
            />
            <Button type="primary" danger onClick={handleLogout}>
              Logout
            </Button>
            {/* Profile redirect */}
            <div
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 cursor-pointer"
            ></div>
          </>
        ) : (
          <Link
            to="/login"
            className="text-blue-500 font-medium hover:underline"
          >
            Login
          </Link>
        )}
      </div>
    </Layout.Header>
  );
};

export default Header;
