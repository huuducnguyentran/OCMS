import { useEffect, useState } from "react";
import { 
  Layout, 
  Card, 
  Typography, 
  Tag, 
  Statistic, 
  Button, 
  Row, 
  Col, 
  Tooltip,
  Badge,
  Empty,
  Spin,
  Space,
  Timeline,
  message
} from "antd";
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
  BellOutlined,
  UserOutlined,
  RiseOutlined,
  BarChartOutlined,
  AimOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getAllAssignedTrainee } from "../../services/traineeService";
import { courseService } from "../../services/courseService";
import { getUserProfile } from "../../services/userService";
const { Title, Text, Paragraph } = Typography;

const HomePage = () => {
  const [role, setRole] = useState("user");
  const [roleName, setRoleName] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeTrainees: 0,
    ongoingSchedules: 0,
    certificatesIssued: 0,
    pendingRequests: 0,
    completedCourses: 0
  });
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    const storedRoleName = sessionStorage.getItem("roleName");
    if (storedRole) setRole(storedRole);
    if (storedRoleName) setRoleName(storedRoleName);
    getUserProfile()
    .then((data) => {
      setUserData(data);
    })
    // Fetch real data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch courses data
        const coursesResponse = await courseService.getAllCourses();
        const totalCourses = coursesResponse.data?.length || 0;
        
        // Fetch assigned trainees data
        const assignedTraineesResponse = await getAllAssignedTrainee();
        const activeTrainees = assignedTraineesResponse?.length || 0;
        
        // Update stats with real data
        setStats({
          totalCourses: totalCourses, // Actual number of courses
          activeTrainees: activeTrainees, // Actual number of assigned trainees
          ongoingSchedules: 18,
          certificatesIssued: 5, // Actual number of certificates
          pendingRequests: 12,
          completedCourses: 45
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
        message.error("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  

  const StatisticCard = ({ icon, title, value, color, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        onClick={onClick}
        className="cursor-pointer hover:shadow-lg transition-all duration-300"
        bodyStyle={{ padding: '24px' }}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <Text className="text-gray-600">{title}</Text>
            <Title level={3} className="!mb-0">
              {value}
            </Title>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const QuickAccessCard = ({ icon, title, description, path, color, badge }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        onClick={() => navigate(path)}
        className="h-full cursor-pointer hover:shadow-xl transition-all duration-300 border-none"
        bodyStyle={{ height: "100%" }}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
              {icon}
            </div>
            {badge && (
              <Badge count={badge} />
            )}
          </div>
          <Title level={4} className="mb-2">
            {title}
          </Title>
          <Paragraph className="text-gray-600 flex-grow" ellipsis={{ rows: 2 }}>
            {description}
          </Paragraph>
          <div className="mt-4">
            <Button type="primary" className={`${color} border-none hover:opacity-90`}>
              Access Now →
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const AdminHome = () => (
    <div className="space-y-8">
      {/* Hero Section with Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white mb-8"
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <Title level={2} className="!text-white !mb-2">
              Welcome back, Administrator
            </Title>
            <Text className="text-blue-100 text-lg">
              Here's what's happening in your training system today
            </Text>
          </Col>
        </Row>
      </motion.div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatisticCard
          icon={<BookOutlined className="text-2xl text-white" />}
          title="Total Courses"
          value={stats.totalCourses}
          color="bg-blue-500"
          onClick={() => navigate('/all-courses')}
        />
        <StatisticCard
          icon={<TeamOutlined className="text-2xl text-white" />}
          title="Active Trainees"
          value={stats.activeTrainees}
          color="bg-green-500"
          onClick={() => navigate('/assigned-trainee')}
        />
        <StatisticCard
          icon={<SafetyCertificateOutlined className="text-2xl text-white" />}
          title="Certificates Issued"
          value={stats.certificatesIssued}
          color="bg-purple-500"
          onClick={() => navigate('/certificate')}
        />
      </div>

      {/* Quick Access Section */}
      <div>
        <Title level={3} className="mb-6">Quick Access</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickAccessCard
            icon={<UserOutlined className="text-2xl text-white" />}
            title="Candidate Management"
            description="Review and manage candidate applications, track recruitment progress."
            path="/candidates-view"
            color="bg-cyan-500"
            badge={stats.pendingRequests}
          />
          <QuickAccessCard
            icon={<BellOutlined className="text-2xl text-white" />}
            title="Notifications"
            description="View system notifications, announcements, and updates."
            path="/notifications"
            color="bg-yellow-500"
            badge={5}
          />
          <QuickAccessCard
           icon={<BookOutlined className="text-2xl text-white" />}
           title="subject"
           description="View subject subject, announcements, and updates."
           path="/subject"
           color="bg-yellow-500"
           
          />
        </div>
      </div>
    </div>
  );

  const NormalHome = () => (
    <div className="space-y-8">
      {/* Personal Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white"
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={12}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <UserOutlined className="text-3xl text-white" />
              </div>
              <div>
                <Text className="text-indigo-100">Welcome back,</Text>
                <Title level={3} className="!text-white !mb-0">
                  {userData?.fullName || "User"}
                </Title>
                <Tag color="blue">{roleName}</Tag>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic 
                  title={<span className="text-indigo-100">Completed Courses</span>}
                  value={stats.completedCourses}
                  prefix={<TrophyOutlined className="text-yellow-400" />}
                  className="text-white"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={<span className="text-indigo-100">Active Courses</span>}
                  value={stats.ongoingSchedules}
                  prefix={<ClockCircleOutlined className="text-green-400" />}
                  className="text-white"
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickAccessCard
          icon={<CalendarOutlined className="text-2xl text-white" />}
          title="My Schedule"
          description="View your upcoming training sessions and manage your calendar."
          path="/schedule"
          color="bg-blue-500"
        />
        <QuickAccessCard
          icon={<FileTextOutlined className="text-2xl text-white" />}
          title="My Progress"
          description="Track your learning progress and view assessment results."
          path="/progress"
          color="bg-green-500"
        />
        <QuickAccessCard
          icon={<AimOutlined className="text-2xl text-white" />}
          title="Learning Path"
          description="Explore recommended courses and plan your learning journey."
          path="/learning-path"
          color="bg-purple-500"
        />
      </div>

      {/* Recent Activities */}
      <Card className="shadow-md">
        <Title level={4} className="mb-4">Recent Activities</Title>
        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <Timeline>
            <Timeline.Item color="green">Completed "Introduction to Medical Ethics" course</Timeline.Item>
            <Timeline.Item color="blue">Enrolled in "Advanced Patient Care" course</Timeline.Item>
            <Timeline.Item color="orange">Upcoming assessment on Friday</Timeline.Item>
          </Timeline>
        )}
      </Card>
    </div>
  );

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Layout.Content className="p-8">
        <div className="max-w-7xl mx-auto">
          {role === "Admin" ? <AdminHome /> : <NormalHome />}
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default HomePage;

