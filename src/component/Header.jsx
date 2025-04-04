
import { Layout, Avatar, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAvatar } from "../context/AvatarContext";
import { useEffect, useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const { avatar } = useAvatar();
  const [userID, setUserID] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedUserID = localStorage.getItem("userID");
    const storedRole = localStorage.getItem("role");

    if (storedUserID) setUserID(storedUserID);
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

        {/* UserID display */}
        {userID && (
          <span className="text-gray-700 font-medium text-sm">
            Welcome, {userID}
          </span>
        )}

        {isLoggedIn ? (
          <>
            {/* Profile redirect */}
            <div
              onClick={() => navigate(`/profile/${userID}`)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Avatar
                src={avatar || "https://via.placeholder.com/40"}
                size="large"
              />
              <span className="text-blue-500 font-medium hover:underline">
                Profile
              </span>
            </div>

            {/* Logout button */}
            <Button type="primary" danger onClick={handleLogout}>
              Logout
            </Button>
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
