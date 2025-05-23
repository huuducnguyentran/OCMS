// src/components/Navbar.jsx
import { Layout, Menu, Badge } from "antd";
import { Link } from "react-router-dom";
import navItems from "../data/NavItem";
import { useRef } from "react";

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
  FileAddOutlined,
  TeamOutlined,
  SolutionOutlined,
  FileDoneOutlined,
  IdcardOutlined,
  DeploymentUnitOutlined,
  ReadOutlined,
  FileProtectOutlined,
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
  FileAddOutlined: <FileAddOutlined />,
  TeamOutlined: <TeamOutlined />,
  SolutionOutlined: <SolutionOutlined />,
  FileDoneOutlined: <FileDoneOutlined />,
  IdcardOutlined: <IdcardOutlined />,
  DeploymentUnitOutlined: <DeploymentUnitOutlined />,
  ReadOutlined: <ReadOutlined />,
  FileProtectOutlined: <FileProtectOutlined />,
};

const Navbar = () => {
  const storedRole = sessionStorage.getItem("role");
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    const storedUserID = sessionStorage.getItem("userID");
    if (storedUserID) {
      fetchUnreadCount(storedUserID);
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const storedUserID = sessionStorage.getItem("userID");
      if (storedUserID) {
        fetchUnreadCount(storedUserID);
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

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

  const filteredNavItems = navItems
    .filter(
      (item) => Array.isArray(item.roles) && item.roles.includes(storedRole)
    ) // Check if item.roles is an array
    .map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter(
          (child) =>
            Array.isArray(child.roles) && child.roles.includes(storedRole) // Check for each child role
        );
        if (filteredChildren.length === 0) return null;

        return {
          key: item.key,
          icon: iconMap[item.icon],
          label: item.label,
          children: filteredChildren.map((child) => ({
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
            {item.key === "2" && <Badge count={unreadCount} offset={[10, 0]} />}
          </Link>
        ),
      };
    })
    .filter(Boolean); // Remove null items

  return (
    <Sider
      theme="dark"
      style={{
        overflow: "hidden", // hide scrollbar
        height: "auto",
        backgroundColor: "#083344",
        userSelect: "none", // prevent text selection while dragging
      }}
    >
      <div className="p-4 text-center border-b border-gray-600">
        <div className="text-2xl font-extrabold text-white tracking-wide">
          <span className="text-red-500">F</span>
          <span className="text-green-500">l</span>
          <span className="text-blue-500">i</span>
          <span className="text-yellow-500">g</span>
          <span className="text-white">ht</span>
          <span className="text-white">Vault</span>
        </div>
        <div className="text-xs text-gray-400 mt-1 capitalize">
          {storedRole}
        </div>
      </div>

      {/* Scrollable and draggable container */}
      <div
        ref={scrollRef}
        style={{
          height: "calc(100vh - 80px)", // adjust height as needed
          overflowY: "scroll",
          scrollbarWidth: "none", // Firefox
        }}
        className="no-scrollbar" // use Tailwind utility to hide scrollbar
      >
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[window.location.pathname]}
          defaultOpenKeys={filteredNavItems
            .filter((item) =>
              item.children?.some((child) =>
                window.location.pathname.startsWith(child.label.props.to)
              )
            )
            .map((item) => item.key)}
          style={{
            borderRight: 0,
            backgroundColor: "#083344",
            color: "#083344",
          }}
          items={filteredNavItems}
        />
      </div>
    </Sider>
  );
};

export default Navbar;
