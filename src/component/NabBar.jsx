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
  const storedRole = localStorage.getItem("role");

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
          {item.key === "4" && <Badge count={1} offset={[20, 0]} />}
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
