import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClassSubjectByClassId, getClassSubjectDetailsById } from "../../services/classSubjectService";
import { Card, Spin, Typography, Table, Tag, Button, message, Descriptions, List, Avatar, Space, Tabs } from "antd";
import { ArrowLeftOutlined, UserOutlined, CalendarOutlined, BookOutlined, TeamOutlined, InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
import "animate.css";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const ClassroomDetailPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classDetails, setClassDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Step 1: Get all ClassSubject IDs for the given classId
        const classSubjectsResponse = await getClassSubjectByClassId(classId);
        if (classSubjectsResponse && classSubjectsResponse.classSubjects && classSubjectsResponse.classSubjects.length > 0) {
          // Assuming we want details for all subjects in the class,
          // we'll fetch details for each one.
          // For simplicity, this example will focus on the first subject or a general overview.
          // You might need to adjust this logic based on how you want to display multiple subjects.

          // Let's fetch details for each classSubjectId
          const detailedSubjects = await Promise.all(
            classSubjectsResponse.classSubjects.map(cs => getClassSubjectDetailsById(cs.classSubjectId))
          );

          // Combine information as needed. For this example, we'll use the first detailed subject
          // and enrich it with general class info.
          // You might want to display a list of subjects or aggregate data.
          if (detailedSubjects.length > 0) {
             // For now, let's assume the first subject's details are representative or primary
            const primarySubjectDetails = detailedSubjects[0].details;

            // Construct a more complete classDetails object
            // We need a classroom name, which isn't directly in getClassSubjectDetailsById
            // We'll use the className from the first entry of getClassSubjectByClassId if available
            const className = classSubjectsResponse.classSubjects[0]?.className || "N/A";


            setClassDetails({
              classId: primarySubjectDetails.classId,
              className: className, // Or fetch separately if needed
              subjects: detailedSubjects.map(ds => ds.details) // Store all subject details
            });
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
        <Title level={3} type="danger">Error</Title>
        <Paragraph>{error}</Paragraph>
        <Space direction="vertical" size="middle" className="mt-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Go Back
          </Button>
          {(error === "No subjects found for this class." || error === "No subject details found for this class.") && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`/classroom/${classId}/create-schedule`)}
              className="bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600"
            >
              Create Schedule
            </Button>
          )}
        </Space>
      </div>
    );
  }

  if (!classDetails || !classDetails.subjects || classDetails.subjects.length === 0) {
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 p-4 md:p-8 animate__animated animate__fadeIn">
      <div className="max-w-6xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/class")}
          className="mb-6 border-sky-600 text-sky-600 hover:!border-sky-700 hover:!text-sky-700"
        >
          Back to Classrooms
        </Button>

        <Card className="shadow-xl rounded-lg border border-sky-600 overflow-hidden">
          <div className="p-6 bg-sky-700 text-white">
            <Title level={2} className="!text-white !mb-1 truncate" style={{color: 'white'}}>
              <BookOutlined className="mr-2" /> {className || "Class Details"}
            </Title>
            <Text className="!text-sky-200">Class ID: {classId}</Text>
          </div>

          <div className="p-6">
            {subjects.length > 1 ? (
              <Tabs defaultActiveKey={subjects[0].classSubjectId || "0"} className="custom-tabs">
                {subjects.map((subject, index) => (
                  <TabPane tab={<span className="text-sky-700 font-medium"><BookOutlined className="mr-2" />{subject.subjectName || subject.subjectId || `Subject ${index + 1}`}</span>} key={subject.classSubjectId || index.toString()}>
                    {renderSubjectDetails(subject, index)}
                  </TabPane>
                ))}
              </Tabs>
            ) : subjects.length === 1 ? (
              renderSubjectDetails(subjects[0], 0)
            ) : (
              <Text>No subject data to display.</Text>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Helper function to render details for a single subject
const renderSubjectDetails = (subject, index) => {
  const scheduleColumns = [
    { title: "Schedule ID", dataIndex: "scheduleID", key: "scheduleID", render: (text) => text || "N/A" },
    { title: "Location", dataIndex: "locationName", key: "locationName", render: (text) => text || "N/A" },
    { title: "Room", dataIndex: "roomName", key: "roomName", render: (text) => text || "N/A" },
    { title: "Start Time", dataIndex: "startDateTime", key: "startDateTime", render: (text) => text ? new Date(text).toLocaleString() : "N/A" },
    { title: "End Time", dataIndex: "endDateTime", key: "endDateTime", render: (text) => text ? new Date(text).toLocaleString() : "N/A" },
    { title: "Days", dataIndex: "daysOfWeek", key: "daysOfWeek", render: (text) => <Tag color="blue">{text || "N/A"}</Tag> },
    { title: "Status", dataIndex: "status", key: "status", render: (text) => <Tag color={text === "Pending" ? "orange" : "green"}>{text || "N/A"}</Tag> },
    { title: "Notes", dataIndex: "notes", key: "notes", render: (text) => text || "N/A" },
  ];

  const traineeColumns = [
    { title: "Trainee ID", dataIndex: "traineeId", key: "traineeId", render: (text) => text || "N/A"},
    { title: "Status", dataIndex: "requestStatus", key: "requestStatus", render: (text) => <Tag color={text === "Pending" ? "orange" : "green"}>{text || "N/A"}</Tag> },
    { title: "Assigned By", dataIndex: "assignByUserId", key: "assignByUserId", render: (text) => text || "N/A" },
    { title: "Assigned Date", dataIndex: "assignDate", key: "assignDate", render: (text) => text ? new Date(text).toLocaleDateString() : "N/A"},
    { title: "Notes", dataIndex: "notes", key: "notes", render: (text) => text || "N/A" },
  ];

  return (
    <div key={subject.classSubjectId || index} className="py-4">
      <Title level={3} className="mb-4 text-sky-700">
        <InfoCircleOutlined className="mr-2" />
        Details for: {subject.subjectName || subject.subjectId || "N/A"}
      </Title>

      <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }} size="middle" className="mb-6 bg-white">
        <Descriptions.Item label="Subject ID">{subject.subjectId || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Class Subject ID">{subject.classSubjectId || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Credits">{subject.credits !== null ? subject.credits : "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Passing Score">{subject.passingScore !== null ? subject.passingScore : "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Description" span={2}>{subject.description || "N/A"}</Descriptions.Item>
      </Descriptions>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card bordered={false} className="shadow-lg rounded-lg border border-sky-200">
          <Title level={4} className="mb-3 text-sky-600 flex items-center">
            <UserOutlined className="mr-2" /> Instructor
          </Title>
          {subject.instructorName ? (
            <Descriptions layout="vertical" size="small" colon={false}>
              <Descriptions.Item label="Name" className="font-semibold">{subject.instructorName}</Descriptions.Item>
              <Descriptions.Item label="Email" className="font-semibold">{subject.instructorEmail || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Assignment ID" className="font-semibold">{subject.instructorAssignmentID || "N/A"}</Descriptions.Item>
            </Descriptions>
          ) : <Text>No instructor assigned.</Text>}
        </Card>
        <Card bordered={false} className="shadow-lg rounded-lg border border-sky-200">
            <Title level={4} className="mb-3 text-sky-600 flex items-center">
                <TeamOutlined className="mr-2" /> Enrolled Trainees
            </Title>
            <Text strong className="text-2xl text-sky-700">{subject.enrolledTraineesCount || 0}</Text>
            <Text> trainees</Text>
        </Card>
      </div>
      
      <Card title={<><CalendarOutlined className="mr-2" />Schedules</>} className="shadow-lg rounded-lg border border-sky-200 mb-6">
        {subject.schedules && subject.schedules.length > 0 ? (
          <Table
            columns={scheduleColumns}
            dataSource={subject.schedules}
            rowKey="scheduleID"
            pagination={{ pageSize: 3, hideOnSinglePage: true, className:"custom-pagination" }}
            scroll={{ x: 'max-content' }}
            size="small"
          />
        ) : <Text>No schedules available for this subject.</Text>}
      </Card>

      <Card title={<><TeamOutlined className="mr-2" />Assigned Trainees</>} className="shadow-lg rounded-lg border border-sky-200">
        {subject.traineeAssignments && subject.traineeAssignments.length > 0 ? (
          <Table
            columns={traineeColumns}
            dataSource={subject.traineeAssignments}
            rowKey="traineeAssignId"
            pagination={{ pageSize: 3, hideOnSinglePage: true, className:"custom-pagination" }}
            scroll={{ x: 'max-content' }}
            size="small"
          />
        ) : <Text>No trainees enrolled in this subject.</Text>}
      </Card>
    </div>
  );
}

export default ClassroomDetailPage; 