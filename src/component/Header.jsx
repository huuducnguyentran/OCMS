// src/components/Header.jsx
import { Layout, Avatar, Badge } from "antd";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAvatar } from "../context/AvatarContext";
import { useEffect, useState } from "react";
import { getUserProfile } from "../services/userService";
import { BellOutlined, UserOutlined } from "@ant-design/icons";
import { notificationService } from "../services/notificationService";

const Header = () => {
  const navigate = useNavigate();
  const { avatar, setAvatar } = useAvatar();
  const [userData, setUserData] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getUserProfile()
      .then((data) => {
        setUserData(data);
        if (!avatar && data?.avatarUrlWithSas) {
          setAvatar(data.avatarUrlWithSas);
        }
        fetchUnreadCount(data.userId); // Use userId directly from the profile
      })
      .catch(console.error);
  }, [avatar, setAvatar]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (userData?.userId) {
        fetchUnreadCount(userData.userId);
      }
    }, 30000);
    return () => clearInterval(intervalId);
  }, [userData]);

  useEffect(() => {
    const handleRefreshNotifications = () => {
      if (userData?.userId) {
        fetchUnreadCount(userData.userId);
      }
    };
    window.addEventListener("refreshNotifications", handleRefreshNotifications);
    return () => {
      window.removeEventListener(
        "refreshNotifications",
        handleRefreshNotifications
      );
    };
  }, [userData]);

  const fetchUnreadCount = async (userId) => {
    try {
      const result = await notificationService.getUnreadCount(userId);
      setUnreadCount(result?.unreadCount ?? 0);
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      setUnreadCount(0);
    }
  };

  const isLoggedIn = !!sessionStorage.getItem("token");

  return (
    <Layout.Header className="bg-white shadow-md px-6 py-4 flex items-center justify-between w-full">
      <SearchBar />
      <div className="flex items-center gap-4 ml-4">
        {userData && (
          <span className="text-white font-medium text-sm">
            Welcome, {userData.fullName}
          </span>
        )}
        {isLoggedIn ? (
          <>
            <div
              onClick={() => navigate(`/profile/${userData?.userId}`)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Avatar
                src={
                  avatar ||
                  userData?.avatarUrlWithSas ||
                  "https://via.placeholder.com/40"
                }
                size="large"
                icon={
                  !avatar && !userData?.avatarUrlWithSas && <UserOutlined />
                }
              />
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="text-blue-500 font-medium hover:underline"
          >
            Login
          </Link>
        )}
        {isLoggedIn && (
          <Badge count={unreadCount} overflowCount={99}>
            <div
              className="cursor-pointer text-xl text-white"
              onClick={() => navigate("/notifications")}
            >
              <BellOutlined />
            </div>
          </Badge>
        )}
      </div>
    </Layout.Header>
  );
};

export default Header;
