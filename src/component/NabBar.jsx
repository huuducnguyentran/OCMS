// src/components/Navbar.jsx
import { Layout, Menu, Badge } from "antd";
import { Link } from "react-router-dom";
import navItems from "../data/NavItem";
import {
  HomeOutlined,
  BookOutlined,
  ScheduleOutlined,
  BellOutlined,
  LineChartOutlined,
  QuestionCircleOutlined,
  ImportOutlined,
  UserOutlined,
  AccountBookOutlined,
  FileExcelOutlined,
  SelectOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { notificationService } from "../services/notificationService";

const { Sider } = Layout;

const iconMap = {
  HomeOutlined: <HomeOutlined />,
  BookOutlined: <BookOutlined />,
  ScheduleOutlined: <ScheduleOutlined />,
  BellOutlined: <BellOutlined />,
  LineChartOutlined: <LineChartOutlined />,
  QuestionCircleOutlined: <QuestionCircleOutlined />,
  ImportOutlined: <ImportOutlined />,
  UserOutlined: <UserOutlined />,
  AccountBookOutlined: <AccountBookOutlined />,
  FileExcelOutlined: <FileExcelOutlined />,
  SelectOutlined: <SelectOutlined />,
};

const Navbar = () => {
  const storedRole = sessionStorage.getItem("role");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const storedUserID = sessionStorage.getItem("userID");
    if (storedUserID) {
      fetchUnreadCount(storedUserID);
    }
  }, []);

  // Thêm interval để cập nhật số lượng thông báo chưa đọc mỗi 30 giây
  useEffect(() => {
    const intervalId = setInterval(() => {
      const storedUserID = sessionStorage.getItem("userID");
      if (storedUserID) {
        fetchUnreadCount(storedUserID);
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Thêm event listener để lắng nghe sự kiện làm mới thông báo
  useEffect(() => {
    const handleRefreshNotifications = () => {
      const storedUserID = sessionStorage.getItem("userID");
      if (storedUserID) {
        fetchUnreadCount(storedUserID);
      }
    };

    window.addEventListener("refreshNotifications", handleRefreshNotifications);

    return () => {
      window.removeEventListener(
        "refreshNotifications",
        handleRefreshNotifications
      );
    };
  }, []);

  const fetchUnreadCount = async (userId) => {
    try {
      const result = await notificationService.getUnreadCount(userId);
      console.log("NavBar unread count response:", result);

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

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(storedRole)
  );

  const menuItems = filteredNavItems.map((item) => {
    if (item.children) {
      return {
        key: item.key,
        icon: iconMap[item.icon],
        label: item.label,
        children: item.children
          .filter((child) => child.roles.includes(storedRole))
          .map((child) => ({
            key: child.key,
            label: <Link to={child.path}>{child.label}</Link>,
          })),
      };
    }

    return {
      key: item.key,
      icon: iconMap[item.icon],
      label: (
        <Link to={item.path}>
          {item.label}
          {item.key === "4" && <Badge count={unreadCount} offset={[20, 0]} />}
        </Link>
      ),
    };
  });

  return (
    <Sider theme="dark" style={{ overflow: "auto", height: "auto" }}>
      <div className="text-xl font-bold text-white p-4">
        <span className="text-red-500">F</span>
        <span className="text-green-500">l</span>
        <span className="text-blue-500">i</span>
        <span className="text-yellow-500">g</span>
        <span className="text-white">ht</span>
        <span className="text-white font-bold">Vault</span>
        <div className="text-sm text-gray-300 mt-1 capitalize">
          {storedRole}
        </div>
      </div>
      <Menu
        theme="dark"
        mode="vertical"
        defaultSelectedKeys={["1"]}
        items={menuItems}
      />
    </Sider>
  );
};

export default Navbar;
