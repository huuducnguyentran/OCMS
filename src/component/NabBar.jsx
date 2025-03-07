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
} from "@ant-design/icons";
import "tailwindcss";

const { Sider } = Layout;

const iconMap = {
  HomeOutlined: <HomeOutlined />,
  BookOutlined: <BookOutlined />,
  ScheduleOutlined: <ScheduleOutlined />,
  BellOutlined: <BellOutlined />,
  LineChartOutlined: <LineChartOutlined />,
  QuestionCircleOutlined: <QuestionCircleOutlined />,
};

// Convert navItems to Ant Design Menu format
const menuItems = navItems.map((item) => ({
  key: item.key,
  icon: iconMap[item.icon],
  label: (
    <Link to={item.path}>
      {item.label}
      {item.key === "4" && <Badge count={1} offset={[10, 0]} />}
    </Link>
  ),
}));

const Navbar = () => (
  <Sider theme="dark" style={{ overflow: "auto", height: "auto" }}>
    <div className="text-xl font-bold text-white p-4">FlightVault</div>
    <Menu
      theme="dark"
      mode="vertical"
      defaultSelectedKeys={["1"]}
      items={menuItems}
    />
  </Sider>
);

export default Navbar;
