import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClassSubjectDetailsById } from "../../services/classSubjectService";
import { getAllUsers } from "../../services/userService";
import {
  Card,
  Spin,
  Typography,
  Table,
  Tag,
  Button,
  message,
  Descriptions,
  Alert,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  InfoCircleOutlined,
  ScheduleOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import "animate.css";

const { Title, Text, Paragraph } = Typography;

const ClassSubjectDetailPage = () => {
  const { classSubjectId } = useParams(); // Assuming route is /class-subject/:classSubjectId
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!classSubjectId) {
        setError("Class Subject ID is missing from URL.");
        setLoading(false);
        message.error("Class Subject ID is missing from URL.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await getClassSubjectDetailsById(classSubjectId);
        console.log("API Response for ClassSubjectDetailsById:", response);
        if (response && response.details) {
          setDetails(response.details);
        } else if (response && response.classSubjectId) {
          // Fallback if the response is the details object itself
          setDetails(response);
        } else {
          setError(
            "No details found for this class subject or unexpected data structure."
          );
          message.info(
            "No details found or unexpected data structure from API."
          );
        }
      } catch (err) {
        console.error("Failed to fetch class subject details:", err);
        const errorMessage =
          err.response?.data?.title ||
          err.response?.data?.message ||
          err.message ||
          "Failed to load class subject details.";
        setError(errorMessage);
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [classSubjectId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        console.log("Users response:", response);
        if (response && Array.isArray(response)) {
          setUsers(response);
        } else if (response && Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          console.error("Unexpected users data structure:", response);
          setUsers([]);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    console.log("Current users state:", users);
  }, [users]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    // Assuming timeString is like "HH:mm:ss"
    return timeString.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Spin size="large" tip="Loading class subject details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center bg-red-50">
        <Title level={3} type="danger" className="mb-4">
          <InfoCircleOutlined className="mr-2" /> Error Loading Details
        </Title>
        <Paragraph className="text-red-700 mb-6">{error}</Paragraph>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center bg-gray-50">
        <InfoCircleOutlined
          style={{ fontSize: "48px", color: "#ccc" }}
          className="mb-4"
        />
        <Title level={3} className="text-gray-700">
          No Details Available
        </Title>
        <Paragraph className="text-gray-500 mb-6">
          Could not find any details for the specified class subject.
        </Paragraph>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const scheduleColumns = [
    {
      title: "Schedule ID",
      dataIndex: "scheduleID",
      key: "scheduleID",
      render: (text) => text || "N/A",
      width: 150,
    },
    {
      title: "Location",
      dataIndex: "locationName",
      key: "locationName",
      render: (text) => text || "N/A",
      width: 120,
    },
    {
      title: "Room",
      dataIndex: "roomName",
      key: "roomName",
      render: (text) => text || "N/A",
      width: 100,
    },
    {
      title: "Start",
      dataIndex: "startDateTime",
      key: "startDateTime",
      render: (text) => formatDate(text),
      width: 180,
    },
    {
      title: "End",
      dataIndex: "endDateTime",
      key: "endDateTime",
      render: (text) => formatDate(text),
      width: 180,
    },
    {
      title: "Days",
      dataIndex: "daysOfWeek",
      key: "daysOfWeek",
      width: 220,
      render: (text) => {
        const daysText = text || "N/A";
        if (daysText.length > 25) {
          return (
            <Tooltip title={daysText}>
              <Tag color="cyan" className="truncate max-w-[200px] inline-block">
                {daysText}
              </Tag>
            </Tooltip>
          );
        }
        return <Tag color="cyan">{daysText}</Tag>;
      },
    },
    {
      title: "Time",
      dataIndex: "classTime",
      key: "classTime",
      render: (text) => formatTime(text),
      width: 100,
    },
    {
      title: "Period",
      dataIndex: "subjectPeriod",
      key: "subjectPeriod",
      render: (text) => text || "N/A",
      width: 100,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => {
        let color = "default";
        if (text === "Completed") color = "green";
        else if (text === "Pending") color = "orange";
        else if (text === "Ongoing" || text === "Approved") color = "blue";
        else if (text === "Cancelled") color = "red";
        return <Tag color={color}>{text || "N/A"}</Tag>;
      },
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (text) => text || "N/A",
      width: 200,
      ellipsis: true,
    },
  ];

  const traineeColumns = [
    {
      title: "User ID",
      dataIndex: "traineeId",
      key: "traineeId",
      render: (traineeId) => {
        console.log("Rendering traineeId:", traineeId);
        console.log("Available users:", users);
        const user = users.find((u) => u.userId === traineeId);
        console.log("Found user:", user);
        return user?.userId || traineeId || "N/A";
      },
    },
    {
      title: "Full Name",
      key: "fullName",
      render: (_, record) => {
        const user = users.find((u) => u.userId === record.traineeId);
        return user?.fullName || "N/A";
      },
    },
    {
      title: "Email",
      key: "email",
      render: (_, record) => {
        const user = users.find((u) => u.userId === record.traineeId);
        return user?.email || "N/A";
      },
    },
    {
      title: "Gender",
      key: "gender",
      render: (_, record) => {
        const user = users.find((u) => u.userId === record.traineeId);
        return user?.gender || "N/A";
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-4 md:p-8 animate__animated animate__fadeIn">
      <div className="max-w-6xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="!mb-6 !border-cyan-600 !text-cyan-600 hover:!border-cyan-700 hover:!text-cyan-700 shadow-sm"
        >
          Back
        </Button>

        <Card className="!shadow-2xl !rounded-lg !border !border-cyan-400 !overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-cyan-600 to-cyan-400 text-white rounded-t-lg">
            <Title level={2} className="!text-white !mb-1 truncate">
              <IdcardOutlined className="!mr-3" />
              {details.subjectName || "Class Subject Details"}
            </Title>
            <Text className="!text-cyan-200">
              Class Subject ID: {details.classSubjectId || "N/A"}
            </Text>
            {details.className && (
              <Text className="!text-cyan-100 block">
                Class: {details.className} (ID: {details.classId || "N/A"})
              </Text>
            )}
          </div>

          <div className="p-6 space-y-8">
            <Card
              type="inner"
              title={
                <>
                  <InfoCircleOutlined className="!mr-2 !text-cyan-700" />
                  General Information
                </>
              }
              className="!shadow-md !rounded-lg !border-cyan-200 !mb-4"
            >
              <Descriptions
                bordered
                column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }}
                size="middle"
              >
                <Descriptions.Item
                  label={
                    <>
                      <BookOutlined /> Subject ID
                    </>
                  }
                >
                  {details.subjectId || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <UserOutlined /> Instructor
                    </>
                  }
                >
                  {details.instructorName || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Credits">
                  {details.credits ?? "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Passing Score">
                  {details.passingScore ?? "N/A"}
                </Descriptions.Item>
                {details.instructorEmail && (
                  <Descriptions.Item label="Instructor Email">
                    {details.instructorEmail}
                  </Descriptions.Item>
                )}
                {details.instructorAssignmentID && (
                  <Descriptions.Item label="Instructor Assign. ID">
                    {details.instructorAssignmentID}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Description" span={2}>
                  {details.description || "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              type="inner"
              title={
                <>
                  <ScheduleOutlined className="!mr-2 !text-cyan-700" />
                  Schedules
                </>
              }
              className="!shadow-md !rounded-lg !border-cyan-200 !mb-4"
            >
              {details.schedules?.length > 0 ? (
                <Table
                  columns={scheduleColumns}
                  dataSource={details.schedules}
                  rowKey="scheduleID"
                  pagination={{ pageSize: 5, hideOnSinglePage: true }}
                  scroll={{ x: true }}
                  size="middle"
                  className="rounded-lg overflow-hidden"
                />
              ) : (
                <Alert
                  message="No schedules available for this subject in this class."
                  type="info"
                  showIcon
                />
              )}
            </Card>

            {details.traineeAssignments && (
              <Card
                type="inner"
                title={
                  <>
                    <TeamOutlined className="!mr-2 !text-cyan-700" />
                    Trainees
                  </>
                }
                className="!shadow-md !rounded-lg !border-cyan-200"
              >
                {details.traineeAssignments.length > 0 ? (
                  <>
                    <Text className="!block mb-2 !text-gray-600">
                      <UserOutlined className="!mr-1" /> Count:{" "}
                      {details.enrolledTraineesCount ??
                        details.traineeAssignments.length}
                    </Text>
                    <Table
                      columns={traineeColumns}
                      dataSource={details.traineeAssignments}
                      rowKey="traineeAssignId"
                      pagination={{ pageSize: 5, hideOnSinglePage: true }}
                      scroll={{ x: true }}
                      size="middle"
                      className="rounded-lg overflow-hidden"
                    />
                  </>
                ) : (
                  <Alert
                    message={
                      <span className="text-cyan-700 font-medium">
                        No trainees currently assigned to this subject in this
                        class.
                      </span>
                    }
                    type="info"
                    showIcon
                    className="!border-l-4 !border-cyan-500 !bg-cyan-50"
                  />
                )}
              </Card>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ClassSubjectDetailPage;
