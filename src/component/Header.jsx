// src/components/Header.jsx
import { Layout, Avatar, Badge } from "antd";
import { Link, useNavigate } from "react-router-dom";
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
      <div className="flex-1">
        {/* Có thể thêm logo hoặc tên ứng dụng ở đây */}
      </div>

      <div className="flex items-center gap-6">
        {isLoggedIn ? (
          <>
            {userData && (
              <span className="text-gray-700 font-medium">
                Welcome, {userData.fullName}
              </span>
            )}

            <Badge count={unreadCount} overflowCount={99}>
              <div
                className="cursor-pointer text-xl text-gray-600 hover:text-blue-500 transition-colors"
                onClick={() => navigate("/notifications")}
              >
                <BellOutlined style={{ fontSize: '20px' }} />
              </div>
            </Badge>

            <div
              onClick={() => navigate(`/profile/${userData?.userId}`)}
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Avatar
                src={
                  avatar ||
                  userData?.avatarUrlWithSas ||
                  "https://via.placeholder.com/40"
                }
                size={40}
                icon={!avatar && !userData?.avatarUrlWithSas && <UserOutlined />}
                className="border-2 border-gray-200"
              />
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="text-blue-500 font-medium hover:text-blue-600 hover:underline"
          >
            Login
          </Link>
        )}
      </div>
    </Layout.Header>
  );
};

export default Header;
