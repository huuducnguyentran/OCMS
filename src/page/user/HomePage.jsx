import { useEffect, useState } from "react";
import { Layout, Card, Typography, Tag, Statistic, Button, Row, Col, Tooltip } from "antd";
import {
  BookOutlined,
  TeamOutlined,
  CalendarOutlined,
  TrophyOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BranchesOutlined,
  SafetyCertificateOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const HomePage = () => {
  const [role, setRole] = useState("user");
  const [roleName, setRoleName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    const storedRoleName = sessionStorage.getItem("roleName");
    if (storedRole) setRole(storedRole);
    if (storedRoleName) setRoleName(storedRoleName);
  }, []);

  const QuickAccessCard = ({ icon, title, description, path, color }) => (
    <Card
      onClick={() => navigate(path)}
      className="h-full cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-none"
      bodyStyle={{ height: "100%" }}
    >
      <div className="flex flex-col h-full">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <Title level={4} className="mb-2">
          {title}
        </Title>
        <Text className="text-gray-600 flex-grow">{description}</Text>
        <div className="mt-4">
          <Button type="link" className="p-0 text-blue-600 hover:text-blue-800">
            Access Now →
          </Button>
        </div>
      </div>
    </Card>
  );

  const AdminHome = () => (
    <div className="space-y-8">
      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <Statistic
            title={<span className="text-gray-600">Total Courses</span>}
            value={24}
            prefix={<BookOutlined className="text-blue-500" />}
            className="cursor-pointer"
            onClick={() => navigate('/course')}
          />
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <Statistic
            title={<span className="text-gray-600">Active Trainees</span>}
            value={156}
            prefix={<TeamOutlined className="text-green-500" />}
            className="cursor-pointer"
            onClick={() => navigate('/trainee')}
          />
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <Statistic
            title={<span className="text-gray-600">Ongoing Schedules</span>}
            value={18}
            prefix={<CalendarOutlined className="text-orange-500" />}
            className="cursor-pointer"
            onClick={() => navigate('/schedule')}
          />
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <Statistic
            title={<span className="text-gray-600">Certificates Issued</span>}
            value={89}
            prefix={<SafetyCertificateOutlined className="text-purple-500" />}
            className="cursor-pointer"
            onClick={() => navigate('/certificate')}
          />
        </Card>
      </div>

      {/* Quick Access Section */}
      <div>
        <Title level={3} className="mb-6">Quick Access</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickAccessCard
            icon={<BookOutlined className="text-2xl text-white" />}
            title="Course Management"
            description="Create and manage training courses, assign instructors and monitor progress."
            path="/course"
            color="bg-blue-500"
          />
          <QuickAccessCard
            icon={<CalendarOutlined className="text-2xl text-white" />}
            title="Schedule Management"
            description="View and manage training schedules, track sessions and attendance."
            path="/schedule"
            color="bg-green-500"
          />
          <QuickAccessCard
            icon={<BranchesOutlined className="text-2xl text-white" />}
            title="Specialty Management"
            description="Organize and manage medical specialties and their hierarchies."
            path="/specialty"
            color="bg-purple-500"
          />
        </div>
      </div>
    </div>
  );

  const NormalHome = () => (
    <div className="space-y-8">
      {/* Personal Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="h-full shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TeamOutlined className="text-2xl text-blue-500" />
              </div>
              <div>
                <Text className="text-gray-500">Welcome back,</Text>
                <Title level={4} className="m-0">
                  {`${sessionStorage.getItem("username") || "User"} (${roleName})`}
                </Title>
              </div>
            </div>
            <div className="space-y-2">
              <Tag icon={<CheckCircleOutlined />} color="success">
                Active Account
              </Tag>
              <Tag icon={<ClockCircleOutlined />} color="processing">
                2 Upcoming Sessions
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card className="h-full shadow-md hover:shadow-lg transition-all duration-300">
            <Title level={4}>Your Progress</Title>
            <div className="grid grid-cols-2 gap-4">
              <Statistic
                title="Completed Courses"
                value={5}
                prefix={<TrophyOutlined className="text-yellow-500" />}
              />
              <Statistic
                title="Ongoing Courses"
                value={2}
                prefix={<ClockCircleOutlined className="text-blue-500" />}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickAccessCard
          icon={<CalendarOutlined className="text-2xl text-white" />}
          title="My Schedule"
          description="View your upcoming training sessions and manage your calendar."
          path="/schedule"
          color="bg-indigo-500"
        />
        <QuickAccessCard
          icon={<FileTextOutlined className="text-2xl text-white" />}
          title="My Grades"
          description="Check your course grades and assessment results."
          path="/grade"
          color="bg-green-500"
        />
        <QuickAccessCard
          icon={<SafetyCertificateOutlined className="text-2xl text-white" />}
          title="My Certificates"
          description="Access and download your earned certificates."
          path="/certificate"
          color="bg-yellow-500"
        />
      </div>
    </div>
  );

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Layout.Content className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate__animated animate__fadeIn">
            <div className="flex items-center gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full shadow-lg border-2 border-blue-200">
                <DashboardOutlined className="text-5xl text-blue-500" />
              </div>
              <div>
                <Title level={2} className="!mb-1">
                  {role === "Admin" ? "Admin Dashboard" : "Training Dashboard"}
                </Title>
                <Text className="text-gray-600">
                  {role === "Admin" 
                    ? "Manage and monitor all training activities"
                    : roleName === "Trainee"
                    ? "Track your learning progress and upcoming sessions"
                    : roleName === "Instructor"
                    ? "Manage your classes and student progress"
                    : roleName === "Training Staff"
                    ? "Oversee training operations and schedules"
                    : "Welcome to the training system"}
                </Text>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {role === "Admin" ? <AdminHome /> : <NormalHome />}
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default HomePage;
