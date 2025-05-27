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
import {
  getSubjectById,
  getSubjectTrainees,
} from "../../services/subjectService";
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
            setTrainees(
              Array.isArray(response.trainees)
                ? response.trainees
                : [response.trainees]
            );
          } else {
            setTrainees([]);
          }
        } catch (error) {
          console.log("Note: Trainees data not available", error);
          setTrainees([]);
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() =>
                navigate(shouldNavigateToSchedule ? "/schedule" : "/subject")
              }
              className="flex items-center !bg-white/10 !border-white/20 !text-white hover:!bg-white/20"
              ghost
            >
              {shouldNavigateToSchedule
                ? "Back to Schedule"
                : "Back to Subjects"}
            </Button>
            <Breadcrumb className="text-white/70">
              <Breadcrumb.Item>
                <a
                  href={shouldNavigateToSchedule ? "/schedule" : "/subject"}
                  className="text-white/70 hover:text-white"
                >
                  {shouldNavigateToSchedule ? "Schedule" : "Subjects"}
                </a>
              </Breadcrumb.Item>
              <Breadcrumb.Item className="text-white">Details</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <Title level={2} className="text-white mb-1">
            {subject?.subjectName || "Subject Details"}
          </Title>
          <Text className="text-white/80">
            Subject ID: {subject?.subjectId}
          </Text>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-md hover:shadow-lg transition"
            >
              <Statistic
                title="Credits"
                value={subject?.credits || 0}
                prefix={<BookOutlined className="!text-cyan-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-md hover:shadow-lg transition"
            >
              <Statistic
                title="Passing Score"
                value={subject?.passingScore || 0}
                prefix={<TrophyOutlined className="!text-cyan-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-md hover:shadow-lg transition"
            >
              <Statistic
                title="Course Specialties"
                value={subject?.courseSubjectSpecialties?.length || 0}
                prefix={<TagOutlined className="!text-cyan-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-md hover:shadow-lg transition"
            >
              <Statistic
                title="Last Updated"
                value={moment(subject?.updatedAt).format("DD/MM/YYYY")}
                prefix={<ClockCircleOutlined className="!text-cyan-500" />}
              />
            </Card>
          </Col>
        </Row>

        {/* Basic Information */}
        <Card
          title={
            <div className="flex items-center space-x-2 text-cyan-700">
              <BookOutlined />
              <span className="font-semibold">Basic Information</span>
            </div>
          }
          className="mb-8 shadow-md hover:shadow-lg transition"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div className="space-y-4">
                <div>
                  <Text className="!text-gray-500">Credits</Text>
                  <Tag color="cyan" className="!mt-1 !ml-1 px-3 py-1 text-base">
                    {subject?.credits}
                  </Tag>
                </div>
                <div>
                  <Text className="!text-gray-500">Passing Score</Text>
                  <Tag color="blue" className="!mt-1 !ml-1 py-1 text-base">
                    {subject?.passingScore}
                  </Tag>
                </div>
                <div>
                  <Text className="!text-gray-500">Created By</Text>
                  <Tag
                    color="geekblue"
                    className="!mt-1 !ml-1 px-3 py-1 text-base"
                  >
                    {subject?.createByUserId}
                  </Tag>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="space-y-4">
                <div>
                  <Text className="!text-gray-500">Created At</Text>
                  <Text strong className="block text-base">
                    {moment(subject?.createdAt).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </div>
                <div>
                  <Text className="!text-gray-500">Last Updated</Text>
                  <Text strong className="block text-base">
                    {moment(subject?.updatedAt).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </div>
              </div>
            </Col>
            <Col span={24}>
              <Text className="!text-gray-500 !block mb-1">Description</Text>
              <Text className="!text-base">
                {subject?.description || "No description available"}
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Course Subject Specialties */}
        <Card
          title={
            <div className="flex items-center space-x-2 text-cyan-700">
              <TeamOutlined />
              <span className="font-semibold">Course Subject Specialties</span>
            </div>
          }
          className="shadow-md hover:shadow-lg transition"
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
                  render: (text) => <Text strong>{text}</Text>,
                },
                {
                  title: "Specialty",
                  key: "specialty",
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
                  render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
                },
                {
                  title: "Created By",
                  dataIndex: "createdByUserId",
                  key: "createdByUserId",
                  render: (text) => <Tag color="cyan">{text}</Tag>,
                },
                {
                  title: "Notes",
                  dataIndex: "notes",
                  key: "notes",
                  render: (notes) => notes || "-",
                },
              ]}
            />
          ) : (
            <Empty description="No course subject specialties assigned" />
          )}
        </Card>

        {/* Assigned Trainees */}
        <Card
          title={
            <div className="flex items-center space-x-2 text-cyan-700">
              <UserOutlined />
              <span className="font-semibold">Assigned Trainees</span>
            </div>
          }
          className="mt-8 shadow-md hover:shadow-lg transition"
        >
          {loadingTrainees ? (
            <div className="flex justify-center items-center p-8">
              <Spin size="large" tip="Loading trainees..." />
            </div>
          ) : trainees.length === 0 ? (
            <Empty description="No trainees assigned to this subject" />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={trainees}
              pagination={{ pageSize: 5, showSizeChanger: false }}
              renderItem={(trainee) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={<UserOutlined />} className="bg-cyan-500" />
                    }
                    title={
                      <div className="text-lg font-medium">{trainee.name}</div>
                    }
                    description={
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                        <div className="flex items-center gap-2">
                          <IdcardOutlined className="text-gray-500" />
                          <span className="text-gray-700">
                            ID: {trainee.traineeId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MailOutlined className="text-gray-500" />
                          <span className="text-gray-700">{trainee.email}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Tag color="cyan">
                            Assign ID: {trainee.traineeAssignId}
                          </Tag>
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
