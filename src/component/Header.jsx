// src/components/Header.jsx
import { Layout, Avatar, Badge } from "antd";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAvatar } from "../context/AvatarContext";
import { useEffect, useState } from "react";
import { getUserById } from "../services/userService";
import { BellOutlined, UserOutlined } from "@ant-design/icons";
import { notificationService } from "../services/notificationService";

const Header = () => {
  const navigate = useNavigate();
  const { avatar } = useAvatar();
  const [userID, setUserID] = useState("");
  const [userData, setUserData] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const storedUserID = localStorage.getItem("userID");

    if (storedUserID) {
      setUserID(storedUserID);
      getUserById(storedUserID)
        .then((data) => setUserData(data))
        .catch(console.error);
        
      // Fetch unread notifications count
      fetchUnreadCount(storedUserID);
    }
  }, []);
  
  // Thêm interval để cập nhật số lượng thông báo mỗi 30 giây
  useEffect(() => {
    const intervalId = setInterval(() => {
      const storedUserID = localStorage.getItem("userID");
      if (storedUserID) {
        fetchUnreadCount(storedUserID);
      }
    }, 30000);
    
    // Dọn dẹp interval khi component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Thêm event listener để lắng nghe sự kiện làm mới thông báo
  useEffect(() => {
    const handleRefreshNotifications = () => {
      const storedUserID = localStorage.getItem("userID");
      if (storedUserID) {
        fetchUnreadCount(storedUserID);
      }
    };
    
    window.addEventListener('refreshNotifications', handleRefreshNotifications);
    
    return () => {
      window.removeEventListener('refreshNotifications', handleRefreshNotifications);
    };
  }, []);
  
  const fetchUnreadCount = async (userId) => {
    try {
      const result = await notificationService.getUnreadCount(userId);
      console.log("Unread count response:", result);
      
      if (result && result.unreadCount !== undefined) {
        setUnreadCount(result.unreadCount);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      setUnreadCount(0);
    }
  };

  const isLoggedIn = !!localStorage.getItem("token");

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
            {/* Profile redirect */}
            <div
              onClick={() => navigate(`/profile/${userID}`)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Avatar
                src={avatar || "https://via.placeholder.com/40"}
                size="large"
                icon={!avatar && <UserOutlined />}
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
              onClick={() => navigate('/notifications')}
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
