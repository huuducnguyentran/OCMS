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
  Avatar,
  List,
  Empty,
  message,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  BookOutlined,
  TrophyOutlined,
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { getSubjectById, getSubjectTrainees } from "../../services/subjectService";
import moment from "moment";

const { Title, Text, Paragraph } = Typography;

const SubjectDetailPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trainees, setTrainees] = useState([]);
  const [loadingTrainees, setLoadingTrainees] = useState(false);
  const isTrainee = sessionStorage.getItem("role") === "Trainee";
  const isInstructor = sessionStorage.getItem("role") === "Instructor";
  const shouldNavigateToSchedule = isTrainee || isInstructor;

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const response = await getSubjectById(subjectId);
        setSubject(response.subject);
      } catch (error) {
        console.error("Error fetching subject:", error);
        message.error("Could not load subject details");
      } finally {
        setLoading(false);
      }
    };
    fetchSubject();
  }, [subjectId]);

  useEffect(() => {
    const fetchTrainees = async () => {
      if (subjectId) {
        try {
          setLoadingTrainees(true);
          const response = await getSubjectTrainees(subjectId);
          if (response && response.trainees) {
            setTrainees(Array.isArray(response.trainees) ? response.trainees : [response.trainees]);
          } else {
            setTrainees([]);
          }
        } catch (error) {
          console.error("Error fetching trainees:", error);
          message.error("Error fetching trainees");
        } finally {
          setLoadingTrainees(false);
        }
      }
    };
    fetchTrainees();
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
              onClick={() => navigate(shouldNavigateToSchedule ? "/schedule" : "/subject")}
              className="flex items-center bg-white/10 border-white/20 text-white hover:bg-white/20"
              ghost
            >
              {shouldNavigateToSchedule ? "Back to Schedule" : "Back to Subjects"}
            </Button>
            <Breadcrumb className="text-white/60">
              <Breadcrumb.Item>
                <a 
                  href={shouldNavigateToSchedule ? "/schedule" : "/subject"} 
                  className="text-white/60 hover:text-white"
                >
                  {shouldNavigateToSchedule ? "Schedule" : "Subjects"}
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
                title="Course Specialties"
                value={subject?.courseSubjectSpecialties?.length || 0}
                prefix={<TagOutlined className="text-purple-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-sm hover:shadow-md transition-shadow"
            >
              <Statistic
                title="Last Updated"
                value={moment(subject?.updatedAt).format("DD/MM/YYYY")}
                prefix={<ClockCircleOutlined className="text-indigo-500" />}
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
                <div>
                  <Text className="text-gray-500 block">Created By</Text>
                  <Tag color="cyan" className="mt-1 text-base px-3 py-1">
                    {subject?.createByUserId || "N/A"}
                  </Tag>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="space-y-4">
                <div>
                  <Text className="text-gray-500 block">Created At</Text>
                  <Text strong className="text-base">
                    {moment(subject?.createdAt).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </div>
                <div>
                  <Text className="text-gray-500 block">Last Updated</Text>
                  <Text strong className="text-base">
                    {moment(subject?.updatedAt).format("DD/MM/YYYY HH:mm")}
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

        {/* Course Subject Specialties Section */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <TeamOutlined className="text-indigo-500" />
              <span>Course Subject Specialties</span>
            </div>
          }
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          {subject?.courseSubjectSpecialties?.length > 0 ? (
            <Table
              dataSource={subject.courseSubjectSpecialties}
              rowKey="id"
              pagination={false}
              className="shadow-sm"
              columns={[
                {
                  title: "Course ID",
                  dataIndex: "courseId",
                  key: "courseId",
                  width: "15%",
                  render: (text) => <Text strong>{text}</Text>,
                },
                {
                  title: "Specialty",
                  key: "specialty",
                  width: "25%",
                  render: (_, record) => (
                    <div>
                      <Text strong>{record.specialty?.specialtyName}</Text>
                      <Text className="block text-xs text-gray-500">
                        {record.specialty?.specialtyId}
                      </Text>
                    </div>
                  ),
                },
                {
                  title: "Created At",
                  dataIndex: "createdAt",
                  key: "createdAt",
                  width: "20%",
                  render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
                },
                {
                  title: "Created By",
                  dataIndex: "createdByUserId",
                  key: "createdByUserId",
                  width: "15%",
                  render: (text) => <Tag color="blue">{text}</Tag>,
                },
                {
                  title: "Notes",
                  dataIndex: "notes",
                  key: "notes",
                  width: "25%",
                  render: (notes) => notes || "-",
                },
              ]}
            />
          ) : (
            <Empty description="No course subject specialties assigned" />
          )}
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

        {/* Trainees Section */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <UserOutlined className="text-green-500" />
              <span>Enrolled Trainees</span>
            </div>
          }
          className="mt-8 shadow-sm hover:shadow-md transition-shadow"
        >
          {loadingTrainees ? (
            <div className="flex justify-center items-center p-8">
              <Spin size="large" tip="Loading trainees..." />
            </div>
          ) : trainees.length === 0 ? (
            <Empty description="Không có học viên nào trong môn học này" />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={trainees}
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
              }}
              renderItem={(trainee) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} className="bg-blue-500" />}
                    title={<div className="text-lg font-medium">{trainee.name}</div>}
                    description={
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                        <div className="flex items-center gap-2">
                          <IdcardOutlined className="text-gray-500" />
                          <span className="text-gray-700">ID: {trainee.traineeId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MailOutlined className="text-gray-500" />
                          <span className="text-gray-700">{trainee.email}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Tag color="blue">Trainee Assign ID: {trainee.traineeAssignId}</Tag>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default SubjectDetailPage;
