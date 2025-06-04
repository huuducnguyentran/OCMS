import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getClassSubjectByClassId,
  getClassSubjectDetailsById,
} from "../../services/classSubjectService";
import { getUserById } from "../../services/userService";
import {
  Card,
  Spin,
  Typography,
  Table,
  Tag,
  Button,
  message,
  Descriptions,
  Tabs,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  BookOutlined,
  TeamOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import "animate.css";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const ClassroomDetailPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classDetails, setClassDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [traineeUserMap, setTraineeUserMap] = useState({});

  useEffect(() => {
    const fetchClassDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const classSubjectsResponse = await getClassSubjectByClassId(classId);
        if (
          classSubjectsResponse &&
          classSubjectsResponse.classSubjects &&
          classSubjectsResponse.classSubjects.length > 0
        ) {
          const detailedSubjects = await Promise.all(
            classSubjectsResponse.classSubjects.map((cs) =>
              getClassSubjectDetailsById(cs.classSubjectId)
            )
          );

          if (detailedSubjects.length > 0) {
            const primarySubjectDetails = detailedSubjects[0].details;
            const className =
              classSubjectsResponse.classSubjects[0]?.className || "N/A";

            setClassDetails({
              classId: primarySubjectDetails.classId,
              className: className,
              subjects: detailedSubjects.map((ds) => ds.details),
            });
            // Fetch all trainee user info for all subjects
            const traineeMap = {};
            for (const ds of detailedSubjects) {
              const subject = ds.details;
              if (subject.traineeAssignments && subject.traineeAssignments.length > 0) {
                const users = await Promise.all(
                  subject.traineeAssignments.map(async (ta) => {
                    try {
                      const user = await getUserById(ta.traineeId);
                      return user && user.data ? user.data : user;
                    } catch {
                      return { userId: ta.traineeId };
                    }
                  })
                );
                traineeMap[subject.classSubjectId] = users;
              } else {
                traineeMap[subject.classSubjectId] = [];
              }
            }
            setTraineeUserMap(traineeMap);
          } else {
            setError("No subject details found for this class.");
          }
        } else {
          setError("No subjects found for this class.");
        }
      } catch (err) {
        console.error("Failed to fetch class details:", err);
        setError(`Failed to load class details: ${err.message}`);
        message.error(`Failed to load class details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchClassDetails();
    }
  }, [classId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Loading class details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
        <Title level={3} type="danger">
          Error
        </Title>
        <Paragraph>{error}</Paragraph>
        <div className="mt-4 space-y-3">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Go Back
          </Button>
          {(error === "No subjects found for this class." ||
            error === "No subject details found for this class.") && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`/classroom/${classId}/create-schedule`)}
              className="!bg-cyan-500 hover:!bg-cyan-600 !border-cyan-500 hover:!border-cyan-600"
            >
              Create Schedule
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (
    !classDetails ||
    !classDetails.subjects ||
    classDetails.subjects.length === 0
  ) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
        <Title level={3}>No Details</Title>
        <Paragraph>No class details found.</Paragraph>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const { className, subjects } = classDetails;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-4 md:p-8 animate__animated animate__fadeIn">
      <div className="max-w-6xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/class")}
          className="!mb-6 !border-cyan-600 !text-cyan-600 hover:!border-cyan-700 hover:!text-cyan-700"
        >
          Back to Classrooms
        </Button>

        <Card className="!shadow-xl !rounded-lg !border !border-cyan-600 !overflow-hidden">
          <div className="p-6 bg-cyan-700 text-white">
            <Title level={2} className="!text-white !mb-1 truncate">
              <BookOutlined className="mr-2" /> {className || "Class Details"}
            </Title>
            <Text className="!text-cyan-200">Class ID: {classId}</Text>
          </div>

          <div className="p-6">
            {subjects.length > 1 ? (
              <Tabs
                defaultActiveKey={subjects[0].classSubjectId || "0"}
                className="custom-tabs"
              >
                {subjects.map((subject, index) => (
                  <TabPane
                    tab={
                      <span className="text-cyan-700 font-medium">
                        <BookOutlined className="!mr-2" />
                        {subject.subjectName ||
                          subject.subjectId ||
                          `Subject ${index + 1}`}
                      </span>
                    }
                    key={subject.classSubjectId || index.toString()}
                  >
                    {renderSubjectDetails(subject, index, traineeUserMap[subject.classSubjectId] || [])}
                  </TabPane>
                ))}
              </Tabs>
            ) : (
              renderSubjectDetails(subjects[0], 0, traineeUserMap[subjects[0].classSubjectId] || [])
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Helper function to render details for a single subject
const renderSubjectDetails = (subject, index, traineeUserData) => {
  const scheduleColumns = [
    {
      title: "Schedule ID",
      dataIndex: "scheduleID",
      key: "scheduleID",
    },
    {
      title: "Location",
      dataIndex: "locationName",
      key: "locationName",
    },
    {
      title: "Room",
      dataIndex: "roomName",
      key: "roomName",
    },
    {
      title: "Start Time",
      dataIndex: "startDateTime",
      key: "startDateTime",
      render: (text) => (text ? new Date(text).toLocaleString() : "N/A"),
    },
    {
      title: "End Time",
      dataIndex: "endDateTime",
      key: "endDateTime",
      render: (text) => (text ? new Date(text).toLocaleString() : "N/A"),
    },
    {
      title: "Days",
      dataIndex: "daysOfWeek",
      key: "daysOfWeek",
      render: (text) => <Tag color="cyan">{text || "N/A"}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <Tag color={text === "Pending" ? "orange" : "green"}>
          {text || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
    },
  ];

  const traineeColumns = [
    { title: "Trainee ID", dataIndex: "userId", key: "userId" },
    { title: "Full Name", dataIndex: "fullName", key: "fullName" },
    { title: "Gender", dataIndex: "gender", key: "gender" },
    { title: "Email", dataIndex: "email", key: "email" },
  ];

  return (
    <div key={subject.classSubjectId || index} className="py-4">
      <Title level={3} className="!mb-4 !text-cyan-700">
        <InfoCircleOutlined className="!mr-2" />
        Details for: {subject.subjectName || subject.subjectId || "N/A"}
      </Title>

      <Descriptions
        bordered
        column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }}
        size="middle"
        className="!mb-6 !bg-white"
      >
        <Descriptions.Item label="Subject ID">
          {subject.subjectId || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Class Subject ID">
          {subject.classSubjectId || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Credits">
          {subject.credits ?? "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Passing Score">
          {subject.passingScore ?? "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Description" span={2}>
          {subject.description || "N/A"}
        </Descriptions.Item>
      </Descriptions>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card
          bordered={false}
          className="!shadow-lg !rounded-lg !border !border-cyan-400"
        >
          <Title level={4} className="!mb-3 !text-cyan-600 !flex !items-center">
            <UserOutlined className="!mr-2" /> Instructor
          </Title>
          {subject.instructorName ? (
            <Descriptions layout="vertical" size="small" colon={false}>
              <Descriptions.Item label="Name">
                {subject.instructorName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {subject.instructorEmail || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Assignment ID">
                {subject.instructorAssignmentID || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Text>No instructor assigned.</Text>
          )}
        </Card>

        <Card
          bordered={false}
          className="!shadow-lg !rounded-lg !border !border-cyan-400"
        >
          <Title level={4} className="!mb-3 !text-cyan-600 !flex !items-center">
            <TeamOutlined className="!mr-2" /> Enrolled Trainees
          </Title>
          <Text strong className="!text-2xl !text-cyan-700">
            {subject.enrolledTraineesCount || 0}
          </Text>
          <Text> trainees</Text>
        </Card>
      </div>

      <Card
        title={
          <>
            <CalendarOutlined className="!mr-2" />
            Schedules
          </>
        }
        className="shadow-lg rounded-lg border !border-cyan-400 !mb-6"
      >
        {subject.schedules && subject.schedules.length > 0 ? (
          <Table
            columns={scheduleColumns}
            dataSource={subject.schedules}
            rowKey="scheduleID"
            pagination={{ pageSize: 3, hideOnSinglePage: true }}
            scroll={{ x: "max-content" }}
            size="small"
          />
        ) : (
          <Text>No schedules available for this subject.</Text>
        )}
      </Card>

      <Card
        title={
          <>
            <TeamOutlined className="mr-2" />
            Assigned Trainees
          </>
        }
        className="!shadow-lg !rounded-lg !border !border-cyan-400"
      >
        {traineeUserData && traineeUserData.length > 0 ? (
          <Table
            columns={traineeColumns}
            dataSource={traineeUserData}
            rowKey="userId"
            pagination={{ pageSize: 3, hideOnSinglePage: true }}
            scroll={{ x: "max-content" }}
            size="small"
          />
        ) : (
          <Text>No trainees enrolled in this subject.</Text>
        )}
      </Card>
    </div>
  );
};

export default ClassroomDetailPage;
