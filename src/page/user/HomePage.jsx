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
  AimOutlined,
  SolutionOutlined,
  FileProtectOutlined,
  DeploymentUnitOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getAllAssignedTrainee } from "../../services/traineeService";
import { courseService } from "../../services/courseService";
import { getUserProfile } from "../../services/userService";
import navItems from "../../data/NavItem";
const { Title, Text, Paragraph } = Typography;

const HomePage = () => {
  const [role, setRole] = useState("");
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
  const [allowedNavs, setAllowedNavs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    const storedRoleName = sessionStorage.getItem("roleName");
    
    if (storedRole) setRole(storedRole);
    if (storedRoleName) setRoleName(storedRoleName);
    
    // Get allowed navigation items for this role
    const allowed = navItems.filter(item => 
      item.roles?.includes(storedRole)
    );
    setAllowedNavs(allowed);
    
    getUserProfile()
      .then((data) => {
        setUserData(data);
      })
      .catch(err => console.error("Error getting user profile:", err));
      
    // Fetch real data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data based on role permissions
        if (["Admin", "Training staff", "HeadMaster"].includes(storedRole)) {
          const coursesResponse = await courseService.getAllCourses();
          const totalCourses = coursesResponse.data?.length || 0;
          
          const assignedTraineesResponse = await getAllAssignedTrainee();
          const activeTrainees = assignedTraineesResponse?.length || 0;
          
          setStats({
            totalCourses,
            activeTrainees,
            ongoingSchedules: 18,
            certificatesIssued: 5,
            pendingRequests: 12,
            completedCourses: 45
          });
        } else if (storedRole === "Trainee") {
          // Get trainee-specific stats
          setStats({
            completedCourses: 3,
            ongoingSchedules: 2,
            pendingRequests: 0,
            certificatesIssued: 1
          });
        } else if (storedRole === "Instructor") {
          // Get instructor-specific stats
          setStats({
            totalCourses: 0, // Số khóa học đang dạy
            activeTrainees: 0, // Số học viên đang dạy
            ongoingSchedules: 0, // Số lịch dạy hiện tại
            completedCourses: 0, // Số khóa học đã hoàn thành
            upcomingSchedules: 0, // Số lịch dạy sắp tới
            pendingGrades: 0 // Số bài cần chấm điểm
          });
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
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

  // Render quick access cards based on allowed nav items
  const renderQuickAccessCards = () => {
    const cards = [];
    
    allowedNavs.forEach(nav => {
      // Map nav items to cards
      switch (nav.key) {
        case "2": // Plan
          cards.push({
            icon: <CalendarOutlined className="text-2xl text-white" />,
            title: "Training Plans",
            description: "View and manage training plans in your organization",
            path: "/plan",
            color: "bg-blue-500"
          });
          break;
        case "6": // Accounts
          if (role === "Admin") {
            cards.push({
              icon: <TeamOutlined className="text-2xl text-white" />,
              title: "User Accounts",
              description: "Manage user accounts and permissions",
              path: "/accounts",
              color: "bg-purple-500"
            });
          }
          break;
        case "7": // Candidates
          cards.push({
            icon: <SolutionOutlined className="text-2xl text-white" />,
            title: "Candidates",
            description: "Review candidate applications and track progress",
            path: "/candidates-view",
            color: "bg-green-500",
            badge: stats.pendingRequests
          });
          break;
        case "13": // Course
          cards.push({
            icon: <BookOutlined className="text-2xl text-white" />,
            title: role === "Trainee" ? "My Courses" : "Courses",
            description: "Access training courses and learning materials",
            path: role === "Trainee" ? "/assigned-trainee-courses" : "/all-courses",
            color: "bg-indigo-500"
          });
          break;
        case "14": // Certificate
          cards.push({
            icon: <FileProtectOutlined className="text-2xl text-white" />,
            title: "Certificates",
            description: "View and manage training certificates",
            path: "/certificate",
            color: "bg-yellow-500"
          });
          break;
        case "11": // Assign Trainee
          cards.push({
            icon: <DeploymentUnitOutlined className="text-2xl text-white" />,
            title: "Trainee Assignment",
            description: "Assign trainees to courses and track progress",
            path: "/assigned-trainee",
            color: "bg-cyan-500"
          });
          break;
      }
    });
    
    // Return at most 3 cards
    return cards.slice(0, 3).map((card, index) => (
      <QuickAccessCard key={index} {...card} />
    ));
  };

  const renderDashboard = () => {
    return (
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
                Welcome back, {userData?.fullName || roleName}
              </Title>
              <Text className="text-blue-100 text-lg">
                Here's what's happening in your training system today
              </Text>
            </Col>
          </Row>
        </motion.div>

        {/* Statistics based on role */}
        {role === "Trainee" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatisticCard
              icon={<BookOutlined className="text-2xl text-white" />}
              title="My Courses"
              value={stats.ongoingSchedules}
              color="bg-blue-500"
              onClick={() => navigate('/assigned-trainee-courses')}
            />
            <StatisticCard
              icon={<TrophyOutlined className="text-2xl text-white" />}
              title="Completed Courses"
              value={stats.completedCourses}
              color="bg-green-500"
              onClick={() => navigate('/trainee-grade')}
            />
          </div>
        ) : role === "Instructor" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatisticCard
              icon={<CalendarOutlined className="text-2xl text-white" />}
              title="Current Schedules"
              value={stats.ongoingSchedules}
              color="bg-blue-500"
              onClick={() => navigate('/schedule')}
            />
            <StatisticCard
              icon={<TeamOutlined className="text-2xl text-white" />}
              title="Active Trainees"
              value={stats.activeTrainees}
              color="bg-green-500"
              onClick={() => navigate('/grade')}
            />
            <StatisticCard
              icon={<FileTextOutlined className="text-2xl text-white" />}
              title="Pending Grades"
              value={stats.pendingGrades}
              color="bg-orange-500"
              onClick={() => navigate('/grade')}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {role === "Admin" && (
              <StatisticCard
                icon={<TeamOutlined className="text-2xl text-white" />}
                title="Active Trainees"
                value={stats.activeTrainees}
                color="bg-green-500"
                onClick={() => navigate('/assigned-trainee')}
              />
            )}
            {["Admin", "Training staff"].includes(role) && (
              <StatisticCard
                icon={<BookOutlined className="text-2xl text-white" />}
                title="Total Courses"
                value={stats.totalCourses}
                color="bg-blue-500"
                onClick={() => navigate('/all-courses')}
              />
            )}
            {["Admin", "HR", "AOC Manager"].includes(role) && (
              <StatisticCard
                icon={<SafetyCertificateOutlined className="text-2xl text-white" />}
                title="Certificates Issued"
                value={stats.certificatesIssued}
                color="bg-purple-500"
                onClick={() => navigate('/certificate')}
              />
            )}
          </div>
        )}

        {/* Quick Access Section */}
        <div>
          <Title level={3} className="mb-6">Quick Access</Title>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {role === "Instructor" ? (
              <>
                <QuickAccessCard
                  icon={<CalendarOutlined className="text-2xl text-white" />}
                  title="Teaching Schedule"
                  description="View and manage your teaching schedules"
                  path="/schedule"
                  color="bg-blue-500"
                />
                <QuickAccessCard
                  icon={<FileTextOutlined className="text-2xl text-white" />}
                  title="Grade Management"
                  description="Manage and submit grades for your trainees"
                  path="/grade"
                  color="bg-orange-500"
                  badge={stats.pendingGrades}
                />
                <QuickAccessCard
                  icon={<TeamOutlined className="text-2xl text-white" />}
                  title="My Trainees"
                  description="View and manage your assigned trainees"
                  path="/grade"
                  color="bg-green-500"
                />
              </>
            ) : (
              renderQuickAccessCards()
            )}
          </div>
        </div>
        
        {/* Recent Activities for Instructor */}
        {role === "Instructor" && (
          <Card className="shadow-md">
            <Title level={4} className="mb-4">Recent Activities</Title>
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
              </div>
            ) : (
              <Timeline>
                <Timeline.Item color="blue">
                  Upcoming class: Advanced Training (Tomorrow, 9:00 AM)
                </Timeline.Item>
                <Timeline.Item color="orange">
                  5 pending grades need review
                </Timeline.Item>
                <Timeline.Item color="green">
                  Completed teaching schedule for Basic Training
                </Timeline.Item>
              </Timeline>
            )}
          </Card>
        )}
      </div>
    );
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Layout.Content className="p-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : (
            renderDashboard()
          )}
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default HomePage;

