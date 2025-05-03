import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Tag,
  Typography,
  Breadcrumb,
  Row,
  Col,
  Spin,
  Table,
  Statistic,
} from "antd";
import {
  ArrowLeftOutlined,
  BookOutlined,
  TrophyOutlined,
  TeamOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { getSubjectById } from "../../services/subjectService";
import moment from "moment";

const { Title, Text } = Typography;

const SubjectDetailPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const isTrainee = sessionStorage.getItem("role") === "Trainee";
  const isInstructor = sessionStorage.getItem("role") === "Instructor";
  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const response = await getSubjectById(subjectId);
        setSubject(response.subject);
      } catch (error) {
        console.error("Error fetching subject:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubject();
  }, [subjectId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <Text className="block mt-4 text-gray-600">
            Loading subject details...
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(isTrainee ? "/schedule" : "/subject")}
              className="flex items-center bg-white/10 border-white/20 text-white hover:bg-white/20"
              ghost
            >
              {isTrainee ? "Back to schedule" : "Back to Subjects"}
            </Button>
            <Breadcrumb className="text-white/60">
              <Breadcrumb.Item>
                <a href="/subject" className="text-white/60 hover:text-white">
                  Subjects
                </a>
              </Breadcrumb.Item>
              <Breadcrumb.Item className="text-white">Details</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <Title level={2} className="text-white mb-2">
            {subject?.subjectName || "Subject Details"}
          </Title>
          <Text className="text-white/80">
            Subject ID: {subject?.subjectId}
          </Text>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-sm hover:shadow-md transition-shadow"
            >
              <Statistic
                title="Credits"
                value={subject?.credits || 0}
                prefix={<BookOutlined className="text-blue-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-sm hover:shadow-md transition-shadow"
            >
              <Statistic
                title="Passing Score"
                value={subject?.passingScore || 0}
                prefix={<TrophyOutlined className="text-yellow-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-sm hover:shadow-md transition-shadow"
            >
              <Statistic
                title="Total Schedules"
                value={subject?.trainingSchedules?.length || 0}
                prefix={<CalendarOutlined className="text-purple-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-sm hover:shadow-md transition-shadow"
            >
              <Statistic
                title="Instructors"
                value={subject?.instructors?.length || 0}
                prefix={<TeamOutlined className="text-indigo-500" />}
              />
            </Card>
          </Col>
        </Row>

        {/* Basic Information */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <BookOutlined className="text-blue-500" />
              <span>Basic Information</span>
            </div>
          }
          className="mb-8 shadow-sm hover:shadow-md transition-shadow"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div className="space-y-4">
                <div>
                  <Text className="text-gray-500 block">Credits</Text>
                  <Tag color="blue" className="mt-1 text-base px-3 py-1">
                    {subject?.credits || "N/A"}
                  </Tag>
                </div>
                <div>
                  <Text className="text-gray-500 block">Passing Score</Text>
                  <Tag color="orange" className="mt-1 text-base px-3 py-1">
                    {subject?.passingScore || "N/A"}
                  </Tag>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="space-y-4">
                <div>
                  <Text className="text-gray-500 block">Status</Text>
                  <Tag color="green" className="mt-1 text-base px-3 py-1">
                    Active
                  </Tag>
                </div>
                <div>
                  <Text className="text-gray-500 block">Department</Text>
                  <Text strong className="text-base">
                    {subject?.department || "N/A"}
                  </Text>
                </div>
              </div>
            </Col>
            <Col span={24}>
              <Text className="text-gray-500 block mb-2">Description</Text>
              <Text className="text-base">
                {subject?.description || "No description available"}
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Training Schedules Section */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <CalendarOutlined className="text-purple-500" />
              <span>Training Schedules</span>
            </div>
          }
          className="mb-8 shadow-sm hover:shadow-md transition-shadow"
        >
          <Table
            dataSource={subject?.trainingSchedules}
            rowKey="scheduleID"
            pagination={false}
            className="shadow-sm"
            columns={[
              {
                title: "Schedule ID",
                dataIndex: "scheduleID",
                key: "scheduleID",
                width: "15%",
                render: (text) => <Text strong>{text}</Text>,
              },
              {
                title: "Period",
                key: "period",
                width: "30%",
                render: (_, record) => (
                  <div className="space-y-1">
                    <Text strong>
                      {moment(record.startDateTime).format("DD/MM/YYYY")} -{" "}
                      {moment(record.endDateTime).format("DD/MM/YYYY")}
                    </Text>
                    <Tag color="blue" className="block w-fit">
                      {record.daysOfWeek}
                    </Tag>
                    <Text className="block text-xs text-gray-500">
                      Time: {record.classTime} ({record.subjectPeriod} hours)
                    </Text>
                  </div>
                ),
              },
              {
                title: "Location",
                key: "location",
                width: "25%",
                render: (_, record) => (
                  <div>
                    <Text strong>Room: {record.room}</Text>
                    <Text className="block text-xs text-gray-500">
                      {record.location}
                    </Text>
                  </div>
                ),
              },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: "15%",
                render: (status) => (
                  <Tag
                    color={
                      status === "Incoming"
                        ? "blue"
                        : status === "Ongoing"
                        ? "green"
                        : "default"
                    }
                  >
                    {status}
                  </Tag>
                ),
              },
              {
                title: "Notes",
                dataIndex: "notes",
                key: "notes",
                width: "15%",
                render: (notes) => (
                  <div className="max-w-xs truncate" title={notes}>
                    {notes || "-"}
                  </div>
                ),
              },
            ]}
          />
        </Card>

        {/* Instructors Section */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <TeamOutlined className="text-indigo-500" />
              <span>Assigned Instructors</span>
            </div>
          }
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          <Table
            dataSource={subject?.instructors}
            rowKey="assignmentId"
            pagination={false}
            className="shadow-sm"
            columns={[
              {
                title: "Assignment ID",
                dataIndex: "assignmentId",
                key: "assignmentId",
                width: "20%",
                render: (text) => <Text strong>{text}</Text>,
              },
              {
                title: "Instructor ID",
                dataIndex: "instructorId",
                key: "instructorId",
                width: "20%",
                render: (text) => <Tag color="blue">{text}</Tag>,
              },
              {
                title: "Assigned Date",
                dataIndex: "assignDate",
                key: "assignDate",
                width: "25%",
                render: (date) => (
                  <div>
                    <CalendarOutlined className="mr-2 text-gray-400" />
                    {moment(date).format("DD/MM/YYYY HH:mm")}
                  </div>
                ),
              },
              {
                title: "Status",
                dataIndex: "requestStatus",
                key: "requestStatus",
                width: "15%",
                render: (status) => (
                  <Tag
                    color={
                      status === "Approved"
                        ? "green"
                        : status === "Pending"
                        ? "gold"
                        : status === "Rejected"
                        ? "red"
                        : "default"
                    }
                  >
                    {status}
                  </Tag>
                ),
              },
              {
                title: "Notes",
                dataIndex: "notes",
                key: "notes",
                width: "20%",
                render: (notes) => (
                  <div className="max-w-xs truncate" title={notes}>
                    {notes || "-"}
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

export default SubjectDetailPage;
