// src/components/Navbar.jsx
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
    .filter((item) => item.roles.includes(storedRole))
    .map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter((child) =>
          child.roles.includes(storedRole)
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
            {item.key === "4" && <Badge count={unreadCount} offset={[10, 0]} />}
          </Link>
        ),
      };
    })
    .filter(Boolean); // Remove null items

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
        mode="inline"
        defaultSelectedKeys={["1"]}
        items={filteredNavItems}
      />
    </Sider>
  );
};

export default Navbar;
