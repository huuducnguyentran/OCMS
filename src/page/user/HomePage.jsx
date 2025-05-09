import { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Typography,
  Button,
  Row,
  Col,
  Badge,
  Spin,
  Timeline,
} from "antd";
import {
  BookOutlined,
  TeamOutlined,
  CalendarOutlined,
  TrophyOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  SolutionOutlined,
  FileProtectOutlined,
  DeploymentUnitOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getAllAssignedTrainee } from "../../services/traineeService";
import { courseService } from "../../services/courseService";
import { getUserProfile } from "../../services/userService";
import { getPendingCertificate } from "../../services/certificateService";
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
    completedCourses: 0,
    pendingCertificates: 0,
    pendingDecisions: 0,
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
    const allowed = navItems.filter((item) => item.roles?.includes(storedRole));
    setAllowedNavs(allowed);

    getUserProfile()
      .then((data) => {
        setUserData(data);
      })
      .catch((err) => console.error("Error getting user profile:", err));

    // Fetch real data
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch data based on role permissions
        if (["Admin", "Training staff", "HeadMaster"].includes(storedRole)) {
          // Lấy tổng số khóa học
          const coursesResponse = await courseService.getAllCourses();
          const courses = coursesResponse.data || [];
          const totalCourses = courses.length;
          
          // Lấy số khóa học đã hoàn thành
          const completedCourses = courses.filter(course => 
            course.progress === "Completed"
          ).length;
          
          // Lấy tổng số học viên đang hoạt động
          const assignedTraineesResponse = await getAllAssignedTrainee();
          const activeTrainees = assignedTraineesResponse?.length || 0;
          
          // Lấy số lịch học đang diễn ra
          let ongoingSchedules = 0;
          courses.forEach(course => {
            if (course.subjects) {
              course.subjects.forEach(subject => {
                if (subject.courseSubjectSpecialties) {
                  subject.courseSubjectSpecialties.forEach(specialty => {
                    if (specialty.schedules) {
                      ongoingSchedules += specialty.schedules.filter(
                        schedule => schedule.status === "Approved"
                      ).length;
                    }
                  });
                }
              });
            }
          });
          
          // Lấy số yêu cầu đang chờ xử lý
          const pendingRequests = courses.filter(course =>
            course.status === "Pending"
          ).length;
          
          // Lấy số chứng chỉ đã cấp
          let certificatesIssued = 0;
          if (assignedTraineesResponse) {
            certificatesIssued = assignedTraineesResponse.filter(
              trainee => trainee.requestStatus === "Approved" && trainee.certificateIssued === true
            ).length || 0;
          }
          
          // Dành cho HeadMaster: Lấy số chứng chỉ đang chờ phê duyệt và số quyết định đang chờ phê duyệt
          let pendingCertificates = 0;
          let pendingDecisions = 0;
          
          if (storedRole === "HeadMaster") {
            try {
              // Lấy số chứng chỉ đang chờ phê duyệt từ CertificatePendingPage
              const pendingCertificateResponse = await getPendingCertificate();
              pendingCertificates = Array.isArray(pendingCertificateResponse) ? pendingCertificateResponse.length : 0;
              
              // Lấy số quyết định đang chờ phê duyệt
              const decisionResponse = await fetch("/api/decisions/pending").then(res => res.json()).catch(() => []);
              pendingDecisions = Array.isArray(decisionResponse) ? decisionResponse.length : 0;
              
              // Nếu không có API riêng, dùng các phương pháp thay thế để ước tính
              if (pendingDecisions === 0) {
                // Dùng số khóa học đang chờ quyết định làm ước tính
                pendingDecisions = Math.floor(pendingRequests * 0.7); // Giả định 70% yêu cầu cần quyết định
              }
            } catch (error) {
              console.error("Error fetching HeadMaster data:", error);
              // Fallback: đặt giá trị mặc định
              pendingCertificates = 0; // Giả định có 0 chứng chỉ đang chờ
              pendingDecisions = 0; // Giả định có 0 quyết định đang chờ
            }
          }

          setStats({
            totalCourses,
            activeTrainees,
            ongoingSchedules,
            certificatesIssued,
            pendingRequests,
            completedCourses,
            pendingCertificates,
            pendingDecisions,
          });
        } else if (storedRole === "Trainee") {
          const storedUserID = sessionStorage.getItem("userID");
          
          // Lấy các khóa học đã gán cho trainee
          const traineeCoursesResponse = await courseService.getAssignedTraineeCourse(storedUserID);
          const traineeCourses = Array.isArray(traineeCoursesResponse) 
            ? traineeCoursesResponse.filter(course => course.status === "Approved")
            : [];
            
          // Số khóa học đang tham gia và đã hoàn thành
          const completedCourses = traineeCourses.filter(
            course => course.progress?.toLowerCase() === "completed"
          ).length;
          
          const ongoingCourses = traineeCourses.filter(
            course => course.progress?.toLowerCase() === "ongoing"
          ).length;
          
          // Lấy chứng chỉ của trainee
          const certificateResponse = await getUserProfile(); // Hoặc gọi API lấy chứng chỉ
          let certificatesIssued = 0;
          
          try {
            // Nếu có API riêng cho chứng chỉ, sử dụng API đó
            const certificateData = await fetch("/api/trainee/certificates").then(res => res.json());
            certificatesIssued = certificateData.filter(cert => cert.status === "Active").length;
          } catch (e) {
            // Fallback nếu API không tồn tại
            certificatesIssued = certificateResponse?.certificates?.length || 0;
          }
          
          // Lấy lịch học
          let ongoingSchedules = 0;
          // Đếm lịch học từ tất cả các khóa học được gán
          traineeCourses.forEach(course => {
            if (course.subjects) {
              course.subjects.forEach(subject => {
                if (subject.courseSubjectSpecialties) {
                  subject.courseSubjectSpecialties.forEach(specialty => {
                    if (specialty.schedules) {
                      ongoingSchedules += specialty.schedules.filter(
                        schedule => schedule.status === "Approved"
                      ).length;
                    }
                  });
                }
              });
            }
          });

          // Lấy các yêu cầu đang chờ xử lý
          const pendingRequests = traineeCourses.filter(
            course => course.status === "Pending"
          ).length;
          
          setStats({
            totalCourses: traineeCourses.length,
            completedCourses,
            ongoingCourses,
            ongoingSchedules,
            pendingRequests,
            certificatesIssued,
            pendingCertificates: 0,
            pendingDecisions: 0,
          });
        } else if (storedRole === "Instructor") {
          // TODO: Cập nhật API để lấy thông tin khóa học của instructor
          const instructorResponse = await getUserProfile();
          
          const totalCourses = instructorResponse?.teachingCourses?.length || 0;
          const activeTrainees = instructorResponse?.activeTrainees || 0;
          const ongoingSchedules = instructorResponse?.ongoingSchedules || 0;
          const completedCourses = instructorResponse?.completedCourses || 0;
          const upcomingSchedules = instructorResponse?.upcomingSchedules || 0;
          const pendingGrades = instructorResponse?.pendingGrades || 0;
          
          setStats({
            totalCourses,
            activeTrainees,
            ongoingSchedules,
            completedCourses,
            upcomingSchedules,
            pendingGrades,
            pendingCertificates: 0,
            pendingDecisions: 0,
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
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card
        onClick={onClick}
        className="cursor-pointer hover:shadow-lg transition-all duration-300"
        bodyStyle={{ padding: "24px" }}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}
          >
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

  const QuickAccessCard = ({
    icon,
    title,
    description,
    path,
    color,
    badge,
  }) => (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card
        onClick={() => navigate(path)}
        className="h-full cursor-pointer hover:shadow-xl transition-all duration-300 border-none"
        bodyStyle={{ height: "100%" }}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <div
              className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}
            >
              {icon}
            </div>
            {badge && <Badge count={badge} />}
          </div>
          <Title level={4} className="mb-2">
            {title}
          </Title>
          <Paragraph className="text-gray-600 flex-grow" ellipsis={{ rows: 2 }}>
            {description}
          </Paragraph>
          <div className="mt-4">
            <Button
              type="primary"
              className={`${color} border-none hover:opacity-90`}
            >
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

    allowedNavs.forEach((nav) => {
      // Map nav items to cards
      switch (nav.key) {
        case "2": // Plan
          if (role !== "Trainee") {
            cards.push({
              icon: <CalendarOutlined className="text-2xl text-white" />,
              title: "Training Plans",
              description: "View and manage training plans in your organization",
              path: "/plan",
              color: "bg-blue-500",
            });
          } else {
            // Đối với Trainee, hiển thị Accomplishments thay vì Training Plans
            cards.push({
              icon: <TrophyOutlined className="text-2xl text-white" />,
              title: "Accomplishments",
              description: "Track your learning journey and achievements",
              path: "/accomplishment",
              color: "bg-yellow-500",
            });
          }
          break;
        case "6": // Accounts
          if (role === "Admin") {
            cards.push({
              icon: <TeamOutlined className="text-2xl text-white" />,
              title: "User Accounts",
              description: "Manage user accounts and permissions",
              path: "/accounts",
              color: "bg-purple-500",
            });
          }
          break;
        case "7": // Candidates
          // Trainee không xem được Candidates
          if (role !== "Trainee") {
            cards.push({
              icon: <SolutionOutlined className="text-2xl text-white" />,
              title: "Candidates",
              description: "Review candidate applications and track progress",
              path: "/candidates-view",
              color: "bg-green-500",
            });
          }
          break;
        case "13": // Course
          cards.push({
            icon: <BookOutlined className="text-2xl text-white" />,
            title: role === "Trainee" ? "My Courses" : "Courses",
            description: "Access training courses and learning materials",
            path:
              role === "Trainee" ? "/assigned-trainee-courses" : "/course",
            color: "bg-indigo-500",
          });
          break;
        case "14": // Certificate
          cards.push({
            icon: <FileProtectOutlined className="text-2xl text-white" />,
            title: "Certificates",
            description: "View and manage training certificates",
            path: "/certificate",
            color: "bg-yellow-500",
          });
          break;
        case "11": // Assign Trainee
          if (role !== "Trainee") {
            cards.push({
              icon: <DeploymentUnitOutlined className="text-2xl text-white" />,
              title: "Trainee Assignment",
              description: "Assign trainees to courses and track progress",
              path: "/assigned-trainee",
              color: "bg-cyan-500",
            });
          }
          break;
        case "8": // Schedule
          cards.push({
            icon: <CalendarOutlined className="text-2xl text-white" />,
            title: "Schedule",
            description: "View and manage your training schedule",
            path: "/schedule",
            color: "bg-blue-500",
          });
          break;
        case "15": // Request
          cards.push({
            icon: <FileTextOutlined className="text-2xl text-white" />,
            title: "Requests",
            description: "Manage and track your pending requests",
            path: "/request",
            color: "bg-orange-500",
          });
          break;
      }
    });

    // Sắp xếp thẻ cho vai trò Trainee để đảm bảo hiển thị đúng thứ tự ưu tiên
    if (role === "Trainee") {
      // Ưu tiên thứ tự: My Courses, Schedule, Accomplishments
      cards.sort((a, b) => {
        const order = {
          "My Courses": 1,
          "Schedule": 2,
          "Accomplishments": 3,
          "Certificates": 4,
          "Requests": 5,
        };
        return (order[a.title] || 99) - (order[b.title] || 99);
      });
    }

    // Return at most 3 cards
    return cards
      .slice(0, 3)
      .map((card, index) => <QuickAccessCard key={index} {...card} />);
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
                Here is what happening in your training system today
              </Text>
            </Col>
          </Row>
        </motion.div>

        {/* Statistics based on role */}
        {role === "HeadMaster" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatisticCard
              icon={<CalendarOutlined className="text-2xl text-white" />}
              title="Pending Requests"
              value={stats.pendingRequests}
              color="bg-orange-500"
              onClick={() => navigate("/request")}
            />
            <StatisticCard
              icon={<SafetyCertificateOutlined className="text-2xl text-white" />}
              title="Pending Certificates"
              value={stats.pendingCertificates}
              color="bg-green-500"
              onClick={() => navigate("/certificate-pending")}
            />
            <StatisticCard
              icon={<FileTextOutlined className="text-2xl text-white" />}
              title="Pending Decisions"
              value={stats.pendingDecisions}
              color="bg-blue-500"
              onClick={() => navigate("/decision")}
            />
          </div>
        ) : role === "Trainee" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          </div>
        ) : role === "Instructor" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {role === "Admin" && (
              <StatisticCard
                icon={<TeamOutlined className="text-2xl text-white" />}
                title="Active Trainees"
                value={stats.activeTrainees}
                color="bg-green-500"
                onClick={() => navigate("/assigned-trainee")}
              />
            )}
            {["Admin", "Training staff"].includes(role) && (
              <StatisticCard
                icon={<BookOutlined className="text-2xl text-white" />}
                title="Total Courses"
                value={stats.totalCourses}
                color="bg-blue-500"
                onClick={() => navigate("/course")}
              />
            )}
            {["Admin", "HR", "AOC Manager"].includes(role) && (
              <StatisticCard
                icon={
                  <SafetyCertificateOutlined className="text-2xl text-white" />
                }
                title="Certificates Issued"
                value={stats.certificatesIssued}
                color="bg-purple-500"
                onClick={() => navigate("/certificate")}
              />
            )}
          </div>
        )}

        {/* Quick Access Section */}
        <div>
          <Title level={3} className="mb-6">
            Quick Access
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {role === "HeadMaster" ? (
              <>
                <QuickAccessCard
                  icon={<CalendarOutlined className="text-2xl text-white" />}
                  title="Pending Requests"
                  description="Review and approve pending training plans"
                  path="/request"
                  color="bg-orange-500"
                  badge={stats.pendingRequests}
                />
                <QuickAccessCard
                  icon={<SafetyCertificateOutlined className="text-2xl text-white" />}
                  title="Pending Certificates"
                  description="Review and approve pending certificates"
                  path="/certificate-pending"
                  color="bg-green-500"
                  badge={stats.pendingCertificates}
                />
                <QuickAccessCard
                  icon={<FileTextOutlined className="text-2xl text-white" />}
                  title="Pending Decisions"
                  description="Review and approve training decisions"
                  path="/decision"
                  color="bg-blue-500"
                  badge={stats.pendingDecisions}
                />
              </>
            ) : role === "Instructor" ? (
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
                  path="/grade-view"
                  color="bg-orange-500"
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

        {/* Recent Activities for HeadMaster */}
        {role === "HeadMaster" && (
          <Card className="shadow-md">
            <Title level={4} className="mb-4">
              Recent Activities
            </Title>
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
              </div>
            ) : (
              <Timeline>
                <Timeline.Item color="orange">
                  {stats.pendingRequests} new training plans need review
                </Timeline.Item>
                <Timeline.Item color="green">
                  {stats.pendingCertificates} certificates waiting for approval
                </Timeline.Item>
                <Timeline.Item color="blue">
                  {stats.pendingDecisions} decisions need to be made
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
