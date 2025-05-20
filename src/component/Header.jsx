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
    <Layout.Header className="bg-gradient-to-r from-blue-600 to-blue-400 shadow-lg px-8 py-3 flex items-center justify-between w-full">
      <div className="flex-1 text-white text-xl font-semibold tracking-wide">
        {/* App Name or Logo could go here */}
      </div>

      <div className="flex items-center gap-6">
        {isLoggedIn ? (
          <>
            {userData && (
              <span className="text-white font-medium">
                Welcome, {userData.fullName}
              </span>
            )}

            <Badge count={unreadCount} overflowCount={99}>
              <div
                className="cursor-pointer text-xl text-white hover:text-yellow-300 transition-colors"
                onClick={() => navigate("/notifications")}
              >
                <BellOutlined style={{ fontSize: "22px" }} />
              </div>
            </Badge>

            <div
              onClick={() => navigate(`/profile/${userData?.userId}`)}
              className="flex items-center cursor-pointer hover:opacity-90 transition-opacity"
            >
              <Avatar
                src={
                  avatar ||
                  userData?.avatarUrlWithSas ||
                  "https://via.placeholder.com/40"
                }
                size={40}
                icon={
                  !avatar && !userData?.avatarUrlWithSas && <UserOutlined />
                }
                className="border-2 border-white"
              />
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="text-white font-medium hover:text-yellow-200 hover:underline"
          >
            Login
          </Link>
        )}
      </div>
    </Layout.Header>
  );
};

export default Header;
